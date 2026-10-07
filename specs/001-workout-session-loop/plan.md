# Implementation Plan: 训练记录最小闭环

**Branch**: `001-workout-session-loop`（Spec Kit 功能标识；当前 Git 分支为 `main`） | **Date**: 2026-08-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-workout-session-loop/spec.md`

## Summary

在 `apps/mobile/` 初始化一个 Expo + React Native + TypeScript 应用，完成单机、匿名、离线可用的训练记录闭环。进行中训练由内存状态管理；用户确认完成后，通过一个原子事务将训练、动作和训练组写入设备 SQLite。界面通过 Expo Router 提供开始训练、进行中训练、完成摘要、历史列表和历史详情。领域验证和状态转换先以失败测试定义，再实现 UI 与 SQLite 适配器。

## Technical Context

**当前状态2026-10-02**：继续Expo + React Native App，训练/纠错、保存、日历历史和确认删除已接SQLite。153项/19套自动回归、类型/lint、双平台JS/Hermes导出及最新4f6c66316bf5本地Android构建/签名/ZIP对齐通过。依赖未变，Doctor21/21沿用本日同版本证据，audit仍15项（11 moderate/4 high）。4f6包已独立核验保存期间历史显示Loading且无假错误、提交后留在历史、离线重启可读；仅新增两笔合成训练，原1002笔逐行不变。 旧00aba包的1000场历史UI功能/滚动/返回选日已独立核验；首窗口P95 298ms不等于完整UI就绪，慢帧保留，不能宣称1秒完整交互或真机流畅。044ab迟到导航专项、00aba的Q001/Q005/Q009/320dp/16KB及更早场景各保留原包归属，未在4f6全量重跑；16KB兼容模式禁用未证。 T032工程文档已完成，本人学习仍待演示；T029/T030/T031/T033保持待。小屏日历A/B、002数据入口A/B与隐私审查、真实TalkBack、实体设备/iOS及5位用户条件未通过，仅合成数据，无账号、付费或发布。 当前源码的28项哈希与4f6构建输入一致；旧manifest仅为当时快照。任务见[tasks](tasks.md)，证据见[verification](verification.md)阶段八；以下注明日期的旧规划/版本保留当时状态。

**2026-09-26增量**：历史整场删除已补齐：严格确认→私有连接事务级联→提交后使列表重新读取，保留浏览位置/当前草稿。详情按ID隔离确认和迟到回执，失败保留详情并重新确认重试。146项自动测试、类型/lint与双平台资源导出通过；下一步设备验收及独立隐私/导出规格。以下9月23日等段落保留其时点状态。

**最新状态 2026-09-23**：正式Expo路由、共享Provider、行内训练/纠错、完成摘要及只读月历已接SQLite保存/列表/详情。Provider使用同步外部状态容器与useSyncExternalStore，服务全生命周期唯一，表单草稿/语言/月历位置跨路由保留。T016/T017/T026完成；T019–T022仅只读部分，删除未做。130项测试/类型/lint通过；双平台JS/Hermes资源导出通过，但未做安装包/手机验收。以下日期段落为历史，版本以2026-09-16锁文件为准。

原生外部链接由+native-intent只接受既定页面与数字ID，禁止查询/编码/超长输入；真实Router冷/热入口已回归。该限制满足当前T016入口条件，不修复上游解码依赖；无Web入口、新依赖或功能扩张。错误和名称编辑就近保留在workout-screen/summary，UI测试合并到workout-flow/history/app-routes；职责与原规格不变。

**2026-09-12 执行补充**：用户要求复核 App/小程序后直接开始，并对前端多轮确认。先交付不依赖界面的领域规则（tasks.md T001–T010），再创建完整 Expo 宿主。已核对官方兼容矩阵：SDK 57 / React Native 0.86 / React 19.2.3 / Node >=22.13.x；本机 bundled Node v24.19.0。下文 SDK 56 是历史规划基线，T011 当天须再次核实包与 Expo Go 兼容性并更新，不能把文档矩阵当成已安装依赖。

首批纯 TypeScript 行为测试临时使用 Node 24 内置 `node:test`（无新增包、无 React/SQLite mock、可立即验证领域逻辑）；T011 将这些行为用例迁移到计划中的 Jest，并配置类型检查、lint 和 doctor。Node 执行会擦除类型，**不证明类型检查通过**。完整 Expo、原生 SQLite 和真机流程仍须各自验收。此调整避免在用户尚未确认界面时生成模板页面，并不改变产品行为或架构。

**2026-09-13 执行补充**：依据用户“继续开发”，将纯 reducer T012 提前到 T010 后，继续用内置测试器，不等待 Expo 宿主。Reducer 只处理数据与显式事件；时间、动作/组键、保存尝试标识由调用方传入。保存结果必须匹配当前尝试，失败保留同一草稿，成功ID有效后才转完成态。该保护不能替代应用服务防重入或SQLite原子提交，T014/T015仍待实现。取消确认要覆盖尚在表单、未进入草稿的文字，未来UI在请求取消时传入 hasUnsavedInput。

**2026-09-15 执行调整**：用户要求采纳竞品反馈并继续下一阶段。本轮提前实施 T033 的稳定错误码与中英字典，以及 T024/T025 的纯 reducer 纠错部分；以失败测试覆盖改名、定向修改/删除组、位置重排、无效编辑与完成中锁定。无新增依赖，既有取消确认复用 T012。应用服务、正式界面和数据库仍按原依赖推进，T004/T011 的真实用户确认条件不变。本轮仅用合成数据，不添加历史编辑、模板、计时或异常退出草稿恢复。

**2026-09-16 保存服务准备**：用户继续开发并明确选择 A 行内录组。首页/历史入口与第三轮交互仍待确认；先提前实现 T013 的保存仓储端口及 T015 的应用编排，用可控制异步提交的测试替身验证并发/失败/重试，不把它视为 SQLite 实现。保存服务依赖同步的 `getState/transition` 状态端口，`transition` 必须在返回前应用真实 reducer；未来 React provider 用同步引用协调状态，不得把 React 异步 dispatch 直接当此端口。每个应用状态容器只创建一个服务实例，保存标识工厂在该容器整个生命周期内不可重复。无新增依赖，真实事务与设备验收保持 T014/T018。

**2026-09-16 日历逻辑提前实现**：用户已认可月历交互，并将背景/内容丰富度留到后续；本轮提前执行T021/T022的纯日期投影部分，继续独立于Expo和SQLite。投影只接收已完成摘要的id/UTC时间和显式设备时区；公历年月、分日、稳定排序与切月由无副作用函数处理。范围为1–9999年，异常输入抛RangeError，未来UI统一映射读取错误而非空历史或原异常文字。T021/T022整项仍待屏幕测试和路由接入，T004第三轮训练键盘/小屏未完成；不改已确认视觉，不引入包或新实体。

**Language/Version**: TypeScript 5.x（由 Expo SDK 56 模板锁定具体版本）；Expo SDK 56；React Native 0.85；React 19.2.3；Node.js >= 20.19.x

**Primary Dependencies**: Expo Router（模板内置）、`expo-sqlite`；不引入第三方状态库、ORM、验证库或日期库

**Storage**: 设备本地 SQLite，仅持久化已完成训练；进行中训练保留在内存，异常退出恢复按规格推迟

**2026-09-16 历史呈现修订**：用户明确选择底部训练/历史并要求日历总览。T021/T022增加月历导航与本地日期分组，复用已保存完成记录，不增加表或新依赖。底层仓储仍按UTC完成时间排序，展示层按设备本地日期分组；具体单场/多场点击、初始选日和触摸细节继续T004，正式实现时覆盖跨午夜、跨月年、闰月、返回与删除标记一致性。趋势与计划功能仍不在001范围。

**Testing**: Jest、`jest-expo`、React Native Testing Library；领域与状态单元测试、组件交互测试、SQLite 适配器边界测试、真机手动验收

**Target Platform**: iOS 16.4+、Android 7+；首个切片优先通过 Expo Go 或兼容 development build 在实体设备验证

**Project Type**: 跨平台移动应用；本切片无服务端、账号或外部 API

**Performance Goals**: 至少 4/5 测试用户在打开应用后 10 秒内进入可记录状态；常规本地保存、读取和删除在用户感知上 1 秒内完成；历史列表在 1000 场训练规模下保持流畅

**Constraints**: 离线核心流程；简体中文/英文切换（默认中文）；公斤单位；单一进行中训练；完成写入不可重复；不收集身份数据；输入界面在小屏和键盘开启时仍可操作；不修改 `legacy/streamlit/`

**Scale/Scope**: 单一设备、单一匿名用户；5 个核心界面；3 个领域实体；设计上支持 1000 场历史训练、每场最多 100 个动作、每个动作最多 100 组，但 UI 不鼓励极端输入

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Constitution gate | Pre-research | Post-design evidence |
| --- | --- | --- |
| Evidence Before Scope | PASS | D-003 已批准 `001`；计划没有添加游戏化、AI、账号或订阅 |
| Specification-First Vertical Slices | PASS | 所有设计均映射到 FR-001–FR-019，且仍是一条可独立验收的记录闭环；FR-019 来自 2026-09-13 用户双语要求 |
| Test-First and Fresh Verification | PASS | 计划要求领域规则、状态转换和 UI 行为先写失败测试，再实现；完成前运行测试、类型、lint、doctor 和设备流程 |
| Learning Is a Deliverable | PASS | `quickstart.md` 提供运行与验收路径；每个后续任务必须附中文学习验收和 L1–L4 目标 |
| Privacy, Safety, and Honest Guidance | PASS | 仅保存必要的本地训练数据；不联网、不含身份、健康平台、AI 或广告用途；支持单条删除 |
| Product and Technical Constraints | PASS | 目标目录为 `apps/mobile/`；使用本地优先架构；依赖被限制为模板能力与持久化所需的 `expo-sqlite` |

**2026-09-12 gate review**：上述 PASS 是历史规划结论。独立审查发现隐私宪章要求真实健身数据采集前完成同意/数据流审查并提供导出路径，而 001 推迟导出。当前允许纯函数及合成数据验证；真实数据采集前必须补充相应隐私规格与批准，不得把“将来公开上架再处理”作为豁免。见 tasks.md T030。该限制不阻塞本轮无存储的领域增量。

## Architecture Decisions

### 1. 依赖方向

```text
Route screens / UI components
          ↓
Workout application service + state reducer
          ↓
Pure domain validation and calculations
          ↓
WorkoutRepository interface
          ↓
SQLite adapter
```

- 路由文件负责屏幕组合和导航，不包含 SQL 或业务规则。
- 领域层不依赖 React Native 或 SQLite，可以在 Jest 中直接测试。
- 应用服务协调完成、删除和错误恢复；只有仓储适配器接触 SQLite。
- UI 通过显式状态渲染 `idle`、`active`、`completing`、`completed` 和 `error`，不得以成功提示替代真实提交结果。
- 2026-09-13 双语补充：同一应用维护中文/英文文案字典；语言状态与训练草稿分离，切换不重挂载输入区、不派发训练事件。默认中文，正式切换入口待结构确认；公斤单位不变。当时领域与 reducer 的中文错误尚未国际化。2026-09-16 已完成 T033 A 的稳定错误码和纯文案映射，不以翻译中文错误字符串作为接口；T033 B 的页面语言状态仍待接入。标签、读屏名称、计数、日期、空状态、确认及失败重试文案均纳入双语验收，用户自填动作名不翻译。正式界面当前仅有讨论稿，纯文案基础已实现，无新增运行依赖。

### 2. 持久化边界

- 用户开始训练时创建内存 `WorkoutDraft`，同一时刻最多一个。
- 编辑动作名称、增加/修改/删除训练组只更新内存草稿。
- 用户确认完成时先验证整个草稿，再用单一 SQLite 事务写入训练、动作和训练组。
- 事务成功后才切换为完成状态并清除草稿；失败则保留草稿，显示可重试错误。
- 已完成训练不可编辑；删除在事务内执行并级联删除下属数据。
- 进行中草稿异常退出后恢复不在本切片实现，避免通过技术便利偷偷扩大规格。

### 3. 状态与依赖策略

- 使用 React Context + `useReducer` 管理单一训练草稿，不添加全局状态依赖。
- 使用小型 `WorkoutRepository` 接口隔离 SQLite，使组件测试可注入内存替身。
- 使用整数保存十分之一公斤，避免浮点数导致显示和比较误差。
- 使用参数化查询或 prepared statements 处理所有用户输入，不拼接 SQL。
- 数据库使用 schema version 和向前迁移函数，为后续字段演进保留入口；本切片只有版本 1。

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-session-loop/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── workout-flow.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # 由 $speckit-tasks 后续创建
```

### Source Code (repository root)

```text
apps/mobile/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── workout/
│   │   │   ├── active.tsx
│   │   │   └── complete/
│   │   │       └── [id].tsx
│   │   └── history/
│   │       ├── index.tsx
│   │       └── [id].tsx
│   ├── features/
│   │   └── workouts/
│   │       ├── domain/
│   │       │   ├── types.ts
│   │       │   ├── validation.ts
│   │       │   └── calculations.ts
│   │       ├── application/
│   │       │   ├── workout-reducer.ts
│   │       │   ├── workout-service.ts
│   │       │   └── workout-provider.tsx
│   │       ├── data/
│   │       │   ├── workout-repository.ts
│   │       │   ├── sqlite-workout-repository.ts
│   │       │   └── migrations.ts
│   │       └── ui/
│   │           ├── exercise-editor.tsx
│   │           ├── set-editor.tsx
│   │           ├── workout-summary.tsx
│   │           └── workout-error.tsx
│   └── test/
│       ├── fixtures.ts
│       └── render-with-providers.tsx
├── __tests__/
│   ├── domain/
│   ├── application/
│   ├── data/
│   └── screens/
├── app.json
├── package.json
├── tsconfig.json
└── package-lock.json

legacy/streamlit/              # 保持不变
```

**Structure Decision**: 使用单一 Expo 应用和按功能纵向组织的 `workouts` 模块。路由、领域、应用服务、数据适配器和 UI 分层足以支持测试与后续演进，同时不提前创建共享包、服务端或复杂模块系统。

## Verification Strategy

1. **领域 RED/GREEN**：先为名称、次数、重量、汇总和时长规则编写失败测试。
2. **状态 RED/GREEN**：先测试开始、编辑、完成中锁定、保存失败保留草稿、成功清空和取消确认。
3. **数据 RED/GREEN**：验证事务边界、排序、详情映射、级联删除和错误转换；原生 SQLite 的最终行为必须在设备流程中观察。
4. **屏幕 RED/GREEN**：以可访问角色和文本操作主流程、无效输入、空状态、确认对话框和错误提示；验证键盘打开时关键按钮仍可到达。
5. **静态质量**：运行 TypeScript、Expo lint、Expo Doctor 和无监听 Jest。
6. **设备验收**：飞行模式执行开始—记录—完成—重启—历史详情—删除，并在小屏、数字键盘和读屏标签条件下检查可操作性；iOS 构建验收须先安装完整 Xcode。

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| SDK 57 处于文档切换期，默认模板版本可能变化 | 脚手架与测试依赖不稳定 | 显式使用 `default@sdk-56` 稳定模板，生成后锁定依赖并运行 `expo-doctor` |
| 当前 Mac 没有完整 Xcode | 无法立即运行 iOS 模拟器或本机构建 | 第一切片可先用兼容设备/Android；进入 iOS 里程碑前安装 Xcode 并补做验证 |
| Jest 环境不能证明真实 SQLite 原生行为 | 事务或持久化问题可能只在设备出现 | 单元测试使用边界替身，设备 quickstart 强制验证真实关闭重开和飞行模式 |
| 完成按钮重复触发 | 可能产生重复历史 | `completing` 状态锁、单一服务命令和事务成功后状态转换；组件与服务测试覆盖重复触发 |
| 进行中训练异常退出会丢失 | 用户体验有限 | 规格明确推迟；不做虚假恢复承诺，后续可靠性切片单独设计 |

## Complexity Tracking

无宪章违规。本切片不需要服务端、账号、ORM、第三方状态管理或多包工作区。

## 2026-09-16 T004通过后的宿主执行基线

已获得三轮核心设计答复，T011可执行。采用当日实际生成的SDK57官方模板兼容组合：Expo57、React Native0.86.3、React19.2.3、TypeScript6.0.x；npm11.9.0仅为当前任务局部工具（npm12与脚手架pack JSON输出不兼容）。上文SDK56/TS5及“默认模板切换期”的条目保留为历史，不再指导此次安装。

选择性引入运行、测试和静态检查依赖，不复制模板示例页面。T011仅为工程环境与测试迁移，正式页面仍按T016/T017/T022/T026分别实现；SQLite包安装不代表T013迁移或T014事务已实现。原生小屏/键盘/触控/读屏、前后台及离线重启仍由T018/T023/T029补证。背景和内容丰富度按用户要求后补，不阻塞已确认核心交互的工程化。

## 2026-09-17 T013/T014 数据层增量

已实现仓储契约、v1迁移、原子保存/详情和Expo连接工厂，不新增依赖。工厂采用`useNewConnection: true`，由单一仓储拥有连接；初始化共享同一Promise，数据操作以Busy互斥。私有连接手动BEGIN IMMEDIATE/COMMIT/ROLLBACK，使提交后的连接清理异常不会伪装成保存失败。失败丢弃连接，关闭也失败时隔离实例，待App重启重新打开；不在不确定连接上重试。

测试层补充Node24内置SQLite的临时文件驱动，执行生产SQL而非模拟SQL结果；Expo原生打开边界单独替换并检查连接选项，已安装的真实Expo类型参与tsc。105项Jest、类型检查和lint通过；桌面文件重开不是App终止重启验收。原79项保持，历史列表/删除与设备性能验收仍独立待做。正式UI沿用全部已确认设计，T016路由依赖风险闸门保持。
