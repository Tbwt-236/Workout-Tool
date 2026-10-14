# Verification: 本地数据说明与 JSON 导出

**Date**: 2026-10-14 | **Status**: Android主要导出路径与桌面基准已核验，完整设备/用户验收开放

## 2026-10-14 取消顺序修复与原生失败恢复

### 问题与最小修复

等待分享能力期间取消，若随后结果为false，旧服务会返回SharingUnavailable并短暂发布error→idle，而不是Cancelled。现有UI忽略返回值，未产生文件/分享；属于内部取消契约不一致。独立审查用当前源码复现后，主线程先加回归；RED为预期Cancelled、实得SharingUnavailable。修复仅将取消检查放在处理不可用结果之前，无界面、依赖或数据schema变化。

`export-service.test.ts`新增6例（不可用false/throw为2例），覆盖取消优先级、能力恢复重试、清理等待中取消、交接后后台、释放迟到及失败；`export-files.test.ts`新增1例，证明取消删除失败后活动保护解除、后续过期清理可回收。只有新增取消回归属于此次RED→GREEN修复，其余为已有契约覆盖，不虚构它们先失败。完整188项/25套exit0，3.618秒；类型、lint通过。独立代码审查0 Critical/Important/Minor。

### 构建与版本绑定

双平台JS/Hermes导出通过（iOS2.6MB/Android2.9MB，非iPhone运行）；离线Android构建19秒、495任务/33执行。APK `1ee63b686078` SHA256 `1ee63b686078b13f25657d90d631ef89c91084000a6bb9bba70cf76483eae070`，42,267,926字节，arm64 / Android Debug签名 / 临时包dev.fitquest.local。36项生产源码/package/lock与隔离构建一致，变更服务源码在source map逐字匹配，APK Hermes bundle与构建产物一致；未发现数据库或测试接收器文件。签名和ZIP16KB对齐通过，不代表商店包或16KB运行验证。Gradle10不兼容的既有弃用提示保留。

### 两个APK分别记录原生证据

| 版本 | 观察与边界 |
| --- | --- |
| 旧1f3，先完成既有基线检查 | 创建不保存的ExportProbe草稿，42.5kg/12次/0组；收起实际软键盘再进入历史并选10月2日。临时把专属缓存目录保留改名，用任务自有普通文件阻断路径，导出显示WriteFailed及重试。面板切英文后恢复目录，原面板Retry打开系统选择器，本地无网络权限接收器实际读取8,061字节。返回面板→历史→训练，选日和原始42.5/12保持，文件不含草稿。随后通过正常确认取消自建草稿，未保存。 |
| 新1ee，升级后专项复验 | 保留数据升级、启动、历史/数据可达；再次受控阻断→中文写入失败→恢复→重试→本地接收8,061字节→返回面板。新包未重跑旧包完整草稿/英文/键盘组合，不转绑旧证据；设备上没有复现分享能力false的取消竞态，该修复由真实服务时序测试证明。 |

两次接收JSON全部workouts与10月13日已逐字段核验的20场基线相同，时间各自更新，接收回执哈希匹配；仅证明诊断本地接收，不泛化到iOS/任意第三方。最后一次缓存库存7份在阻断前后逐项哈希一致；早一次恢复有操作记录，但库存JSON后来被最终检查覆盖，不能称两次都有独立库存归档。原训练20/20/20和独立规模库1000/4000/20000在基线、旧包后、新包后三个时点整库哈希及行完全相同；WAL均空，完整性ok/外键错误0。见[数据保护记录](evidence/2026-10-14/data-preservation.json)及[旧包输入往返记录](evidence/2026-10-14/native-retry-verification.json)。

第一轮工具误将键盘覆盖区当导航点击，给次数多输入了尾空格；操作失败后立即恢复缓存，收键盘、纠正为12并重新取证。该误操作不作产品行为或成功证据，未保存数据库。后续命令遇错即停；UI树瞬态null重试会先删除旧dump，未复用旧树。临时接收器卸载，键盘设置恢复，模拟器在收尾时关闭。

### 当前边界与后续

当前Mac仅CommandLineTools，无完整Xcode/simctl/devicectl。已装工程SDK57与本地推荐依赖匹配；手机Expo Go版本和连接仍待。此前LAN自动审批被拒后未获得明确答复，本轮再次提出临时LAN请求；未启动LAN或隧道，未登录/新建账号，不用普通“继续”代替这项许可。

00129/33、00214/18不变。仍需T013设备分段性能；T015全部写入/move时点中断、原生平台失败分支、当前包完整键盘组合、TalkBack、iPhone、备份恢复；T016五目标用户；T018隐私/最终接受。SDK Android启动分享异常的pendingPromise风险未改SDK、未宣称修复。本轮修的是应用层取消顺序，不能与该SDK缺陷混淆。PR3已获明确许可并于10月13日合并至master e190c7f，本轮修改另留同步回执。

### 本步学习验收

取消结果与资源收尾L2、故障测试与产物版本归属L2。练习解释“取消后何时允许再导出”，运行服务测试找出Busy→idle轨迹；再用合成数据演示写入失败→恢复→重试，在接收处核JSON，指出旧/新两包各验证什么。可汇报“应用层取消边界已修复，Android写入失败重试有实际证据，原训练未变”。未掌握时重看export-service和Q-004/Q-005，勿用188项替代解释。代码/构建/限定原生证据已交付，本人学习与完整产品接受另待。

本机证据在 `.../gen/work/data-control-2026-10-14/`：cancel-red/green、tests/typecheck/lint-final、code.patch、production-fingerprints、build-binding、artifact/APK、Android/export日志、PNG/XML、receiver-retry/new-build、database-before/after-old-apk/after和sync回执。仓库仅附摘要与指定合成截图，APK/数据库/测试接收器不上传。

## 2026-10-13 Android原生与规模基准

用户明确允许改用ADB操作本项目模拟器；CUA不识别Qt窗口不再构成本轮阻塞。仅使用任务AVD `fitquest_api36_arm64` / `emulator-5580` / Android16，未wipe或清App数据。原生包为下方相同SHA256的 `1f3ed5f3ba3d`；本轮34个生产源码及依赖锁复算仍一致，仅package.json新增基准命令、脚本与文档，不把package整文件称作不变。

### 实际观察

| 场景 | 本轮结果与边界 |
| --- | --- |
| 数据入口/双语 | 历史右上打开第二版面板，20场、日期范围、导出及数据说明可见；中英切换正常。未覆盖本轮键盘/未录输入组合。 |
| 文件生成 | 原生缓存生成8,061字节JSON，与导出前20场/20动作/20组逐字段一致；此项本身不是接收证据。 |
| 原生接收 | AOSP初始没有JSON接收App，系统显示无可用目标。临时安装无网络权限的本地诊断接收器，以ContentResolver读取授权URI并存自身私有副本；两次均8,061字节/20场，workouts相同，时间字段各自更新。首次接收SHA256为 `29e7263d3227fe77306c37d1fd316da1f001a645442c903fbf3cb4e148f81539`。不宣称任意第三方/云端/iOS送达。 |
| 取消/返回/重复 | 两个本地接收入口构成实际系统选择器；Back取消回原数据面板，导出重新可用，同进程再点打开新文件选择器。接收器返回亦留面板，无“保存成功”推断。没有验证所有系统调用失败分支。 |
| 进程终止 | 系统选择器打开期间force-stop FitQuest，重开回历史，没有自动再次分享。未覆盖快照/写入/move各微小时点终止。未完成草稿不承诺重启恢复。 |
| 原生缓存清理 | 在专属缓存目录创建4份任务探针：48小时前的合法json/partial启动时删除；未来mtime合法json、旧未知名称文件保留；此前所有导出文件哈希/mtime不变。验后只清自建剩余探针。未证明后台定时、安全擦除、删除失败重试或接收方长期保存。 |
| 小屏 | 1080像素/density540即320dp，font1.3；中文/英文折叠面板无明显截字，英文展开说明可滚动、标题关闭可达。恢复原density420/font1.0。配置切换重建App的中间截图不作为英文面板通过证据。TalkBack/iPhone仍待。 |
| 训练保护 | 先停止App备份SQLite，验后再停止拉取；实际训练库20/20/20、独立benchmark库1000/4000/20000所有行、整库SHA256均前后一致，integrity/foreign-key检查通过。该AVD不是旧1005场验收设备。诊断接收器已卸载，未改产品训练。 |

存在一次uiautomator过渡态返回null root，相关结论以独立截图和后续状态核对，后续采集器改为删除旧dump后重试，防止将旧XML当新证据。不将工具瞬态失败记为产品缺陷或通过证据。

### 自动检查与桌面基准

完整181/181、25/25，exit0，4.966秒；typecheck exit0；`CI=1 EXPO_NO_TELEMETRY=1 npm run lint` exit0。首次未关闭Expo遥测的lint被沙箱拒写全局状态，修正执行环境后通过，未改产品代码规避检查。

新增 `apps/mobile/scripts/benchmark-export.ts`、`npm run benchmark:export`，复用生产SQLite仓储/编码器，以独立临时合成库1000场/4000动作/20000组测25轮；每轮文件读回逐字段一致。原始样本见[benchmark-export.json](evidence/2026-10-13/benchmark-export.json)。

| 阶段 | 中位ms | P95 ms | 最大ms |
| --- | ---: | ---: | ---: |
| 快照SQL+聚合验证 | 53.213 | 60.591 | 68.750 |
| JSON编码及重验证 | 10.655 | 15.638 | 21.740 |
| Node UTF-8写入/关闭/改名/stat | 4.081 | 5.153 | 6.689 |
| 三段合计 | 68.656 | 78.838 | 88.853 |

文件3,039,757字节，Mac arm64 / Darwin27 / Node24.21.0，25样本全保留、nearest-rank P95。初始化/造数与文件完整性核对/删除均在计时外；热进程/缓存，不是冷启动。Node文件API替代Expo桥接，无fsync承诺，无系统选择器/接收等待/清理/UI测量，不用该值保证手机性能或关闭T013。

### 独立复核、反思与下一步

基准脚本/统计、面板截图和接收文件已独立复核，无新增阻断。基准清理结构和计时说明两项小建议已修改并重新执行。原生验证补足“文件生成≠接收读到”的关键差距；不把诊断接收器当普通用户文件App，也不因主流程通过宣布所有故障均已解决。

001仍29/33，002仍14/18。T013设备分段性能；T015剩余故障/中断、原生键盘/草稿组合、iPhone、读屏、备份恢复；T016五名目标用户；T018最终接受及真实数据/隐私仍开放。已知Android Sharing启动异常pendingPromise风险未修改SDK或验证解决。下一步优先iPhone接收及剩余中断，不增加未经确认页面或账号/云服务。

### 本轮证据位置与学习验收

本机 `.../gen/work/data-control-2026-10-13/`：`receiver-first/`、`receiver-repeat/`、`first-file-verification.json`、`native-cache-check.json`、`database-before/after`、`data-preservation.json`、`current-source-binding.json`、`actions.jsonl`及对应PNG/XML。仓库含[数据保护摘要](evidence/2026-10-13/data-preservation.json)、规模原始样本和三张真实面板图，未上传APK、数据库、工具链或诊断接收器。

本步学习验收：原生接收凭据、哈希前后对比L2；桌面/设备性能和验收范围取舍L3。练习用合成数据完成导出→接收位置读取，解释为什么取消后不能展示保存成功，再复算25样本P95。可汇报：“Android主要导出路径已实际验证，原训练未变，桌面规模基准可复现；iPhone及剩余验收继续。”未达标则重做Q-003/Q-004与数据保护核对。工程/验证产物已完成，用户本人操作掌握另待证明。

---

以下为2026-10-12实施/构建时点记录；其中Mac锁屏、未原生操作及未推送只描述当时，10月13日进展以上方为准。

## 批准及实施

用户对明确的“JSON全量已完成训练、空历史置灰、系统结束留在第二版底部面板”提案回答“可以的”，随后接入真实App。数据入口/结构来自此前两轮直接答复。缓存24小时资格规则是研究后的工程选择，不冒称用户指定；不构成法律、真实数据或发布批准。

本轮输入基线155项/19套；新增26项共181项/25套。代码写入仅主代理，三个代理只读审查。本地工作目录保留原有改动，未重置或修改真实Git index。

## 当前自动核验

| 检查 | 结果与范围 |
| --- | --- |
| 完整Jest | 181/181，25/25，exit0，3.383秒；合成数据，含既有训练/历史回归 |
| TypeScript | `npm run typecheck` exit0 |
| Lint | CI/关闭Expo遥测，`npm run lint` exit0 |
| iOS/Android JS/Hermes | 当前生产源码双平台export成功；iOS2.6MB、Android2.9MB，非iOS原生运行 |
| Android构建 | assembleRelease arm64 offline成功，24秒，495tasks/60executed；依赖包含FileSystem57.0.7/Sharing57.0.22 |
| 完整性 | 真实桌面SQLite 1000场/4000动作/20000组逐字段与JSON一致，无内部ID/草稿；20轮读写交错通过 |
| 文件与故障 | 真实桌面临时文件+原生桥接替身：UTF-8、move URI变化、写入/移动前后失败、活动/过期/未来保护及目录外合法名称拒绝 |
| UI | RNTL实际Provider/仓储：空历史/中英/月日保持、未提交输入保持、写入时后台/关闭、快照未结束关闭→详情等待 |

TDD证据保存在本轮工作目录：快照3例RED→GREEN；编码/服务12例RED→GREEN；文件3例RED→GREEN；入口/面板3例RED→GREEN。后续增加规模、20轮交错、跨页及移动故障回归。UI最初测试错误字段标签已修正后重跑真实缺入口RED，不作为生产缺陷。跨页补测单独通过、合并失败，经解包AggregateError定位：jest-expo原有AppState mock被mockRestore清掉默认订阅，修复测试隔离后全套通过；没有为测试污染改生产监听器。

## 产物与独立核验

APK SHA256：`1f3ed5f3ba3da50184476bbc3849d6f3e81efef4fb340b0863dd5b41a13e2d79`，42,267,918字节。归档文件：`fitquest-data-1f3ed5f3ba3d.apk`。本地包名`dev.fitquest.local`，release变体但**Android Debug签名**，仅arm64，非商店包。

34/34生产源码及package/lock与隔离构建目录一致；app.json仅多临时包名。APK Hermes bundle与构建产物一致，source map内30个运行时源码逐字匹配，另4个为纯类型文件。未发现合成数据库或旧诊断代码入包。签名验证、ZIP16KB对齐通过，23个so均对齐；不代表16KB内存页运行验证。

实际Manifest仅INTERNET和本包signature级receiver权限；外存读写、悬浮窗、振动仍排除。Sharing/FileSystem Provider均未导出并允许URI授权；Sharing路径默认覆盖files/cache/external根，产品适配器才限定专属活动JSON。未加接收入站分享Activity。`allowBackup=true`未变，无备份排除，不能声称训练绝不进入备份。

独立代码审查：Critical0/Important0/Minor1。Minor为目录越界测试原使用非法文件名而未触及目录条件，已改用目录外合法名称并断言原文件保留。补充移动前后故障测试。文件生命周期审查与产物一致性审查均无阻断；审查不是原生验收。

## 仍需证据

- CUA进入设备检查返回Mac锁屏且无法自动解锁；本轮未安装/操作新包，无新原生截图或接收文件，不复用旧APK通过记录。
- 真正选择器取消/返回、接收位置读取JSON、再次导出、进程终止及过期清理需设备验收；iOS Modal叠层、iPhone/实体设备、320宽/大字号/键盘/读屏未测。
- 已安装Android Sharing源码启动Activity异常路径未清pendingPromise，可能阻止同进程重试；错误文案给出重试/必要时重启。未修改SDK且未设备复现/解决该缺陷。
- 缓存24小时是机会性清理资格，不保证接收方读完、实际保留上限或安全擦除。系统可提前清除，晚接收需重导出。
- 规模完整性与20轮交错通过，不等于手机性能；分段耗时/文件大小未形成基准。桌面总测试时长不能作手机导出秒数。
- 5用户、本人学习演示、真实数据/隐私、依赖新安全审计与正式发布未完成。既有Doctor21/21不转用于新增依赖；本轮offline依赖检查仅提示版本匹配，不作完整Doctor结论。
- 001保持29/33，T029/T030/T031/T033仍开放。当前002为14/18完成。

## 证据位置

本机任务目录：`/Users/qqqq/Documents/Codex/2026-09-12/gen/work/data-control-2026-10-12`。

`baseline.json`及`baseline/`保存实施前60文件；`code.patch`/`code-changed-files.json`为代码差异；`tests-final.txt`、`typecheck-final.txt`、`lint-final.txt`、`export.txt`、`android-build.txt`为当前核验；`production-fingerprints.json`、`artifact.json`及APK为绑定产物。文件系统/服务用例不使用真实训练内容，日志不打印训练正文。上述本机材料不会因Markdown路径而自动上传GitHub。

## 本地版本检查点

`6522bd11d8842e06230886870ba3c87db30eced8`，176/176文件逐字核对通过。使用独立临时index及checkpoint分支，当前HEAD与真实index哈希保持，未重置已有改动。检查点后的任务状态记录仅为文档更新；本轮未推送GitHub。

## 阶段反思与下一步

保持已确认B界面和底部面板；取消、快照锁与系统返回是实现重点。复杂持久交接清单无法增加接收证明，收敛为可重导出的缓存策略更可维护。下一阶段优先实际设备Q-001/Q-004/Q-005，再完成中断/清理、小屏/读屏；原生未过前不宣布功能最终验收或扩张新功能。

## 本步学习验收

- 必须学会：一致快照、null/整数重量、系统返回与保存区别、debug包与发行包，均L2；缓存/依赖范围取舍L3。
- 练习：用合成数据打开「历史→数据→导出」，在接收位置读取JSON，确认625为62.5kg、null未变、原训练输入仍在；指出一次系统取消为何不能仅从void判断。
- 可如实汇报：“已通过三轮共创并接入真实本地JSON导出；181项自动测试与Android构建通过，手机系统分享和用户验收仍待完成。”
- 未达标：重走quickstart Q-002/Q-004并对照数据流四个资源时点，不背诵测试数量代替理解。
- 实施和自动核验产物完成；本人学习掌握、原生验收及最终接受分别待证。
