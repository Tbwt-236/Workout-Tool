# Data Model: 本地数据说明与最小 JSON 导出

**Date**: 2026-10-02 | **Status**: DRAFT，未实施、未批准

**Feature**: [spec.md](spec.md) | **Contract**: [contracts/local-data-control.md](contracts/local-data-control.md)

## 1. DataNotice（文案，不新增数据库表）

说明字段、用途、本地保存、既有删除路径、导出明文及系统备份/接收方边界。中英正文随 App 分发；文案修订不自动增加接受/拒绝状态，也不保存阅读时间、身份、设备标识或行为轨迹。

本切片不新增记录许可状态机、数据库选择表或 schema 迁移，不改变既有训练表。实施/真实试用前的数据流与同意审查由产品审查记录承载；是否另需运行时用户同意机制，研究后独立决定。

## 2. ExportSnapshot（内存、不可变）

- `snapshotAt`：一致性读取时记录的 UTC 时点，不改写各条训练时间；不是数据库历史查询或不可回拨的可信时间戳。
- `workouts`：全部已完成聚合，完成时间降序，同时间按内部 ID 降序。
- 按现有 `CompletedWorkout` 规则重验证，动作/组按连续 position 排序。内部 ID 仅用于读取、隔离和稳定排序，不进入文件。
- 无草稿、原始输入、语言、说明阅读或分享状态；空历史为 `workouts: []`。任何损坏聚合整体失败。
- 规模夹具：1000 场，每场 4 动作、每动作 5 组，共 4000 动作和 20000 组。

## 3. JSON ExportDocument v1（候选格式）

| 字段 | 类型与约束 |
| --- | --- |
| format | 固定 `fitquest-workouts` |
| schemaVersion | 整数 1；含义改变时使用新版本 |
| exportedAt | 编码时 UTC 时间，不冒充训练完成时间 |
| snapshotAt | 快照读取 UTC 时点；不假设设备时钟永不回拨 |
| weightUnit | 固定 `tenths_of_kg` |
| workouts | 保留快照排序，可为空 |
| workouts[].startedAt / completedAt | 原规范 UTC 时间 |
| workouts[].durationSeconds | 原非负整数秒，按领域规则校验 |
| workouts[].exercises | 保持 position；可有无组动作，但整场至少有一个有效组 |
| exercises[].name / position | 原规范化名称、从 0 起连续位置 |
| exercises[].sets | 按 position 排序 |
| sets[].position / reps | 连续位置；1–999 整数次数 |
| sets[].weightTenthsKg | null 或 1–10000 整数；625 表示 62.5 kg，null 表示未记录 |

合成示例：

```json
{
  "format": "fitquest-workouts",
  "schemaVersion": 1,
  "exportedAt": "2026-10-02T04:01:00.000Z",
  "snapshotAt": "2026-10-02T04:00:59.000Z",
  "weightUnit": "tenths_of_kg",
  "workouts": [{
    "startedAt": "2026-10-01T10:00:00.000Z",
    "completedAt": "2026-10-01T10:30:00.000Z",
    "durationSeconds": 1800,
    "exercises": [{
      "name": "深蹲",
      "position": 0,
      "sets": [{ "position": 0, "reps": 8, "weightTenthsKg": null }]
    }]
  }]
}
```

使用标准 JSON 编码，用户文字不拼接；拒绝 NaN/Infinity/undefined，不依靠隐式省略或转换。JSON 不加密，也不承诺 App 支持导入。文件名只含固定前缀与任务标识，例如 `fitquest-export-<task-id>.json`，不含动作等用户内容。

## 4. ExportJob（内存）

- 字段：唯一 `taskId`、所属页面/请求有效性、状态、任务期间的快照/编码结果和受控文件句柄。
- 状态：idle → snapshotting → writing → handoffPending → sharing → settled；交接前可 cancelled，故障可 failed。
- 不提供需要第二次点击的 ready 页面；完整文件校验/提交是内部步骤。
- 同时只有一个活动任务。交接前离页/后台先撤销分享意图；即使底层 IO 不能中止，其结果也只能清理，不能继续交接。任务完成收尾后释放本任务锁。
- 交接后退出页面不撤销已发生的系统交接；平台可证终态或可证调用失败时释放任务锁。无法区分终态的适配器必须在平台研究中定义可测的返回/释放点，不能以任意超时解锁后再开第二个分享界面。
- 进程重启不恢复活动任务或自动分享；只恢复文件核对/清理。内存训练草稿仍遵循 001 生命周期，本功能不增加异常退出草稿恢复。

## 5. 文件归属清单与恢复

Android候选为Expo FileSystem cacheDir，不属于Auto Backup默认备份范围；缓存仍可能被系统回收，交接前需检查文件存在，文件消失不能当作分享成功。iOS行为待核，依据见plan。

专属缓存目录内，清单只存 taskId、受控相对文件名、createdAt、文件阶段、交接可能性及待清理状态，不存训练正文。路径禁止穿越或目录外链接。清单持久化策略须经平台文件 API 研究确认。

写入顺序：持久化任务归属 → 创建/写入 partial → 完整关闭及校验 → 提交完整文件 → 持久化 handoffPending → 检查本次意图仍有效 → 调用系统。归属登记失败不创建数据文件；交接标记失败不分享。每个中断点都必须可恢复，不依靠内存中的 finally 作为进程终止保障。

启动/回前台核对：

- 清单有条目但文件不存在：消除失效条目，不恢复任务锁。
- 可证明未交接的 partial/取消文件：安全清理；删除失败保留待清理项。
- 清单与完整文件阶段不一致，或存在无完整清单的文件：仅对专属目录、严格文件名规则能证明归属的文件恢复隔离条目。不能证明尚未交接时按未知交接处理；不能证明归属则不删除，报告受控的恢复问题。
- handoffPending/sharing 遗留项：可能已交给系统，不能因 App 重启或前台就立即删除。
- 活动文件和可能仍被系统读取的文件始终受保护；旧回调只能引用本任务文件。

未知交接状态的 24 小时仅是未核实的候选清理资格阈值。清理还需要平台安全条件成立，并在下一次启动/前台执行；未运行、清理失败或时钟异常可能延长实际残留，不承诺保留上限。年龄不是安全证明。若平台无法满足可解释、可测试的清理策略，实施前修订 Q2，不能隐性无限延长。

用户保存或接收的副本不属于本清单，训练删除不能撤回这些副本。

## 6. Data Flow Review Inventory

| 路径 | 数据 | 当前结论 |
| --- | --- | --- |
| 用户输入 → 本地训练库 | 时间、名称、次数、重量 | 沿用 001；真实数据闸门仍待 |
| 查看说明 | 中英文静态文案 | 不保存用户阅读/接受轨迹 |
| 训练库 → 快照 → 临时文件 | 仅已完成训练 | 一致性、字段、文件保护待实现 |
| 临时文件 → 系统 → 用户选择接收方 | 明文候选 JSON | 每次显式发起；不追踪接收方 |
| 系统备份/恢复 | 可能涉及训练库和缓存 | 配置及保护待核，不承诺排除 |

## 本步学习验收

目标 L2：解释 625、null、UTC、position，以及“文件清理资格”和“可安全清理”的区别；指出 handoffPending 崩溃后为何不能立即删除。汇报：“格式和文件恢复模型仍是草案，没有新增训练选择表。”未掌握时沿写入顺序检查每个中断点；数据流里程碑前提升至 L3。
