# Contract: Workout Recording Flow

**Date**: 2026-08-04

**Feature**: [../spec.md](../spec.md)
**Data model**: [../data-model.md](../data-model.md)

## 1. Purpose

本契约定义屏幕、应用服务和本地仓储之间可观察的行为。它不是外部网络 API，也不授权任何服务端或账号功能。

## 2. Route and Screen Contract

| Route | Required states | Primary actions | Success destination |
| --- | --- | --- | --- |
| `/` | 无历史、存在历史、已有进行中训练 | 开始训练、继续训练、查看历史 | `/workout/active` 或 `/history` |
| `/workout/active` | 空草稿、有动作、有效组、验证错误、保存错误、完成中 | 添加/改名动作、添加/修改/删除组、取消、完成 | 完成后 `/workout/complete/{id}` |
| `/workout/complete/{id}` | 已保存摘要、记录不存在 | 查看历史详情、返回首页 | `/history/{id}` 或 `/` |
| `/history` | 月历标记、选日训练列表、空历史/空日期、进行中训练、读取错误 | 切月、选日、开始/继续训练、打开记录、重试 | `/workout/active` 或 `/history/{id}` |
| `/history/{id}` | 完整详情、不存在、读取错误、删除确认 | 返回、删除、重试 | 删除后 `/history` |

2026-09-16 日历方向：历史以月历为主，按设备本地日期分组，所选日的训练按完成时间倒序，同时间按ID倒序；同日多场均可进入详情。分组不改写UTC完成时间，仓储仍返回按完成时间排序的记录。返回时保留浏览月份与日期，删除后重新计算标记。默认打开历史及底部训练/历史已采纳；用户已认可单场日期直接详情、多场在日历下选择的讨论稿交互，正式路由仍待接入。训练键盘/小屏与设备验收不随该反馈通过。

Every interactive control must have a user-visible label or accessibility label. Validation messages must be associated with the relevant input, and confirmation dialogs must identify the destructive action. Primary touch targets must meet the active platform's recommended minimum size (at least 44 pt on iOS and 48 dp on Android). The active-workout form must scroll so the focused input and completion/cancellation actions remain reachable when the keyboard is visible or the device width is 320 logical pixels.

## 3. Application Commands

### `startWorkout()`

- **Precondition**: no active draft.
- **Success**: creates one draft with `startedAt`, returns active state.
- **Already active**: returns the existing draft; must not create a second draft.
- **Persistence**: none.

### `addOrRenameExercise(name)`

- **Validation**: trimmed name length 1–80.
- **Success**: updates the active draft and contiguous positions.
- **Failure**: returns field-specific validation feedback; draft remains otherwise unchanged.

### `addOrUpdateSet(exerciseKey, reps, optionalWeightKg)`

- **Validation**: reps integer 1–999; optional weight >0 and <=1000 with no more than one decimal.
- **Success**: stores normalized domain values and updates derived counts.
- **Failure**: no invalid value enters the draft.

2026-09-16 用户确认“自动收起键”：界面在记录成功后收起键盘；校验失败时保留输入并聚焦错误字段。下一组继续沿用本场刚记录的数值，不自动提交下一组。该规则由页面在成功结果后执行，不让纯领域逻辑调用键盘；讨论稿已固定此选择，原生效果仍由T029验收。

### `removeSet(exerciseKey, setKey)`

- **Success**: removes only the target set and compacts positions.
- **Last set**: draft may become incomplete; completion must then be blocked.

### `cancelWorkout(confirmed)`

- **Empty draft**: cancels immediately and creates no history record.
- **Draft with entered content, not confirmed**: returns to active draft without changes.
- **Draft with entered content, confirmed**: clears the draft and creates no history record.

### `completeWorkout(confirmed)`

- **Not confirmed**: returns to active draft.
- **Invalid draft**: returns validation feedback and performs no database write.
- **Confirmed valid draft**: enters `completing`, invokes `saveCompletedWorkout` once, and blocks duplicate completion actions.
- **Commit success**: receives completed workout ID, clears draft, then navigates to saved summary.
- **Commit failure**: returns a recoverable storage error and preserves the full draft for retry.

2026-09-16 应用层绑定：`requestCompletion()` / `requestCancellation(hasUnsavedInput)` 先走 reducer 的确认状态；随后 `completeWorkout(confirmed)` / `cancelWorkout(confirmed)` 只接受对应操作的确认。空草稿取消由 request 阶段直接完成。服务通过同步 `getState/transition` 端口更新状态，每个状态容器持有一个实例；UI/provider 后续负责把返回的有效成功ID用于导航。`NotConfirmed`、`NoActiveWorkout`、`Superseded` 是命令控制结果，不直接作为界面错误文字。Superseded 不可触发旧摘要导航。

保存接口失败或抛错必须表示本次没有已提交记录，否则不能安全重试。T014已用真实桌面SQLite验证SQL写入与提交失败回滚及服务联调；Expo原生桥和设备证据仍由T018负责。

## 4. Repository Contract

### `initialize()`

- Applies pending forward-only migrations.
- Enables foreign keys and required database settings.
- Returns ready only after schema v1 is usable.
- Converts initialization failure to a recoverable `StorageUnavailable` result.

### `saveCompletedWorkout(draft, completedAt)`

- Revalidates the full aggregate at the boundary.
- Inserts workout, exercises and sets in one transaction.
- Returns the new completed workout ID only after commit.
- Rolls back all writes on any failure.
- Repeated calls while one completion is in progress are rejected as `Busy` and do not create a second row.

### `listCompletedWorkouts()`

- Returns summaries ordered by `completedAt` descending.
- Each summary contains ID, displayed date, duration, exercise count and set count.
- Empty database returns an empty list, not an error.

### `getCompletedWorkout(id)`

- Returns the complete nested record with exercises and sets in position order.
- Unknown ID returns `NotFound`, which the UI represents without crashing.

2026-09-17 T013/T014实现约定：一个应用数据容器持有一个仓储实例及私有连接；初始化并发共享同一次迁移。保存/详情操作互斥，冲突返回`Busy`，读取不会窥见进行中的半笔事务。一次参数化JOIN读取一致聚合，按动作/组位置排序并重验证，不把损坏数据当空记录。SQL失败的连接关闭后再新建；若关闭也失败，隔离本仓储实例并保持`StorageUnavailable`，需要重启后重新打开，不在可疑连接上重试。`COMMIT`成功之后不运行可能抛错的SQL或连接清理，避免已提交却返回失败。Expo连接工厂已实现，T016尚未挂载provider。

### `deleteCompletedWorkout(id, confirmed)`

- No database call occurs without confirmation.
- Confirmed deletion removes only the selected workout and its descendants in one transaction.
- Unknown ID returns `NotFound`; other rows remain unchanged.

2026-09-26实现：确认须严格为true，未确认或非法ID不触库；有效操作与保存/读取互斥。详情失败保留显示，重试重新确认；NotFound呈现缺失并使历史刷新。只有提交成功后返回原日历位置，更新当天列表/标记，不修改当前训练草稿。确认随详情ID重置；页面卸载后旧响应不得导航。手机行为仍按Q-006/Q-009验收。

## 5. Error Contract

| Error | User-facing behavior | Retry state |
| --- | --- | --- |
| `ValidationError` | Highlight field and state accepted range in the current interface language (Simplified Chinese or English) | User edits the draft |
| `Busy` | Keep current screen and prevent duplicate action | Wait until current command resolves |
| `StorageUnavailable` | State that save/read/delete did not complete | Preserve draft or current list and offer retry |
| `NotFound` | State that the selected history record no longer exists | Return to refreshed history |
| `UnexpectedStorageError` | Generic local-data failure without false success | Preserve safe state; allow retry or return |

Error messages must not expose SQL text, file paths, stack traces or implementation details to the user.

## 6. Acceptance Mapping

| Contract section | Specification coverage |
| --- | --- |
| Routes and screen states | FR-001, FR-009, FR-012–FR-014 |
| Draft commands | FR-002–FR-010, FR-017 |
| Completion transaction | FR-011, FR-015, FR-018 |
| History repository | FR-013–FR-016 |
| Error contract | FR-007, FR-018 and documented edge cases |
