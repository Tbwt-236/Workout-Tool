# Implementation Plan: 本地数据说明与最小 JSON 导出

**Updated**: 2026-10-12 | **Status**: 已按批准范围实施，原生验收进行前准备完成

[Spec](spec.md) · [Tasks](tasks.md) · [Verification](verification.md)

## 方案与成本

复用Expo57.0.26、RN0.86.3、React19.2.3、既有SQLite仓储与Provider。新增直接依赖 `expo-file-system ~57.0.7`（原为间接依赖）和 `expo-sharing ~57.0.22`，锁定57.0.7/57.0.22。用途仅本地临时文件和出站系统分享；SDK自带适配减少自建两套原生桥接的维护成本。没有云端存储、账号服务、订阅或新的持续服务账单；设备测试与维护仍需投入。

不新增训练表、迁移、接受状态、第二确认、第三tab或独立数据路由。此前的持久交接清单被专属目录+严格命名+活动集合+机会性过期清理替代：清单不能证明第三方读完，增加状态并不能解决该问题。24小时是缓存工程策略，不是法定期限或平台安全点。

## 数据流

```text
历史右上「数据」→ 底部面板（原Provider保持）
主动导出 → 等历史读队列 → 单次SQL快照/校验
→ 释放仓储锁 → 白名单JSON编码
→ 共享可用检查/受控旧缓存清理
→ 唯一partial写入 → 等待move完成 → 完整文件检查
→ 再核请求有效 → 系统选择 → 返回面板
→ 未交接删除尝试；已交接保留，未来启动/导出尝试过期清理
```

Provider持有一个导出服务和文件适配器。只有`snapshotting`期阻止新读取/完成/删除竞争；文件和系统分享不占训练仓储锁。面板关闭后仍等正在进行的IO收尾，不提前解锁。AppState退后台只取消尚未交接任务。导出不写训练或编辑器状态。

## 实际文件

- `apps/mobile/src/features/data-control/domain/export-document.ts`：字段白名单与再校验。
- `application/export-service.ts`：单任务、取消、状态和故障。
- `data/export-file-port.ts`、`native-export-files.ts`：端口及实际Expo文件/分享。
- `ui/data-sheet.tsx`、`src/i18n/data-copy.ts`：底部面板和简短中英说明。
- `workouts/data/*repository.ts`：只读快照；`workout-provider.tsx`：共享服务及读取协调。
- `history-screen.tsx`、`workout-screen.tsx`、`workout-summary.tsx`、`src/app/_layout.tsx`：入口、跨页读取和宿主注入。

## 数据流与平台审查

训练库存名称、次数、重量和时间以记录/回顾；导出时产生内存快照与明文缓存，用户在系统选择目标。App不新增上传、追踪或阅读同意存储。用户选云端接收方可使文件离开设备；删除App内记录不撤回外部副本。说明关闭不是法律同意，001 T030及真实试用前审查不关闭。

实际Android包`allowBackup=true`保持原状，数据库默认具有备份资格；未证明备份实际传输/恢复。缓存目录的备份规则与系统提前清理边界见[research](research.md)。SharingFileProvider自身映射范围比App专属目录广；本适配器只交出受控JSON，不能说provider层仅允许专属目录。无新增外存、相机、麦克风等权限。

首轮本地构建为Android arm64测试包，debug签名、临时标识`dev.fitquest.local`；不是商店发布。iOS只有JS/Hermes导出，未构建/运行原生。原生分享、取消、保存接收文件、iOS Modal叠层、小屏读屏和备份仍需设备证据。

## 核验与反思

按RED→GREEN分别实现快照、编码/编排、文件及界面；完整既有训练回归、静态检查和双平台资源导出后构建Android。独立审查记录见verification；不把替身文件测试当原生桥接通过。当前共享SDK存在启动Activity异常后锁未清的源码风险，错误文字建议重试/必要时重启；未修改依赖，不声称已解决所有原生故障。

下一阶段先跑Q-001–Q-007的实际设备路径，再招募合成数据5用户；不追加其他新页面或装修需求来代替验收。

## 本步学习验收

目标：事务释放、系统交接、任务解锁、文件清理四个时间点L2；依赖与缓存取舍L3。练习沿数据流指出每一步持有何种资源；汇报：“复用训练库，只新增本地导出依赖，没有新增服务成本，设备验收尚未关闭。”若将返回当送达或清理安全点，重读research并重走流程。实现产物与本人学习分别验收。
