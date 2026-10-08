# FitQuest 对话与项目交接文件

> 用途：在新的 Codex 模式或新任务中恢复完整工作背景。
>
> 整理日期：2026-09-12（Asia/Hong_Kong）
>
> 仓库：`/Users/qqqq/Documents/Codex/2026-07-24/tbwt-236-workout-tool-https-github`
>
> 当前 Git 分支：`main`

## 1. 新任务应先知道的结论

用户希望把原有 Workout Tool 作品集继续完善为一款可以真正上架、获得用户并验证盈利能力的训练 App，同时在开发过程中学习 AI 产品经理和移动端产品开发。

已经确定的方向：

- 产品名称暂用 **FitQuest / Workout Tool**。
- 做 **iOS/Android App**，不是先做微信小程序。
- 目标技术方向是 **Expo + React Native + TypeScript**。
- 首发目标市场是 **中国大陆**。
- 第一批用户以中文力量训练新手为核心，大学生只是便于触达的访谈入口，不是永久限定人群。
- 商业化假设是“免费核心训练记录 + Pro 个性化计划/洞察”，但订阅功能必须在留存与付费意愿验证后开发。
- 当前采用 **Codex 单一主开发 Agent**。Cursor 是 IDE/工作台，不作为第二个同时写代码的自主 Agent。
- 必须使用规格驱动、测试驱动、小垂直切片开发，不能用一个提示一次生成整个 App。
- 每次完成任务都必须附中文 `本步学习验收`，说明用户必须学会什么、目标 L1–L4、证明练习、汇报口径和未掌握时如何复习。

最关键的真实状态：

> 第一条移动端功能已经完成需求规格和 Phase 0/1 技术设计，但还没有生成 `tasks.md`，也还没有创建 `apps/mobile/`。目前不能声称移动 App 已实现或可运行。

## 2. 用户目标与协作偏好

### 2.1 最终目标

1. 将作品集发展成可以上架的正式移动 App。
2. 形成真实的用户价值、留存数据和付费验证，而不是只做演示项目。
3. 在过程中获得 AI 产品经理的完整实践经验：发现、定义、决策、交付、度量和迭代。
4. 用户需要能够亲自讲解项目，而不是只知道“AI 帮我做了”。

### 2.2 学习方式

用户第一次接触 Expo、React Native 等移动端技术，要求边开发边学习。每一步应：

- 用中文解释正在解决的用户问题和技术问题。
- 说明关键概念、重要文件和数据流。
- 给出运行与验证方法。
- 明确有意推迟的功能。
- 不把阅读过材料等同于掌握；必须有可操作或可讲解的验收练习。

掌握等级：

| 等级 | 含义 | 可验证表现 |
| --- | --- | --- |
| L1 能复述 | 理解用途 | 能用自己的话解释概念并给出 FitQuest 例子 |
| L2 能照做 | 能按步骤操作 | 能找到文件、运行命令并读懂正常结果 |
| L3 能独立应用 | 能验收和判断 | 不依赖逐步提示完成任务，并解释取舍与数据流 |
| L4 能教学与决策 | 能教别人和维护选择 | 能比较方案，并依据证据决定是否调整 |

### 2.3 用户研究约定

- 用户明确表示可以自行找到合适的访谈或测试用户。
- 不要求在仓库中填写 15 位候选人名单。
- 招募与联络可以在仓库外进行。
- 这不取消发现证据门槛；后续 MVP 调整仍应依据真实访谈和测试结果。
- 仓库只保存匿名研究结论，不保存姓名、微信、电话等直接身份信息。

## 3. 对话发展时间线

以下是本对话中重要请求与决定的压缩记录，不是逐字聊天导出：

1. 用户提供 GitHub 项目 `Tbwt-236/Workout-Tool`，希望基于现有作品集完善为可上线的小程序或 App。
2. 用户把原项目下载到本地，要求移动到 Codex 工作区并合理整理。
3. 经过讨论，用户倾向参考“训记”的训练记录体验，但希望个人制作一款具有差异化的 App。
4. 用户说明对新技术栈并不完全掌握，要求以规范驱动开发为基础，主要使用 ChatGPT/Codex Agent 和 Cursor IDE，边开发边学习。
5. 用户曾要求搜索主流开发 skills，并让 Cursor 学习四项质量技能：
   - `test-driven-development`
   - `systematic-debugging`
   - `verification-before-completion`
   - `requesting-code-review`
6. Cursor 一度打开了只有 `.agents/`、`.cursor/` 的错误或不完整工作目录，未发现产品源码；后续明确当前正确仓库根目录就是本文顶部路径。
7. 用户询问是否可以在 Codex 与 Cursor 之间减少来回切换，最终同意由 Codex 作为主开发 Agent，Cursor 主要作为 IDE/查看和手动操作工具。
8. 用户授权制定以“最终上架盈利 + 学习 AI 产品经理”为目标的工作计划，并确认：
   - 中文力量训练新手为核心用户；
   - 推迟公开社交、饮食和自由生成式 AI 计划；
   - 可从同学、朋友、健身房和训记用户招募；
   - 中国大陆作为首发目标市场。
9. 用户后来明确“不用考虑 15 位用户名单”，招募由其自行安排，项目继续推进。
10. 用户要求每次任务完成后都规定必须学会什么、掌握哪些内容以及掌握到什么程度。该要求已写入 constitution、AGENTS 和学习路径。
11. 用户曾计划换 Windows 电脑继续，随后因迁移麻烦取消，决定继续在 Mac 上工作。
12. 第一条训练记录闭环规格获得批准，随后完成技术研究、数据模型、契约、计划和 quickstart。
13. 用户第一次接触 Expo、React Native 等技术，要求详细解释并提供官方资料。已新增移动技术栈学习手册，但该轮改动尚未提交。
14. 当前请求：把对话与项目上下文封装为 Markdown，以便在新模式重新开始。

## 4. 产品定位与已批准决策

权威决策记录位于 [`docs/product/DECISIONS.md`](../product/DECISIONS.md)。当前已批准：

### D-001：初始市场、用户与 MVP 边界

- 核心用户：中文力量训练新手。
- 大学生：首批访谈入口，不是永久人群定义。
- 核心价值：帮助用户持续完成真实训练。
- 初始差异化：低摩擦记录、可降级训练任务、可解释游戏化反馈。
- MVP 暂不包含公开社交、饮食系统和自由生成式 AI 训练计划。
- 首发市场：中国大陆。

### D-002：用户招募自行管理

- 产品负责人负责寻找、联系和安排用户。
- 不把仓库内候选名单作为规格或开发阻塞项。
- 仍需真实访谈和可用性证据，不能把假设描述成已验证事实。

### D-003：批准第一条移动端训练记录闭环

- `specs/001-workout-session-loop/spec.md` 是已批准需求来源。
- 允许进入技术计划和任务拆分。
- 不授权扩大范围；账号、同步、模板、计时、游戏化、AI、订阅继续推迟。

## 5. 第一条功能 `001-workout-session-loop`

### 5.1 用户价值

匿名用户在无网络情况下可以：

1. 开始一场训练。
2. 添加动作。
3. 记录次数和可选重量。
4. 修改动作名称，或修改/删除未完成训练组。
5. 确认完成训练。
6. 在历史列表和详情中看到已保存内容。
7. 二次确认后删除指定历史记录。

### 5.2 关键业务边界

- 同时最多一场进行中的训练。
- 动作名去除首尾空格后为 1–80 个字符。
- 次数为 1–999 的整数。
- 可选重量大于 0、不超过 1000 kg，最多一位小数。
- 空训练不能完成。
- 完成操作必须二次确认并仅生成一条历史。
- 保存失败不能出现虚假成功；草稿必须保留以便重试。
- 已完成记录需跨 App 重启保留。
- 核心流程必须离线可用。

### 5.3 有意推迟

- 登录、账号、云同步和跨设备恢复。
- 动作库、训练模板和新手目标设置。
- 休息计时、个人最佳和趋势图。
- App 异常终止后的进行中训练恢复。
- XP、等级、任务、连续训练、勋章等游戏化。
- AI、订阅、支付、推送、健康平台同步和公开社交。
- 全量导出和账户级数据删除。

## 6. 技术方案

### 6.1 规划基线

- Expo SDK 56。
- React Native 0.85。
- React 19.2.3。
- TypeScript 5.x，由 Expo 模板锁定具体版本。
- Node.js 20.19.x 或兼容的更新版本。
- Expo Router。
- React Context + `useReducer`。
- `expo-sqlite`。
- Jest + `jest-expo` + React Native Testing Library。

上述版本是 2026-08-04 的规划基线。真正创建 `apps/mobile/` 当天必须重新核对 Expo 官方兼容矩阵、模板、Expo Go、测试包和 Node 版本，然后锁定 `package-lock.json`。架构方向可保持，具体版本不得盲目照抄过期值。

### 6.2 架构依赖方向

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

职责：

- 路由和 UI：显示与用户交互，不写 SQL。
- Reducer：纯函数状态转换，不执行数据库或导航副作用。
- Domain：训练输入验证、计算和业务规则。
- Service：编排开始、完成、失败恢复和删除等用例。
- Repository interface：隔离业务与具体存储。
- SQLite adapter：SQL、事务、迁移和数据映射。

### 6.3 内存与持久化

- 进行中的 `WorkoutDraft` 保存在内存 Context/reducer 中。
- 用户确认完成前，只编辑内存草稿。
- 完成时由应用服务验证完整草稿。
- Repository 在持久化边界再次验证。
- 使用一个 SQLite 事务写入 workout、exercises 和 sets。
- 成功后才清空草稿并进入完成摘要。
- 失败则回滚所有数据库写入并保留草稿。

当前设计不承诺异常终止后的草稿恢复。

### 6.4 SQLite 数据模型

```text
workouts 1 ────── * exercises 1 ────── * sets
```

- `workouts`：开始时间、完成时间、时长。
- `exercises`：所属训练、名称、顺序。
- `sets`：所属动作、顺序、次数、重量。
- 重量以十分之一公斤的整数保存：`62.5 kg → 625`。
- 外键级联删除，删除训练时移除其动作和训练组。
- `PRAGMA user_version = 1`，未来用前向 migration 升级结构。

## 7. 为什么选择 App、React Native 和 Expo

- 目标是长期训练工具，需要通知、订阅、设备能力和商店分发路径，App 比小程序更符合长期目标。
- React Native 可以共享大部分 iOS/Android 业务和界面代码。
- Expo 在 React Native 上提供模板、CLI、SDK、开发构建和 EAS 衔接，降低个人开发的原生配置成本。
- React 是组件与状态模型；React Native 是原生移动 UI 渲染层；Expo 是围绕 React Native 的应用框架与工具链。
- Expo Go 只是早期通用预览客户端，不等同于 Expo。项目复杂后会使用自定义 development build。
- Node.js 目前用于运行开发工具，不表示第一条切片存在 Node 业务后端。
- TypeScript 是运行前静态类型检查，不能替代输入的运行时验证。

详细学习材料见 [`docs/learning/MOBILE_TECH_STACK_FOUNDATIONS.md`](../learning/MOBILE_TECH_STACK_FOUNDATIONS.md)。

## 8. 规格驱动与质量工作流

需求和计划由 GitHub Spec Kit 管理：

```text
constitution
→ specify
→ clarify / checklist
→ plan
→ tasks
→ analyze
→ implement
→ converge（如需）
```

实现质量流程：

```text
规格与任务
→ test-driven-development（RED → GREEN → REFACTOR）
→ systematic-debugging（出现故障时先定位根因）
→ verification-before-completion（新鲜证据后才声称完成）
→ requesting-code-review（有意义的变更完成后、合并前）
```

下一步尚未完成的是：

1. 使用 `speckit-tasks` 根据现有 spec、plan、research、data model 和 contract 生成 `tasks.md`。
2. 人工审查任务是否为小型、依赖有序的垂直切片。
3. 使用 `speckit-analyze` 检查 spec、plan、tasks 一致性。
4. 用户确认首批任务后，再开始 TDD 实现。

不要跳过 tasks/analyze 直接创建完整 App。

## 9. 仓库目录和权威来源

### 9.1 来源优先级

发生冲突时按以下优先级处理：

1. 当前仓库根目录的 `AGENTS.md`。
2. [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)。
3. 已批准的 [`specs/001-workout-session-loop/spec.md`](../../specs/001-workout-session-loop/spec.md)。
4. 同一功能的 plan、research、data model、contract 和 tasks。
5. [`docs/product/PRODUCT_AND_DELIVERY_PLAN.md`](../product/PRODUCT_AND_DELIVERY_PLAN.md) 与 [`docs/product/DECISIONS.md`](../product/DECISIONS.md)。
6. 本交接文件。本文件是上下文摘要，不替代正式规格。

### 9.2 重要文件

- 原始 Streamlit：[`legacy/streamlit/`](../../legacy/streamlit/)
- 产品总计划：[`docs/product/PRODUCT_AND_DELIVERY_PLAN.md`](../product/PRODUCT_AND_DELIVERY_PLAN.md)
- 产品决策：[`docs/product/DECISIONS.md`](../product/DECISIONS.md)
- AI 产品经理学习路径：[`docs/learning/AI_PRODUCT_MANAGER_PATH.md`](../learning/AI_PRODUCT_MANAGER_PATH.md)
- 移动技术栈手册：[`docs/learning/MOBILE_TECH_STACK_FOUNDATIONS.md`](../learning/MOBILE_TECH_STACK_FOUNDATIONS.md)
- 用户访谈材料：[`docs/research/INTERVIEW_GUIDE.md`](../research/INTERVIEW_GUIDE.md)
- 首个功能规格：[`specs/001-workout-session-loop/spec.md`](../../specs/001-workout-session-loop/spec.md)
- 实施计划：[`specs/001-workout-session-loop/plan.md`](../../specs/001-workout-session-loop/plan.md)
- 技术研究：[`specs/001-workout-session-loop/research.md`](../../specs/001-workout-session-loop/research.md)
- 数据模型：[`specs/001-workout-session-loop/data-model.md`](../../specs/001-workout-session-loop/data-model.md)
- 应用与仓储契约：[`specs/001-workout-session-loop/contracts/workout-flow.md`](../../specs/001-workout-session-loop/contracts/workout-flow.md)
- 未来运行与设备验收：[`specs/001-workout-session-loop/quickstart.md`](../../specs/001-workout-session-loop/quickstart.md)

### 9.3 受保护内容

- 不修改或删除 `legacy/streamlit/`，它是原作品集参考。
- 不移动大型目录，除非先确认源路径和目标路径。
- 不覆盖用户已有改动。
- 不在没有验证证据时声称功能可运行、测试通过或已经上架。

## 10. 当前 Git 与工作区状态

整理交接文件前，`git status --short` 为：

```text
 M README.md
 M docs/learning/AI_PRODUCT_MANAGER_PATH.md
?? docs/learning/MOBILE_TECH_STACK_FOUNDATIONS.md
```

这些是上一轮“移动技术栈学习手册”任务的未提交变更，应保留并审查，不得当作垃圾删除。本交接文件本身也会成为新的未跟踪文件。

最近提交：

```text
9720da4 docs: plan first mobile workout slice
242cd9d docs: require mastery checks for every task
e3888d5 docs: define first workout logging slice
6a3608d chore: initialize Spec Kit and discovery workflow
271f641 chore: establish FitQuest migration baseline
```

当前分支是 `main`。用户没有在本轮要求提交或推送，因此新任务应先检查 diff，再决定是否在用户授权的任务范围内提交。

## 11. 已知本地环境事实

2026-08-04 的检查结果：

- 普通 shell 当时没有可用的 `node`。
- Codex bundled Node 当时为 v24.14.0。
- Mac 当时只有 Xcode Command Line Tools，没有完整 Xcode。
- 因此尚不能声称 iOS 模拟器或本地 iOS 构建环境已经就绪。

这些事实可能已经变化。进入脚手架任务时应重新运行环境检查，不要直接沿用旧结果。

## 12. 新任务的推荐开场动作

新模式接手后，先进行只读检查：

```bash
pwd
git status --short
git branch --show-current
git log --oneline -5
test -f specs/001-workout-session-loop/spec.md
test -f specs/001-workout-session-loop/plan.md
test -f specs/001-workout-session-loop/tasks.md
test -d apps/mobile
```

预期在本交接时点：

- `spec.md`、`plan.md` 存在。
- `tasks.md` 不存在。
- `apps/mobile/` 不存在。
- 学习手册相关改动和本交接文件尚未提交。

随后应：

1. 完整读取根目录 `AGENTS.md`。
2. 读取 constitution 和 `001` 的所有设计工件。
3. 检查并保护当前未提交变更。
4. 如果用户指示继续开发，先使用 `speckit-tasks`，不要直接实现整款 App。
5. 每一步结束附 `本步学习验收`。

## 13. 可复制到新模式的启动提示词

```text
请接管 FitQuest 项目，仓库路径是：
/Users/qqqq/Documents/Codex/2026-07-24/tbwt-236-workout-tool-https-github

先完整读取并遵守：
1. AGENTS.md
2. docs/handoff/2026-09-12-conversation-handoff.md
3. .specify/memory/constitution.md
4. specs/001-workout-session-loop/ 下已有的 spec、plan、research、data-model、contract 和 quickstart

先做只读状态检查，保护所有未提交改动，不要修改 legacy/streamlit/。
当前真实进度应是：第一条功能已批准并完成技术设计，但 tasks.md 和 apps/mobile/ 尚未创建。若实际状态与交接文件不同，以当前文件系统和 Git 证据为准并报告差异。

继续采用单一主 Agent、规格驱动、小垂直切片和 TDD。下一步优先生成并审查 001 的 tasks.md，再做一致性分析；不要一次性生成完整 App，不要增加未批准范围或依赖。

我第一次接触 Expo、React Native 等技术。每次任务结束必须给出中文“本步学习验收”，包含必须学会、L1–L4 目标、具体证明练习、可用于项目汇报的真实说法，以及未掌握时应复习什么。
```

## 14. 本次交接任务的学习验收

### 必须学会

- 正式规格与交接摘要的区别。
- 新模式接手项目时为什么必须先检查 Git 和文件系统。
- 当前项目究竟完成到哪里，哪些能力还不存在。

### 目标等级

- 交接与来源优先级：L1。
- 当前阶段判断：L1。

### 掌握证据

用户能回答：

1. 当前为什么不能直接说“App 已经完成”？
2. 下一步为什么是生成 `tasks.md`，而不是一次生成整个 App？
3. 新任务发现状态与本文不一致时，应相信本文还是当前 Git/文件证据？

正确要点：尚无 `apps/mobile/`；任务需要由已批准规格拆分；当前证据和正式来源优先于交接摘要。

### 汇报口径

> FitQuest 已完成产品方向、首个训练记录闭环的功能规格和技术设计，并建立了学习与质量流程。移动端源码尚未开始；下一步是把规格拆成可验证的小任务，完成一致性审查后再进行测试驱动实现。

### 未掌握时的处理

重新阅读本文第 1、5、8、9、10 和 12 节，并亲自执行第 12 节的只读命令，对照输出说明当前阶段。
