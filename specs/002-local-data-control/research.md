# 2026-10-12 系统分享与临时文件研究

状态：只读研究与候选方案；用户只确认历史页右上「数据」入口，未批准 JSON、直接依赖、缓存期限或系统交接流程。没有安装依赖、生成实际导出文件、开启真实数据使用或发布 App。

## 结论与成本取舍

通用分享接口无法证明任意接收方已经读完文件。继续增加持久化交接清单和未知状态隔离，仍不能产生这项证据。因此 10-02 草案的“仅在证明安全点后清理”条件需要调整，而非直接照其开发复杂恢复机制。

候选改为：专属缓存目录、唯一文件名、partial 写入成功后提交、单任务锁与离页失效保护；不持久化分享阶段清单。分享返回只结束本次界面任务，不立即删除完整文件。启动或下次导出时尝试清除超过约定期限的完整副本，跳过当前任务，失败下次再试。24 小时只是待确认的保留策略候选，**不是接收方已读完、安全擦除或实际保留上限的证明**。系统提前清理或接收方迟读可能需要重新导出。

这项取舍省去持久清单的写入、对账和迁移成本，不增加后台定时任务或云服务；不能据此承诺工期或全平台已验证。若要求完全避免第三方迟读失效，应改为用户选目录、应用自行完成写入的流程，并重新确认交互。当前不同时开发两条方案。

## 官方依据

- Expo SDK57 [Android SharingModule](https://github.com/expo/expo/blob/sdk-57/packages/expo-sharing/android/src/main/java/expo/modules/sharing/SharingModule.kt)：ActivityResult 匹配后结束 Promise，但丢弃结果码；返回不能区分取消、保存或接收方读完。模块另有显式 grantUriPermission，不能说权限随返回立即失效；Android [文件分享授权说明](https://developer.android.com/training/secure-file-sharing/share-file#GrantPermissions)区分显式与 Intent 授权。
- Expo SDK57 [iOS SharingModule](https://github.com/expo/expo/blob/sdk-57/packages/expo-sharing/ios/SharingModule.swift)：完成回调 resolve(void)，未向 JS 暴露 completed 或错误参数。[Apple 完成回调](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller/completionwithitemshandler-swift.typealias)也不是任意第三方的远端送达或永久保存收据。
- [Android 缓存文档](https://developer.android.com/training/data-storage/app-specific#internal-remove-cache)与 [Apple 文件系统说明](https://developer.apple.com/documentation/foundation/using-the-file-system-effectively)：缓存适合可重新生成内容，系统可能删除；应用不能依赖系统及时清理或保证保留多久。[Apple 备份说明](https://developer.apple.com/documentation/foundation/optimizing-your-app-s-data-for-icloud-backup)不代表训练库或接收方副本的所有备份路径已核验。

这是 SDK57 分支与官方文档的研究时点，不是未来安装包的不可变源码证明。实施前须将实际锁定的 FileSystem/Sharing 版本与原生源码复核。当前本地间接 FileSystem 为 57.0.7，Sharing 未安装；bundledNativeModules 建议 ~57.0.22。直接使用时才经批准声明直接依赖，不开启入站分享或 Share Extension。

## 文案与验收边界

可提议：“生成明文临时文件，由你选择保存或分享；后续使用 App 时尝试清理，系统也可能提前清除。保存结果请在接收应用确认。已保存或发送的副本不随 App 内删除撤回。”不写“发送成功”“24小时内必删”或“数据绝不离开设备”。讨论稿的模拟取消单独写“未创建或分享文件”，不冒充真实系统结果。

原生验收须覆盖：iOS 保存至本机“文件”及取消；Android 支持的本地接收路径；返回后重导出；写入/分享期间终止进程；缓存消失、清理失败、过期扫描及作用域。只用合成 JSON 核对接收字段和数量，证明不清理训练库或用户副本。这些结果只能覆盖实际测试路径，不能证明所有第三方应用。

Q2 待确认后统一修订数据模型、契约和 T009–T011；目前旧草案仍标为候选，未开始产品代码。

## 本步学习验收

分享返回、接收方保存和缓存清理：目标 L2（能照做）。练习对照系统取消与成功保存两种路径，指出哪种事实由谁证明，再解释为什么不显示“已成功发送”。可汇报：“导出采用可重新生成文件的候选方案，外部保存须在接收应用确认，原生验证与方案批准尚待。”未达标时重读平台边界并重新走查。研究产物已完成；产品决定与本人学习掌握分别待验收。
