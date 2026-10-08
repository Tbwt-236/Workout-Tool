# 2026-09-12 首批领域规则验证

本地恢复检查点的实际提交、保存范围和main/真实暂存区保留结果见[执行回执](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/git-checkpoint-2026-10-02.json)；不据此关闭T031或推定远程发布。原暂存区的独立版本不是该功能树快照的备份范围。

> 2026-10-02 历史续开发结果：001保持29/33，T032工程文档完成，本人学习待演示。153项/19套、类型/lint、双平台JS/Hermes导出及4f6c66316bf5本地Android构建/签名/ZIP对齐通过；28项当前生产源码与隔离构建输入哈希一致。依赖未变，Doctor21/21沿用本日同版本证据，audit仍15项（11 moderate/4 high）。 最新4f6包已独立核验：保存期间历史Loading、无假读取错误/Retry，提交后不被迟到回执跳走，离线重启可读；原1002场及关联行逐值不变，仅新增两笔8次/62.5kg合成记录，触发器已清理。 旧00aba包的1000场UI日历/四卡倒序/四动作20组详情滚动/返回选日观察通过，三表1000/4000/20000完整保留。五次首窗口105/216/298/235/188ms，P50 216/P95 298ms不等于完整UI就绪；慢帧、SwiftShader和并行主机负载均保留，不宣称1秒完整交互或真机流畅。 早期Q场景/20轮/320dp/16KB及044ab迟到导航证据保留各自版本，不视为4f6全部重跑；16KB兼容模式禁用未证。T029/T030/T031/T033保持待：小屏日历A/B、002数据入口A/B与隐私审查、TalkBack、实体/iOS和5位用户条件仍未通过。仅合成数据，无账号、付费或发布。 仅Android专属合成模拟器范围，完整证据见阶段八；历史阶段保留各自任务数、哈希和待验时点。

## 2026-10-07 B 能量橙：已实现，用户确认保持当前页面

用户先选择“B”，随后确认“保持现在最好 同步更新github”；亮橙＋蓝黑＋雾白及当前字号/密度作为保留基线，不混入A字体方向。本轮仅改共享视觉、训练输入和历史条目密度、底部状态标记，未改领域、存储、路由与键盘处理，无新增依赖或功能。详细批准范围见[前端共创记录](../../docs/design/FRONTEND_REVIEW.md)。

- 当前源码的153项/19套、类型、lint、iOS/Android JS/Hermes导出通过；纯视觉调整没有新增镜像测试。最终28个源码文件与隔离构建输入哈希一致。
- 当前本地候选 `f3b396b26936`，完整SHA `f3b396b269360ccbe4aba310686bb070c47544797f938f8d54896fbf5fc03b0b`。Android arm64 release变体、debug签名、临时包名；构建、签名和ZIP对齐通过。iOS资源导出不等于iPhone运行；未发行。
- 最终候选在Mac上的任务专属Android模拟器（5584，合成数据）以320dp、130%字号检查：0次保留原值/错误焦点/键盘，改8次成功录入并收起键盘，原位编辑为10次，完成确认并保存，断网重启读取均通过脚本与截图观察。该证据是指定数值/状态的局部验收，长边界数值、实际读屏、iOS/实体设备、所有字号不在本次通过范围。大字下编辑按钮可换行，保持可达。
- 原1004场/4004动作/20004组逐行不变；只追加1场合成Squat、1动作、1组（62.5kg×10），结果1005/4005/20005。另有用于视觉展示的内存合成草稿，不冒充保存结果。
- 独立源码审查发现1类状态对比度问题，日期标记/选中边界与底部选中线已修复，未解决Critical/Important/Minor均0。亮橙深字4.824:1，状态深橙/雾白5.913:1，深色导航线/白底14.278:1；不宣称完整无障碍合规。

证据目录：[本轮验证文件](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/theme-b-2026-10-07/)。关键文件：tests-final.txt、typecheck-final.txt、lint-final.txt、export-final.txt（输出native-export-rc2）、android-build-final.txt、signing-final.txt、zipalign-final.txt、source-manifest-final.json、native-final.json、source-change.patch、review.md、visual-review.md、evidence-final/。a523为本轮早期候选，evidence/下截图不转绑最终包；旧4f6的Busy等专项保持旧时点，本轮没有把其全套原生场景重跑。

反思与限制：先前键盘脚本在点击后立即判断导致时序误报，改为最多5秒条件等待后通过，产品键盘逻辑未改。模拟器改变系统字号会重建App，旧内存演示草稿不保留；放大字体验证改为先配置环境、再开始合成训练。没有据此声称草稿恢复功能。320dp月历仍有既有336dp横滚，第七列可能初始屏外；该独立共创选择、002数据入口、隐私与五位用户门槛仍待。001仍29/33，T029/T030/T031/T033不自动关闭，Doctor/audit仍为旧版本依赖证据。iPhone的Expo Go已由用户安装登录，CLI/局域网连接独立待办；没有启动LAN服务或恢复已暂停自动任务。

本步学习验收：视觉状态辨识L2、真实截图与设备验收区别L2。练习在中英文图中找出“记录/Log”“完成/Finish”和当前页，再按0次→8次→编辑10次→完成确认检查输入与保存差别；说明浅底为什么仍可通过高对比数字与亮橙形成力量感。可如实汇报“用户选择B后已落实真实App并通过指定合成模拟器场景，iPhone验收仍待，当前视觉已获用户确认保持”。找不清主操作时对照截图复看颜色/字号，而非新增仪表盘填充。产物已完成，本人学习掌握待操作演示。

## 2026-10-02 持续开发：字段反馈、基准与原生验收

用户明确纠正为App并授权持续开发全生命周期、每阶段反思，目前无开发者账号。001仍是已批准需求；未迁移小程序，未把新增隐私/导出界面自动视为批准。

### 阶段一：T029/T033自动化可验证部分

输入错误原本只在顶部全局显示；名称、次数与重量现各自关联accessibilityHint、就地文本和红框。validationRequested属于各自表单，错误随当前值与语言投影；修改后消失，切页保留，取消已录编辑不污染下一组。4个新增屏幕行为先失败（字段hint缺失），最小修改后16项训练页面用例通过，全量150/19通过。领域及存储规则未改；原始值直到显式记录/保存才进入草稿。

`scripts/benchmark-history.ts`只在临时SQLite创建1000场/4000动作/20000组，调用真实仓储并断言内容/排序/null重量/月历标记；25次常规操作、5次新连接生命周期。修订后桌面Node24/macOS arm64的P95：列表4.151ms，日历2.212ms，详情0.096ms，保存20组0.346ms，删除20组0.108ms，打开/初始化/列表/关闭5.042ms。这里无Hermes/Expo桥或UI渲染，不是手机性能通过。

独立字段审查0/0/0；基准审查发现原计时名称排除了open，已把open/list/close均纳入同一回调，断言在计时外，注明同一热进程/原连接仍打开。Minor独立复核关闭。反思：先建立准确证据，不因能生成优化代码就改已经很快的算法。T029/T033原生读屏、键盘、触控仍待，任务不勾选。

### 阶段二：兼容版本、主题配置与构建准备

原生prebuild实测缺system-ui；依D-009补官方57.0.4模块及插件。重新生成Android配置后warning消失，`expo_system_ui_user_interface_style=light`实际落地。Doctor初次20/21（4个同SDK补丁不匹配），按官方建议升级Expo57.0.26/constants57.0.20/linking57.0.11/router57.0.24；React/RN不变，无强制override。

| 检查 | 本轮结果 |
| --- | --- |
| Jest | 19 suites / 150 tests，exit0；sdk-patch-tests.txt |
| TypeScript / lint | exit0；sdk-patch-typecheck.txt、sdk-patch-lint.txt |
| Expo Doctor 1.20.4 | 21/21，exit0；sdk-patch-doctor.txt |
| npm audit | exit1：15项传播告警（11 moderate/4 high），未通过；sdk-patch-audit.txt |
| iOS/Android JS/Hermes export | exit0，34资源，约2.5/2.8MB；sdk-patch-export.txt |
| Android prebuild | 隔离源码副本成功；主题配置已核实，尚非APK |

独立配置审查0/0/0；28个源码文件哈希与主工程一致、staging锁文件一致。安全告警按三个根问题和当前调用范围记录于docs/product/DEPENDENCY_REVIEW_2026-10-02.md；兼容升级不等于修复漏洞，不把Doctor当安全审计。本地Android合成数据验证可继续，签名/发布路径仍需复审。

日志根目录：/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/。Jest/ESLint原项目缓存EPERM改用任务目录缓存；Expo API缓存用EXPO_NO_CACHE=1；未为环境缓存修改业务。依赖安装的沙箱mkdir受限，经工具权限升级成功，不隐瞒失败尝试。导出仅有NO_COLOR/FORCE_COLOR提示。

工具链和原生运行仍在推进：本机无完整Xcode；初始缺失的JDK17/API36/Build Tools36/NDK27.1/CMake/Emulator37.2.12均已在任务目录隔离安装、官方哈希校验。空Pixel7 AOSP API36 ARM64模拟器emulator-5580已启动，sys.boot_completed=1，1080×2400/420dpi。无开发者账号，临时包名dev.fitquest.local和调试签名仅用于本地，不代表正式标识或生产签名。

首次Gradle在沙箱加载node_modules插件阶段失败；同命令通过所需编译权限后进入原生任务。继而react-native-gesture-handler需要额外Build Tools35，SDK自动下载报“Archive is not a ZIP archive”，构建exit1（android-build-permitted.txt）。后按Google官方XML核对76,857,898字节归档、SHA1 93ab8ce91230e067b5add4bfa79919c52b27f072及ZIP CRC，仅补35并隔离失败残留；Build Tools36与Platform36文件哈希未变。非ZIP响应的传输层原因未知，没有盲改依赖或子工程版本。第二轮构建与原生观察见阶段三，原失败记录保留。

本步学习验收：字段归属/桌面与设备证据L2、兼容补丁与安全告警区别L2。运行README的训练页面测试和benchmark，解释同一错误为何只关联一个输入、为何5ms桌面结果不能承诺手机体验。汇报“150项自动测试和工程兼容检查通过，本地原生验证继续，依赖风险已登记未掩盖”。未掌握时重看对应用例、基准计时边界和风险表；学习待本人演示。

### 阶段二补充：历史语义与对比度

静态审查确认14号辅助文字/纸底4.211634:1、16号橙日期/选中底4.344011:1，低于[WCAG普通文字4.5:1基线](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)。同色系最小调整为muted #6E7169、orange #C34312，纸底辅助字4.591899、纸底橙字4.699714、选中日期4.564035、橙底白字5.082264。背景、红色、结构保持；没有为两个色值添加镜像测试，独立按实际源码重新计算。

历史多场卡片原accessibilityLabel只含内部ID，屏蔽可见时间与训练量。新增中英回归先RED（1失败/7通过），改为时间、动作数、组数与分钟后history/routes共10项GREEN；内部ID仍只用于数据查找与导航。原排序、跨月、取消删除和目标删除断言保留。

新鲜全量151/19、类型/lint通过（accessibility-tests-all.txt/typecheck/lint）；双平台JS/Hermes导出通过（accessibility-export.txt，native-export-current）。构建前源码28文件哈希再次与staging比对相同；后续本地APK和运行证据见阶段三。独立审查重跑10项及色值复算通过，无新增阻塞；证据ui-review-platform-cost-research/。仍待320横向月历发现性、完整键盘场景及真实读屏验证；基础录组键盘行为的原生观察见阶段三。

本步学习验收：读屏名称与可见信息对应L2、静态标准与设备证据区别L2。练习用读屏名称区分同日两场，并解释“颜色计算合格”为何不证明320界面可操作。汇报“已修正可证明的语义和对比度问题，151项回归通过，原生验收继续”。未掌握时复读history读屏用例及Q-008；学习待本人演示。


### 阶段三时点记录：本地APK与离线原生片段

本阶段使用合成数据，目标为Pixel7 AOSP Android16/API36 ARM64模拟器emulator-5580（1080×2400/420dpi），不是手机真机。当前包为release构建变体、debug证书签名、临时应用ID dev.fitquest.local、仅arm64-v8a，不代表正式首发平台或生产签名。

| 检查或观察 | 本轮证据与边界 |
| --- | --- |
| APK构建 | [android-build-tools35.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/android-build-tools35.txt)：BUILD SUCCESSFUL in 5m17s；495 tasks（467执行、28已有） |
| 签名/ABI/权限 | [apk-signature.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/apk-signature.txt)证实Android Debug证书；[apk-badging.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/apk-badging.txt)证实临时包名及arm64-v8a |
| APK对齐/安装 | zipalign -P16退出0，仅为ZIP对齐检查，不能证明16KB设备运行；adb install返回Success |
| 离线首开 | 飞行模式＋WiFi关闭，冷启动进入历史页；[截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/first-offline-launch.png)及同名XML |
| 无效次数 | 次数0时显示错误、原输入/焦点/键盘保留；[截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/invalid-reps-keyboard.png)，XML的EditText仍focused=true |
| 有效录组 | Squat，8次/62.5kg，记录成功出现该组且键盘关闭；[截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/valid-set-keyboard-dismissed.png)及同名XML |
| 完成保存 | 明确完成确认后显示已保存、同一动作及62.5 kg × 8；[截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/first-saved-offline.png)及同名XML |
| force-stop冷启读回 | 终止进程再冷启，从历史详情读回同一动作与组；[截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/restart-offline-detail.png)及同名XML |
| 20轮循环与数据核验 | [restart-cycles.json](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/restart-cycles.json)记录20/20完成；force-stop后复制DB/WAL/SHM只读核验为20场/20动作/20组、无重复、次数/重量全匹配，integrity ok、foreign key错误0，见[数据库审计](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/twenty-cycles-db-audit.json) |
| 中文日期RED→GREEN | [原生RED](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/date-locale-red.txt)复现中文历史页显示October 2026；运行时探针确认zh-CN默认best fit回落en-US、lookup解析为zh。4处formatter增加localeMatcher: lookup后重新构建安装，[原生GREEN](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/date-locale-green.txt)及[结果JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/date-locale-regression.json)覆盖中英月份、24小时、详情日期、确认及选日保持；observedProductLocale为探针读取值，不宣称系统语言未变。运行APK指纹和无探针状态见[APK记录](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/date-locale-apk.json) |
| Q-003 中英字段边界 | [validation-boundaries.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/validation-boundaries.txt)及[JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/validation-boundaries.json)记录20个无效输入：空白/超长名称、非法次数和重量均阻止录入，错误及焦点保留；中英均接受1/999次、0.1/1000.0kg，之后取消合成草稿 |
| Q-004 编辑和取消 | [edit-cancel.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/edit-cancel.txt)及[JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/edit-cancel.json)完整通过两组→改名Renamed→首组65kg×9→删次组；无效编辑取消保留旧组，下一组未录6次/75kg保留。拒绝取消后内容保留，确认取消后空闲，历史数仍20；[输入截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/edit-next-input-preserved.png)及XML的次数focused=true，[取消后截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/cancelled-draft-no-history.png)一致。独立只读核验支持T027完成 |
| Q-006 仅删除所选历史 | [history-delete-resume.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete-resume.txt)及[JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete.json)：对Native20取消删除后20场workouts逐行不变；确认后仅id20消失，id19聚合查询不变且详情仍为Native19/未记录重量×19。中英切换不改目标；[返回日历截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete-selection-preserved.png)/XML保留所选日期及19场计数，[当前草稿截图](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete-active-input-preserved.png)保留DraftGuard未录13次。独立只读核验支持本模拟器Q006观测通过，不单独关闭T023 |

APK及打包Manifest仅声明INTERNET和dev.fitquest.local.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION（signature）；READ_EXTERNAL_STORAGE、WRITE_EXTERNAL_STORAGE、SYSTEM_ALERT_WINDOW、VIBRATE四项实际移除。allowBackup=true仍在，不把无业务联网/断网可用写成“没有网络权限”或“数据绝不进入系统备份”。此项并非002隐私批准或备份实测。

验收驱动边界：Q004原驱动依据UI树误点键盘遮挡区域；android-ui.py的visible_target改为依据InputMethod真实区域及ScrollView滚动定位后，全流程重新执行通过，没有为此修改产品。Q006原[中断日志](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete.txt)发生在详情点击前的离屏零面积节点，尚未调用删除；修正驱动后从同一选日继续，resume重新确认20场基线和Native20目标，再完整执行取消及确认。核验包含驱动源码、终态日志、JSON、四组截图及XML，未操作当前UI或重跑业务测试。20场持久性审计和Q006后的19场是不同时间点，不能混成同一当前数量。

阶段反思：构建产物的变体名称不能代替签名核验；本地安装不是商店发布。中文日期缺陷必须用原生RED/GREEN闭环，自动化点击驱动的失败则先核对实际触点，不能据其失败盲改产品。本轮依据Q004完整证据关闭T027，001为25/33；Q007仍在验收，完整Q、320布局、读屏、原生1000场性能、真机与用户条件仍待，T018/T023/T028/T029/T030/T033保持未完成。没有进入002实现。

本步学习验收：release变体/debug签名/正式发行的区别L2，产品缺陷与验收驱动故障的区别L2。练习用日期RED/GREEN说明产品修复，用Q004/Q006脚本及截图说明驱动修正后的有效观察，并解释T027为何可关闭、T023为何仍不能关闭。汇报“151项回归和本地测试APK通过，模拟器20轮持久性、日期修复、双语字段边界、编辑取消和目标删除已观察；001为25/33，完整设备验收继续”。未掌握时重看此表与quickstart对应Q场景后再解释；学习待本人演示。

### 阶段四时点记录：Q007故障恢复与原生1000场数据层基准

本阶段继续使用Android16/API36 ARM64模拟器及合成数据。独立审阅Q007驱动、结果JSON、六份UI XML及数据库快照，重新计算基准全部原始样本的nearest-rank分位数，范围内未发现阻塞；文档收尾没有重跑UI、业务测试或操作当前模拟器。

**Q007保存与读取故障观察通过。** 使用真实SQLite `BEFORE INSERT … RAISE(ABORT)`使保存失败；中英文均显示可重试错误，没有成功摘要，Q007NativeSave及8次/62.5kg输入、有效组保持，三张表原有19笔数据不变。移除触发器后，同一进程PID11397重新确认并重试，只新增一场/一动作/一组。读取故障通过临时重命名workouts表触发，中文覆盖冷启动初始化/历史读取，英文覆盖同会话Retry；恢复表名后同进程重试重新显示20场。最终无故障对象残留，结构语义、integrity和外键检查通过。证据：[结果JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q007-native-storage-faults.json)、[驱动](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q007-native-storage-faults.py)、[运行日志](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q007-native-storage-faults.txt)。

`cleanupConfirmed:true`指故障触发器/表名及结构恢复、原有数据保持；成功重试的Q007NativeSave被有意保留。当前20场是Q006删除后19场加此次1场，并非恢复成早先20轮循环时的同一数据集。审查比较[Q007前快照](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q007-preflight-rows.json)与[基准前快照](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/product-db-before-benchmark.json)，确认原有19场逐行保持，新增仅上述聚合。本次不证明磁盘耗尽、提交时断电、损坏数据库或详情单独读取失败。Q007日志的SQLite3.44.3来自设备命令行sqlite3，不是App引擎版本。

**原生1000场基准完成。** 临时诊断构建在Hermes、Expo SQLite3.50.3、development=false下，使用独立fitquest-benchmark.db构造1000场/4000动作/20000组；内容、排序、日历投影、保存、级联删除与新连接读取断言通过。runId为2026-10-02T08:30:24.578Z；夹具准备11141.039ms，初始化单次33.971ms，不以单样本宣称稳定分位数。

| 数据层操作 | 样本数 | P50（ms） | P95（ms） |
| --- | ---: | ---: | ---: |
| 读取1000场列表 | 25 | 7.714 | 7.893 |
| 1000场日历投影 | 25 | 13.646 | 14.659 |
| 读取20组详情 | 25 | 0.946 | 1.185 |
| 保存20组 | 25 | 11.221 | 12.485 |
| 删除20组 | 25 | 1.195 | 1.405 |
| 新连接打开/初始化/列表/关闭 | 5 | 11.173 | 11.243 |

以上计时来自performance.now；正确性断言在各操作计时外，无丢弃预热样本。新连接采样前原连接已关闭，但仍处于同一热进程；5样本的P95等于最大值，不作统计稳定性承诺。没有测UI渲染、帧、触摸延迟或冷进程启动，也没有性能通过阈值，不能据此勾选T029或声称常规交互1秒达标。[原始事件/样本](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-history-benchmark-events.json)、[业务库隔离核验](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/product-db-benchmark-isolation.json)和[诊断APK/探针指纹](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-benchmark-apk.json)已保留；业务fitquest.db三张表前后不变，仍20场/20动作/20组。独立基准库保留为只读后续核验材料，不进入产品数据连接。

阶段四结束时的待办快照（已由下方阶段五更新）：基准探针已从仓库与staging的产品构建输入移除，原始探针只在日志目录保留。当前staging另有FITQUEST_SCROLL_DIAG临时滚动诊断探针，不能把该构建交付为产品包。contentRef/日历rowGap修订及原生小屏回归仍在进行，边界mock刚修、最终全量检查尚待；必须去除诊断探针、核对源码并重建验证。151项通过只作为前述阶段的历史证据。确切中文Q001/Q002/Q005驱动版本尚待重跑，Q009脚本尚待执行；T018/T023/T028/T029/T033不随本阶段证据勾选，001维持25/33，真机、iOS与T030真实数据/用户条件仍待。

阶段反思：先用数据库真实失败证明安全重试，再把性能测量限定到实际经过的原生桥与数据层。数量相同不代表同一批数据；清理故障不等于撤销成功恢复的训练。诊断构建、最终产品包和UI体验必须各自有证据，不以局部通过覆盖尚在诊断的小屏问题。

本步学习验收：故障恢复/清理范围与数据时间点L2，数据层和UI性能区别L2，原始样本分位数核算L3。练习说明19→20为何不是重复保存，并从25个列表样本重算P95，解释为何7.893ms不能代表历史页冷启动。汇报“Q007双语重试与原生1000场数据层已有独立核验；小屏及完整流程继续，001仍25/33”。未达标时复读Q007断言、快照与基准计时边界后重做；证据文档已更新，学习待本人演示。

### 阶段五时点记录：键盘视口回归、冻结APK与T028工程检查

本阶段只关闭T028，001为26/33；T018/T023/T029/T033各自条件未自动通过。目标产物为去探针release变体、debug签名、临时包dev.fitquest.local、arm64-v8a APK。

| 检查 | 新鲜证据与边界 |
| --- | --- |
| 完整Jest | [keyboard-resize-green-full.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/keyboard-resize-green-full.txt)：19/19套、151/151项，exit0；扩展既有测试，计数不变 |
| TypeScript / lint | 独立运行bundled Node下tsc --noEmit与eslint . --no-cache，均exit0 |
| Expo Doctor | [final-doctor-retry.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/final-doctor-retry.txt)：21/21 |
| iOS/Android JS/Hermes导出 | [final-native-export-retry.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/final-native-export-retry.txt)：两平台成功，不是iOS原生安装 |
| Android打包 | [android-clean-keyboard-build.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/android-clean-keyboard-build.txt)：BUILD SUCCESSFUL，12s、495任务（24执行/471已有） |
| 源码与产物 | [manifest-00aba5737eab.json](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-00aba5737eab.json)：28个生产src文件与仓库/staging复算一致，APK复算匹配，无scroll/benchmark探针 |

冻结[fitquest-android-local-00aba5737eab.apk](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-00aba5737eab.apk)的SHA256为`00aba5737eabbd21f4038bf7ad18b6e703d2438b425974e238f5fd1f9599b180`。manifest中nativeAcceptance=pending描述冻结当时，以下为后续观察。既有四项权限移除、INTERNET和allowBackup=true边界保持；audit仍15（11 moderate/4 high），不宣称安全审计或发行通过。

**失败复现与修复。** 数字getInnerViewNode使Fabric measureLayout静默返回，改公共innerViewRef加空值guard。后续测量成功仍遮挡，实验发现驱动为露出整按钮先滑动，on-drag收起键盘；失败提交focus重开键盘，首次scrollTo按较大视口限制偏移。键盘稳定时直接点已观察中心可滚至719.2dp，排除“scrollTo永不生效”；后一个键盘时点的视口不能用于反推先前clamp。最终用pending row在下一次ScrollView onLayout中先清除再补定位一次，并由Active传根布局已使用的insets.top给KeyboardAvoidingView；没有改输入/领域/存储规则。

[行为RED](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/keyboard-resize-red.txt)为15通过/1失败（视口缩小后预期scrollTo2次、实际1次），实现后151项通过。原第12项还覆盖重复layout不重滚、隐藏键盘消费pending后不误重滚；host测量仍拒绝数字tag。最初两次RNTL接口/事件冒泡错误分别留作harness日志，不计产品RED。独立审查ref、错误提交、一次性定位和安全区传播，Critical/Important为0；旋转、所有键盘类型及iOS未验收。

**去探针包原生观察。** [small-screen-clean-regression.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/small-screen-clean-regression.txt)在320dp、八组原始操作下通过：重量[93,281][317,401]、完整英文错误[93,401][708,560]，IME top863px，人工看图确认末行“blank.”。原生层级及中英XML的ScrollView为[0,91][800,863]，此场景安全区偏移已纠正。[followup JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/small-screen-clean-followup.json)为observed-pass-with-driver-resume：英文次数/中文重量错误完整可见、有效录组收键盘、Log first保留输入/焦点、取消拒绝保留10次/非法重量，再确认不新增历史，结束20场且恢复原显示规格。[原followup日志](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/small-screen-clean-followup.txt)保留第二次取消前旧滚动目标失效中断，续跑使用新观察边界，未改产品；不能把中断文本单独称完整通过。

[calendar-order-clean.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/calendar-order-clean.txt)确认中英原生树日期1→31有序，不是TalkBack导航实测。320dp日历A/B仍待用户答复，Q008/T029及T033保持。[中文Q001/Q002重跑](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/empty-chinese-loop/result.json)确认空完成阻止、经React输入“深蹲”、离线保存62.5kg×8和重启读回，最后恢复原20场；Unicode由受包名/焦点/不重启限制的辅助工具输入，不能称中文IME验收。同JSON虽有快速完成字段，Q005截图实际已是Saved，保存中时点和连点前后数据库证据仍需补验，T018不关闭；Q009/T023继续。

**16KB后续边界。** [相同SHA的5582结果](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/android-16k-acceptance/runs/20261002T095241.401497Z-00aba5737eab/result.json)为ui-and-db-observed-pass，pageSize16384，记录断网录入/保存/force-stop重启详情和只读副本一致性，安装前后APK哈希相同。pageSizeCompatibilityModeVerifiedDisabled=false，不能声称禁用兼容模式下通过；平台独立最终审查继续，不作为正式发行验收。

阶段反思：原生失败须区分产品、驱动与键盘时序；框架边界mock只证明调用契约，可见性由同一去探针APK的截图/层级验证。工程检查完成与用户选择、真实设备及完整场景是不同闸门。

本步学习验收：事件时序/最小实验L2、产物身份/验收闸门L2。练习解释键盘两种高度如何影响scrollTo，并区分T028完成与T029仍待。汇报“320dp键盘重开遮挡已修复并绑定冻结APK核验；151项回归与目标构建通过，001为26/33”。未达标时复读RED/GREEN、Q008及manifest后重述；文档完成，学习待本人演示。

### 阶段六时点记录：强化Q005与Q009补证，T018/T023关闭

**强化Q005。** [重跑日志](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/empty-chinese-loop-saving-proof.txt)与[结果JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/empty-chinese-loop/result.json)现记录duplicateTapsWhileSaveStillUncommitted=true。真实SQLite临时触发器仅延长保存事务；脚本先保存实际“保存中…”树与完成按钮enabled=false的截图，再直接点两次，核对三张表仍空、UI仍保存中，最终仅1场/1动作/1组（深蹲、8次、625十分之一kg）。随后force-stop/重开详情相同，原20场恢复。独立已查看[保存中PNG](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q005-native-save-in-progress.png)、解析同名XML并检查脚本断言；原先拍到Saved的旧证据留档，不再作为保存中证明。中文输入走受约束的ACTION_SET_TEXT测试工具，非中文IME验收。

**Q009日历。** [执行结果](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q009-20261002t095752-96b25d.json)及[视觉补证](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q009-reviewed.json)相互哈希匹配。Asia/Shanghai下UTC跨日/跨年归组、2024闰年2月29天、前后月、单场直达、多场08:45→07:30倒序、删除先取消再2→1→0、选日/月保持有实际UI和数据库断言。独立再查看两场/删一场/删末场、闰年29和英文跨年五张截图，标记及列表一致。cleanup exactBaselineRestored=true，前后20/20/20业务行指纹一致、foreignKeyViolations为空；脚本q009FullyAccepted=false表示需另做视觉审查，该条件由reviewed JSON及本次独立图审补齐。当前草稿保留使用既有[Q006](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete.json)的DraftGuard原始13次证据，不冒称Q009驱动自身重测。

任务处置：T018由最新Q001摘要、既有Q003双语边界、强化Q005及Q007真实故障恢复满足；T023由最新完整Q001/Q002、既有Q006/Q007、Q009及20/20持久性审计满足。20轮审计与当前Q006删除/Q007新增后的20场是不同时间点，保留各自数据身份。当前冻结APK有最新中文保存/重启及日历回归，不把此前20轮描述成在最新包再次跑20轮。独立范围审查无阻断，T018/T023标完成，加T028后001为28/33。

此结论仅为Android合成模拟器。T029/T030/T031/T032/T033仍待：320dp日历A/B无用户答复，TalkBack、真机/iOS、隐私/真实用户和里程碑条件不被替代。151/19、类型/lint、Doctor21/21和构建是阶段五新鲜证据；audit15未解决，16KB兼容模式边界保持。

阶段反思：正确的最终数据不自动证明中间状态；应把Saving原始树、禁用按钮、未提交时连点和最终数据库放在同一因果链。脚本结论、视觉review与数据清理须各有证据，不能把待视觉审查误写为失败，也不能跳过图审。

本步学习验收：事务时点与复合证据L2、模拟器/用户验收范围L2。练习对照Q005四个时点解释去重，再由Q009的2→1→0和恢复指纹解释目标删除及清理。汇报“Android合成数据核心训练/历史场景及工程检查已核验，001为28/33；剩余五项条件独立推进”。未达标时复读相应断言、PNG/XML后重述；文档完成，学习待本人演示。

### 阶段七时点记录：保存迟到回执保护、新候选包与T032工程文档关闭

独立全局审查发现：允许的`fitquest://history`热链接可在确认保存pending时卸载WorkoutScreen；旧`.then`回调未检查页面存活，SQLite提交后仍调用onSaved，将用户从当前历史页拉回摘要。应用服务与Provider已经持有保存流程，页面生命周期应只决定是否发起导航，不能取消已确认保存。

新增真实ExpoRoot＋SQLite回归于[RED日志](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-route-red.txt)实际观察1失败/2通过：释放保存后历史页消失。仅`workout-screen.tsx`增加mounted ref及useEffect卸载清理，并在成功导航前检查；保存和Provider历史刷新不变。[独立代码审查](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/review-001-source-2026-10-02.md)已完成：Critical 0，发现的1项Important已修关闭，未解决Important/Minor均0；独立两例探针先1失败/1通过、修复后2通过。Ready仅为继续设备验收，本阶段不关闭T031。

| 检查 | 本轮证据 |
| --- | --- |
| Jest全量 | [late-save-route-green-full.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-route-green-full.txt)：152 tests / 19 suites通过 |
| TypeScript / lint | [typecheck](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-typecheck.txt)、[lint](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-lint.txt)，exit0 |
| iOS/Android JS/Hermes导出 | [late-save-native-export.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-native-export.txt)，两平台成功；不等于iOS原生构建 |
| Android构建 | [android-late-save-build.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/android-late-save-build.txt)：BUILD SUCCESSFUL，51s，495任务 |
| 签名 / ZIP对齐 | [signature](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-signature.txt)、[alignment](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/late-save-alignment.txt)通过；Android Debug证书，ZIP对齐不代替16KB设备验证 |
| 依赖检查 | 依赖未变，沿用本日[Doctor21/21](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/final-doctor-retry.txt)；audit仍15项（11 moderate/4 high），不声称重跑或清零 |

[最新候选APK](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-044ab329e9e4.apk)的SHA256为`044ab329e9e40b21ab5dbb17714289c723debffe402d383ab0d5d7b1779b45b3`；release变体/debug签名/临时包`dev.fitquest.local`/ARM64。[新manifest](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-044ab329e9e4.json)及APK哈希独立复算，28项生产源码与当前仓库、隔离staging一致。相比00aba仅workout-screen生产文件改变；旧manifest是当时快照，不再与全部当前源码一致。新包原生专项仍待，之前的Q001/Q002/Q005/Q009、320dp及16KB局部观察保持旧00aba归属，其他旧场景保留各自构建与时点。

T032的实际运行路径、候选包/旧证据区别和中文学习验收已完成独立文档审查；本次工程文档关闭后001为29/33，学习掌握仍须本人操作证明。T029/T030/T031/T033不勾选。1000场实际UI尚在准备：原5580库替换方案被自动审批审查拒绝，改为全新空5584专属模拟器自建合成夹具，不触碰原20场；不把已有数据层基准写成页面性能通过。

阶段反思：保存副作用归应用流程，导航副作用归仍存活的页面；合法链接同样能暴露异步生命周期竞态。源码改变后须重新绑定构建与回归证据，不能用上一包原生GREEN替新包背书。工程文档完成与学习掌握、发行准备各自验收。

本步学习验收：异步副作用归属L2、版本与证据绑定L2。练习在app-routes新增用例指出“保存pending→热链接到历史→释放事务→历史仍在且新记录可见”四个时点，再对照两个manifest指出改变的生产文件。汇报“迟到保存回执的导航问题已按RED→GREEN修复，新包构建完成并等待专项原生验证；运行学习文档已交付，剩余体验/隐私/用户闸门独立推进”。未掌握时重读测试、WorkoutScreen与阶段七日志后复述；本人学习仍待演示。

### 阶段八：1000场UI观察、迟到导航与历史等待态原生闭环

**1000场UI，绑定旧00aba。** 新空5584专属模拟器在先验空库后填入自建合成夹具，旧00aba APK五次进程重启后显示可用日历，第五次完成四卡15:00/13:00/11:00/09:00倒序、四动作20组详情滚动及返回10月2日选中。前后1000/4000/20000三表逐值相同，逻辑哈希`345e4afcd24f4e2ef88785ce9a1234afbba40d16a6a80fb98261e228346b7e5e`；不是1000次人工保存，也未触碰原5580的20场。原替库方案被自动审批审查拒绝且未到设备，新空AVD方案按正常权限流程执行。首轮详情驱动错误假设父group未被Android平铺，修正为实际文本顺序/可见边界后重跑，产品未因此改动。见[功能/隔离审查](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-ui-1000-empty-avd/acceptance-review.md)、[独立证据](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-ui-1000-empty-avd/independent-evidence-review.json)与[原始完成结果](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-ui-1000-empty-avd/runs/20261002T105335-099cd5e8/result.json)。

首窗口`am start -W TotalTime`五样本105/216/298/235/188ms，P50 216/P95 298ms（5样本nearest-rank P95为最大值）。这不是完整日历渲染或可交互时刻，UIAutomator轮询含工具开销；进程冷启动也不是OS/文件缓存全冷。慢帧没有剔除，原生累计gfx依次为总帧/慢帧25/6、26/7、25/8、25/8、287/19；末轮raw CSV仅保留120行，不能代替全287帧。1080×2400、420dpi、API36/ARM64/4KB、2核/2560MiB、SwiftShader、headless、并行5580与主机构建均限制性能解释。[完整计时审查](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-ui-1000-empty-avd/all-run-timing-review.json)保留首轮驱动失败的样本；仅证明所观测UI功能/可达，不能关闭T029的1秒完整交互、流畅或真机条件。

**044ab原生迟跳专项。** [原生result](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/late-save-native/evidence/result.json)和[独立解析](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/review-001-native-late-save-check.json)证实正常保存到摘要，保存未提交时热链接进入历史后不被成功回执拉走，提交后保持历史并更新，force-stop PID5425→6696重开详情正确。原1000全行不变，仅新增1001 LateSave_Control、1002 LateSave_Leave，各8次/625十分之一kg；触发器清理完成。255条事件均5584，无旧库替换。这关闭044ab对应迟跳专项；截图还暴露正常Repository Busy被误报为Could not load history/Retry，作为既有契约的Minor反馈修正，不是数据丢失。

**等待态修复与新鲜工程证据。** HistoryScreen用writePending在保存/删除期间保持Loading、缓存与选日、禁用读目标；结束或失败后重新读取。只增加依赖的中间版仍可能在状态与revision分次更新时并发读，cleanup不取消已发SQL，因此加入串行Promise队列，查询前/结果返回后检查active，过期请求跳过，成功/失败均释放队列；真实错误仍可重试。无定时轮询或放宽仓储互斥。

| 检查 | 证据 |
| --- | --- |
| 原始RED | [history-write-wait-red.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-write-wait-red.txt)：2失败/10通过 |
| 中间版失败保留 | [history-write-wait-green-full.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-write-wait-green-full.txt)：152通过/1失败；文件名不代表GREEN |
| 最终完整回归 | [history-write-wait-final-tests.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-write-wait-final-tests.txt)：153通过/19套，含首次读取抛错后重试恢复 |
| 类型 / lint | [final-typecheck](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-write-wait-final-typecheck.txt)、[final-lint](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-write-wait-final-lint.txt)，exit0 |
| 双JS/Hermes导出 | [native-history-wait-export.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-history-wait-export.txt)，iOS/Android成功；不代表iOS原生安装 |
| Android构建 | [android-history-wait-build.txt](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/android-history-wait-build.txt)，BUILD SUCCESSFUL，13s、495任务 |
| 签名 / ZIP对齐 | [signature](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-wait-signature.txt)、[alignment](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/history-wait-alignment.txt)通过；Debug签名，ZIP对齐不替代16KB设备验收 |

[当前APK](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-4f6c66316bf5.apk) SHA256为`4f6c66316bf50bce3ff73e783d975178c46275f1eb3f528f8a8664cdeadd8c17`，release变体/debug签名/临时包dev.fitquest.local/ARM64。[新manifest](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-4f6c66316bf5.json)及实体APK、28项repo/staging源码独立复算一致；相对044ab仅HistoryScreen生产文件变化。依赖未变，Doctor21/21沿用本日同版本证据；audit15（11 moderate/4 high）未解决。统一索引见[交付清单](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/delivery-2026-10-02.json)。

**4f6原生等待态与重开专项。** [result](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/history-wait-native/evidence/result.json)记录运行观察通过；[独立审查](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/review-001-history-wait-2026-10-02.md)与[独立解析JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/review-001-history-wait-native-check.json)补齐其awaiting-independent-review时点标记，原result未回写。259事件全部5584；执行runner/hash匹配，独立查看6XML及等待/提交后/重开3PNG。保存未提交时严格历史页显示Loading、31日历节点禁用，无假错误/Retry/Saved；提交后三次采样日期启用、Loading消失且仍在历史。正常保存仍到摘要。PID6971→8239重开Wait_Leave显示62.5kg×8。

原1002/4002/20002逐行相同，前后逻辑哈希`c59e06b335f8110661ade922eef17b9223ab1ea91672f0a3bd7d5002cad043a0`，最终1004/4004/20004，仅新增1003 Wait_Control、1004 Wait_Leave，各8次/625十分之一kg。DROP正常成功、触发器为空、integrity ok/FK空；没有声称执行失败清理回退分支。原生Minor等待态及读取竞态在本包本路径闭环；Critical0、未解决Important0。早期其他场景不转绑该包，T031整体不据专项关闭。

阶段反思：功能可达、首窗口、完整交互与真实流畅是不同证据；不能隐藏慢帧或丢弃驱动失败记录。Busy是协调状态，effect失效不等于SQL取消；以真实事务门闩复现，再串行读和原生延迟验收，避免凭单次GREEN判断。数据清理和原记录身份逐行核验与页面成功同样需要证据。

本步学习验收：Busy/错误与异步生命周期L2、版本/性能证据归属L2。练习画出查询开始→effect失效→SQL settle→下一查询，指出153/19与中间152/1的区别，再用00aba首窗口298ms/慢帧说明完整UI目标为何仍待。汇报“新4f6包保存等待、离页后留历史及离线重开已独立核验；旧包1000场UI功能可达，剩余小屏、读屏、隐私与用户闸门按计划验收”。未掌握时重读HistoryScreen、app-routes、Q008和本节后复述/操作；工程产物完成，本人学习待演示。

任务结论：001仍29/33，T029/T030/T031/T033继续；T032工程文档已完成，学习掌握独立待验。续跑及未决条件见当日handoff，不以本节专项代替整体里程碑。

## 2026-09-26 历史删除与日历联动

用户指令“继续进行下一阶段任务”。本轮仅补批准的T019–T022删除闭环，沿用已确认的详情删除/二次确认、日历位置和双语；不新增导出、账号、云同步或收费依赖。

### 实现

- SQLite仓储严格要求confirmed===true，未确认/非法ID不打开数据库；删除与读/存互斥。参数化DELETE只定位一个ID，外键级联动作和组，COMMIT后才成功；NotFound不影响其它记录，异常回滚并沿用失败连接隔离。
- Provider接完整HistoryRepository，同步锁防重复；成功或NotFound后使历史重新读取，保留选中月/日和当前训练的未录输入，失败不提前清理。
- 仅历史详情显示删除入口；确认显示所选训练时间与不可撤销说明，切语言不改变目标。等待时禁重复删除/返回/底栏；失败保留内容，重试重新确认；缺失显示NotFound。组件随ID重建确认，卸载后旧结果不导航到新页面。
- 成功返回日历并重新计数：两场→一场→零场时标记与当日列表一致，邻日记录不受影响，跨月返回保留位置。

### 验证证据

运行目录apps/mobile，Node24.19.0/npm11.9.0，CI=1与EXPO_NO_TELEMETRY=1，无新增依赖，全部合成数据。

| 检查 | 结果 |
| --- | --- |
| 起始基线 | 130/130通过 |
| SQLite删除RED→GREEN | 7项先因缺少删除能力失败，再全部通过；5个数据测试文件共35项通过 |
| 删除页面RED→GREEN | 5失败/1已有只读行为通过，再6项通过；失败原因为无删除入口 |
| 审查后同帧重复确认RED→GREEN | 两次相同Pressability事件：SQL只一次，但提前出现失败提示；先复现1失败/6通过，再同步消费确认，7项通过 |
| 实际Router+SQL联调 | 新用例先无删除入口失败；实现后跨月/取消/逐场删除/当日清空/邻日保留/当前草稿保持通过 |
| 补充已有历史刷新失败回归 | 保留已加载条目和选日，重试恢复；首跑通过，仅补回归，不声称新增RED |
| npm run test:ci | 19 suites、146 tests通过：原130 + SQL删除7 + 删除UI7 + 历史失败保留1 + 路由删除1 |
| npm run typecheck / npm run lint | 均exit0，无错误/警告 |
| 双平台Expo export | exit0，iOS约2.5MB、Android约2.8MB HBC及资源；不等于APK/IPA或原生运行 |

真实SQL故障使用子组删除触发器中断以及延迟外键制造COMMIT失败；验证全部父子数据回滚、其它训练不变、重新开连接可重试。另暂停提交检查外部连接仍看见原记录，并发删/查/存均Busy。仓储文件重开证明桌面持久性，不替代手机杀进程。

原始日志：/Users/qqqq/Documents/Codex/2026-09-12/gen/work/delete-2026-09-26/，含baseline、delete-red、data-green、screen-red、routes-red、screens-green，以及repeat-confirm-red/green。最终修复后的证据是tests-post-review、typecheck-post-review、lint-post-review、export-post-review（四项均exit0），导出目录native-export-reviewed；此前tests-final等记录145项中间版本。导出只有NO_COLOR/FORCE_COLOR环境提示。原生边界之外的Router、Provider、服务、SQLite SQL均实际运行。

独立只读审查自行运行中间145项全量测试、typecheck和lint，检查选定ID删除、回滚、NotFound刷新、迟到响应与草稿/月日保留。发现1项Minor：同帧双确认虽只有一次SQL，却可能把第二次Busy显示为失败。页面以同步ref消费本次确认、重新打开时才重置；新增回归先失败后通过，审查者独立复跑删除UI 7/7后确认关闭。最终Critical/Important/Minor为0/0/0，结论仅适用于本代码切片。主Agent随后全量146项及类型/lint/双平台导出通过。

本地Git检查：`git diff --check`通过，legacy/streamlit差异为空；本次源文件/测试/文档另查无尾随空格和冲突标记。任务33个唯一编号、已完成24个（T019–T022本轮勾选）。HEAD保持9720da4，保留既有改动，无commit/push。

### 仍待验证

手机/模拟器、安装包、20次真机完成/重启、飞行模式、320布局/软键盘/读屏和1000场性能尚未完成；T018/T023/T027/T028/T029/T030保持未勾选。T033设备双语、T031/T032最终里程碑条件仍待。Doctor21/21与audit13 moderate仍为9月16日证据，依赖未变本轮未重跑；原生入口限制不等于上游告警已消除。

下一阶段优先准备目标平台安装构建和合成数据真机闭环；隐私/最小导出另行规格，在其批准及实现前不采集真实健身数据。不把T019–T022代码完成描述为US2或001整体验收完成。

本步学习验收：确认/事务/界面刷新边界L2。运行README的删除测试命令，解释取消为什么不访问数据库、子组删除失败为何不能留下半条训练、删除当天最后一场如何影响月历。汇报“确认删除与日历联动已接通并有真实SQL回滚/路由回归，手机体验待验收”。答不出时重看删除仓储和app-routes用例后重做；代码进度与学习掌握分开，学习待本人演示。



## 2026-09-23 正式页面与只读历史

用户授权“进行下一步开发任务”。沿用三轮已确认的浅色橙红、行内录组、自动收键盘、底部双入口与日历，不新增视觉方向。完成T016/T017/T026，累计20/33；T019–T022只读部分已落地，删除及整体验收保持未完成。

### 已实现及RED/GREEN证据

- `+native-intent.tsx`限制已知原生路径和数字ID，拒绝query/编码/超长输入。先4项失败，再实际Router冷/热链接入口测试通过；上游GHSA-vcc3-ghjq-m6fr仍未修复，范围和后续重审条件见research。
- `workout-provider.tsx`共享同步reducer/服务、表单原值、语言与日历位置，仓储在根布局创建一次。真实路由默认历史，训练、完成摘要和详情均已挂载。
- `workout-screen.tsx`/`set-editor.tsx`实现开始、行内录组、改名/组编辑、二次删除/取消、未录输入处理、完成确认和失败保留/重试；先8项训练UI失败，再实现通过。记录成功请求收键盘、保留建议值，650ms禁用防连点；手填下一组不会被已录组编辑覆盖。
- `workout-summary.tsx`按已提交ID重新读库，显示null重量和动作/组/时长，区分不存在/读取失败，重试及旧ID晚到保护。`history-screen.tsx`显示真实月历、单场直达、多场倒序选择和空/失败状态；列表SQL先2失败后通过，历史屏幕先3失败/2通过再全通过。
- `app-routes.test.tsx`先因缺少历史路由失败，再使用真实ExpoRoot、页面、Provider、服务、reducer及Node临时SQLite跑通默认历史→开始→录入→切页/继续→记录→确认保存→摘要→日历，数据库恰1场。只替换Expo原生打开边界；不使用演示历史。
- 审查发现保存失败后重试可越过未保存动作名称：先断言disabled为true失败，再统一完成/重试guard及禁用，回归通过。最后补“先记录”定位：先发现无focus调用，再请求定位首个未录动作/当前编辑行、聚焦次数，处理后清空请求；原生测量/焦点边界替换测试通过，手机效果仍待T029。

### 最终验证（macOS、Node24.19.0、npm11.9.0）

在`apps/mobile/`执行，PATH见该目录README，`CI=1 EXPO_NO_TELEMETRY=1`。

| 检查 | 2026-09-23结果 |
| --- | --- |
| `npm run test:ci` | 17 suites、130 tests通过：基线105 + 链接4 + 历史SQL2 + 训练屏幕12 + 历史/摘要6 + 路由/SQLite1 |
| `npm run typecheck` | exit0 |
| `npm run lint` | exit0，无错误/警告 |
| `npx --no-install expo export --platform ios --platform android --output-dir <任务日志>/native-export --max-workers 2` | exit0；iOS约2.5MB、Android约2.8MB HBC及资源；不是APK/IPA或原生构建 |
| `git diff --check` / legacy路径差异 | 通过 / 空；旧Streamlit未改 |
| 任务格式核对 | 33个唯一任务，20个已完成 |

日志根目录：`/Users/qqqq/Documents/Codex/2026-09-12/gen/work/ui-2026-09-23/`。包含links/list/screens/history/routes各red日志、log-cooldown-red、retry-name-red、log-first-red/green以及tests-final、typecheck-final、lint-final、export-final。导出仅有NO_COLOR/FORCE_COLOR环境提示，不影响exit0；所有数据为合成临时数据，未新增依赖或全局安装。

独立只读审查自行运行初版125项/类型/lint、随后17项训练/历史修订及最后定位定向回归。保存失败重试名称保护Important和定位Minor均已修复并独立复核，最终Critical/Important/Minor均0，Ready to proceed仅适用于本代码切片。主Agent随后全量130项再次验证。HEAD仍为既有工作树基线，保留用户改动，无commit/push。

### 证据边界与下一步

尚未实现历史删除；没有APK/IPA、完整Xcode/模拟器、手机SQLite/断网/强制终止重启、320宽度/读屏/软键盘、1000场性能或真实用户可用性证据。`xcode-select -p`仍为`/Library/Developer/CommandLineTools`。320宽度日历以横向滚动维持48目标，是否顺手须设备验收；未声称已完成视觉检查。Doctor21/21与audit13 moderate为9月16日结果，本轮未重跑或消除上游告警。

T018/T023/T027/T028/T029/T030及完整001均未验收。下一步先完成T019/T020事务删除/隔离/失败保留，再接T021/T022删除确认和日历刷新，然后在设备上执行quickstart；采集真实健身数据前仍须T030隐私审查。

本步学习验收：状态与持久化边界L2，自动/设备证据区别L2。运行`npm run test:ci -- __tests__/screens`（19项），解释为何“记录”只改变草稿、“完成确认”才写库、保存失败为何不能跳摘要。汇报：“原生页面已接本地保存与日历查看，130项自动测试和双平台资源导出通过，历史删除及手机验收待做。”答不出时重读Provider→service→repository与app-routes用例后重做；代码完成，学习待本人演示。

---

范围：T001–T003、T005–T010。前端T004等待真实用户答复；尚未完成任何完整用户故事。

## 新鲜验证证据

环境：macOS，bundled Node v24.19.0；普通 shell 无 Node/npm；仅 Xcode Command Line Tools，没有证明完整 Xcode/模拟器可用。

执行目录：`apps/mobile/`。

```bash
/Users/qqqq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test __tests__/domain/*.test.ts
```

- 字段校验：先有7个测试，占位API抛出 Not implemented 导致7失败；实现后7通过。
- 汇总/时长：先有3个失败测试；实现后全部10通过。
- 完成聚合：先有6个失败测试；实现后全部16通过。
- 独立代码审查复现了 `Date.parse` 将2月30日自动纠正的问题；补回归用例，观察3通过/1失败（Missing expected exception），再共用规范 UTC 往返校验，全部**17通过、0失败**。
- 所有数据均为合成测试数据，无网络、数据库或用户真实记录。
- 修复后独立审查再次运行17项测试并核对文档处置，结论“本轮可继续，无阻塞”；主Agent最终复跑17/17通过，任务格式检查32项/已完成9项。
- `git diff --check` 通过；旧 Streamlit 未修改。先前 README/学习材料/交接文档的未提交工作保留。未提交或推送本轮变更。

Node内置测试通过只证明运行时行为，不执行TypeScript静态类型检查。尚未运行：Jest、typecheck、Expo lint/doctor、打包、SQLite真机事务/重启、320宽度/键盘/读屏和用户可用性验证。没有将这些标记通过。

## 规格一致性与问题处置

Spec Kit prerequisite成功；32项任务格式正确。18个FR和4个可构建验证SC均有任务，另3个用户结果指标安排T030；覆盖表示有任务，不表示已完成。

- 历史隐私PASS与宪章冲突：plan取消无条件PASS；仅纯函数/合成数据可继续，真实健身数据采集前T030必须完成隐私规格、导出路径与同意/数据流审查。该后续闸门仍未满足。
- US1完成摘要先需要数据库读取：T014前置`getCompletedWorkout`，T020复用。
- Q-001过早要求历史详情：T018止于已保存摘要，T023补完整流程。
- 已有目录与脚手架冲突：T011明确在work临时模板后合并，不覆盖领域代码。
- SDK56旧记录：research/plan/quickstart均注明历史基线；T011当日统一已安装版本并锁文件。

## 本步学习验收

必须学会：运行时校验/静态类型检查的区别、表单值到领域值的转换、真实持久化与纯函数测试的区别。目标L2；平台成本取舍目标L3。

掌握证据：运行上述命令；分别解释62.5、62.55及空重量结果；指出哪个测试阻止非法日期；用自己的话解释为什么17项通过不能称为App已完成。

汇报口径：“已复核平台并开始App领域规则，修复独立审查发现的日期问题，17项行为测试通过；前端共创、原生存储和真机验收继续待完成。”未掌握时复看 apps/mobile/README.md 和三个测试文件后重做练习。代码产物与学习掌握分别记录，学习待用户证明。

## 2026-09-13 T012训练状态增量

用户授权继续开发，前端三轮要求继续有效。任务顺序调整为先实现无框架依赖的T012；无新增生产/开发包、无网络或付费动作。

新增：`apps/mobile/src/features/workouts/application/workout-reducer.ts` 与 `apps/mobile/__tests__/application/workout-reducer.test.ts`；package.json 提供临时 Node `test:ci`。旧领域代码未改。

测试过程：恢复基线17/17；开始/录入7个新用例先失败后通过；保存状态9个新用例先观察失败（其中1个最初缺少“已有确认”前提而提前通过，补前提断言后观察到失败），实现后通过；取消3个新用例先失败后通过。最终领域17 + reducer19 = **36/36通过、0失败**。

独立只读review再次运行36项测试，结论 Ready to proceed: Yes，Critical 0、Important 0。已验证唯一草稿、字段规范化、不可变更新、确认分离、完成中锁定、失败保留、成功ID、过期/重复回执隔离及表单未保存文字的取消确认。

注意：`attemptId` 由未来应用服务生成且不得重用；状态中的成功/失败是合成事件，本测试不证明真实数据库持久化或服务命令只执行一次。SAVE_SUCCEEDED只能由已确认提交的仓储结果发出。TypeScript静态检查、Jest迁移、Expo宿主/SQLite/设备验证仍未执行。T024/T025的修改/删除组未实现，取消状态实现不等于整个US3完成。

第一轮会话方向稿含A训练工具/B运动品牌/C训练日志，以及浅深模式；仅本地内存演示，不接产品源码。尚无用户确认，不把它作为前端任务完成或设备UI验收。前端记录在 docs/design/FRONTEND_REVIEW.md。

运行：在 apps/mobile/ 使用 bundled Node 执行 `--test __tests__/domain/*.test.ts __tests__/application/*.test.ts`。最后核对git diff格式、任务状态和未修改legacy证据。未提交/推送。

本步学习验收：状态生命周期、纯reducer与真实保存的区别目标L2。练习运行36项测试，解释为何旧请求的迟到成功不能清空当前草稿，以及为何36通过仍不能称数据已经落盘。汇报口径：“训练状态逻辑已通过独立审查，前端在第一轮方向确认中，持久化尚未接入。”未掌握时复看reducer中的completing分支及对应迟到回执测试。学习验收待本人操作。

## 2026-09-16 双语基础与完成前纠错

工作从9月15日延续到16日。先运行基线36/36，再实现T033 A和T024/T025的reducer部分，不改变001范围，不增加包或网络调用。

### TDD与独立审查证据

- 错误协议：旧7项断言改为固定码后先出现7失败，原因是实际仍返回中文message；新聚合与状态原因用例也观察到预期断言失败，随后38/38通过。
- 字典：先写5项行为测试，用空返回占位建立可运行API，观察5项断言失败；最小实现后43/43通过。
- 纠错：8项用例先有7失败，1项完成中/已完成锁定因复用既有保护先通过；新增行为包括定向改名、修改、删除重排、无效输入、缺失目标与确认失效。实现后51/51通过。
- 两轮独立只读代码审查分别复跑43项、51项测试；结论均Ready to proceed: Yes，Critical/Important/Minor均0。主Agent随后补了测试代码的类型收窄断言，不改变业务行为。
- 执行证据保存在本机会话 `gen/work/implementation-2026-09-15/` 的 `errors-red.txt`、`codes-red.txt`、`i18n-red.txt`、`edit-red.txt`、`behavior-green.txt`；`mobile-before/` 保存本轮开始时源文件供审查比较。

运行目录 `apps/mobile/`：

```bash
/Users/qqqq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test __tests__/domain/*.test.ts __tests__/application/*.test.ts __tests__/i18n/*.test.ts
```

最终行为数：领域18、状态20、纠错8、文案5，共51。T024测试完成；T025的应用服务和T033的页面接入/设备验收仍未完成。没有配置或执行静态typecheck、Jest、lint/doctor、原生构建、SQLite事务或重启测试，也没有采集真实用户数据。

对比稿通过脚本语法检查；浏览器文件URL被安全策略拦截，未绕过，不宣称浏览器交互/原生键盘可用。详见前端共创记录。

本步学习验收：错误码与显示语言、不可变定向纠错目标L2；竞品取舍目标L3。运行51项测试，解释为什么切EN不应发训练事件，以及为什么完成中必须阻止编辑。可汇报：“完成双语基础及完成前纠错，通过行为测试与独立审查；界面第二轮比较中，持久化未接入。”未掌握时复看移动端README的新数据流和纠错测试，再做解释与对比稿练习。产物交付不等于学习已掌握。

收尾核对：最终51/51通过（final-tests.txt），git diff --check通过，legacy无改动。对比稿独立静态审查通过语法、ID与表单节点保留检查；1项文档Minor（plan的旧国际化状态）已修正，另统一讨论稿按钮最小宽/高为48。没有把这些源代码检查等同于浏览器视觉或设备验收；未提交/推送，当前不是设备里程碑检查点。

## 2026-09-16 保存应用服务

范围：T015、T025应用层及T013的保存端口。新增 `application/workout-service.ts`、`data/workout-repository.ts` 和 `__tests__/application/workout-service.test.ts`；没有改动既有领域/reducer实现或安装依赖。用户明确确认A行内录组，首页/历史提案继续共创，T004/T011仍未完成。

### 测试与审查

- 先运行基线51项全部通过。首批确认/提交/防重复4项观察到4失败；其中首项补齐确认状态断言后才观察到预期失败，再实现。
- 错误、异常、重试、非法ID和仓储重验证增量先4通过/5失败；实现后通过。
- 取消、生成器故障、重复ID、旧响应等增量先11通过/5失败，其中2项复用已有保护先通过；实现后保存服务16项通过。
- 主Agent与独立只读review分别新鲜运行完整 Node 命令：**67 tests、67 pass、0 fail、exit 0**。领域18、状态20、纠错8、文案5、保存服务16。审查结论 Ready to proceed: Yes，Critical/Important/Minor均0。
- TDD日志：本机会话 `gen/work/save-service-2026-09-16/save-red-1.txt`、`save-red-2.txt`、`save-red-3.txt`、`save-green.txt`；源文件基线 `mobile-before/`。

在 `apps/mobile/` 运行：

```bash
/Users/qqqq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test __tests__/domain/*.test.ts __tests__/application/*.test.ts __tests__/i18n/*.test.ts
```

已验证：未确认不写入；并发只调用一次保存端口；提交等待保留草稿；成功且ID有效才清空；明确失败或异常保留原稿并清确认；重新确认后可保存最新有效草稿；取消不调用保存；旧回执返回Superseded，不清新草稿、不提供旧导航成功。

### 验收边界

同步state port必须先应用reducer再返回；未来provider每个状态容器仅持有一个service，尝试ID全生命周期唯一。仓储接口要求失败或throw时无已提交记录；安全重试依赖这一承诺，仍须T014真实事务验证。此轮没有SQLite迁移、真实写入/回滚、历史读取、Expo/React接入、typecheck、Jest/lint/doctor、打包或设备证据。没有采集真实健身数据。

首页/历史共创稿只作结构讨论，内存合成数据；源码与脚本语法检查不等于实际浏览器或原生设备可用。未绕过先前浏览器安全策略。任务清单T015/T025完成，T013部分完成保持未勾选；13/33代码任务完成，不能等同于完成任何用户故事或设备里程碑。保留未提交用户工作，未提交/推送。

本步学习验收：服务防重复与数据库事务的区别L2，首页导航取舍L3。运行67项测试，定位重复完成、重试、旧响应用例，解释为什么只有提交成功才清草稿；在首页稿试走历史/返回/继续并说明选择。汇报：“保存应用编排完成并通过独立审查，训练录组结构已确认，真实持久化和正式界面待实现。”未掌握时复看移动端README保存数据流和这三项测试，再操作讨论稿。产物已交付，学习待本人证明。

## 2026-09-16 日历日期投影

用户认可日历交互，将背景和页面内容丰富度留待后续。提前实现T021/T022纯逻辑部分：`application/history-calendar.ts` 及 `__tests__/application/history-calendar.test.ts`。没有新增包、修改既有业务源文件、绑定讨论稿或建立正式页面。

- 基线67项全部通过；首批5项新行为在占位实现上5失败，实现后5通过。
- 追加非法参数、时间、ID和日期范围等用例后7通过/5失败；DST和删除重投影两项新增回归复用既有行为，先通过。
- 补范围校验时出现5项回归失败。诊断 `Intl.DateTimeFormat` 的真实输出发现iso8601配置不返回era字段，导致正常年份被拒绝；将日历制明确为gregory后，完整**79 tests、79 pass、0 fail、exit 0**。
- 独立只读审查复跑79项通过，Critical/Important/Minor均0，Ready to proceed: Yes，仅针对纯日期投影部分。
- 日志与源码基线保存在 `gen/work/calendar-logic-2026-09-16/`：`calendar-red-1.txt`、`calendar-red-2.txt`、`calendar-era-failure.txt`、`calendar-green.txt`、`mobile-before/`。

运行路径和命令仍为移动端README的Node命令，package脚本自动纳入新测试。验证范围包括显式时区、UTC跨午夜/月界、同日及同时间稳定排序、月份和周起始、闰年/跨年、低年份、DST、非法日期/重复ID拒绝及删除后重投影；不改写只读记录。时间范围1–9999年，空日期单元与月历外占位明确区分。

未来UI须捕获RangeError并转为读取错误，不能直接显示异常文字或伪装空历史。设备Intl、TypeScript检查、Expo、SQLite、页面/导航、实际删除和持久化均未验证；T021/T022仍部分完成，不勾选。没有提交/推送或修改legacy。

本步学习验收：UTC保存与本地日期投影L2。运行79项测试，解释首项中9月15日16:00 UTC在香港为何归9月16日；指出删除后为何应从新记录列表重新生成标记。可汇报：“月历交互已认可，日期逻辑经测试和审查，原生页面与持久化继续待实现。”答不出时复看日历测试首项和删除用例后重做。代码交付与学习完成分开记录。

## 2026-09-16 T004设计收尾与T011工程接入

### 范围与批准

用户对上一轮“完成／删除位置及确认流程”答复“顺手”。结合先前三轮原话，核心设计闸门T004完成；背景和内容丰富度后补，真实小屏/键盘/触控/读屏仍由T029验收。T011仅工程配置，不提前实现或宣称T016页面/SQLite适配完成。

原始工程基线与运行日志存于任务目录 `/Users/qqqq/Documents/Codex/2026-09-12/gen/work/expo-host-2026-09-16/`，包含 `mobile-before`、官方模板、`node-baseline.txt`、`jest-migration-before.txt`、`jest-final.txt`、`typecheck-final.txt`、`lint-final.txt`、`doctor.txt`、`audit.json`、`dependency-tree.json`。

### 变更与迁移证据

- 官方create-expo-app4.0.0在独立目录生成default@sdk-57模板57.0.25。选择性合并package/app/tsconfig和测试/lint配置，没有复制模板示例页面、图片或重置脚本。正式src原文件逐字节保持不变。
- Node24.19.0基线先运行79/79通过。直接使用Jest执行原node:test注册的calculation文件，Jest报“must contain at least one test”、0项测试，exit1；Node旁路4项输出不能冒充Jest通过。
- 9个既有测试文件仅将test注册改为@jest/globals；独立审查发现2条重复导入lint警告后，合并日历测试的同源导入。断言、夹具及业务源码不变，没有新增或删减业务用例。
- 实际锁定Expo57.0.23 / Router57.0.21 / SQLite57.0.3 / React19.2.3 / RN0.86.3 / TS6.0.3 / Jest29.7.0 / jest-expo57.0.5 / RNTL14.0.1。完整版本以package-lock.json为准。npm11.9.0为任务局部工具，未改全局安装。

### 最终验证

| 命令/核对 | 结果 | 证明边界 |
| --- | --- | --- |
| `npm run test:ci` | 9 suites，79 passed，0 failed，exit0 | 已有业务规则在Jest环境行为一致，不含页面或真实SQLite |
| `npm run typecheck` | 0错误，exit0 | 首次静态类型检查通过，不替代运行时校验 |
| `npm run lint`（expo lint .） | 无错误/警告输出，exit0 | 包括src、测试及配置；不证明界面体验 |
| `expo-doctor`1.20.4 | 21/21通过，exit0 | 配置/依赖诊断，不验证产品启动或安全审计 |
| `npm ls --all --json` | exit0 | 无未满足/无效peer图；manifest与lock一致 |
| 基线比对 | src保持原样，测试断言及夹具保持原样 | 无模板覆盖或测试语义缩减 |
| `git diff --check` | 通过 | 文本差异无空白错误；legacy/streamlit未改动 |
| `npm audit --json` | exit1，13 moderate，0 high/critical | 两个根告警传播，仍未修复，不宣称audit通过 |

安装故障与根因已记research：本机无npm导致子进程ENOENT；任务局部npm12与脚手架pack JSON形态不兼容，换经完整性校验的npm11.9.0后生成成功；精简模板使可选peer选到React DOM19.3/Worklets0.12，按Expo兼容表显式固定后安装与全树校验通过。未用force或legacy-peer-deps掩盖冲突。

### 剩余依赖风险与审查

URL解码告警GHSA-vcc3-ghjq-m6fr仍在Router→query-string7.1.3→decode-uri-component0.2.2链上。官方修复0.5.0是ESM，当前调用方为CJS函数require，未采用未经验证的强制覆盖或audit建议的Expo46降级。已在T016正文设真实路由接入前必须处理/验证输入限制并补回归的条件。uuid告警GHSA-w5hq-g745-h8pq限定源码核查中，当前xcode只使用v4且不传外部buffer，未命中公告v3/v5/v6条件；后续构建仍需复核。细节及维护者链接见research。ESLint9/Worklets的上游弃用告警也已留档，不称工具链无已知问题。

独立只读审查：自行复核Jest79、tsc、lint、基线及锁文件；两项Minor（旧运行文档、重复导入）已修复并复查关闭。Critical0；1项Important作为T016后续路由闸门明确跟踪，漏洞本身未修复，但不阻塞当前无路由的T011工程配置。最终结论“仅T011工程配置Ready to proceed，无剩余审查阻塞”。

未做：src/app路由、实际组件/RNTL流程、SQLite迁移/事务/读写、Metro产品打包、模拟器/真机、离线重启、键盘与读屏、公开发布。T004/T011共15/33完成不等于完整用户故事完成；未提交或推送Git。

### 本步学习验收

目标L2：区分设计确认、行为测试、类型检查、依赖诊断和设备验收；理解锁文件保证安装版本可复现。练习运行README的test:ci/typecheck/lint，指出“79通过”与“重启后历史存在”分别需要哪种证据。若不能解释，回看Jest配置和保存服务/仓储边界再重做。汇报：“三轮核心设计确认完成，Expo工程与测试迁移就绪，正式页面和持久化继续接入。”代码产物已验证，学习掌握待本人操作证明。

## 2026-09-17 T013/T014 SQLite保存与详情

用户指令：“进入下一阶段”。沿用已确认界面，本轮仅完成本地数据层。T013/T014勾选，累计17/33；没有把桌面数据库测试记作手机验收。

### 实现和数据流

定义初始化/保存/详情和未来历史列表/删除契约；实现私有SQLite连接、WAL/外键、事务化v1迁移、原子保存和一次JOIN详情读取。领域规则再次复制并验证完整草稿，保存到训练/动作/组三张表，COMMIT成功才给服务返回ID；服务此后清稿。查询按position还原完整聚合，包括暂时无组的动作及null重量。

初始化并发共享一次迁移；保存/读取冲突返回Busy。SQL失败回滚、关闭连接后允许新连接重试；关闭也失败则隔离实例。初始化会等待正在关闭的连接，避免提前误报ready。业务值均参数化；对外只返回安全错误码。Expo工厂使用`fitquest.db`及`useNewConnection: true`，尚未挂载provider。

### RED/GREEN与最终证据

环境：macOS，Node24.19.0、局部npm11.9.0，既有锁文件；本轮无依赖或全局安装变更。`__tests__/data`用Node内置SQLite执行真实临时文件，非SQL结果mock。Expo工厂仅替换原生open边界，生产适配器与迁移均运行。

- 迁移先观察版本仍为0、应拒绝不兼容表/更高版本却未拒绝的失败；实现后6项通过。覆盖幂等/重新开启外键/失败回滚/拒绝降级及SQL约束。
- 仓储占位时14项失败，先实现初始化后，保存/读取聚焦运行仍9失败；完成事务和详情后通过。用真实ABORT触发器中断第二组、延迟外键导致COMMIT失败、另一连接占用写锁；检查所有表无残留、旧训练不受影响、重新确认只新增一场。
- 提交前暂停仅发生在驱动执行边界，实际写入仍是SQLite；独立连接在COMMIT前读不到数据，并发调用Busy，提交后才返回ID。
- 关闭文件再从同一路径读取、参数化名称、position不同于ID的排序、损坏数据、安全错误和服务/reducer整链路均有测试。成功提交后不关闭连接，不会因后续清理抛错伪装成保存失败。
- Expo工厂先观察初始化失败，随后接入已安装Expo API；实际Expo类型参与TypeScript兼容检查。
- 独立审查发现关闭尚pending时initialize提前开第二连接。新增回归先得到`opens: expected 1, received 2`；修正为先登记关闭Promise并等待后，回归通过。

最终命令（在`apps/mobile/`，本机PATH见该目录README；`CI=1 EXPO_NO_TELEMETRY=1`）：

| 检查 | 2026-09-17结果 |
| --- | --- |
| `npm run test:ci` | 12 suites、105 tests全通过；原79项未改，新增26项（迁移6、仓储18、Expo工厂2） |
| `npm run typecheck` | exit0，零错误 |
| `npm run lint` | exit0，零错误/警告 |
| `git diff --check` | 通过 |
| `git diff --name-only -- legacy/streamlit` | 空，旧代码未改 |

原始RED与最终日志位于任务工作目录：`/Users/qqqq/Documents/Codex/2026-09-12/gen/work/sqlite-2026-09-17/`，包括`migrations-red.txt`、`repository-red.txt`、`save-read-red.txt`、`expo-factory-red.txt`、`close-race-red.txt`以及`jest-final.txt`/`typecheck-final.txt`/`lint-final.txt`。首次lint遥测触及全局`.expo`被沙箱阻止；禁用遥测后通过，没有申请扩大权限。Node原生数组跨Jest VM的原型差异与Expo重载类型差异已在测试夹具/连接端口正确处理，未弱化业务期望。

独立只读审查自行运行104项/类型/lint后报告Critical0、Important0、Minor1；修复关闭并发后，审查者独立运行新增回归并复核最终105项日志，结论Critical/Important/Minor均0，Ready to proceed。工作树基线HEAD `9720da4`；保留既有未提交更改，未自动commit或push。

### 尚未验证

本轮不含原生页面、Provider/Router挂载、历史列表/删除实现、Metro产品打包、模拟器/手机SQLite、飞行模式、强制终止/重启、320宽度/键盘/读屏或真实用户数据。T018/T023/T029/T030保持未完成。Doctor21/21与audit13moderate是9月16日记录，本轮依赖未变且未重跑；T016的URL解码风险仍须在接入真实路由前处理。不宣称完整US1或001已交付。

### 本步学习验收

目标L2：事务原子性、提交后清稿、桌面与手机证据边界。执行`npm run test:ci -- __tests__/data`得到26项通过，解释第二组写入失败为何不能留下一场半训练，并指出手机杀进程验证还缺什么。汇报：“SQLite保存/详情已实现并经过真实SQL回滚与文件重开测试，原生页面和手机持久化仍待验收。”未掌握时复看事务函数与回滚/可见性用例再重做；产物完成与学习掌握分开，学习仍待本人演示。
