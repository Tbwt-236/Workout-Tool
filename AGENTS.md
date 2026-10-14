# FitQuest agent instructions

## 2026-10-14 continuation — current

Fixed one cancellation-order bug: after awaiting sharing availability, cancellation now wins over an unavailable result. A failing regression reproduced SharingUnavailable instead of Cancelled; fixed before proceeding. Seven meaningful cases added, 188/25 plus type/lint pass. No UI/dependency changes. Both JS/Hermes exports and an offline Android build pass; current test APK `1ee63b686078` (arm64/debug signature/dev.fitquest.local), 36 source/package/lock hashes match staging and service source-map matches. Native current-build write-failure→retry→local diagnostic reception→return observed. Prior `1f3` additionally exercised unlogged42.5/12 input and selected-date preservation in this turn; do not transfer those observations to the new APK. Both existing databases unchanged across baseline, old-build checks and upgrade/new-build checks. Diagnostic receiver and temporary cache obstruction removed; original keyboard setting restored at teardown.

PR3 was explicitly approved and merged into master `e190c7f`; this new fix requires its own sync/review record. No new default-branch merge authorization is inferred from PR3. iPhone Expo Go is installed per user, but Mac lacks full Xcode. Temporary LAN approval was previously rejected; a new explicit question is pending in this turn. Do not start LAN until answered. No physical/iOS, full fault matrix, TalkBack, backup, five-user/privacy acceptance or release claim. 00129/33 and 00214/18 remain.

## 2026-10-13 continuation — current evidence

User explicitly authorized ADB automation of the task-owned Android emulator after CUA could not identify its window. APK `1f3ed5f3ba3d` was installed without resetting synthetic data. Actual local diagnostic receiver read the 8,061-byte, 20-workout JSON; cancellation, return and repeat export were observed. 320dp/130% Chinese/English sheet, English detail scrolling/close, process termination during chooser then restart without automatic sharing, and scoped startup cache cleanup have evidence. Both existing databases are byte-identical before/after (20/20/20 and separate 1000/4000/20000). Diagnostic receiver removed; density420/font1.0 restored.

Fresh181/25, type/lint and 25-sample desktop export benchmark pass. Added `benchmark:export` only; 34 production source hashes and dependency lock still match the archived APK inputs. Package.json differs by the benchmark script, so do not claim its entire hash still matches. No new native build was needed for this measurement/docs-only continuation. Desktop 3,039,757-byte output and P95 78.838ms are not phone performance. Independent reviews found no blockers for this scope. Full device fault injection, iPhone, keyboard/draft combinations, TalkBack, backup/restore, five-user and privacy acceptance remain open: 00129/33, 00214/18. The dated10-12 lock-screen limitation below is historical. Preserve current visuals; see 002 verification for exact coverage and sync record.

## 2026-10-12 continuation

The owner confirmed the History top-right Data entry, then “第二版” (bottom sheet), then “可以的” to the explicit JSON/all-completed/empty-disabled/system-return-to-sheet flow. These choices authorize implementation and are settled; do not ask them again. Native/device acceptance remains separate. Preserve B visuals and existing workout/calendar behavior.

002 is now implemented: single SQLite snapshot, JSON whitelist, native Expo file/share adapter, scoped cache cleanup and bilingual sheet. Fresh 181 tests/25 suites, type/lint, iOS/Android JS/Hermes exports and Android build pass. Direct dependencies are FileSystem57.0.7 and Sharing57.0.22. The archived local APK is `1f3ed5f3ba3d` (arm64, debug signature, temporary dev.fitquest.local); 34/34 source files and package/lock match staging. The 24-hour opportunistic cache policy is an engineering choice disclosed in copy, not a platform receipt or user-quoted duration.

Independent code/artifact reviews found no blockers; one test gap is fixed. CUA reported Mac locked, so this new APK has NOT been installed/exercised this turn; do not transfer older native evidence. Physical/iOS, system receiver/cancel/retry, small-screen/reader, backup and five-user/privacy acceptance remain open. Known Android Sharing start-activity failure may retain native pendingPromise; retry/restart copy is not proof of a dependency fix. See specs/002-local-data-control/verification.md and tasks.md. 001 remains29/33 with T029/T030/T031/T033 open. No release, real-data gate bypass, new cloud/account or automation resumption.

The earlier same-day detail-read guard (commit/rollback after app-owned writes) remains, now extended to pending export snapshots. Closing a sheet does not release the read lock early; the cross-page regression is included in 181/25. Older counts below are historical.

## 2026-10-07 visual update

The user chose B (bright orange, deep ink navy, mist white). It is implemented in the real training/history UI, keeping established interactions. Current local candidate: `f3b396b26936`; fresh 153/19, type/lint, both JS/Hermes exports, Android build/signature/ZIP checks pass. Task-owned Mac Android emulator checks at 320dp/130% font cover specified inline validation/edit/save and offline saved reopen; original 1004 synthetic workouts remain intact, one synthetic workout added. See the dated section of `specs/001-workout-session-loop/verification.md` and `docs/design/FRONTEND_REVIEW.md`. The owner confirmed “保持现在最好 同步更新github”: retain the rendered B type size, palette and density, and sync this project to GitHub. Narrow-calendar choice, 002 choice, iOS/physical/reader/privacy/user gates remain pending. Historical native evidence below belongs to its original APK. No new dependencies, LAN exposure, release, or automation resumption occurred.

## Repository status

This repository is intentionally in a migration phase.

- The recovered original application is under `legacy/streamlit/`.
- The target product is a new Expo + React Native mobile app.
- The mobile app lives under `apps/mobile/`.
- GitHub Spec Kit is initialized under `.specify/` with the Codex skills
  integration. The first feature specification is approved under
  `specs/001-workout-session-loop/`, and its Phase 0/1 technical plan and design
  artifacts exist. As of 2026-10-02, `apps/mobile/` includes the domain/reducer,
  one shared provider, bilingual inline training and correction screens, saved
  summary, calendar history with confirmed deletion, actual Expo routes and SQLite save/list/detail/delete.
  There are 153 passing Jest tests across 19 suites, including real Router + desktop
  SQLite integration; TypeScript, lint and both JS/Hermes exports pass.
  The latest local Android arm64 APK is `4f6c66316bf5` (release variant, debug
  signature, temporary package `dev.fitquest.local`). Its independently reviewed targeted native observation
  verifies pending-save Loading without a false read error, staying in history after
  commit, and correct offline reopen. Original synthetic rows remain unchanged.
  History reads now wait for writes and serialize effect requests; actual storage
  failures remain retryable. WorkoutScreen guards navigation after unmount.
  The prior 044ab APK separately passed late-save navigation. Earlier Q001–Q007/Q009,
  20-cycle persistence, 320 dp keyboard and 16 KB evidence retain their original
  build/timepoint; do not transfer them to the latest APK. Disabling 16 KB
  compatibility mode was not verified. All-current-build native scenarios are not
  claimed complete.
  Old 00aba's 1000-workout UI calendar/detail/scroll/back path passed observation;
  first-window P95 298 ms is not full UI readiness. Recorded slow frames, SwiftShader
  and concurrent host work prevent real-device smoothness or one-second claims.
  Core frontend co-design is approved. Narrow-calendar and 002 data-entry choices,
  actual TalkBack, physical/iOS devices, privacy and five-user gates remain pending.
  T032 running/learning docs are complete; owner mastery still needs demonstration.
  Expo Doctor's same-day 21/21 result applies to unchanged dependencies; audit still
  reports 15 findings (11 moderate/4 high). T029/T030/T031/T033 remain open.
  No store-readiness, dependency-advisory fix or new UI approval is implied.
  The user corrected the 2026-10-02 mini-program wording: continue the App only.
  No developer accounts exist yet. Stage reviews and current progress are in
  docs/handoff/2026-10-02-app-lifecycle.md.

## Current user interaction requirement

The product owner requires multiple frontend confirmation rounds: visual
direction, page structure, then clickable interaction and visual details. Track
actual answers in `docs/design/FRONTEND_REVIEW.md`. No response is not approval.
Continue independent domain/testing work while waiting; do not generate template
product screens or expand features to fill an unapproved dashboard.

## Source of truth

Approved Spec Kit feature specifications and acceptance criteria are the source
of truth for implementation. Until the first feature specification is approved,
remain in discovery and planning unless the user explicitly requests a bounded
change.

The original Streamlit source is reference material, not the target mobile
architecture. Preserve it and avoid modifying it during mobile scaffolding.

## Required quality skills

Use the project skills under `.agents/skills/`:

- `test-driven-development` for features, fixes, behavior changes, and refactors.
- `systematic-debugging` before proposing a technical fix.
- `verification-before-completion` before any success or completion claim.
- `requesting-code-review` after meaningful work and before merge.

GitHub Spec Kit owns requirements and planning. These four skills own testing,
diagnosis, verification, and review; they must not create a competing planning
workflow.

## Learning-oriented delivery

For every completed task—including discovery, planning, implementation,
debugging, documentation, measurement, and release work—provide a Chinese
`本步学习验收` section that states:

1. What the product owner must learn.
2. The required L1–L4 mastery level for each concept, using the scale in the
   constitution.
3. A concrete explanation, operation, or verification exercise that proves
   mastery.
4. A concise, truthful project-presentation explanation.
5. What to review or repeat if the target has not been reached.

Report artifact completion and learning completion separately when needed. In
implementation tasks, also explain the problem, important files and data flow,
how to run and verify the result, and what remains intentionally deferred.

Prefer small vertical slices. Do not generate the entire app from a single
prompt. Do not add dependencies or broaden scope without explaining the reason
and updating the relevant specification or decision record.

## Safety

- Do not delete or overwrite the legacy source.
- Do not move large directory trees without first resolving exact source and
  destination paths.
- Preserve user changes and report verification evidence rather than relying on
  an agent's completion statement.
