# Implementation Plan: 本地数据说明与最小 JSON 导出

**Branch**: 未创建/未切换 | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Status**: DRAFT — 供范围与数据流评审，不是已批准实施计划。

## Summary

复用现有 App、训练仓储及双导航，提出“可随时查看说明＋一次主动导出全部已完成训练”。生成完整文件后直接进入系统选择，不新增训练许可表、记录门禁、撤回清稿或第二次分享确认。本目录仅文档，不授权代码实施或真实数据使用。

宪章 V 和 001 T030 要求数据流与同意审查；并未指定版本化阻断弹窗。是否需要额外用户同意机制须按实际产品/平台研究后独立决定。旧设计中的状态机与迁移已移出最小切片，不通过补复杂锁继续扩大范围。

## Technical Context

**Language/Version**: 2026-10-02 当前工程基线 Expo 57.0.26、React Native 0.86.3、React 19.2.3、TypeScript 6.0.3；151 项/19套自动测试属于 001 当前证据，不是 002 验收。实施前重核版本。

**Primary Dependencies**: 复用 React、Expo Router、expo-sqlite、Jest、RNTL；文件/分享适配的官方能力、依赖、替代方案、隐私和维护成本由 T002 研究，尚未确定或安装。

**Storage**: 不新增训练库表或 schema 迁移。复用现有连接所有者读取一致快照；临时文件与最小归属清单存专属缓存目录，系统备份/文件保护待核。

**Testing**: 纯编码、真实 SQLite 快照、文件/分享边界故障与中断、RNTL、类型/lint、原生文件/分享/清理验收。桌面替身不证明系统行为。

**Target Platform**: 现有iOS/Android App，无账号或服务端，不开展小程序。001的Android 16模拟器5580已启动；Build Tools35官方校验补齐后第二轮本地测试APK已构建并安装成功，飞行模式且WiFi关闭后冷启动进入模拟器历史页；其余Q场景和真机待验收，中文月标题显示英文问题在查，不代表正式首发平台已确定。002入口A/B首轮已提问、无答复；首验平台、系统与安装路径仍随研究和批准确定。

**Performance Goals**: 1000 场，每场 4 动作、每动作 5 组，共 4000 动作/20000 组。记录快照、编码、文件生成分段耗时及大小；系统选择等待单列，不在缺少设备证据时承诺端到端秒数。

**Constraints**: 不改变 001 记录语义；无未授权真实采集、网络上传、新 dashboard 或第三 tab。不直接复制 SQLite/WAL，不在日志输出训练正文。

**Scale/Scope**: 全部已完成历史一份候选 JSON；无单场选择、导入恢复、批量删除、账号、云或同意状态机。

## Constitution Check

| Gate | 草案状态 | 批准前/实施时要求 |
| --- | --- | --- |
| Evidence Before Scope | 最小候选，未批准 | 说明与导出服务数据控制；JSON 和入口仍待确认 |
| Specification-First | DRAFT，实施关闭 | Q1/Q2、平台未决点及验收条件确认后才转 Approved |
| Test-First and Verification | 仅计划 | 新行为真实 RED→GREEN；文档不伪称测试完成 |
| Learning | 材料已列，学习待验收 | 数据流 L2，主要范围与取舍在里程碑前 L3 |
| Privacy/Safety | OPEN | 实际数据流/同意、备份、分享及清理审查；无法律结论 |
| Dependencies/Release | OPEN | 新依赖和原生行为待核；不发布 |

**Gate result**: 可以澄清与只读研究，不能执行 002 产品代码或开启真实数据使用。001 设备验证不被入口答复阻塞，T030 原条件不变。

## Architecture and Data Flow

```text
获批现有导航入口 → 可随时查看的数据说明（不修改训练）
用户主动点击导出全部历史
  → export service：单任务和请求有效性
  → 既有仓储 readExportSnapshot：单一读事务
  → 释放仓储锁 → 纯 JSON 编码
  → 先登记文件归属 → 写 partial → 完整提交
  → 持久化可能交接标记 → 再核本次请求仍有效
  → 系统保存/分享选择 → 如实结果与任务收尾
  → 按平台安全点核对/清理临时文件
```

- 快照由现有连接所有者和互斥提供，禁止 UI 以列表加逐条详情拼装，也不另建未经协调的写入连接。
- 同一读事务中的全部聚合重验证后才返回；快照释放锁后不受后续删除/保存改写。文件代表该快照，不表示交接时数据库仍未变化。
- 编码字段和顺序固定；不输出内部 ID/localKey、草稿或诊断。
- 不引入说明接受状态或新训练限制，原 provider/service 数据流保持。
- 导出任务拥有唯一标识及有效性；交接前离页/后台取消继续分享意图，不能中止 IO 时只收尾，不继续交接。
- 交接后后台和返回不是送达或文件读取结束证据。单任务释放点与文件安全清理点分别定义，必须通过平台研究及设备验证。
- 清单先于文件创建持久化，可能交接标记先于系统调用持久化；启动核对缺失/部分/孤儿/未知交接文件，不恢复自动分享。无法证明归属或安全性时保持受控恢复状态。
- 24 小时候选仅为清理资格阈值，不能替代安全条件；实际残留可能更久。无法验证策略时修订并确认，不隐性无限保留。
- 不实现网络传输。系统备份和用户接收方独立审查；没有网络 SDK 不等于数据不会离开设备。

## Proposed Structure

```text
specs/002-local-data-control/
  spec.md, plan.md, data-model.md, tasks.md, quickstart.md
  contracts/local-data-control.md, checklists/requirements.md
  research.md       # 后续官方证据与平台结论，尚未写成完成
  verification.md   # 实施后真实证据，不预填
apps/mobile/src/features/data-control/
  domain/export-document.ts
  application/export-service.ts
  data/export-file-port.ts, native-export-files.ts
  ui/data-control-screen.tsx
apps/mobile/src/features/workouts/data/
  workout-repository.ts, sqlite-workout-repository.ts  # 只增加快照读取
apps/mobile/src/app/data/index.tsx                    # 候选路由，Q1 后确定
apps/mobile/__tests__/data-control/
```

路径均为提案。说明文案接现有中英结构；不新建 privacy-choice/service/storage 模块，不改迁移或活动 feature 配置。

## Platform Evidence Recorded 2026-10-02（只读，未作原生验收）

- 本地 expo-sqlite 57.0.3 的 Android 默认目录为 filesDir 下的 SQLite；当前工厂未指定其他目录。隔离 staging 生成 Manifest 的 allowBackup 为 true，未配置备份排除。因此当前训练库具有默认备份资格；这不是已经上传或恢复的证据。Android 将 files 目录纳入默认备份范围，cache 目录排除，最终设备/渠道设置还需验证。[Android Auto Backup](https://developer.android.com/identity/data/autobackup) 本日APK badging已确认外存读写/悬浮窗/振动四项权限实际移除，仅保留开发用INTERNET及本包signature receiver权限；本次未改backup。
- 候选导出目录为 Expo FileSystem cache 对应的 Android cacheDir；该位置可减少系统备份包含临时副本的风险，但系统也可能清除缓存，交接前必须检查文件仍存在，不能承诺缓存保留时长。iOS 保护/备份行为另行核实。[FileSystem SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/)、[Android app-specific storage](https://developer.android.com/training/data-storage/app-specific)
- Expo SDK57 Android SharingModule 的活动返回处理只匹配请求码并结束 Promise，不传递结果码。因此候选 shareAsync 的 void 返回不能区分取消/保存，也不能证明接收方读完文件；不得在 finally、回前台或 Promise 完成时无条件删除。单任务返回与文件清理必须分离，24小时不构成平台安全证明。[Sharing API](https://docs.expo.dev/versions/v57.0.0/sdk/sharing/)、[SDK57 SharingModule](https://github.com/expo/expo/blob/sdk-57/packages/expo-sharing/android/src/main/java/expo/modules/sharing/SharingModule.kt#L73)
- 本地 SDK bundledNativeModules 指定候选 expo-file-system ~57.0.7、expo-sharing ~57.0.22。前者已由Expo间接安装；若产品直接使用，应声明直接依赖。两项直接依赖目前均未获本功能批准或添加。用途限本地文件和出站分享；替代原生自建文件/Intent适配维护成本更高。需要评估文件权限、原生构建和清理成本，不启用接收入站分享/Share Extension，也不扩展现有URL白名单。
- 未决：目标接收路径的读取生命周期、可执行安全清理策略、缓存被系统清除后的提示、真实备份/恢复与iOS行为。只读研究可继续，清理规则未确定前不实施002。

## Verification Strategy and Reflections

1. 范围与只读平台研究可并行：核实 A/B、JSON、明文范围、单次发起、取消/中断和清理；不把实现方便写成法律必要性。
2. 获批后先交付可查看说明，验证返回不改变训练；纯编码和快照可按单一写入者分批推进。
3. 文件/分享先测试故障与各崩溃点，再实现；每批问“回调证明了什么”“哪份文件仍可能被系统使用”。
4. 运行相关测试、typecheck/lint；集成时运行原 151 项/19套及新增回归，原基线与新增证据分开记录。
5. 设备记录系统、构建、备份配置、接收路径、取消/返回事实、残留文件与清理条件；没有证据保持待办。
6. 5 人合成数据找入口/解释去向后，再按实际证据审查 001 T030，不能自动宣布其完成。

## Complexity Tracking

本次通过移除未经证明的记录许可状态机、持久化选择和数据库迁移控制成本。仅保留导出必需的一致快照、单任务防重、文件归属和中断恢复。Q1/Q2 及系统生命周期未决，因此只交付 DRAFT。

## 本步学习验收

目标 L2：指出事务释放、系统交接、任务解锁、文件清理四个不同时间点；范围取舍目标 L3，在批准时说明为何未加入记录许可状态机。汇报：“最小方案复用现有训练库，新增界面及系统边界仍在研究确认。”未掌握时沿数据流复述，不把文档完成当批准或设备验收。
