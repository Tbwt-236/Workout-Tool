# Tasks: 训练记录最小闭环

日期：2026-09-12。来源：本目录 spec、plan、research、data-model、contracts/workout-flow 和 quickstart。用户本轮授权重新评估平台后直接执行；**前端必须多轮确认**，不以历史交接里的界面或执行建议代替当前授权。

使用仓库 Spec Kit 任务模板；TDD 由宪章要求。每个行为先观察失败测试，再最小实现、回归。一次只由一个 Agent 写代码，研究和只读审查可并行。

## Phase 1: Setup

- [x] T001 核实平台、现金与人力成本及版本/本机条件，在 docs/product/PLATFORM_DECISION_2026-09-12.md 和本目录 plan.md 记录依据及不确定项。
- [x] T002 建立不依赖界面的 TypeScript 领域测试入口 apps/mobile/package.json、apps/mobile/README.md；先使用 Node 24 内置测试器，不添加服务或生产依赖。

## Phase 2: Foundational

- [x] T003 依据 data-model.md 定义 apps/mobile/src/features/workouts/domain/types.ts 的草稿与验证结果类型，不引入 React 或数据库依赖。
- [x] T004 [P] 在 docs/design/FRONTEND_REVIEW.md 记录三轮确认：气质与参考、低保真信息结构、可点击交互与视觉细节；逐轮记录用户原话，未答复保持待确认。2026-09-16核心交互已确认，背景丰富度由用户明确后补；设备小屏/键盘证据归T029。

## Phase 3: US1 完成并保存训练（P1）

独立验收：无账号、飞行模式，开始 → 深蹲 8 次/62.5 kg → 确认完成 → 正确摘要；空训练阻止完成，保存失败保留草稿。

- [x] T005 [US1] 在 apps/mobile/__tests__/domain/validation.test.ts 写名称、次数、可选重量边界的失败测试；涵盖空白、范围、非有限值和精度，FR-004–FR-007、SC-006。
- [x] T006 [US1] 在 apps/mobile/src/features/workouts/domain/validation.ts 实现名称规范化、字段中文错误与十分之一公斤转换，使 T005 通过。
- [x] T007 [US1] 在 apps/mobile/__tests__/domain/calculations.test.ts 写动作数、组数、时长及设备时钟回拨的失败测试，FR-003、FR-009。
- [x] T008 [US1] 在 apps/mobile/src/features/workouts/domain/calculations.ts 实现派生汇总和非负时长，使 T007 通过。
- [x] T009 [US1] 在 apps/mobile/__tests__/domain/completion.test.ts 写整个聚合的失败测试，禁止空训练及无效嵌套组通过持久化边界，FR-010、FR-007。
- [x] T010 [US1] 在 apps/mobile/src/features/workouts/domain/validation.ts 实现全草稿重验证，保留有效空动作（其他动作须有有效组），不修改输入，使 T009 通过。
- [x] T011 [US1] 完成 T004 的三轮用户确认后，在 apps/mobile/package.json、app.json、tsconfig.json、package-lock.json 在 work/ 临时目录生成并审查官方模板后选择性合并（保留已有领域代码与测试），配置兼容 Expo/Router/React/React Native、jest-expo、RNTL、SQLite；迁移领域测试到 Jest，记录版本、用途与 doctor 结果于本目录 research.md。仅工程配置通过；页面和真实存储未实现，T016依赖风险闸门保留。
- [x] T012 [US1] 在 apps/mobile/__tests__/application/workout-reducer.test.ts 先测唯一草稿、添加动作/组、完成中禁止编辑、未确认不能完成，再在 src/features/workouts/application/workout-reducer.ts 实现，FR-001、FR-002、FR-004、FR-005、FR-011。
- [x] T013 [US1] 在 apps/mobile/src/features/workouts/data/workout-repository.ts 定义本目录契约的接口；在 __tests__/data/migrations.test.ts 先测幂等初始化/失败，再在 data/migrations.ts 实现 v1、外键、WAL 和向前迁移。2026-09-17完成0→1/重复打开/失败回滚/拒绝降级；未来版本迁移随schema变更新增。
- [x] T014 [US1] 在 apps/mobile/__tests__/data/sqlite-workout-repository.test.ts 先测真实 SQL 的事务回滚/原子写入/聚合重验证/Busy，再在 src/features/workouts/data/sqlite-workout-repository.ts 实现保存及 US1 摘要所需 getCompletedWorkout（ID 后读取已提交聚合）；原生行为以 T018 补证，FR-011、FR-015、FR-018。2026-09-17桌面真实SQLite及服务联调通过，Expo连接工厂完成但未挂载页面。
- [x] T015 [US1] 在 apps/mobile/__tests__/application/workout-service.test.ts 先测重复完成、取消确认、保存成功后清空、失败草稿保留及安全重试，再在 src/features/workouts/application/workout-service.ts 实现，FR-010、FR-011、FR-018。
- [x] T016 [US1] 在 apps/mobile/__tests__/screens/workout-flow.test.tsx 先测用户确认过的开始、录组、字段错误、完成确认、失败重试；再实现 src/features/workouts/application/workout-provider.tsx 及 src/app/_layout.tsx、index.tsx、workout/active.tsx，FR-001、FR-007、FR-009–FR-011、FR-018。2026-09-23完成；+native-intent拒绝查询/编码/超长/未知路径，真实Router冷/热入口恶意输入回归通过。只是当前原生入口限制，GHSA-vcc3-ghjq-m6fr上游依赖仍未修复，不跨CJS/ESM覆盖；新入口/升级时重审。
- [x] T017 [US1] 在 apps/mobile/__tests__/screens/workout-flow.test.tsx及history.test.tsx覆盖已保存摘要、空重量、不存在/读取失败/重试和迟到ID响应；实现src/app/workout/complete/[id].tsx与features/workouts/ui/workout-summary.tsx（错误呈现就近共用，无单独workout-error.tsx），FR-012。2026-09-23完成，app-routes.test.tsx已用真实Router与桌面SQLite联调；历史删除和设备验收不随之完成。
- [x] T018 [US1] 执行本目录 quickstart.md Q-001 的保存摘要部分（历史详情步骤7延至T023）、Q-003、Q-005、Q-007，在本目录 verification.md 记录设备、离线与 SQLite 的真实结果；此时不得声称 US2 或整个 001 已完成。2026-10-02 Android合成模拟器观察与独立审查通过；Q005强化证明两次点击后仍保存中且数据库未提交，随后只生成1/1/1；Q003双语边界、Q007真实故障恢复证据合并核验，不代表真机/iOS/用户验收。

## Phase 4: US2 查看和管理历史（P2）

独立验收：以跨月、同日多场的持久化记录为夹具，检查月历标记/选日、当天逆序列表、详情一致、取消删除保留、确认只删除一条及标记更新、重启仍存在。

- [x] T019 [US2] 在 apps/mobile/__tests__/data/history-repository.test.ts 先测时间降序/稳定同时间排序；复用sqlite-workout-repository.test.ts的详情顺序/NotFound/读取失败回归；在history-delete.test.ts先测确认、级联隔离、回滚及Busy，FR-013–FR-016、FR-018。2026-09-26完成，故障注入含删除中断及COMMIT失败。
- [x] T020 [US2] 在 apps/mobile/src/features/workouts/data/sqlite-workout-repository.ts 实现列表和事务删除，复用并回归 T014 已实现的详情读取，所有输入参数化，使 T019 通过。2026-09-26完成，严格true确认、仅提交后成功；手机持久性由T023补证。
- [x] T021 [US2] 在 apps/mobile/__tests__/application/history-calendar.test.ts 先测本地日期分组（跨UTC午夜/时区）、跨月/年及闰月；history.test.tsx覆盖月历标记/同日倒序/空态/重试，history-delete.test.tsx覆盖取消/二次确认/失败/重复确认/ID隔离，app-routes.test.tsx验证跨月选日与删除后标记变化，FR-013、FR-014、FR-016、FR-018、SC-007。2026-09-26完成；刷新失败保留既有内容另补回归。
- [x] T022 [US2] 在 apps/mobile/src/features/workouts/application/history-calendar.ts 实现日期呈现分组，在 src/app/history/index.tsx、history/[id].tsx 实现用户确认的月历与详情路径，与底部训练/历史及完成摘要联调，使 T021 通过。2026-09-26完成Provider/详情删除接入，保持当前训练未录输入和浏览位置；无新增依赖。
- [x] T023 [US2] 执行本目录 quickstart.md 完整Q-001、Q-002、Q-006、Q-007、Q-009（日历），并在 verification.md 记录 20 次完成/强制关闭/重开数据一致与无重复结果，FR-013–FR-015、SC-004、SC-005。2026-10-02结合20/20既有持久性审计、最新中文保存重启、目标删除/故障重试及Q009时区/闰年/跨年/同日排序/逐条删除通过；Q009视觉与清理已独立核验，草稿保持引用Q006。仅Android合成模拟器范围，320dp日历选择与T029/T033仍待。

## Phase 5: US3 完成前纠错（P3）

独立验收：两组草稿中改名、修改第一组、删第二组，派生值正确；取消整场需确认且不写历史。

- [x] T024 [US3] 在 apps/mobile/__tests__/application/workout-edit.test.ts 先测改名、修改/删除目标组、位置重排、删除唯一组后不能完成、取消确认与完成中锁定，FR-008、FR-017、SC-007。
- [x] T025 [US3] 在 apps/mobile/src/features/workouts/application/workout-reducer.ts、workout-service.ts 实现纠错和整场取消，使 T024 通过。
- [x] T026 [US3] 在 apps/mobile/__tests__/screens/workout-flow.test.tsx集中覆盖改名、组纠错、取消/删除确认和校验反馈，配合既有workout-edit领域回归；实现ui/workout-screen.tsx内名称编辑与set-editor.tsx，整合active.tsx，FR-007、FR-008、FR-017。2026-09-23完成；保留手填下一组，名称未保存时禁止完成/重试，先记录请求定位输入。设备焦点与键盘效果仍归T029。
- [x] T027 [US3] 执行本目录 quickstart.md Q-004，在 verification.md 记录取消无意外历史及错误数据不进入草稿的结果。2026-10-02 Android16/API36专属合成数据模拟器实测：两组中改名/改首组/删次组、无效编辑取消、下一组未录输入保留、取消先拒绝后确认；历史数量20不变。脚本、日志、JSON及截图/XML独立核验一致；不替代T029键盘/小屏/读屏或真机验收。

## Phase 6: Cross-cutting verification

- [ ] T033 依据 2026-09-13 用户双语要求，在 apps/mobile/__tests__/domain/validation.test.ts、__tests__/application/workout-reducer.test.ts 先测稳定错误码并调整 domain/types.ts、validation.ts 和 application/workout-reducer.ts；在 __tests__/i18n/workout-copy.test.ts 先测字典完整、计数与错误映射，再实现 src/i18n/ 的中英文字典。T011 后将语言状态接入已确认页面，在 __tests__/screens/workout-locale.test.tsx 验证切换保留输入/草稿/确认状态、自填动作名称不变；T016/T017/T022/T026 各页落实 FR-019，并在 T029 中分别验收两种语言的布局和读屏。常用按钮短动词，单位/错误/确认信息完整，不引入第二份应用或训练数据。
- [x] T028 运行 apps/mobile/package.json 的完整 Jest、typecheck、lint、Expo Doctor 和目标平台打包；在本目录 verification.md 写新鲜结果，测试不可替代原生运行验收。2026-10-02最新修订后153/19、类型/lint、双平台JS/Hermes导出及Android release变体/debug签名APK构建/签名/ZIP对齐通过，SHA前缀4f6c66316bf5；依赖未变，Doctor21/21沿用本日同版本证据。该包等待态/迟跳/重开专项已独立核验，不替代T029/T030/T031/T033的剩余条件。
- [ ] T029 执行本目录 quickstart.md Q-008，在 verification.md 记录 320 宽度/键盘/滚动/44pt 或48dp/读屏标签；建立1000场历史夹具，测本地读写和列表表现，记录设备与实际耗时（计划目标常规操作1秒）。
- [ ] T030 真实健身数据采集前先在 docs/product/DECISIONS.md 记录独立隐私规格、导出路径及同意/数据流审查的批准；未满足前只用合成数据。随后在本目录 quickstart.md 的匿名表格记录5位用户任务完成率、进入记录耗时和流程中位时间；对应 SC-001–SC-003，未收集前保持未验证。
- [ ] T031 依据 .agents/skills/requesting-code-review/code-reviewer.md 审查本目录规格与 apps/mobile/ 改动，在 verification.md 记录问题处置及本地 Git 检查点；保留用户改动，设备验收后方可接受里程碑。
- [x] T032 更新 apps/mobile/README.md、本目录 quickstart.md 和 docs/learning/AI_PRODUCT_MANAGER_PATH.md 的实际运行路径与中文学习验收；区别代码已完成、设备未验证和学习待验收。2026-10-02工程文档及独立复核完成：安装/工具路径与链接已检查，最新候选及旧原生证据分开，学习目标/操作练习/未达标复习齐备；本人学习掌握仍待演示，不由文档完成代替。

## Dependencies and incremental strategy

2026-10-02 最新验收（阶段八）：001保持29/33，T032工程文档完成，本人学习待演示。153项/19套、类型/lint、双平台JS/Hermes导出及4f6c66316bf5本地Android构建/签名/ZIP对齐通过；28项当前生产源码与隔离构建输入哈希一致。依赖未变，Doctor21/21沿用本日同版本证据，audit仍15项（11 moderate/4 high）。 最新4f6包已独立核验：保存期间历史Loading、无假读取错误/Retry，提交后不被迟到回执跳走，离线重启可读；原1002场及关联行逐值不变，仅新增两笔8次/62.5kg合成记录，触发器已清理。 旧00aba包的1000场UI日历/四卡倒序/四动作20组详情滚动/返回选日观察通过，三表1000/4000/20000完整保留。五次首窗口105/216/298/235/188ms，P50 216/P95 298ms不等于完整UI就绪；慢帧、SwiftShader和并行主机负载均保留，不宣称1秒完整交互或真机流畅。 早期Q场景/20轮/320dp/16KB及044ab迟到导航证据保留各自版本，不视为4f6全部重跑；16KB兼容模式禁用未证。T029/T030/T031/T033保持待：小屏日历A/B、002数据入口A/B与隐私审查、TalkBack、实体/iOS和5位用户条件仍未通过。仅合成数据，无账号、付费或发布。 证据及新旧APK对应关系见verification阶段八、handoff和交付清单。

2026-10-02 阶段七时点记录：T032工程运行与中文学习文档已独立复核完成，001为29/33；本人学习仍待演示。新回归修复保存pending时经允许的fitquest://history热链接离开后，迟到成功抢回摘要页的问题；仅增加WorkoutScreen卸载保护，保存与Provider刷新继续。最新152项/19套、类型/lint、双平台JS/Hermes导出、新Android候选构建/签名/ZIP对齐通过；依赖未变，Doctor21/21沿用本日同版本证据。新候选SHA前缀044ab329e9e4，原生专项仍待；独立代码审查1项Important已修关闭，0项未解决Critical/Important/Minor；旧00aba等构建的Q001–Q007/Q009、320dp与16KB局部证据不转绑新包。T029/T030/T031/T033保持待：日历A/B、TalkBack、实体/iOS、隐私/真实用户与里程碑条件未通过。1000场仅数据层已有结果，实际UI仍准备；audit15不变。 完整SHA、日志和边界见verification阶段七及当日handoff。

2026-10-02 阶段六时点记录：T018/T023/T028完成，累计28/33，仅Android合成模拟器。修订后151/19、类型/lint、Doctor21/21、双平台JS/Hermes导出及去探针Android构建通过；冻结APK SHA256为00aba5737eabbd21f4038bf7ad18b6e703d2438b425974e238f5fd1f9599b180，当时28个生产源码与staging一致。强化中文Q001/Q002/Q005证明空完成阻止、保存中两次点击仍未提交、最终只1/1/1及重启读回；Q009的跨日/跨年/闰年、同日倒序、取消及2→1→0删除标记有脚本/数据/五张视觉审查，旧20场逐行恢复。结合既有20轮持久性、Q003/Q006/Q007关闭T018/T023。320dp训练键盘回归与中英续跑通过，日历树顺序通过，但日历A/B仍待用户答复，不等同TalkBack或完整Q008。T029/T030/T031/T032/T033保持；原生数据层基准不证明UI/冷启动性能。audit15、无账号、合成数据、隐私/用户闸门及002 DRAFT不变；见verification阶段六及当日handoff。

2026-10-02阶段三时点记录（后续以最新工程验收段为准）：继续App、无开发者账号，不开展小程序。T029完成字段错误关联4项RED→GREEN、中英历史读屏语义1项RED→GREEN（含时刻/动作/组/时长、去内部ID）、1000场真实桌面SQL/日历基准；muted #6E7169/orange #C34312使本轮文字组合≥4.5:1，独立10项及色值复核0阻塞。T033输入错误切语言及切页保持已覆盖。本日共新增5项，累计151项/19套、类型/lint、Doctor21/21及双平台JS/Hermes导出通过；audit15（11moderate/4high）仍未通过。Android16模拟器5580的本地release变体/debug签名/临时包dev.fitquest.local/arm64测试APK已构建安装，20/20离线保存/force-stop冷启及20场数据库副本审计通过。中文日期lookup修复已有原生RED→GREEN；Q003中英边界、Q004编辑取消、Q006目标删除已有观察，后两项脚本/日志/JSON/截图独立核验无阻塞，T027完成、累计25/33。Q006删除后的19场仅为该时点合成数据快照。Q007仍在验收；T018/T023/T028/T029/T033及完整Q/真机条件不因局部证据勾选。APK外存读写/悬浮窗/振动四项权限实际移除，INTERNET、本包signature receiver和allowBackup=true仍保留。002已收缩为说明＋导出DRAFT，A/B入口首轮已提问无答复；仅合成数据，T030保持。阶段反思见verification与docs/handoff/2026-10-02-app-lifecycle.md。

2026-09-26 历史删除切片：T019–T022完成，累计24/33。146项自动测试、typecheck/lint、iOS/Android JS/Hermes资源导出通过；新增SQL删除7、删除UI7、历史刷新失败保留1、真实Router/SQLite删除联调1。删除页同帧重复确认提示竞态经RED→GREEN修复，审查与验证详情见verification.md。下一步目标平台安装构建及合成数据设备闭环；T018/T023/T027/T028/T029/T030/T031/T032/T033仍有设备、隐私、用户或里程碑条件，不把任务计数等同产品完成度。无新增依赖、未提交/推送。以下保留各日期快照。

2026-09-23 原生页面切片：T016/T017/T026完成，累计20/33。T019/T020只完成列表SQL与只读端口，T021/T022只完成只读月历/详情和路由；删除、取消删除与标记更新未实现，四项仍不勾选。T033页面语言状态已接入当前页面，但设备双语/读屏验收待做。测试布局按可复用用户流程合并为workout-flow/history/app-routes，无需按每个原计划文件拆出空模块；不改变验收条件。130项自动测试、typecheck/lint与iOS/Android JS/Hermes导出通过，独立审查问题已关闭。T018/T023/T027/T028/T029/T030/T031/T032整体设备/里程碑条件仍待，不把资源导出称为安装包。无新依赖、未提交/推送。下一步T019/T020完成事务删除，再接T021/T022删除确认与日历更新，随后设备闭环。

2026-09-16 保存服务准备：在既有51项行为基线上，提前实现T013的保存接口部分和T015应用编排；测试用保存端口替身控制成功、回滚失败和延迟结果，复用真实reducer。T013的迁移和T014的SQLite不随之完成，T018原生验收仍待办。用户已明确确认A行内录组；T004剩首页/历史与第三轮，T011整体依赖不变。

2026-09-15：按当前继续开发授权，T033 拆为 A（稳定错误码、中英字典与纯文案投影）和 B（Expo 页面语言状态与设备验收）；本轮实施 A，整个 T033 保持未完成。T024/T025 先做纯 reducer 的改名/组修改/组删除与锁定测试，T025 的 service 集成仍待 T015。两项不改变规格范围；前端通过第二轮对比稿继续共创，未答复不批准，T004/T011 不提前勾选。

2026-09-13 续开发调整：T012 是不依赖 React/Expo/SQLite 的纯 reducer，可在 T010 后先执行；其确认、失败保留及过期保存结果保护先用合成事件验证。T011 仍等待前端三轮确认。此调整仅改变顺序，不把 reducer 测试当作 T014/T015 的数据库或服务实现。T024/T025 的纠错逻辑另行推进，未实现不勾选。

- T001 → T002 → T003 → T005/T006 → T007/T008 → T009/T010：本轮可执行的第一批，仅领域规则，无产品页面、持久化或完整 App 声称。
- T004 可与领域实现并行（主 Agent 写代码、用户回复设计）。每轮确认是实际用户答复；超时不算批准。T011–T018 的 UI 工作必须等待该闸门。
- T011 之后按 T012–T018 完成 US1；US2 的数据测试可用完成记录夹具，不依赖人手先录数据；US3 可用内存草稿夹具，不依赖历史界面。
- US1 → US2 → US3 → 跨切片验收。先交付最小闭环，再谈未来功能；首批领域规则只是准备增量，不能作为用户价值闭环验收。
- 每一项行为测试和实现构成紧邻 RED/GREEN，不预先批量生成实现；每个切片后独立只读 review。

并行例子：US1 领域实现期间可独立核查官方费用；US2 写数据实现时可只读审查已确认历史流程；US3 写状态逻辑时可检查错误文案。不会同时由两个 Agent 改同一代码任务。

## Coverage

| 需求 | 任务 |
| --- | --- |
| FR-001 | T012、T016、T018 |
| FR-002 | T012、T015 |
| FR-003 | T007、T008、T014 |
| FR-004–FR-007 | T005、T006、T009、T010、T012、T016、T026 |
| FR-008 | T024–T027 |
| FR-009 | T007、T008、T016 |
| FR-010 | T009、T010、T015、T016 |
| FR-011 | T012、T014–T018 |
| FR-012 | T017、T022 |
| FR-013–FR-014 | T019–T022 |
| FR-015 | T014、T018、T023 |
| FR-016 | T019–T023 |
| FR-017 | T024–T027 |
| FR-018 | T013–T016、T018–T023 |
| FR-019 | T033、T016、T017、T022、T026、T029 |
| SC-001–SC-003 | T030（真实可用性证据，尚未满足） |
| SC-004–SC-005 | T018、T023 |
| SC-006 | T005、T006、T009、T010、T016、T026、T033（历史中文测试不证明英文验收通过） |
| SC-007 | T021、T024–T027 |

平台费、订阅、AI、账号、云同步、计时、游戏化、全量导出及异常退出草稿恢复均不在本切片新增。

执行快照（2026-09-13）：T001–T003、T005–T010、T012 已完成（10项）；T004第一轮浅色橙红方向获得“可以”答复，双语短文案讨论稿已提供，结构和完整交互轮未完成；新增 T033，未实施，其余任务未完成。已有 17 项领域测试 + 19 项状态测试的验证记录见 verification.md，本次文案讨论未重跑业务测试；没有声明任何用户故事、正式双语 App 或真机里程碑完成。

执行快照（2026-09-14）：继续 T004 第二轮，新增训练页结构可点稿（中英切换、添加/切换动作、组编辑入口、完成/取消确认）；提供已录组在前与输入在前两种排列供比较。等待用户具体反馈，首页/历史入口结构和第三轮交互验收仍未完成，T004 保持未勾选。未修改 apps/mobile，未重新运行业务测试；T011、T033 等生产实现状态不变。材料与学习验收见 docs/design/FRONTEND_REVIEW.md。

执行快照（2026-09-16）：T033 A（稳定错误码、两种语言文案和计数/反馈映射）完成；B页面语言状态/设备验收未做，整个T033不勾选。T024的纠错测试完成（复用既有取消确认测试，新增8项含1项锁定回归），T025仅reducer完成，service待T015，故不勾选。总计51项行为测试通过，独立代码审查无阻塞。新增T004行内/独立输入区对比稿，未获具体布局答复；T004/T011、用户故事与设备里程碑均未完成。新增依赖为零，数据为合成，未提交/推送。

执行快照（2026-09-16 保存服务续）：T015及T025应用层完成；T013仅保存接口已定义，迁移和其余仓储接口未完成，保持未勾选。增加16项保存服务测试，共67项通过，独立审查Critical/Important/Minor均0。重复确认只调用一次保存端口，失败必须重新确认，原稿保留；仓储失败不留已提交记录这一前提尚待T014实证。用户明确选择A行内录组，继续提供首页/历史入口对比，T004/T011仍未完成。代码任务共13/33完成，不等于用户故事或可安装App完成。

执行快照（2026-09-16 首页反馈续）：用户选择B底部「训练/历史」，并偏好打开总览历史数据。T004新稿默认历史页，展示逐场/逐组数据及开始/继续入口，仍在确认总览内容和密度；未把日历或趋势自动纳入范围。已选B不再反复询问，训练行内A保持。正式启动路由与前后台恢复在结构/交互确认后落实到T016/T022；T004/T011保持未完成。仅更新讨论稿与设计记录，业务实现/测试数不变，本轮未重跑业务测试。

执行快照（2026-09-16 日历反馈续）：用户明确要求日历形式并点击查看具体内容，取代上一条“展开明细”的假设。FR-013/US2验收/T021/T022已同步月历、日期分组、同日多场、空日期及详情返回；当前只交付内存讨论稿，业务日历未实现，不勾选T021/T022。T004继续确认日期点击细节和第三轮，T011仍待。日历只是历史导航，不包含计划、补录、趋势或新增持久化实体；33项任务数不变。

执行快照（2026-09-16 日历确认与代码）：用户反馈“顺手 交互体验不错…背景填充和整体页面内容比较单薄 后续再补充”，第二轮结构与日历点击获认可，视觉丰富度后补。T021/T022先完成纯日期逻辑及12项测试，总计79项行为通过；页面/RNTL、真实历史读取/删除和设备尚未实现，两项仍不勾选。T004只剩训练输入/键盘/小屏/误触等第三轮，用户确认不替代设备证据。T011仍按依赖待办，业务任务完成数维持13/33。

执行快照（2026-09-16 训练第三轮）：按“继续下一轮设计”交付行内输入局部讨论稿，比较记录后收起键盘与连续输入，加入未提交输入保护、编辑/删除/完成确认和中英状态切换；背景与页面丰富度继续后补。只做会话讨论材料，未修改生产源代码、未重跑79项业务测试，13/33完成数不变。T004等待用户本轮反馈；示意键盘和自适应高度不作为T029真实键盘/320设备验收证据。

执行快照（2026-09-16 键盘选择）：用户答复“自动收起键”，已固定记录成功后收起键盘，移除讨论稿连续输入比较选项，契约与D-007同步。校验失败保留输入，下一组数值预填但不自动录入。继续核对整场完成入口与误触，T004/T029未勾选，业务完成数13/33不变；本轮未修改或重跑生产代码测试。

执行快照（2026-09-16 设计收尾与宿主）：用户针对完成/删除位置及确认流程答复“顺手”，T004核心共创通过；视觉丰富度后补，T029不随之通过。T011完成官方SDK57模板审查/选择性配置、锁文件、Jest迁移及静态工具；15/33任务完成。生产src与基线一致，9个测试只迁移注册并合并一处重复导入，断言/夹具不变；Jest79/79、typecheck、lint、Doctor21/21通过。audit仍有13moderate（0 high/critical），URL解码风险已纳入T016接入前闸门，尚未修复；不作为当前无路由工程配置的审查阻塞。无产品页面/SQLite适配/设备运行/发布，T013/T014继续下一步。

执行快照（2026-09-17 本地存储）：T013/T014完成，累计17/33任务；新增26项数据测试，总计12 suites/105 tests、typecheck和lint通过。真实桌面SQLite覆盖事务中断/提交失败回滚、并发Busy、文件重开、参数化详情、失败重试与草稿状态联调；原生打开边界单独替换测试。独立审查发现的关闭/初始化并发Minor已先失败复现再修复，复核后Critical/Important/Minor均0。历史列表/删除、真实路由/页面与手机运行仍待，不宣称US1或001完整验收；T016前URL依赖闸门保留。无新增依赖、未提交/推送。
