# Tasks: 本地数据说明与最小 JSON 导出

**Date**: 2026-10-02 | **Status**: DRAFT — 全部实施项未开始

**Input**: 本目录 spec/plan/data-model/contracts/quickstart；界面、数据流和平台未决条件未获批准。

本任务表为候选工作，不因文档完整而执行或勾选，不修改 001 状态。只读研究可继续；代码实施先经过批准。每个代码任务单一写入者，行为按 RED→GREEN→验证→独立审查推进。

## Phase 1: Scope, Research and Approval

- [ ] T001 在 spec Q1/Q2 与 checklist 记录真实入口/数据流答复，完成文字→低保真→可点击多轮；A/B 首问已发但尚未答复，等待不是批准。
- [ ] T002 核实官方文件/分享接口、所需依赖、系统备份及安全清理条件，将证据和未决项记录在 plan；修订数据模型/契约。已有 Android 文档/源码线索不等于设备验收，24 小时不能当平台安全保证；额外用户同意机制另行研究，不预设法律结论。
- [ ] T003 在 spec/plan 记录批准范围、JSON 候选格式、首验平台、依赖决定和最终清理规则；明确 001 T030 真实数据条件不变，未决安全点不能跳过。

## Phase 2: Foundational Contract

- [ ] T004 定义 apps/mobile/src/features/data-control/data/export-file-port.ts 及快照/任务类型，区分请求有效性、任务锁、文件归属及系统交接状态；不引入选择表、迁移、训练门禁或网络端口。

## Phase 3: US1 可随时查看说明

- [ ] T005 [US1] 在 apps/mobile/__tests__/data-control/data-notice-screen.test.tsx 先测获批入口、空历史可达、中英及返回保持输入/日历，再实现 src/features/data-control/ui/data-control-screen.tsx 说明部分和获批路由；关闭说明不产生接受状态，FR-001/FR-003/FR-004/FR-017。

## Phase 4: US2 一致快照与编码

- [ ] T006 [US2] 在 apps/mobile/__tests__/data-control/export-document.test.ts 先测 UTF-8 JSON 往返、白名单、UTC、排序、单位/null 及无效值拒绝，再实现 src/features/data-control/domain/export-document.ts，FR-005–FR-007。
- [ ] T007 [US2] 在 apps/mobile/__tests__/data-control/export-snapshot.test.ts 先测空历史、损坏拒绝、同日排序、与保存/删除互斥和单一快照，再扩展 src/features/workouts/data/workout-repository.ts、sqlite-workout-repository.ts 的只读快照端口，不改训练表，FR-008/FR-009。
- [ ] T008 [US2/US3] 在 apps/mobile/__tests__/data-control/export-service.test.ts 先测未发起无副作用、单任务、仓储锁提前释放、交接前离页/后台取消、旧响应隔离和任务收尾解锁，再实现 src/features/data-control/application/export-service.ts；无第二次分享确认，FR-005/FR-010–FR-012。

## Phase 5: US3 文件、系统交接与恢复

- [ ] T009 [US3] 在 apps/mobile/__tests__/data-control/export-files.test.ts 先测归属登记先于写入、登记失败不建文件、partial/完整提交、受控路径及各中断点，再按 T002 实现 src/features/data-control/data/native-export-files.ts 文件部分，FR-010/FR-014/FR-016。
- [ ] T010 [US3] 在 apps/mobile/__tests__/data-control/export-sharing.test.ts 先测单次显式发起后直接系统选择、不可用、结果未知、重复/迟到回调、交接标记写失败不分享，再实现 native-export-files.ts 分享适配和 export-service.ts 收尾。Android Promise<void> 不模拟为已取消/已保存证据，FR-010–FR-013。
- [ ] T011 [US3] 在 apps/mobile/__tests__/data-control/export-cleanup.test.ts 先测清单/目录对账、缺失/partial/孤儿完整文件、未知交接保护、活动文件保护、清理失败重试及异常时钟，再实现受控恢复/清理；只采用 T003 批准的安全规则，FR-014–FR-016。
- [ ] T012 [US3] 在 apps/mobile/__tests__/data-control/export-screen.test.tsx 先测范围说明、0场、单次发起、生成进度、离页、失败/结果未知及返回不丢输入/月份，再整合获批 data-control-screen.tsx，FR-004/FR-009–FR-013/FR-017。

## Phase 6: Integrity, Device Evidence and Review

- [ ] T013 用 apps/mobile/__tests__/data-control/export-integrity.test.ts 的真实桌面 SQLite 建立 1000 场/4000 动作/20000 组夹具，核全部字段及20次保存/删除交错，记录分段耗时/大小与桌面边界于 verification.md，SC-002/SC-003；不是手机性能通过。
- [ ] T014 运行完整 Jest、typecheck、lint 和实际需要的构建检查，记录当前151项/19套原基线与新增回归的真实结果，不预填通过。
- [ ] T015 执行 quickstart Q-001–Q-007，记录实际设备文件/分享返回/中断恢复/清理/备份配置及320/键盘/读屏证据，SC-001/SC-004/SC-006；没有原生证据保持待办。
- [ ] T016 用5名目标用户的合成数据操作执行 Q-008，验证找入口和解释文件去向，记录匿名结果及学习验收，SC-005；招募仍由产品负责人管理。
- [ ] T017 按 requesting-code-review 审查本功能和001回归，记录问题处置与阶段反思，按批准范围建立本地Git检查点，不覆盖已有改动。
- [ ] T018 汇总数据流/同意审查、原生、用户及学习证据，更新本目录验收记录，复核001 T030依赖。任务完成不自动等于真实数据可使用或001里程碑完成，按实际证据由负责人接受。

## Dependencies and Incremental Strategy

T001 与只读 T002 可以并行；两者未决事项经 T003 批准后，才能开启 T004 及实现。T005 说明页、T006/T007 纯编码与快照可按单一写入者分批推进；T008编排→T009文件→T010交接→T011恢复→T012界面整合，每步有新鲜验证。T013–T018汇总真实证据，不用替身冒充平台完成。

原草案的版本化选择规则、选择存储/迁移、记录许可服务及撤回清稿任务已删除。本目录共18项，均未勾选；现阶段仅修订文档和必要研究。

## Coverage

| 需求/结果 | 任务 |
| --- | --- |
| FR-001 | T005、T015 |
| FR-002 | T001–T003、T018 |
| FR-003/FR-004 | T004、T005、T012、T014 |
| FR-005–FR-007 | T006、T008、T012、T013 |
| FR-008/FR-009 | T007、T012、T013 |
| FR-010–FR-013 | T008–T010、T012、T015 |
| FR-014–FR-016 | T002、T003、T009–T011、T015 |
| FR-017 | T005、T012、T015 |
| SC-001 | T005、T012、T014、T015 |
| SC-002/SC-003 | T006、T007、T013 |
| SC-004 | T008–T012、T015 |
| SC-005 | T016 |
| SC-006 | T015 |

## 本步学习验收

目标 L2：从 FR-012 找到 T008/T010/T015，解释取消意图、系统返回和设备证据的区别；批准范围取舍目标 L3。汇报：“任务已缩为说明和导出18项，全部实施未开始，没有训练许可或清稿任务。”未掌握时重做需求→任务→证据映射，不以数量代替结果。
