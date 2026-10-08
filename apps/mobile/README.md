# FitQuest 移动端工程

2026-10-07：B能量橙真实页面的配色、字号和密度获用户确认保持，并授权同步GitHub。当前本地候选`f3b396b26936`，153项/19套、类型/lint、双平台资源导出和Android构建通过；指定320dp/130%字号下录入、纠错、保存及离线重启已核验。iPhone、读屏、小屏日历方案与隐私门槛仍待。当前界面见[仓库内截图](../../docs/design/FRONTEND_REVIEW.md)，新鲜证据归属见[验证记录](../../specs/001-workout-session-loop/verification.md)。以下2026-10-02段落保留旧版本时点，不能代替B候选结果。

2026-10-02：继续本地优先App。153项/19套自动回归、类型/lint、双平台JS/Hermes导出及最新4f6c66316bf5本地Android构建/签名/ZIP对齐通过。依赖未变，Doctor21/21沿用本日同版本证据，audit仍15项（11 moderate/4 high）。4f6包已独立核验保存期间历史显示Loading且无假错误、提交后留在历史、离线重启可读；仅新增两笔合成训练，原1002笔逐行不变。 T032工程文档已完成，本人学习仍待演示；T029/T030/T031/T033保持待。小屏日历A/B、002数据入口A/B与隐私审查、真实TalkBack、实体设备/iOS及5位用户条件未通过，仅合成数据，无账号、付费或发布。 旧包原生证据不转绑新包，具体归属见下方；任务以[任务表](../../specs/001-workout-session-loop/tasks.md)为准，依赖风险见[复核](../../docs/product/DEPENDENCY_REVIEW_2026-10-02.md)。

## 当前数据流

`src/app/_layout.tsx`创建单个仓储与Provider → `ui/workout-screen.tsx`和`set-editor.tsx`保存原始输入 → `domain/validation.ts`校验 → reducer中的`WorkoutDraft` → 完成确认 → 保存服务 → SQLite重验证/事务提交 → 成功ID → `workout-summary.tsx`重新读取已保存摘要。只读历史从仓储列表投影为月历；页面切换和语言切换共享同一份训练/输入。`domain/calculations.ts`派生数量与非负时长，`domain/time.ts`校验UTC时间。

历史详情 → 删除确认 → Provider互斥 → SQLite参数化DELETE及外键级联事务 → COMMIT成功 → 刷新历史版本并返回原月份/选日。失败不导航或清空详情；NotFound显示缺失并使历史重新读取；重试必须再次确认。确认跟随记录ID重置，旧删除回执不能跳走新的详情；独立的当前训练及其未录输入不受历史删除影响。完成摘要不显示删除入口。历史页面在保存/删除pending时保留日期及缓存并等待，不将正常Busy显示为存储失败；按顺序执行读取、跳过已失效请求，真实读取错误仍可重试。

- `62.5 kg` 转为 `625`；空重量为 `null`，不冒充 0 kg 或徒手。
- 名称按 Unicode 码点计数（不是 UTF-16 单元；组合字形可能包含多个码点），trim 后1–80。
- 表单只接受十进制数字；次数不接受科学计数法，重量字符串最多一位小数。
- 领域时间由 `Date.toISOString()` 产生；非法日历日期不能自动纠正成合法时长。
- 完成校验逐组检查，任何无效组都会阻止整个聚合；允许某动作暂时无组，但整场至少一组。返回独立数据，不改写输入。
- 生命周期 `idle/active/completing/error/completed` 已由 `application/workout-reducer.ts` 持有，`WorkoutDraft` 是其纯数据 payload。确认状态区分完成和取消；保存尝试由调用方提供全生命周期不重复的 attemptId，结果只作用于当前尝试。
- 保存pending时若允许的热链接离开训练页，提交与Provider历史刷新继续；已卸载的训练页不再由迟到成功回执导航到摘要。

## 运行与验证

环境：Node24（本机24.19.0），本轮使用npm11.9.0。第一次在其他环境执行需要联网安装锁文件依赖：

```bash
npm ci
npm run test:ci
npm run typecheck
npm run lint
npx expo-doctor
```

本机普通shell无Node/npm，可先使用任务目录中已校验的局部工具（不改全局安装）：

```bash
export PATH="/Users/qqqq/Documents/Codex/2026-09-12/gen/work/expo-host-2026-09-16/tools/bin:/Users/qqqq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
export npm_config_cache="/Users/qqqq/Documents/Codex/2026-09-12/gen/work/expo-host-2026-09-16/npm-cache"
export EXPO_NO_TELEMETRY=1
cd /Users/qqqq/Documents/Codex/2026-07-24/tbwt-236-workout-tool-https-github/apps/mobile
npm run test:ci
npm run typecheck
npm run lint
```

当前19个测试文件、153项：在9月26日146项基线上新增4项字段反馈/双语/跨页隔离、1项历史读屏语义、1项保存pending时热链接离开后的导航、1项历史写入等待状态回归。真实路由用例进一步覆盖持有SQL事务时的Loading与提交后刷新。数据测试使用Node24内置SQLite临时文件；路由联调使用真实ExpoRoot、Provider和SQL，仅替换原生打开边界。屏幕测试不模拟真实布局或键盘。Doctor21/21沿用2026-10-02同版本证据，最新修复未改依赖；audit15项未通过，不等同工程检查。

本轮沙箱如无法写项目原有缓存，可使用任务目录：

```bash
npm run test:ci -- --cacheDirectory /tmp/fitquest-jest
npm run lint -- -- --cache-location /tmp/fitquest-eslint.cache
EXPO_NO_CACHE=1 npx expo install --check
npm run benchmark:history
```

benchmark只创建/清理自身临时合成数据库，1000场/4000动作/20000组，输出平台、Node版本、样本数、median/P95/max；不读产品数据。测量包括SQL保存/列表/详情/删除、日期投影，以及同一进程新连接open/list/close。没有手机性能通过或冷启动结论，也不以不稳定毫秒阈值使CI失败。字段反馈单跑：`npm run test:ci -- __tests__/screens/workout-flow.test.tsx`（16项）。

启动：在本目录运行`npm start`，用与已安装SDK兼容的Expo Go或development build连接；`npm run ios`需要完整Xcode/模拟器，`npm run android`需要Android模拟器。本机仅确认Xcode Command Line Tools。初始进入历史：开始 → 添加动作 → 录组 → 完成/确认 → 已保存摘要 → 返回日历。隐私验收前只输入合成数据。

导出检查：`npx expo export --platform ios --platform android --output-dir /tmp/fitquest-native-export --max-workers 2`。它生成JS/Hermes资源，不生成APK/IPA，也不证明真机运行。完整设备步骤见[quickstart](../../specs/001-workout-session-loop/quickstart.md)。

`src/app/+native-intent.tsx`限制外部链接为已知页面和正整数ID，拒绝查询/编码/超长输入；恶意冷启动回历史，热链接保持当前页面。上游decode-uri-component告警仍存在，这只是当前原生入口限制，不适用于Web或未来任意链接参数。


## 本地Android安装与验证（2026-10-02）

2026-10-02 本地候选：[fitquest-android-local-4f6c66316bf5.apk](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-4f6c66316bf5.apk)，SHA256为`4f6c66316bf50bce3ff73e783d975178c46275f1eb3f528f8a8664cdeadd8c17`。[manifest](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-4f6c66316bf5.json)的28项生产源码与2026-10-02时点的仓库/隔离构建输入复算一致，不能作为10月7日主题更新后的源码清单。release变体、Android Debug签名、临时包`dev.fitquest.local`、仅ARM64，含离线资源，无Metro/开发者账号依赖；本地构建不等于商店发布。签名与ZIP对齐通过，后者不代替16KB设备验证。

| 产物 | 已有原生证据及限制 |
| --- | --- |
| 2026-10-02 的4f6c66316bf5 | 专属5584合成模拟器正常保存到摘要；保存未提交时热链接进入历史显示Loading、无假错误/Retry；提交后仍留历史；force-stop重开内容正确。原1002场逐行不变，仅增Wait_Control/Wait_Leave各8次、62.5kg，临时触发器已移除。没有重跑所有旧Q场景。 |
| [044ab329e9e4](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-044ab329e9e4.apk) | 迟到回执不抢路由、正常保存导航及重启读回已独立复核；此时发现的Busy假失败显示在4f6修复。 |
| [00aba5737eab](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-00aba5737eab.apk) | 中文Q001/Q002/Q005、Q009、320dp训练、16KB基础闭环及1000场UI观察。16KB兼容模式禁用未证；不是4f6的全部验收。 |

旧[00aba清单](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-00aba5737eab.json)及[044ab清单](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/manifest-044ab329e9e4.json)记录各自时点；当前WorkoutScreen/HistoryScreen已变，不能声称旧清单与全部当前源码仍一致。更早构建20/20离线保存—强关—重开及当时20/20/20数据库审计保留，未在每个后续包全量重复；详细版本、脚本/截图/数据身份和独立复核见[verification](../../specs/001-workout-session-loop/verification.md)。

先以`adb devices -l`确认专用合成设备，将SERIAL替换成该设备序列号；以下历史安装步骤指向10月2日的4f6候选，不对个人数据设备清库。

```bash
source /Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/android-toolchain/env.sh
adb devices -l
adb -s SERIAL install -r /Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/artifacts/fitquest-android-local-4f6c66316bf5.apk
adb -s SERIAL shell am start -n dev.fitquest.local/.MainActivity
```

最短复验：飞行模式 → 开始 → 合成动作8次/62.5kg → 记录（收键盘）→ 完成/确认 → 摘要 → force-stop后重开 → 日历打开同一场详情。只有完成保存的训练有持久化承诺，未完成草稿的崩溃恢复未实现。故障/事务延迟脚本只用于专属合成模拟器，不是普通使用步骤。

早期Q003双语错误边界、Q004纠错取消、Q006目标删除/未录输入保持、Q007真实SQLite故障重试各有证据；Q007不覆盖所有存储故障。00aba的320dp训练完整错误/键盘续跑通过；中文名称使用受限制ACTION_SET_TEXT工具，不等于中文IME测试。月历中英树顺序通过不等于实际TalkBack；320dp日历横向溢出仍待用户A/B选择。

1000场数据层：独立合成库1000/4000/20000，25样本P95列表7.893ms、日历14.659ms、详情1.185ms、保存12.485ms、删除1.405ms；同一热进程5次新连接打开/初始化/列表/关闭P95 11.243ms。1000场UI另在新空5584用旧00aba包观察：五次进程重启后日历可读，四卡15/13/11/09倒序、四动作20组详情滚动与返回选日通过，前后完整合成行相同。首窗口105/216/298/235/188ms、P50 216/P95 298ms只来自`am start -W`，不测完整UI就绪；gfx慢帧保留，SwiftShader及并行主机负载下不推导真机流畅或1秒目标。见[原始审查](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/native-ui-1000-empty-avd/acceptance-review.md)。没有替换原5580的20场数据库。

4f6等待态专项已独立核验通过，结论见[补充审查](/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/logs/review-001-history-wait-2026-10-02.md)为准；此项不替代实体设备、iOS原生、全部Q008或用户验收。APK仍有INTERNET、本包signature receiver和allowBackup=true；此前已移除外存读写、悬浮窗和振动。002数据说明/导出仍DRAFT，未增加入口批准或真实数据许可。

## 本步学习验收

目标L2：区分保存与页面导航生命周期、Busy等待与真实存储错误、首窗口/完整UI/数据层性能，以及源码与APK证据归属。练习按上方命令用合成8次/62.5kg保存重开；从verification阶段八指出为什么effect清理不等于取消SQL、为什么串行读取仍须检查active，再找00aba和4f6的两种原生证据说明各证明什么。

汇报口径：“153项回归通过，新包已观察保存等待与离页后留在历史、离线重开；旧包1000场历史功能可达，不把首窗口毫秒数当完整交互或真机流畅。小屏日历、读屏、隐私与真实用户闸门仍待。”未掌握时复看HistoryScreen、app-routes测试、Q008和阶段八后重述。T032工程文档已交付，本人学习仍待演示。

以下为各次历史增量，不代表最新待办。

## 本次训练状态增量

请求开始 → 录入有效动作/组 → 请求完成确认 → BEGIN_COMPLETION锁定草稿 → 匹配attemptId的成功/失败事件。失败保留原稿，成功且ID有效后清空；旧回执不能覆盖新状态。Reducer不调用SQL、不生成时钟或随机ID、不导航。

应用服务与SQLite保存适配器已接入这一状态协议，真实UI尚未实现。未来表单在取消时须传入hasUnsavedInput，防止未保存文字绕过二次确认。桌面测试已检查并发调用仅提交一场；手机重启持久性另验。

## 2026-09-16 双语与纠错增量

- `domain/types.ts` / `validation.ts` 返回稳定验证原因，保持原字段路径；业务层不再携带中文显示句子。
- `src/i18n/workout-copy.ts` 将同一个反馈映射为中文或英文，并提供短按钮、必要确认、kg标签和计数单复数。只是纯文案层；尚未接入页面语言状态、日期/摘要展示与读屏。
- `RENAME_EXERCISE` / `UPDATE_SET` / `REMOVE_SET` 按动作键和组键修改草稿；无效值/不存在目标保留原数据，删除后位置连续，旧确认失效，保存中和完成后不允许修改。

数据流：原始输入 → 领域校验 → 固定错误码或规范数值 → reducer 更新内存草稿 → 当前语言投影文案。语言不会写入 WorkoutDraft；这不等于已验证真实输入框或键盘保持。

本步学习验收：错误码与显示文字分工 L2，目标定位/不可变更新 L2。运行上方完整命令，指出英文错误映射与跨动作同名组隔离的测试，并解释删除唯一组为什么不能完成。若不能解释，复看 `__tests__/i18n/workout-copy.test.ts` 与 `__tests__/application/workout-edit.test.ts` 后重做。汇报：“双语基础及完成前纠错通过51项行为测试，原生界面与持久化待实现。”学习状态待本人操作证明。

## 2026-09-16 保存服务增量

`application/workout-service.ts` 接收同步状态端口、保存端口、时钟和尝试标识工厂。请求完成 → 明确确认 → 聚合重验证 → 锁定本次保存 → 调用 `data/workout-repository.ts` 的保存接口 → 提交成功才清草稿并返回摘要ID；失败保留草稿，重新确认后重试。旧响应返回 `Superseded`，调用方不得导航到它的旧结果。取消整场不调用保存端口。

一个状态容器只持有一个服务实例；`transition` 必须同步应用 reducer，不能直接传 React 异步 dispatch。尝试标识必须在状态容器整个生命周期唯一；服务本身还会拒绝本实例已使用的标识。未来 provider 负责这些集成条件及成功导航，当前服务没有页面或 React 依赖。

保存接口承诺“失败或抛错时不存在本次已提交记录”。16项服务测试用可控的异步端口验证调用次数、确认、重试及状态保留；该承诺本身须由 T014 的真实 SQLite 事务证明。服务完成不代表迁移、事务、历史查询或设备验证完成。

本步学习验收：服务防重复与数据库原子提交的区别 L2。运行上述命令，找到重复确认、失败重试、旧响应三个测试，解释何时允许清空草稿。汇报：“保存编排与取消通过测试和独立审查，真实落盘待接入。”未掌握时复看保存接口注释和这三个测试后重做。代码产物已交付，学习状态待本人证明。

## 2026-09-16 月历逻辑增量

`application/history-calendar.ts` 的 `buildHistoryCalendar` 接收只读完成记录（至少含id/completedAt）、年月和显式设备时区，返回带日期及当天训练的月历单元格；占位为null，无训练的真实日期有空数组。同日按UTC完成时间倒序，同时间按ID倒序。返回数组独立，记录条目复用原只读对象，不改写时间或名称，不缓存标记；删除后用新列表重新投影。`shiftCalendarMonth` 只操作年月，避免31日切换到二月时溢出。

月份为1–12，公历显示范围1–9999年，周一默认/可传周日。时区不隐式使用运行机器默认值，后续provider需取设备当前时区并在变化时重新投影。非法配置、时间或记录ID抛RangeError；未来界面必须映射为可重试的读取错误，不能显示原异常文案或当作空历史。尚无原生Intl、UI绑定、SQLite查询或真实删除验证。

本步学习验收：UTC保存与本地日期显示的区别L2。运行全部测试，说明同一条 `2026-09-15T16:00:00.000Z` 记录在香港和UTC各归哪一天；再指出删除后一日标记如何更新。汇报：“月历分组和边界通过自动测试，日期点击获用户认可，正式页面待接入。”答不出时复看 `__tests__/application/history-calendar.test.ts` 的首项和删除投影用例后重做；学习待本人操作。

## 2026-09-16 Expo工程接入（T011）

`package.json` / `package-lock.json`锁定官方兼容依赖；`app.json`保持浅色、竖屏及iOS/Android；`tsconfig.json`使用Expo基础配置并开启strict；`jest.config.cjs`使用jest-expo预设；`eslint.config.cjs`使用Expo规则。仅合并必要配置，没有复制模板示例页面。原`src`文件与迁移前基线逐字节一致；9个测试文件迁移test导入，另合并日历测试的重复类型导入以消除lint警告；断言与夹具不变。

实际组合：Expo57.0.23、RN0.86.3、React19.2.3、Router57.0.21、SQLite57.0.3、TS6.0.3、Jest29.7.0、jest-expo57.0.5、RNTL14.0.1。React DOM/Reanimated/Worklets按Expo兼容值显式固定，避免可选peer拉入不匹配版本；不由此增加Web功能或动画需求。

已知工具链事项：ESLint9与当前Expo所用React/import插件peer兼容，但有上游弃用提示；npm audit仍报告13项moderate（0 high/critical），来自两个传递依赖根告警。URL解码告警须在T016接入真实路由前处理；详情与不能直接跨模块系统override的原因见规格research/verification。本工程尚未作为App对外运行或发布，不能将doctor通过当成安全审计通过。

本步学习验收：工程配置与产品功能的区别L2。运行test:ci和typecheck，解释为何79项通过仍不能证明重启后数据存在；找到package-lock.json和保存仓储接口各说明其职责。未掌握时复看运行段和保存服务数据流后重试。汇报：“核心设计共创完成，Expo工程与测试迁移就绪，页面、真实存储和设备验收待接入。”学习掌握仍须本人演示。

## 2026-09-17 SQLite增量（T013/T014）

- `data/migrations.ts`：WAL/外键设置，事务化0→1迁移与结构探测；幂等，不降级或清空旧数据。
- `data/sqlite-workout-repository.ts`：先复制并重验证草稿，再整笔写入三张表；提交成功才返回ID。并发保存/读取返回Busy；详情使用一次参数化JOIN，按position排序并重验证。
- `data/sqlite-transaction.ts`：BEGIN IMMEDIATE → 插入 → COMMIT；失败ROLLBACK。提交后不做可能抛错的清理，防止误报失败引起重复保存。
- `data/expo-workout-repository.ts`：使用已安装的expo-sqlite打开`fitquest.db`独立连接；未来T016每个应用数据容器创建一次。连接不向UI暴露，不同时交给另一个SQLiteProvider使用。
- 失败后丢弃连接，重试新开；关闭失败则隔离实例，需要重启后重新打开。不要把回滚失败的旧连接重新注入仓储。

26项新增数据测试包含真实SQL触发器中断、延迟外键导致COMMIT失败、第二连接写锁、提交前不可见、失败连接隔离、文件关闭重开及服务/reducer联调。测试只使用临时合成数据库，不读取个人训练数据。未新增依赖、服务或收费项。

历史列表与删除只有契约定义，实际实现归T019/T020；原生工厂测试替换了打开边界，不能宣称Expo原生读写已验收。下一步先处理T016已记录的URL依赖风险，再挂载已确认界面和provider。
