# Data Model: 本地数据说明与 JSON 导出

**Updated**: 2026-10-12 | **Status**: 已实施内部模型

[Spec](spec.md) · [Contract](contracts/local-data-control.md)

## 数据说明

中英文案随App分发，不新增数据库表，不保存阅读/接受时间、身份或轨迹。关闭说明不改变训练权限或草稿。

## WorkoutExportSnapshot

`snapshotAt`为读取前记录的UTC时间，非可信外部时钟；`workouts`为全部已完成聚合，按完成时间降序、同时间内部ID降序。动作与组按连续position；内部ID只用于读取/排序，不导出。单SQL一致快照，任何坏聚合全量失败。空库返回空数组，但用户界面和服务不导出空历史。

## ExportDocument v1

| 字段 | 值/约束 |
| --- | --- |
| format | `fitquest-workouts` |
| schemaVersion | `1` |
| exportedAt / snapshotAt | 规范UTC时间，分别为编码与读取时点 |
| weightUnit | `tenths_of_kg`，625表示62.5kg |
| workouts | 保持快照次序 |
| workouts[].startedAt / completedAt / durationSeconds | 原时间与领域校验时长 |
| workouts[].exercises | 原次序，可有无组动作；整场至少一个有效组 |
| exercises[].name / position | 原规范化名称，连续零起位置 |
| exercises[].sets[].position / reps / weightTenthsKg | 原位置/有效次数/十分之一公斤整数或null |

白名单不含id、localKey、草稿、原始输入、语言、统计、诊断或阅读轨迹。null不转换为0；不翻译名称。编码前再次验证领域、时间、时长、计数和规范名称；JSON不静默吞undefined/非法值。

## ExportState与资源

内存阶段`idle → preparing → snapshotting → preparing → writing → sharing → idle/error`。`current`对象包含取消意图和是否已开始交接；单任务锁保留到release收尾。`readingExport`只在snapshotting为真，关闭面板不提前释放。错误为Busy/Empty/ReadFailed/WriteFailed/SharingUnavailable/ShareFailed；Cancelled仅表示交接前实际撤销。

文件目录`Paths.cache/fitquest-exports`，唯一名称`export-<时间>-<序号>-<随机十六进制>.partial/.json`；名称不含训练内容。先完整写UTF-8再等待move并核大小，活动Set跨面板存活。move会改变原File.uri，因此保留两个不可变URI处理失败，避免误删完成文件。

无持久交接清单。进程重启不恢复分享；专属目录内严格命名的非活动文件按mtime至少24小时尝试清理。未知名称、目录、无效或未来mtime不删除；清理失败留待后续。已交接文件保守保留到后续资格扫描；系统也可能提前清理。这不表示接收方已读完，也不保证实际保留时长。

## 本步学习验收

字段白名单、null、缓存与原库区别L2。练习解析一份合成JSON，找出625对应的重量及null含义，再说明为什么没有内部ID。汇报：“JSON v1保存已完成训练的必要字段，草稿和内部标识不导出。”未达标时对照表逐字段核对；模型实施完成，本人掌握待演示。
