# Data Model: 训练记录最小闭环

**Date**: 2026-08-04

**Feature**: [spec.md](spec.md)
**Research**: [research.md](research.md)

## 1. Model Boundary

本切片有两种数据生命周期：

```text
内存：WorkoutDraft → 编辑 / 验证 / 取消
                         ↓ 用户确认完成
持久化：CompletedWorkout → 历史列表 / 详情 / 删除
```

进行中草稿不会写入数据库，因此应用被系统终止后不保证恢复。只有完整验证并成功提交的训练才成为历史记录。

## 2. Domain Entities

### WorkoutDraft

进行中的唯一训练草稿。2026-09-12 实现说明：纯领域 `WorkoutDraft` 类型承载 startedAt/exercises；下表 state/error 属于应用 reducer 的生命周期状态（2026-09-13已实现T012，不含服务或持久化）。输入名称按 Unicode 码点计数，时间由 Date.toISOString() 产生；完整聚合校验拒绝不可往返的日历日期。

| Field | Type | Rules |
| --- | --- | --- |
| `startedAt` | UTC timestamp | 开始训练时创建；当前草稿生命周期内不修改 |
| `exercises` | `DraftExercise[]` | 按 `position` 排列；允许编辑到空，但空草稿不能完成 |
| `state` | enum | `active`、`completing` 或 `error`；成功后草稿被清除 |
| `error` | optional error | 只包含可向用户解释的错误类型和中文恢复提示 |

### DraftExercise

草稿中的动作。

| Field | Type | Rules |
| --- | --- | --- |
| `localKey` | string | 仅用于本次内存编辑和列表稳定渲染，不持久化 |
| `name` | string | 去除首尾空格后 1–80 个字符 |
| `position` | integer | 从 0 开始，在当前草稿内唯一且连续 |
| `sets` | `DraftSet[]` | 可以暂时为空；完成时至少有一个动作包含有效组 |

### DraftSet

草稿中的一次训练组记录。

| Field | Type | Rules |
| --- | --- | --- |
| `localKey` | string | 内存编辑键，不持久化 |
| `position` | integer | 从 0 开始，在所属动作内唯一且连续 |
| `reps` | integer | 1–999 |
| `weightTenthsKg` | integer or null | `null` 表示不记录负重；否则为 1–10000，对应 0.1–1000.0 kg |

### CompletedWorkout

已完成且只读的训练聚合。

| Field | Type | Rules |
| --- | --- | --- |
| `id` | positive integer | 数据库生成，设备内唯一 |
| `startedAt` | UTC timestamp | 来自草稿 |
| `completedAt` | UTC timestamp | 用户确认完成时创建 |
| `durationSeconds` | non-negative integer | `max(0, completedAt - startedAt)` |
| `exercises` | `CompletedExercise[]` | 至少一个动作，且总有效组数至少为 1 |
| `exerciseCount` | derived integer | `exercises.length`，列表查询时计算 |
| `setCount` | derived integer | 所有动作组数之和，列表查询时计算 |

## 3. Persistence Schema v1

### `workouts`

| Column | SQLite affinity | Constraints |
| --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY |
| `started_at` | TEXT | NOT NULL，UTC ISO timestamp |
| `completed_at` | TEXT | NOT NULL，UTC ISO timestamp |
| `duration_seconds` | INTEGER | NOT NULL，CHECK >= 0 |

### `exercises`

| Column | SQLite affinity | Constraints |
| --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY |
| `workout_id` | INTEGER | NOT NULL，FK → `workouts.id` ON DELETE CASCADE |
| `name` | TEXT | NOT NULL，trim 后长度 1–80 |
| `position` | INTEGER | NOT NULL，CHECK >= 0，所属训练内唯一 |

### `sets`

| Column | SQLite affinity | Constraints |
| --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY |
| `exercise_id` | INTEGER | NOT NULL，FK → `exercises.id` ON DELETE CASCADE |
| `position` | INTEGER | NOT NULL，CHECK >= 0，所属动作内唯一 |
| `reps` | INTEGER | NOT NULL，CHECK 1–999 |
| `weight_tenths_kg` | INTEGER | NULL 或 CHECK 1–10000 |

### Indexes and Versioning

- `UNIQUE(exercises.workout_id, exercises.position)`
- `UNIQUE(sets.exercise_id, sets.position)`
- `INDEX workouts(completed_at DESC)`
- `PRAGMA foreign_keys = ON`
- `PRAGMA journal_mode = WAL`
- `PRAGMA user_version = 1`

迁移函数必须在应用数据提供者初始化时运行。后续 schema 变化通过递增 `user_version` 向前迁移，不删除用户历史。

2026-09-17 v1实现：`migrations.ts`在事务内执行0→1，并探测必需列；重复初始化保留数据，高于1或结构缺失返回不可用而不降级/重建。每个连接检查WAL与外键设置。主键限制为正的JavaScript安全整数；时长/位置/次数/非空重量检查SQLite实际整数类型，避免INTEGER affinity接受小数。规范UTC、全聚合连续位置及有效组由保存边界再次校验，详情读取也验证聚合。

## 4. Relationships

```text
workouts 1 ────── * exercises 1 ────── * sets
         delete cascade      delete cascade
```

- 完成事务必须按 Workout → Exercises → Sets 顺序插入。
- 任一步骤失败必须回滚整个事务，不得出现只有训练标题却没有训练组的部分记录。
- 删除 Workout 必须在同一事务中删除全部下属数据。

## 5. State Transitions

```text
idle
  └─ START ──> active
                 ├─ EDIT ───────────────> active
                 ├─ REQUEST_CANCEL ─────> cancel-confirmation
                 │                          ├─ KEEP ──> active
                 │                          └─ CONFIRM ──> idle
                 └─ REQUEST_COMPLETE ───> completion-confirmation
                                            ├─ KEEP ──> active
                                            └─ CONFIRM ──> completing
                                                              ├─ COMMIT_OK ──> completed → idle
                                                              └─ COMMIT_ERROR ──> error → active on retry
```

Rules:

- `START` 在 `active`、`completing` 或 `error` 状态不得创建第二个草稿。
- `REQUEST_COMPLETE` 之前执行全草稿验证；没有有效组时保持 `active`。
- `completing` 状态禁止再次触发完成或编辑。
- 只有数据库事务成功后才能导航到完成摘要。
- 保存失败后草稿内容必须原样保留；用户可以重试或取消。

## 6. Validation and Display Mapping

| User input | Domain value | Display |
| --- | --- | --- |
| `"  深蹲  "` | `"深蹲"` | `深蹲` |
| `"8"` reps | `8` | `8 次` |
| empty weight | `null` | 不显示公斤值或显示“未记录重量”，不推断为徒手 |
| `"62.5"` kg | `625` tenths | `62.5 kg` |

无效输入不得进入领域实体。中文错误必须指出字段和修正方式，例如“次数请输入 1–999 的整数”，而不是仅显示“输入错误”。

## 7. Privacy Boundary

- 数据库仅包含训练时间、动作名称、次数和重量。
- 不包含姓名、手机号、账号、位置、设备标识、广告标识或健康平台数据。
- 本切片没有网络传输、备份或跨设备同步。
- 单条训练删除立即移除其动作和组；全量导出和全量删除由后续隐私规格定义。
