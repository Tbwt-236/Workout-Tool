# Contract: Local Data Notice and JSON Export

**Updated**: 2026-10-12 | **Status**: 已实施内部契约，无外部服务API

[Spec](../spec.md) · [Model](../data-model.md)

## 界面

历史右上「数据 / Data」打开底部面板，×关闭回历史；简短「导出 / Export」「重试 / Retry」「准备中… / Preparing…」。全部已完成、明文范围可见，说明可展开；0场禁用导出，读取失败单独重试，系统返回后仍留面板。无独立路由/第三tab/第二确认；操作不改变原训练、输入、语言或日历位置。

## 仓储与编码

`WorkoutHistoryRepository.readExportSnapshot()`与保存/删除共用同一连接和互斥；一次JOIN读取全部聚合，复用既有读校验。返回成功快照或稳定仓储错误；Busy不降级为空。数据库锁在编码、文件和系统分享前释放。

`encodeExportDocument(snapshot, exportedAt): string`仅输出model中的v1字段，保留UTC、次序、原名称、null和十分之一公斤。无效值抛出，由服务映射为ReadFailed。空快照结构可表达，但服务拒绝用户空历史导出。

## 导出服务

`createExportService({repository, files, now})`提供`getState/subscribe/start(locale, waitFor)/cancelPending/cleanup`。

1. `start`同步获取唯一活动任务；已忙返回Busy，不影响正在运行任务。
2. 等既有历史读队列，再检查有效性；发布snapshotting、读取一次、释放仓储锁。
3. 编码，检查分享可用；机会性清理受控旧缓存，再写完整文件。
4. 每个异步阶段后检查取消意图；分享前标记handed并直接调用系统。
5. finally仅释放自己的文件；未开始交接则尝试删除，已经尝试交接则保留；IO收尾后解除任务锁。

交接前关闭或App非active取消继续分享，不中断已有SQL/文件IO、不提前解除锁。交接后后台不假装撤回；Promise<void>结束不代表保存/取消/读完，界面恢复idle而非显示成功。原生API不返回时保持忙，不用超时并发打开另一选择器；重启清除内存锁但不自动分享。

## 文件端口

`ExportFiles`：`cleanup()`、`isSharingAvailable()`、`write(document): Promise<uri>`、`share(uri, locale)`、`release(uri, remove)`。

实际适配器只接受专属目录内严格命名且仍活动的完整非空JSON进行分享。受控URI比较与活动Set禁止任意路径。文件先exclusive create partial、UTF-8同步write、await move，再核完整文件；失败仅清理自己创建的资源。系统分享MIME为application/json、UTI为public.json，无预设接收方。

清理仅扫描专属目录直接条目：严格名称、非活动、有效非未来mtime且至少24小时；删除失败下次启动/导出重试。不持久化分享阶段；不碰训练库或用户保存的副本。该工程策略可能使很迟读取的接收方需要重导出；不声称安全擦除或接收方已读完。

## 故障

| 错误 | 行为 |
| --- | --- |
| Busy | 稍后显式重试，不开第二任务 |
| Empty | 不生成文件/不分享 |
| ReadFailed | 不漏坏数据、不生成部分历史 |
| WriteFailed | 清理自己创建的部分文件，原训练不变 |
| SharingUnavailable | 不生成替代网络路径 |
| ShareFailed | 不冒称保存成功；保守留完整缓存，允许显式重试 |
| Cancelled | 交接前实际取消，无迟到分享 |

不展示原始异常。已安装Android Sharing源码在启动Activity抛异常路径有pendingPromise未清风险；重试可能仍失败，文案提示必要时重启。当前未改SDK、不宣称完全恢复已证。

## 本步学习验收

目标L2：解释“取消继续分享”与“撤回已交系统”的区别，指出为什么任务解锁不立即删文件。练习按一轮正常返回和一轮写入中关闭追踪资源；汇报：“任务串行且交接前可失效，系统返回不作保存收据。”未达标时重走状态表；里程碑范围判断目标L3，学习待实际证明。
