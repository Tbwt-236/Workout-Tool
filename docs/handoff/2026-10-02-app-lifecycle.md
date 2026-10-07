# 2026-10-02 App 持续开发

2026-10-07 续记：用户已选B能量橙，真实主题实现及局部原生验收已完成，当前本地候选为`f3b396b26936`。见[最新验证](../../specs/001-workout-session-loop/verification.md)与[前端共创](../design/FRONTEND_REVIEW.md)。5584已恢复为Mac可见模拟器，保留原合成数据并新增1场；其余旧关闭/构建记录仍按原日期理解。自动任务仍暂停；iPhone连接尚待；用户已确认“保持现在最好”，并授权同步GitHub。

用户已纠正“小程序”为 App，继续 Expo + React Native，没有小程序迁移。用户授权在当前额度内持续开发全生命周期、每阶段反思检查，目前无开发者账号。保留已批准的前端结构与多轮确认要求，新页面先提供可审阅方案。无付费、账号注册或公开发布授权。

2026-10-02 时点状态：001保持29/33，T032工程文档完成，本人学习待演示。153项/19套、类型/lint、双平台JS/Hermes导出及4f6c66316bf5本地Android构建/签名/ZIP对齐通过；28项当前生产源码与隔离构建输入哈希一致。依赖未变，Doctor21/21沿用本日同版本证据，audit仍15项（11 moderate/4 high）。 最新4f6包已独立核验：保存期间历史Loading、无假读取错误/Retry，提交后不被迟到回执跳走，离线重启可读；原1002场及关联行逐值不变，仅新增两笔8次/62.5kg合成记录，触发器已清理。 旧00aba包的1000场UI日历/四卡倒序/四动作20组详情滚动/返回选日观察通过，三表1000/4000/20000完整保留。五次首窗口105/216/298/235/188ms，P50 216/P95 298ms不等于完整UI就绪；慢帧、SwiftShader和并行主机负载均保留，不宣称1秒完整交互或真机流畅。 早期Q场景/20轮/320dp/16KB及044ab迟到导航证据保留各自版本，不视为4f6全部重跑；16KB兼容模式禁用未证。T029/T030/T031/T033保持待：小屏日历A/B、002数据入口A/B与隐私审查、TalkBack、实体/iOS和5位用户条件仍未通过。仅合成数据，无账号、付费或发布。 详见阶段八；当前交付候选为4f6，不是商店发行。

既有原生证据：release变体、debug签名、临时包dev.fitquest.local、arm64-v8a本地APK已安装；20/20离线保存/force-stop冷启及当时20场数据库审计通过，日期lookup、Q003/Q004/Q006/Q007有各自证据。Q006后的19场加Q007新增1场不是最初20轮的同一数据集。本轮中文Q001/Q002/Q005和Q009完成后均恢复各自原20场数据。强化Q005补齐保存中原始树/截图及连点后未提交断言；Q009视觉review补齐脚本门槛。T018/T023据合并证据关闭，不能扩称所有设备、用户或001整体完成。

## 执行顺序

1. 恢复146项基线，核实构建工具与权限；准备隔离 Android 工具链，优先无账号本地调试包。
2. T029：修复字段错误关联、双语及输入保留；建立1000场真实桌面SQLite和月历性能基准。不得将桌面结果当真机验收。
3. T028/T018/T023/T027/T029：在可用模拟器中执行已批准训练、保存、历史、删除、离线、重启场景，问题先复现再修复；真机触控、读屏和用户操作仍单独验收。
4. T030：整理最小本地隐私与导出规格、数据流和可审阅交互，满足审批与实现条件前只用合成数据。
5. 继续发布准备、回归和审查；按证据更新001任务，不以测试数推导产品完成度。

每阶段记录：目标与范围 → 新鲜测试/构建证据 → 独立审查及处置 → 反思和下一阶段。一次只有一个 Agent 写同一任务，工具链和App任务分目录执行。保留现有未提交代码，不覆盖legacy。

## 运行机制与边界

当前续跑自动任务`fitquest-app`已由工具确认PAUSED，原字段保留、仅状态改变。原因是当前没有下一项独立可推进工作，等待小屏日历/002入口答复及设备、隐私、用户验收条件，并非额度耗尽；本轮文档收口与恢复检查点准备继续。恢复时沿用既有当前额度窗口和不使用赠送重置/付费补充的要求。先前误设的小程序Goal仍不驱动App工作。

模拟器5580和5584已正常`emu kill`，AVD/userdata全部保留；5582先前已关闭。见[关闭记录](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/emulator-cycle-shutdown.json)，没有删除AVD或清空userdata；后续需要原生验收时按对应AVD和产物版本恢复。

日志在 `/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/`。起始Jest项目缓存写入EPERM，切换任务目录缓存后恢复9月26日146项基线，源码未为缓存问题修改；阶段二新增5项后151项通过，阶段五修订后的新鲜全量仍151/19通过，阶段七新增路由回归后152/19通过，阶段八写入等待/串行读取修订后153/19通过。起始工具核查仅有CommandLineTools、无完整Xcode/Java/Android SDK；JDK/Android工具链现已隔离安装并产出本地APK，iOS完整Xcode仍缺。无账号未阻止本次本地Android验证，不代表发行渠道条件满足。

## 本步学习验收

目标L2：区分自动化测试、构建产物、模拟器运行、真机/用户验收四种证据。练习：从最新verification中各找到一条已通过和待验证项，解释调试包为何不等于上架。汇报口径：“继续开发本地优先App，先补可靠性与设备证据，再按独立规格推进隐私导出。”未掌握时重读quickstart的Q场景；学习待本人演示。

## 阶段一反思：字段反馈与性能预检

- 问题：顶部全局错误未关联到具体输入，多个动作时辅助技术用户难以确定出错字段；原规格已要求关联，无须重开设计方向。
- 实现：每个原始输入持有validationRequested；失败提交后显示就地提示、红框和accessibilityHint，纠正后即时清除。切页/语言保持，已录编辑与下一组互相隔离。数据领域与SQLite不变。
- 证据：4个新增行为先失败、修复后通过；全量150/19通过，类型/lint通过。独立审查0/0/0。原缓存目录EPERM使用任务目录缓存解决，lint须通过`-- --cache-location`转交ESLint。
- 性能：真实临时SQLite种1000场/4000动作/20000组，脚本测列表/日历/详情/存/删25次，新连接生命周期5次。修订后P95列表4.151ms、日历2.212ms、打开/初始化/列表/关闭5.042ms；没有算法优化必要的证据。
- 审查修正：原指标把打开连接排除在计时外，已改openListClose1000并包含关闭；明确同一热进程、原连接仍开放。Minor已独立关闭。
- 边界：不证明手机速度、焦点、读屏播报或键盘；T029/T033仍未勾选。反思是先精确界定测量范围，再决定优化，不能以桌面速度包装设备验收。

## 阶段二：工程兼容与本地APK

隔离Android prebuild通过；补system-ui及插件后浅色配置实际生成。SDK57兼容补丁对齐后的历史中间结果为150项，随后历史读屏语义新增1项，该阶段151项/19套、类型/lint、Doctor21/21及双平台JS/Hermes导出通过。audit仍15（11 moderate/4 high），见[依赖复核](../product/DEPENDENCY_REVIEW_2026-10-02.md)，没有宣称安全审计通过。

任务目录的JDK17/API36/Build Tools36/NDK27.1/CMake/Emulator已安装并校验。首个沙箱Gradle失败发生在插件加载阶段；获得必要编译权限后，react-native-gesture-handler还要求Build Tools35，自动下载产物不是ZIP，仅留下.installer。按保存的Google官方XML核对归档大小/SHA1/ZIP CRC后只补35，36组件文件哈希未变。非ZIP响应的传输层原因仍未知；未通过盲改子工程版本、依赖或业务代码规避。

第二轮构建日志android-build-tools35.txt为BUILD SUCCESSFUL（5m17s，495 tasks）。产物是release变体、Android Debug证书签名、临时包名dev.fitquest.local、arm64-v8a，位于隔离android-build目录；原生目录未写回仓库。apksigner校验通过；zipalign -P16通过仅证明ZIP对齐，不能替代16KB设备运行。adb install返回Success，本地APK不是生产签名、正式应用标识或商店发布。

APK badging与打包清单证实READ_EXTERNAL_STORAGE、WRITE_EXTERNAL_STORAGE、SYSTEM_ALERT_WINDOW、VIBRATE四项已移除；仍声明INTERNET与本包signature级receiver权限，allowBackup=true仍保留。断网可运行不等于没有网络权限，也不等于训练数据绝不进入系统备份。

## 阶段三时点记录：合成数据原生验收

设备为Pixel7 AOSP Android16/API36 ARM64模拟器emulator-5580，1080×2400/420dpi，非真机。已观察：

- 飞行模式且WiFi关闭后，冷启动进入历史页。
- 次数0录入失败，保留原输入、输入焦点及键盘。
- 合成动作Squat录入8次、62.5kg，成功后键盘关闭，页面出现62.5 kg × 8。
- 明确完成确认后显示已保存；force-stop再冷启，从历史打开详情仍读到同一动作和组。

截图和UI树位于native-acceptance的first-offline-launch、invalid-reps-keyboard、valid-set-keyboard-dismissed、first-saved-offline、restart-offline-detail。restart-cycles.json记录20/20保存/重启，twenty-cycles-db-audit.json记录该时点20场/20动作/20组、无重复、输入值全匹配、integrity ok及foreign key错误0。

日期原生RED定位zh-CN默认best fit回落en-US；4处formatter增加lookup后重新构建安装，date-locale-green.txt和date-locale-regression.json已覆盖中英月份/24小时/详情日期/确认/选日保持。JSON的observedProductLocale是探针读取值，不能据此宣称系统语言未变。Q003的validation-boundaries.txt/json记录中英共20个无效输入阻止录入、原值/焦点保持及四类有效边界。

Q004的edit-cancel.txt/json完整通过两组改名、改首组、删次组、取消先拒绝后确认；无效编辑没有替换旧组，未录6次/75kg保持，历史数20不变。Q006的history-delete-resume.txt及history-delete.json记录取消保留20场、确认仅删除id20、id19聚合和详情不变，日历保持选日/19场计数，当前DraftGuard未录13次保留。脚本、日志、JSON和四组截图/XML已独立只读核验，T027完成、001为25/33；Q006本模拟器观察通过，但T023整体仍待。

Q004曾因驱动误点键盘下方按钮中断，修正android-ui.py的IME/ScrollView可见目标定位后重跑；Q006曾因离屏零面积节点在详情点击前中断，未发生删除，修正后从同一选日resume并重新核对20场及目标。两者是验收驱动修正，不是产品修复。Q007仍在验收；完整Q、320布局、系统读屏、真实触控、原生1000场性能和真机仍待，T018/T023/T028/T029/T033保持未完成。详细证据见[001验证记录](../../specs/001-workout-session-loop/verification.md)。

阶段反思：先区分工具链、产品和验收驱动的问题，再补各自的新鲜证据。release变体也可能使用debug证书；构建安装和20轮读回不能替代商店发布或完整设备/用户验收。日期修复由原生RED/GREEN闭环，T027由完整Q004关闭；继续其余Q场景，不进入未获批的002实现。

本步学习验收：构建变体/签名/发行L2，产品与验收驱动故障区分L2。练习对照日期RED/GREEN与Q004/Q006日志，解释哪些修改发生在产品、哪些仅在驱动，以及T027可完成而T023仍待的原因。汇报“本地Android测试APK、20轮持久性、日期修复及Q003/Q004/Q006已有模拟器证据，001为25/33；完整设备场景继续验证”。答不清时复看签名、Q场景和截图后重述；工程产物已记录，学习待本人证明。

## 阶段四时点记录：Q007恢复与原生数据层基准

Q007已独立只读核验驱动、JSON、六份UI XML及数据库快照。真实SQLite INSERT触发器RAISE(ABORT)阻止保存，中英文均显示错误/重试、保留Q007NativeSave及8次/62.5kg，原有19场数据不变；移除触发器后同PID11397重新确认重试，只新增一笔聚合。读取故障通过临时重命名workouts表触发：中文冷启动初始化/历史读取失败，英文同会话重试失败；恢复表名后同进程重试显示20场。cleanupConfirmed=true说明故障对象/结构恢复、完整性/外键及原有行核对通过，成功恢复的1场仍保留。当前20=Q006后的19+Q007新增1，不是恢复原20轮样本。Q007的SQLite3.44.3是设备CLI版本，不是App SQLite版本。证据：[Q007结果](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q007-native-storage-faults.json)；不扩称磁盘耗尽、断电或详情单独读取失败已验证。

原生诊断基准使用独立fitquest-benchmark.db、Hermes及Expo SQLite3.50.3，完成1000场/4000动作/20000组内容与排序、日历、读写/级联删除、新连接读取断言；业务fitquest.db三张表前后不变，仍20/20/20。常规操作25样本P95：列表7.893ms、日历14.659ms、20组详情1.185ms、保存12.485ms、删除1.405ms；5次新连接打开/初始化/列表/关闭P95为11.243ms。独立重算nearest-rank分位数与[原始事件](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-history-benchmark-events.json)一致；[业务库隔离结果](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/product-db-benchmark-isolation.json)和诊断APK指纹保留。新连接采样前原连接已关闭，但进程仍热；不测UI渲染、帧、触摸延迟或冷启动，不能声称T029常规交互1秒目标达标。完整计时边界见[001验证记录](../../specs/001-workout-session-loop/verification.md)。

阶段四结束时的待办快照（已由下方阶段五更新）：基准探针已从仓库与staging产品构建输入移除，日志目录原始文件及独立合成库仅为证据。目前staging另有FITQUEST_SCROLL_DIAG滚动诊断探针，当前临时构建不能交付；去除探针后须核对源码、重新构建并跑相关原生回归。contentRef/日历rowGap修订、小屏原生问题仍在诊断，边界mock刚修后的完整Jest/类型/lint/目标构建结果未收齐。上轮151项通过不覆盖这些最新修改。Q001/Q002/Q005新驱动及Q009仍待，不新增任务勾选，001保持25/33；002入口无用户答复，真实数据与用户试用闸门不变。

阶段反思：重试可靠性应由真实故障和数据快照证明；快速数据层不等于流畅界面。诊断工具必须保留可追溯证据并从最终产品包移除，不能把临时构建称为交付。数量相同还需检查数据身份和时点。

本步学习验收：故障恢复/清理范围与快照时点L2，数据层/UI性能区别L2，分位数核算L3。练习解释19→20为何非重复保存，重算列表P95，并说明新连接为何不等于冷启动。汇报“Q007双语恢复和原生1000场数据层已核验，完整小屏/流程继续，001为25/33”。未掌握时复看Q007断言与基准计时边界后重做；文档完成，学习待本人演示。

## 阶段五时点记录：键盘修复、去探针冻结包与T028关闭

320dp八组训练的失败有两层原因：RN0.86 Fabric的measureLayout不接受旧数字tag；改成host ref后，驱动滑动按on-drag收起键盘，失败提交再focus使键盘重开，第一次scrollTo按较大视口限制偏移。键盘稳定时单次点击可滚动；产品因此使用公共innerViewRef、视口变化时一次性pending定位，并由Active路由传顶部安全区偏移。无定时重试、无数据规则改变。

[回归RED](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/keyboard-resize-red.txt)为15通过/1失败（应滚2次、实际1次）；独立[全量GREEN](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/keyboard-resize-green-full.txt)为151/19，类型/lint通过。还覆盖重复layout不重滚、键盘隐藏时清除请求；最初两次测试API/事件错误单独留档，不计产品RED。独立代码审查无Critical/Important阻断，旋转与iOS未扩称已测。

[最终Doctor](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/final-doctor-retry.txt)21/21、[双平台导出](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/final-native-export-retry.txt)成功、[Android构建](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/android-clean-keyboard-build.txt)BUILD SUCCESSFUL（12s，495任务）。[冻结APK](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-00aba5737eab.apk) SHA256为00aba5737eabbd21f4038bf7ad18b6e703d2438b425974e238f5fd1f9599b180；[manifest](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-00aba5737eab.json)的28个生产源码与仓库/staging均复算一致，无scroll/benchmark探针。manifest中nativeAcceptance=pending是冻结时点，后续观察另记。

[clean原生回归](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/small-screen-clean-regression.txt)使用原八组操作通过：重量框[93,281][317,401]、完整英文错误[93,401][708,560]，均在IME top863px以上，PNG末行“blank.”可见。ScrollView实际[0,91][800,863]，安全区修正后底边与IME一致。[中英续跑JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/small-screen-clean-followup.json)记录英文次数/中文重量错误完整可见、有效录组收键盘、先记录保留输入/焦点、取消拒绝后再确认且历史仍20场。原followup日志因旧滚动目标中断，后按新UI边界续跑，未改产品，已恢复原显示规格。[clean日历顺序](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/calendar-order-clean.txt)只证明中英原生树日期1→31，不代表TalkBack导航或日历方案获批。

本阶段仅关闭T028，001为26/33。中文Q001/Q002已重跑并恢复原20场；Q005截图已是Saved而非Saving，保存中连点仍需补证，Q009仍待，因此T018/T023不关闭。16KB同一APK已出现局部UI/数据库通过结果，但兼容模式是否关闭未证，详见verification。日历A/B、T029/T033、真机/iOS、隐私/真实用户条件维持。

阶段反思：不同时间点的内容高度和键盘视口不能拼起来判断clamp；须保持触发操作相同，分别验证ref、键盘重开与安全区。最终验收绑定去探针APK哈希，截图文件名不代替截图实际状态。本地release/debug签名仍不是商店发布。

本步学习验收：事件时序/最小实验L2，工程/原生/用户验收边界L2。练习解释键盘重开为何需要补定位，并指出T028可关闭而T029仍待的依据。汇报“修复320dp键盘重开遮挡，以151项回归、去探针冻结APK和原生观察核验；001为26/33，剩余验收继续”。未达标时重看RED、clean回归和Q008后重述；工程文档完成，学习待本人演示。

## 阶段六时点记录：强化Q005与Q009验收，001为28/33

**强化Q005。** [重跑日志](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/empty-chinese-loop-saving-proof.txt)与[结果JSON](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/empty-chinese-loop/result.json)现记录duplicateTapsWhileSaveStillUncommitted=true。真实SQLite临时触发器仅延长保存事务；脚本先保存实际“保存中…”树与完成按钮enabled=false的截图，再直接点两次，核对三张表仍空、UI仍保存中，最终仅1场/1动作/1组（深蹲、8次、625十分之一kg）。随后force-stop/重开详情相同，原20场恢复。独立已查看[保存中PNG](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q005-native-save-in-progress.png)、解析同名XML并检查脚本断言；原先拍到Saved的旧证据留档，不再作为保存中证明。中文输入走受约束的ACTION_SET_TEXT测试工具，非中文IME验收。

**Q009日历。** [执行结果](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q009-20261002t095752-96b25d.json)及[视觉补证](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/q009-reviewed.json)相互哈希匹配。Asia/Shanghai下UTC跨日/跨年归组、2024闰年2月29天、前后月、单场直达、多场08:45→07:30倒序、删除先取消再2→1→0、选日/月保持有实际UI和数据库断言。独立再查看两场/删一场/删末场、闰年29和英文跨年五张截图，标记及列表一致。cleanup exactBaselineRestored=true，前后20/20/20业务行指纹一致、foreignKeyViolations为空；脚本q009FullyAccepted=false表示需另做视觉审查，该条件由reviewed JSON及本次独立图审补齐。当前草稿保留使用既有[Q006](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/native-acceptance/history-delete.json)的DraftGuard原始13次证据，不冒称Q009驱动自身重测。

Q001/Q002/Q003/Q005/Q006/Q007/Q009及既有20/20保存-强关-重开审计的证据合并后，无本范围阻断，关闭T018/T023；加T028工程检查，当前28/33。Q001/Q002最新中文流程与Q005同次重跑完成；Q004/T027此前已关闭。限定Android合成模拟器，不能宣称真机、iOS或真实用户通过。T029/T030/T031/T032/T033、日历A/B和002界面确认继续；151/19、Doctor21/21、audit15边界不变。

阶段反思：证明“保存中不可重复”需要在未提交时再次操作并保留当时状态，不能只检查最终数量；脚本保留视觉待审标志是证据分工，必须另附实际图审。场景通过与用户设计批准分开。

本步学习验收：事务时点/复合证据L2、验收范围L2。练习从Saving原始树、两次点击后空表、最终1/1/1和恢复20场四处证据说明无重复，再解释日历功能通过为何不等于320dp方案获批。汇报“Android合成模拟器核心记录与历史场景已核验，001为28/33；小屏日历、读屏、隐私与用户条件仍待”。未达标时重看Q005/Q009断言和截图再解释；文档完成，学习待本人演示。

## 阶段七时点记录：保存迟到回执保护、新候选包与T032工程文档关闭

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

## 阶段八：1000场UI观察、迟到导航与历史等待态原生闭环

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

## 待决事项与后续运行

- 小屏日历A/B：继续等待用户选择；不以现有功能或树顺序通过代替新布局批准。
- 002数据入口A/B与隐私审查：说明/最小JSON导出仍DRAFT，具体入口及数据流未获批准，真实健身数据与5位用户采集条件保持。
- 设备/用户条件：实际TalkBack、实体Android、iOS原生、完整Q008与真实用户任务继续待；T031里程碑审查不因本轮专项提前关闭。
- 运行状态：续跑任务已PAUSED且模拟器正常关闭、数据保留。获得新答复或设备/隐私条件后，先核对任务表、当前4f6交付清单及对应证据，再恢复必要工作；不从旧包的GREEN推导新版本全通过。
- 恢复检查点：实际创建状态、提交、保存范围及main/真实暂存区保留结果以[本地执行回执](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/git-checkpoint-2026-10-02.json)为准。该检查点只用于恢复当前功能树，不包含原暂存区的独立版本备份，不代表T031里程碑接受或远程发布。
