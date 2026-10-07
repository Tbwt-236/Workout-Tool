# Phase 0 Research: 训练记录最小闭环

**Date**: 2026-08-04（历史规划）

**当前状态2026-10-02**：SDK57补丁对齐后Doctor21/21通过，累计151项/19套、类型/lint、双平台JS/Hermes导出通过。本日新增字段反馈4项和中英历史读屏语义1项RED→GREEN；muted #6E7169/orange #C34312使本轮文字组合≥4.5:1，独立10项及色值复核0阻塞。新增system-ui57.0.4保证既定浅色配置生成，见D-009。audit仍15项传播告警（11moderate/4high，3个根包），见[依赖审查](../../docs/product/DEPENDENCY_REVIEW_2026-10-02.md)。Android 16 API36 ARM64模拟器5580已启动；首轮APK需要Build Tools35且自动下载非ZIP，按官方XML校验大小/SHA1/CRC后仅补35，SDK36文件哈希未变；第二轮本地测试APK已构建并安装成功，飞行模式且WiFi关闭后冷启动进入模拟器历史页；其余Q场景和真机待验收，中文月标题显示英文问题在查。APK badging已确认外存读写、悬浮窗/振动四项权限实际移除，仅保留开发用INTERNET及本包signature receiver权限；backup不变。继续App、无账号/小程序/真实数据；002说明＋导出仍DRAFT，入口首轮无答复。下文旧版本、旧告警和构建条件是历史。

**2026-09-26续**：T019–T022历史删除能力已接仓储/Provider/详情/月历，146项自动测试与双平台资源导出通过。复用既有事务和外键，不新增schema或依赖；成功提交才刷新，失败弃连接/保留详情/再确认，NotFound使历史重新读取。手机验收和上游依赖升级仍待。下方“9月23最新状态”是当时快照。

**最新状态（2026-09-23）**：正式路由、共享状态、双语训练/纠错/摘要与只读日历已接SQLite。130项Jest测试、类型/lint及双平台JS/Hermes导出通过。删除和设备验收待做。依赖未改，Doctor/audit仍为9月16日记录；原生链接已限制输入，上游告警未修复。以下旧日期段落为历史。

## 2026-09-23 路由入口、共享状态与验证方式

已安装Router57.0.21的`build/getLinkingConfig.js`在冷启动状态解析前调用native-intent，`build/link/linking.js`在热链接交给导航listener前调用；当前应用不配置redirects。按[Expo native-intent接口](https://docs.expo.dev/router/advanced/native-intent/)实现`src/app/+native-intent.tsx`，只接受history、workout/active及带正整数ID的详情/摘要路径，支持fitquest与Expo开发链接；长度上限1024，拒绝百分号编码、查询、片段、反斜线与空白。冷启动非法链接回历史，运行中非法链接忽略，避免打断草稿。

[GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)建议升级或限制输入；当前query-string7.1.3的CJS调用不直接覆盖为ESM修复版。新增4项测试调用实际Router冷/热入口函数，只替换系统Linking边界，覆盖畸形/超长输入和合法数字路径。因此当前原生页面可继续接入；这不修复依赖版本，不保护Web、绕过此入口的新解析调用或未来动态query。若新增URL参数、外链、redirects、Web或升级Router，必须重新检查边界并优先验证兼容升级。

Provider使用`useSyncExternalStore`包装同步reducer状态容器，每个生命周期只创建一个仓储、服务及递增标识源；避免把异步React setState当同步状态端口。表单原始字符串独立于已录组，路由卸载与语言切换保留输入；完成成功才清理。日历定位采用服务实际提交的completedAt，避免午夜跨日时第二次取钟产生偏差。

历史SQL只完成只读列表，通过JOIN计数、UTC完成时间/ID稳定倒序，并复用私有连接与Busy保护；删除仍待T020。RNTL14使用异步render/fireEvent，真实路由测试直接渲染ExpoRoot并接临时SQLite，避开已安装Router测试助手对旧同步render的假设。原生focus/measure/scroll只替换宿主边界验证调用意图，不能证明手机布局或键盘通过。无新增依赖、账户、网络服务或收费项。

**2026-09-12 执行更新**：已重新核验官方 SDK 兼容矩阵，当前文档为 SDK57/RN0.86/React19.2.3/Node>=22.13.x。当前只使用 bundled Node24.19.0 执行纯领域 TypeScript 测试，无 React/Expo 包安装。R-001 的 SDK56 指令不再作为直接运行命令；T011 将在保留已有领域代码的前提下重新核实实际包、模板与 Expo Go，再安装、锁定与统一更新本文。当前免生产依赖；Node测试器仅临时验证领域行为，后续迁移到Jest。前端三轮确认记录见 docs/design/FRONTEND_REVIEW.md。
**Feature**: [spec.md](spec.md)

## R-001：Expo 版本与脚手架

**Decision**: 第一条切片显式使用 `create-expo-app` 的 `default@sdk-56` 模板，并在生成后锁定依赖。SDK 56 对应 React Native 0.85、React 19.2.3，最低 Node.js 为 20.19.x。

**Rationale**: Expo 官方稳定 SDK 列表在调研日将 SDK 56 列为最新已发布稳定版本。与此同时，`create-expo-app` 文档正在切换到 SDK 57，默认行为可能因 Expo Go 兼容性而选择其他版本。显式版本比依赖 `latest` 默认值更可重复，也避开新版本切换初期的测试依赖风险。

**Alternatives considered**:

- SDK 57：文档已经出现模板入口，但稳定发布信息和测试生态仍处于切换期，本切片不承担抢先升级风险。
- SDK 54：更容易匹配部分 Expo Go 商店版本，但版本较旧，不适合作为面向未来上架的新项目基线。
- 裸 React Native：增加原生构建和配置成本，与个人开发及学习目标不符。

**Sources**:

- https://expo.dev/sdk/56
- https://docs.expo.dev/versions/v56.0.0/
- https://docs.expo.dev/more/create-expo/
- https://expo.dev/blog/expo-ui-stable-sdk-56

## R-002：导航

**Decision**: 使用默认模板内置的 Expo Router，并采用 Stack 路由组织首页、进行中训练、完成摘要、历史列表和详情。

**Rationale**: Expo 官方把 Router 作为默认多屏模板的一部分；文件路由让屏幕与 URL/路径一一对应。当前只有一条主流程，Stack 比提前创建多标签导航更简单。

**Alternatives considered**:

- 手工配置 React Navigation：Expo Router 已覆盖当前需求，重复配置没有额外用户价值。
- Tab 导航：当前只有开始训练和历史两个入口，先使用首页入口与 Stack，避免为未来功能预留空标签。

**Sources**:

- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/router/basics/core-concepts/

## R-003：本地数据存储

**Decision**: 使用 `expo-sqlite` 保存已完成训练，开启外键并通过事务写入和删除。所有用户输入使用参数化查询或 prepared statements。

**Rationale**: 训练、动作和训练组是明确的一对多关系；SQLite 可以原子保存整个嵌套记录、稳定排序历史并为后续趋势查询提供基础。官方模块支持应用重启后的持久化，且包含在 Expo Go 能力范围内。

**Alternatives considered**:

- AsyncStorage/单一 JSON：初期代码较少，但整份数据重写、并发保存、迁移和历史查询风险更高。
- 文件 JSON：需要自行处理原子写入、损坏恢复和查询。
- 云数据库：违反本切片无账号、无网络和本地优先边界。
- ORM：当前三张表不需要额外抽象、包体和迁移框架。

**Sources**:

- https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/

## R-004：进行中训练状态

**Decision**: 使用 React Context + `useReducer` 管理单一内存草稿；只在确认完成时调用仓储持久化。

**Rationale**: 规格明确推迟异常退出恢复。内存草稿能清楚区分“正在编辑”和“已经完成”，保存失败时也能保留用户输入以便重试。单一功能不需要第三方全局状态库。

**Alternatives considered**:

- 每次编辑立即写数据库：会无意实现部分恢复能力、增加草稿清理和迁移复杂度。
- Zustand/Redux：当前状态规模不足以证明新增依赖合理。
- 仅用各屏幕局部状态：跨编辑组件、确认弹窗和完成服务的生命周期容易分散。

## R-005：重量精度与时间

**Decision**: 领域层把公斤重量转成十分之一公斤的整数保存；时间戳保存为 UTC ISO 字符串，显示时转换为设备本地时间；时长保存为非负整数秒。

**Rationale**: 规格只允许一位小数，整数能避免二进制浮点比较和显示误差。UTC 时间戳不会因后来切换时区而改写原值，设备本地化只属于展示层。

**Alternatives considered**:

- 浮点公斤：实现直接，但可能出现 `0.1 + 0.2` 一类精度问题。
- 字符串重量：避免浮点但排序、验证和计算更繁琐。
- 本地时间字符串：跨时区和夏令时解释不稳定。

## R-006：测试基线

**Decision**: 使用 Jest + `jest-expo` 运行测试，使用 React Native Testing Library 验证用户可观察的组件行为；领域和 reducer 使用纯函数单元测试，SQLite 原生持久化由设备 quickstart 补证。

**Rationale**: 这是 Expo 官方推荐的单元和组件测试组合。它能支持项目要求的 TDD，同时避免依赖不支持 React 19 的旧 `react-test-renderer`。

**Alternatives considered**:

- 只做手工测试：不能快速回归边界规则和重复完成问题。
- 只做快照测试：对真实用户行为和数据完整性的证明不足。
- 首切片立即加入 Maestro：E2E 有价值，但会扩大环境和工作流范围；Alpha 前再引入自动设备回归。

**Sources**:

- https://docs.expo.dev/develop/unit-testing/

## R-007：依赖最小化

**Decision**: 生产依赖仅采用 SDK 模板已有能力和 `expo-sqlite`；不添加 Zod、日期库、状态库、ORM、分析或网络 SDK。

**Rationale**: 当前验证、日期转换和状态规模都能用平台与 TypeScript 完成。减少依赖能够降低供应链、升级、包体和学习负担，并符合宪章约束。

**Alternatives considered**:

- Zod：运行时 schema 很有用，但本地表单只有三个受控字段，纯函数验证足够。
- 日期库：当前只需 UTC 保存和本地显示。
- Sentry/分析 SDK：MVP 后续可靠性阶段再依据隐私数据流接入。

## R-008：当前开发环境差距

**Decision**: 把 Node 环境和 Xcode 安装列入脚手架/设备验证任务，不在规划阶段假设已经就绪。

**Rationale**: 2026-08-04 的本机检查显示普通 shell 中没有 `node`；Codex bundled runtime 为 Node v24.14.0。`xcodebuild` 只指向 Command Line Tools，没有完整 Xcode，因此目前不能声称已具备 iOS 模拟器或本地 iOS 构建能力。

**Alternatives considered**:

- 忽略环境差距：会导致后续“代码完成但用户无法运行”。
- 规划阶段立即安装：本轮只授权技术规划，安装工具属于后续实施任务。

## Resolved Unknowns

所有技术上下文未知项已经形成明确决策，没有剩余待澄清标记。SDK 版本仍需在实际脚手架当天再次核对官方稳定状态，若改用其他大版本，必须更新本研究记录和计划。

## 2026-09-16 T011 当日复核与官方模板审查

T004已由“顺手”（完成/删除位置与确认流程）收尾。依据[Expo兼容表](https://docs.expo.dev/versions/latest/)、[官方脚手架选项](https://docs.expo.dev/more/create-expo/)、[Router接入说明](https://docs.expo.dev/router/installation/)及[Jest配置说明](https://docs.expo.dev/develop/unit-testing/)，本轮以SDK57为基线，取代历史SDK56计划。

在任务隔离目录生成 `create-expo-app@4.0.0 --template default@sdk-57 --no-install --no-agents-md --yes`；模板实际为expo-template-default 57.0.25，依赖Expo ~57.0.23、RN 0.86.3、React 19.2.3、TypeScript ~6.0.3。模板示例页面、图片、重置脚本、web界面及额外动画/玻璃效果模块不合并；仅取已批准架构所需运行配置与兼容版本。源代码及79项测试已在任务work目录留存完整基线。

新增包用途：Expo提供原生模块运行环境；Router及其constants/linking/screens/safe-area依赖承载已确认导航；React/RN负责原生界面；expo-sqlite供T013/T014本地存储适配；jest-expo/Jest/RNTL用于迁移及后续组件行为验证；TypeScript/ESLint用于静态检查。不增加ORM、状态库、日期库、账号、服务器或付费服务。

本机已有Node24.19.0但无npm；在任务目录从官方registry元数据校验SHA-512后准备npm工具，不修改全局安装。第一次模板命令因子进程找不到npm失败；补齐局部PATH后发现npm12的pack JSON输出与create-expo-app 4.0.0不兼容。改用已核验npm11.9.0后官方模板生成成功。依赖安装与最终验证结果见verification.md，不把模板生成等同于可用App。

依赖解析补充：精简模板时，Router的可选peer自动拉入了React DOM19.3.0和Worklets0.12.2，与SDK57的React19.2.3/原生模块不兼容。依据实际ERESOLVE输出与Expo bundledNativeModules，使用 `expo install react-dom react-native-worklets react-native-reanimated` 固定为官方兼容组合，保留仅iOS/Android平台，不由此新增Web产品或动画需求。jest-expo57.0.5内部使用babel-jest/@jest/globals29，测试器显式取Jest29.7.0；不盲跟独立Jest最新主版本。实际锁定版本及安装告警在最终验证中记录。

### T011依赖审计处置（2026-09-16）

`npm audit --json`实际报告13项moderate、0 high/critical；这是两个根告警沿父依赖传播，不是13个独立漏洞，audit未通过。

- `expo-router → query-string7.1.3 → decode-uri-component0.2.2`：畸形百分号编码可能导致CPU占用，[维护者公告GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)修复版为0.5.0。已下载官方修复包并校验SHA-512后读源码：0.5.0为ESM默认导出；现有query-string为CommonJS并将require结果直接当函数调用。不能直接override为0.5.0，否则有模块形态不兼容风险。T016真实路由接入前须处理该依赖或验证输入限制并补回归；在此之前不以本配置宣称外部输入/发布安全。
- `xcode3.0.1 → uuid7.0.3`：[维护者公告GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)涉及v3/v5/v6自定义输出缓冲区边界。当前安装的xcode/lib/pbxProject.js:90只调用v4且未传缓冲区；该调用点未命中公告描述条件。这是限定源码审查，不是全工程安全证明；后续原生构建或依赖升级时复核。

未执行audit自动建议的Expo46/Router5大版本降级，也未加入未经验证的覆盖。ESLint9有上游弃用提示，但当前eslint-plugin-react/import的peer范围尚不含10，本轮保留官方可兼容工具链；升级时需一起复核。安装中Worklets的DEP0151是上游ESM入口省略后缀的Node告警，无项目业务源码变更。以上记录不阻塞仅T011工程环境与测试迁移，但不能把doctor通过等同于audit或产品发布通过。

## 2026-09-17 T013/T014 SQLite选择与验证边界

已核对[Expo SDK57 SQLite官方文档](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/)和已安装57.0.3的`src/SQLiteDatabase.ts`：异步事务可能与其他查询交错；独占辅助方法会另外创建连接，并在COMMIT之后执行close。为满足保存端口“失败可安全重试”，本实现固定使用仓储私有连接和互斥，手动BEGIN IMMEDIATE/COMMIT/ROLLBACK，成功提交后不执行可能失败的清理。`execAsync`只用于常量设置/DDL/事务语句，所有业务值参数化；不会共享同一连接给UI的SQLiteProvider。

迁移检查WAL和外键，对版本0应用事务化v1；版本1探测列，版本>1拒绝降级。数据库通过范围与实际整数类型约束辅助防御，完整UTC/顺序/嵌套组由领域规则在写入前重验，读取时同样核对。失败后关闭连接再重开；若关闭也失败，隔离该实例至重启，不向用户泄露SQL、路径或堆栈。

无需新SQLite测试依赖：Node24内置引擎在临时文件执行同一生产SQL。用真实触发器制造第二组失败、延迟外键制造提交失败、第二连接持有写锁，并检查另一连接看不见未提交数据。关闭重开测试的是桌面文件；Expo工厂测试只替换原生open边界。因此T018/T023原生桥、强制终止/重启与飞行模式仍未验收，不能用105项自动测试代替。

开发中明确修正两项边界差异：Jest VM与Node原生返回数组的prototype不同，夹具通过Array.from复制，未放宽业务断言；Expo的getAllAsync是“无参数/参数数组”两个重载，连接端口改成相同重载而非显式undefined，真实Expo类型检查通过。首次lint因遥测试图写用户全局`.expo`被沙箱阻止，设置`EXPO_NO_TELEMETRY=1`后通过，未扩大文件权限。
