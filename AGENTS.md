# FitQuest agent instructions

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
