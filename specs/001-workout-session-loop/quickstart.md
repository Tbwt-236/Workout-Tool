# Quickstart and Validation Guide: 训练记录最小闭环

**2026-10-07 更新**：B界面已获用户确认保持。当前本地候选为`f3b396b26936`；153/19及指定320dp/130%字号输入、保存和离线重启检查见[最新验证](verification.md)。以下10月2日的4f6证据与安装步骤保留原时点；不是当前主题源码对应的构建。

**Status**: 2026-10-02 — 已批准的训练/纠错、保存摘要、日历历史与确认删除已接SQLite。153项/19套自动回归、类型/lint、双平台JS/Hermes导出及最新4f6c66316bf5本地Android构建/签名/ZIP对齐通过。依赖未变，Doctor21/21沿用本日同版本证据，audit仍15项（11 moderate/4 high）。4f6包已独立核验保存期间历史显示Loading且无假错误、提交后留在历史、离线重启可读；仅新增两笔合成训练，原1002笔逐行不变。 T032工程文档已完成，本人学习仍待演示；T029/T030/T031/T033保持待。小屏日历A/B、002数据入口A/B与隐私审查、真实TalkBack、实体设备/iOS及5位用户条件未通过，仅合成数据，无账号、付费或发布。 任务见[tasks](tasks.md)，新旧原生结果分属各自构建；不要重新运行脚手架覆盖源码。

产物边界：最新4f6候选SHA256为`4f6c66316bf50bce3ff73e783d975178c46275f1eb3f528f8a8664cdeadd8c17`，release变体/debug签名/临时包`dev.fitquest.local`/ARM64。旧00aba包的1000场历史UI功能/滚动/返回选日已独立核验；首窗口P95 298ms不等于完整UI就绪，慢帧保留，不能宣称1秒完整交互或真机流畅。044ab迟到导航专项、00aba的Q001/Q005/Q009/320dp/16KB及更早场景各保留原包归属，未在4f6全量重跑；16KB兼容模式禁用未证。 2026-10-02时点的28项源码与4f6构建输入一致；该manifest不对应当前B主题源码。APK保留INTERNET、本包signature receiver及allowBackup=true。产物、安装方法与学习练习见[移动端README](../../apps/mobile/README.md)，证据见[verification](verification.md)阶段八。

## 0. 本轮可运行的验证

在apps/mobile使用Node24/npm11，首次安装运行`npm ci`，随后运行：

```bash
npm run test:ci
npm run typecheck
npm run lint
npx expo-doctor
```

本机局部Node/npm路径及受限缓存命令见[移动端README](../../apps/mobile/README.md)。测试全为合成；数据测试覆盖迁移、仓储与Expo打开边界，SQL在真实桌面临时文件执行。屏幕测试含真实ExpoRoot→Provider→SQLite→保存/历史/删除及字段错误联调。可运行`npm run test:ci -- __tests__/data`或`-- __tests__/screens`；这不替代原生桥、飞行模式和App重启证据。`npm run benchmark:history`测临时桌面1000场，不接触App数据库。

依赖审计存在三个上游根问题包，当前15项传播告警；见[依赖审查](../../docs/product/DEPENDENCY_REVIEW_2026-10-02.md)。+native-intent限制当前原生链接，不代表上游修复。原生数据层已有1000场基准；旧00aba另完成1000场日历/详情/滚动/返回选日观察，但首窗口P95 298ms不证明完整UI就绪，慢帧/软件渲染边界保持。以下Q场景保留为完整复验步骤；已有结果与仍待项目以verification为准。

**Feature**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)

## 1. Prerequisites

- Node.js 24.x (project baseline; used 24.19.0).
- npm 11.x (used 11.9.0; the current scaffolder was incompatible with npm 12 pack JSON output).
- A phone capable of running the chosen Expo preview/development build, or an Android/iOS simulator.
- Full Xcode before claiming iOS simulator or iOS build verification.
- No account, server, API key or internet connection is required for the product flow itself.

Environment finding on 2026-08-04:

- Ordinary shell: `node` not currently available.
- Codex bundled Node: v24.14.0.
- Full Xcode: not installed; only Command Line Tools are active.

These are setup tasks, not completed prerequisites.

## 2. Expo宿主配置（T011）

已在隔离目录生成并审查SDK57官方模板，仅合并运行配置与必要依赖。10月2日当前Expo57.0.26 / RN0.86.3 / React19.2.3 / TS6.0.3；Router57.0.24、SQLite57.0.3、system-ui57.0.4、Jest29.7.0、jest-expo57.0.5、RNTL14.0.1。实际依赖以package-lock.json为准。

初始历史→开始→行内录组→完成确认→摘要→日历→详情删除/取消；删除成功返回原月份/日期并更新标记。手机试用前准备兼容SDK57的Expo Go或development build，仅用合成数据。页面与SQL联调已覆盖取消、回滚、重试和跨月位置，下一步按以下Q场景收集设备证据。

## 3. Automated Verification

The implementation tasks must expose non-interactive scripts equivalent to:

```bash
cd apps/mobile
npm run test:ci
npm run typecheck
npm run lint
npx expo-doctor
```

Expected result:

- All tests pass with zero failures.
- TypeScript reports zero errors.
- Expo lint reports zero errors.
- Expo Doctor reports no incompatible package or configuration issues.

Passing these commands does not prove the native SQLite lifecycle; the device scenarios below remain mandatory.

## 4. Start the App（T016路由实现后）

```bash
cd apps/mobile
npx expo start
```

Open the compatible Expo preview or development build on a device. Before the offline scenario, load the app once, then enable flight mode.

## 5. Device Acceptance Scenarios

### Q-001 Primary offline loop

1. Start with no history.
2. Verify the empty state offers “开始训练”.
3. Start a workout.
4. Add action “深蹲”.
5. Add `8` reps at `62.5 kg`.
6. Confirm completion.
7. Open the saved history detail.

Expected: summary and detail show one action, one set, 8 reps and 62.5 kg; no account or network is requested.

US1 的 T018 先验收到已持久化完成摘要（步骤6后检查摘要），其读取聚合能力在 T014 实现。步骤7以及从摘要进入历史的完整路径必须等 US2 的 T022 完成后在 T023 补验；不得提前声称 Q-001 全部通过。

### Q-002 Persistence across restart

1. Complete Q-001.
2. Fully close the app.
3. Reopen it while still offline.
4. Open history and the saved detail.

Expected: the record remains and every value matches the original input.

### Q-003 Validation boundaries

Try each invalid value separately:

- blank/whitespace action name;
- reps `0`, `1.5`, `1000`;
- weight `0`, `-1`, `62.55`, `1000.1`.

Expected: save is blocked and the corresponding message in the current interface language (test both Simplified Chinese and English) states how to correct the field. Valid boundary values `1` rep, `999` reps, `0.1 kg` and `1000.0 kg` are accepted.

### Q-004 Editing and cancellation

1. Add two sets to one action.
2. Rename the action and edit the first set.
3. Delete the second set.
4. Request cancellation and decline; verify all content remains.
5. Request cancellation again and confirm.

Expected: no history record is created after confirmed cancellation.

### Q-005 Empty completion and duplicate protection

1. Start an empty workout and request completion.
2. Verify completion is blocked.
3. Add one valid set and confirm completion once.
4. Rapidly activate the completion control again while saving.

Expected: exactly one history record is created.

### Q-006 Delete confirmation

1. Create two completed workouts.
2. Request deletion of the newest and decline.
3. Verify both remain.
4. Confirm deletion of the newest.

Expected: only the selected workout disappears; the older workout and its detail remain unchanged.

### Q-007 Storage failure behavior

Use the implementation-provided test seam to make save or read fail.

Expected: no success screen appears; the user sees a retryable error in the current interface language (test both Simplified Chinese and English), and an unsaved active draft remains intact after a save failure.

### Q-008 Keyboard, small screen and accessibility

1. Use a device or simulator with a 320 logical-pixel-wide viewport.
2. Open the active workout, add enough rows to require scrolling, and focus the reps and weight inputs.
3. Verify the focused input, validation message, complete action and cancel action can still be reached while the keyboard is visible.
4. Inspect or use VoiceOver/TalkBack labels for inputs, add/edit/delete controls and destructive confirmations.
5. Verify primary touch targets meet the platform minimum of 44 pt on iOS or 48 dp on Android.

Expected: no critical control is hidden or unreachable, labels identify purpose rather than only icons, and reading order follows the visible workout order.

### Q-009 Calendar history（2026-10-02 Android合成模拟器通过）

1. 用跨月、同日两场和UTC跨午夜的合成夹具准备已完成记录。
2. 检查设备本地日期对应的月历标记，切换月份/年份，覆盖二月与闰年。
3. 选择有一场、同日多场和无训练的日期；从当天记录进入详情再返回。
4. 取消删除时检查日标记不变；确认删除一场后检查当天剩余场次与标记；删除当天最后一场后该日标记消失。
5. 切换中/EN，检查选日、月份、原始名称与训练内容保留；另在训练尚有输入时浏览历史并返回，检查草稿未被日历操作重置。

Expected: 所有日期分组来自已保存完成时间，不改写UTC时间；同日记录倒序且均可查看。空日期不冒充“休息日”，日历选择不变成补录训练。返回保留浏览位置，开始/继续针对当前训练。按用户已认可的讨论稿验收：单场日期直达详情，多场先选当天记录。

2026-10-02已在旧00aba5737eab冻结APK上验证时区跨日、闰年/跨年、同日倒序、空日期、返回选日以及删除后2→1→0的标记；脚本断言、五张关键截图及原20场恢复均经独立审查。当前训练未录输入保持的证据引用Q006。320dp月历仍有横向溢出，已提出方案等待用户确认；实际读屏与完整触摸目标仍归T029，Q009功能通过不代替这些体验验收。

## 6. Success-Criteria Recording

For the first usability check, record only anonymous results:

| Participant | Reached active state <=10s | Completed loop without help | Total test time | Blocking issue |
| --- | --- | --- | --- | --- |
| U01 |  |  |  |  |
| U02 |  |  |  |  |
| U03 |  |  |  |  |
| U04 |  |  |  |  |
| U05 |  |  |  |  |

Do not mark SC-001–SC-007 achieved until the relevant automated or device evidence has actually been collected.

## 7. Intentionally Deferred

- Recovery of an unfinished workout after forced termination.
- Workout templates, action library, rest timer, trends and personal records.
- XP, levels, streaks, quests and badges.
- Account, sync, export, AI, subscriptions and store-release configuration.

## 本步学习验收

目标L2：区别自动测试、资源导出、安装包、原生操作和真实用户验收；理解完成事务才产生持久历史。练习：按Q001在专用设备用合成动作8次/62.5kg完成断网保存、强关重开与详情核对，再演示次数0不能录入，指出Q008和隐私/用户验证仍缺什么。安装路径见移动端README；不在个人数据设备运行故障注入或替库脚本。

汇报口径：“Android合成模拟器的训练保存、纠错、历史删除及日历边界已有证据；153项自动回归通过，4f6保存等待/留历史/重开已有原生观察；实际读屏、真机/iOS与用户条件尚未通过。”若无法解释先后关系，重读当前数据流和Q005的保存中/提交后断言，重做上述操作。T032运行文档已更新并独立复核，学习掌握待本人演示；任务完成以tasks为准。
