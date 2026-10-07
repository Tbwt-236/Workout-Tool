<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - IV. Learning Is a Deliverable (expanded to every completed task and added
    measurable mastery evidence)
- Added sections:
  - Learning Deliverables and Mastery Gates
- Removed sections: none
- Follow-up TODOs: none
-->

# FitQuest Constitution

## Core Principles

### I. Evidence Before Scope

Every product capability MUST trace to a documented user problem, an explicit
hypothesis, and a measurable outcome. New scope MUST NOT be added only because
an agent can generate it or a competitor has it. High-risk assumptions MUST be
tested with the least expensive credible method before significant engineering
investment. Retention and completed real workouts take priority over downloads,
screen time, or other vanity metrics.

Rationale: FitQuest must become a sustainable product, not a large collection
of unvalidated features.

### II. Specification-First Vertical Slices

Feature requirements and acceptance criteria MUST be created through GitHub
Spec Kit before implementation. Each delivery unit MUST be a small vertical
slice that produces one observable user outcome and can be verified on its own.
Plans and tasks MUST preserve the approved MVP boundary and identify deferred
work explicitly. The recovered Streamlit application under `legacy/streamlit/`
MUST remain unchanged unless a separate maintenance specification authorizes a
bounded legacy change.

Rationale: small end-to-end increments reduce rework and keep product decisions
separate from implementation convenience.

### III. Test-First and Fresh Verification (NON-NEGOTIABLE)

Features, fixes, behavior changes, and refactors MUST follow the project
`test-driven-development` skill: define behavior, observe the relevant test
fail, implement the minimum change, then refactor while tests remain green.
Unexpected behavior MUST be diagnosed with `systematic-debugging` before a fix
is proposed. No completion claim is valid without fresh evidence from the
relevant tests, type checks, build, and—when UI behavior is involved—an observed
device or simulator flow. Meaningful changes MUST receive a specification-aware
review using `requesting-code-review` before merge.

Rationale: agent statements are not evidence; repeatable checks and observed
behavior are the quality contract.

### IV. Learning Is a Deliverable

Every completed task—including discovery, specification, planning,
implementation, debugging, documentation, measurement, and release work—MUST
include a Chinese learning handoff. The handoff MUST state what the product
owner needs to learn, the required mastery level for each concept, an observable
exercise that proves mastery, the important files or data flow, how to verify
the artifact, and what remains intentionally deferred. A task MUST NOT be
reported as fully complete when its artifact is finished but its learning
handoff is missing; artifact status and learning status MUST be reported
separately when necessary.

Technical and product choices MUST be explained at the product owner's current
level and recorded when they materially affect cost, privacy, architecture, or
scope. The product owner MUST perform acceptance on the real app at milestone
boundaries and MUST be able to explain the product rationale and main data flow
without delegating judgment to the agent.

Rationale: the project is both a commercial product and a practical AI product
management apprenticeship.

### V. Privacy, Safety, and Honest Guidance (NON-NEGOTIABLE)

FitQuest MUST collect only data necessary for an approved user outcome, state
the purpose clearly, and provide deletion and export paths. Health, fitness,
location, identity, and payment data MUST receive explicit data-flow and consent
review before collection or sharing. Health data MUST NOT be used for advertising
profiles. AI output MUST be explainable from authorized inputs, include safe
failure behavior, and MUST NOT present itself as medical diagnosis or guaranteed
fitness advice. Secrets and privileged AI or payment operations MUST NOT reside
in distributable client code.

Rationale: trust and regulatory readiness are product requirements for a
fitness application targeting China mainland.

## Product and Technical Constraints

- The target client is an Expo + React Native + TypeScript app under
  `apps/mobile/`; exact versions MUST be revalidated and pinned when scaffolding.
- Product discovery documents are inputs, while approved Spec Kit feature
  specifications and acceptance criteria are the implementation source of truth.
- The architecture MUST begin local-first for the workout loop. Cloud accounts,
  synchronization, subscriptions, native health integration, and AI services are
  introduced only by specifications with validated need and explicit data flows.
- Core workout logging MUST remain useful without a paid subscription. Paid
  capabilities MUST deliver continuing value and have a documented cost and
  entitlement model.
- Public social features, diet tracking, camera posture analysis, health-platform
  synchronization, and free-form AI plans remain out of MVP unless the product
  decision record is amended with evidence.
- China-mainland public distribution MUST NOT begin until release ownership,
  APP/ICP filing, sensitive-personal-information, privacy, and payment obligations
  have been checked for the actual deployment architecture.
- Production dependencies MUST NOT be added without explaining their purpose,
  alternatives, maintenance risk, privacy impact, and effect on the specification
  or decision record.

## Learning Deliverables and Mastery Gates

Mastery is evaluated with the following observable scale:

- **L0 — 未接触**: cannot yet identify or describe the concept. This level is not
  an acceptable target for completed project work.
- **L1 — 能复述**: can explain the concept, its purpose, and one FitQuest example
  in their own words with prompts.
- **L2 — 能照做**: can complete the relevant operation with a checklist, locate
  the important artifact, and interpret a normal verification result.
- **L3 — 能独立应用**: can complete or accept the task without step-by-step
  prompting, explain the main trade-off and data flow, and diagnose a common
  failure using project evidence.
- **L4 — 能教学与决策**: can teach the concept, compare viable alternatives,
  defend the selected trade-off with evidence, and define when to revisit it.

Every task completion report MUST include a `本步学习验收` section with:

1. **必须学会**: the smallest set of concepts required to understand the task.
2. **目标等级**: an L1–L4 target for each concept, with no vague labels such as
   “了解即可” unless mapped to the scale.
3. **掌握证据**: one short oral explanation, written answer, product operation,
   or verification exercise the product owner can perform.
4. **汇报口径**: a concise explanation the product owner can reuse in a project
   presentation, without claiming work or evidence that does not exist.
5. **未掌握时的处理**: the specific review material or repeat exercise required
   before the learning status can be marked complete.

The following minimum targets apply:

- Product problem, target user, scope, non-goals, success criteria, and major
  trade-offs MUST reach **L3** before the corresponding milestone is accepted.
- Feature data flow, state lifecycle, test strategy, privacy boundary, and
  verification commands MUST reach **L2** during each implementation slice and
  **L3** before the final project presentation.
- One-time setup details MAY target **L1** when the product owner will not operate
  them, but any operation the product owner must repeat MUST target at least
  **L2**.
- The Agent MUST ask for or provide a concrete mastery check at milestone
  boundaries; code completion alone MUST NOT be treated as learning completion.

## Development Workflow and Quality Gates

1. Discovery records evidence and product decisions before feature definition.
2. `$speckit-specify` defines user stories, requirements, non-goals, and acceptance
   criteria without selecting implementation details.
3. `$speckit-clarify` is used when material ambiguity remains; `$speckit-plan`
   then defines architecture, data flows, privacy boundaries, and verification.
4. `$speckit-tasks` creates independently verifiable vertical tasks. The quality
   skills own testing, debugging, verification, and review and MUST NOT be
   replaced by a competing planning workflow.
5. Implementation starts only after the product owner approves the specification
   and acceptance criteria. One writing agent operates on a task at a time.
6. Each milestone requires a Git checkpoint, fresh automated checks, diff review,
   and product-owner acceptance on a device when UI behavior is involved.
7. Product events and success metrics MUST be defined before a release intended
   to validate behavior or monetization.

## Governance

This constitution governs all specifications, plans, tasks, reviews, and release
decisions in the FitQuest repository. When another document conflicts with this
constitution, the constitution takes precedence; applicable law and platform
policy take precedence over all project documents.

Amendments require a written rationale, impact analysis, product-owner approval,
and an update to the Sync Impact Report. Versioning follows semantic versioning:
MAJOR for incompatible principle removal or redefinition, MINOR for a new
principle or materially expanded governance, and PATCH for non-semantic
clarification. Every feature review MUST check constitutional compliance, and
any exception MUST be recorded with scope, owner, expiry condition, and recovery
plan.

**Version**: 1.1.0 | **Ratified**: 2026-08-02 | **Last Amended**: 2026-08-03
