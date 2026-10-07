---
name: requesting-code-review
description: Use after completing a meaningful task or feature and before merging, to review the change against its specification, acceptance criteria, tests, and project architecture
---

# Requesting Code Review

## Core principle

Review early and review against the specification, not against the implementer's intent.

## Mandatory review points

- After a meaningful Spec Kit task or vertical slice
- After a major feature
- After a complex bug fix
- Before merging into the primary branch
- Before a release build

## Prepare the review package

Provide the reviewer only the context needed to evaluate the work:

- What was implemented
- Specification and acceptance-criteria paths
- Base and head revisions, or the exact working-tree diff
- Verification commands and current results
- Known limitations or intentional deviations

Use [code-reviewer.md](code-reviewer.md) as the review template.

## Act on findings

- Fix **Critical** issues immediately.
- Fix **Important** issues before proceeding unless the human partner explicitly accepts the risk.
- Record **Minor** issues for follow-up when they do not block the current specification.
- If feedback is incorrect, respond with technical reasoning and evidence rather than dismissing it.
- Re-run verification after review-driven changes.

## Red flags

- Skipping review because the change is small
- Reviewing without reading the referenced specification
- Accepting “looks good” without file/line evidence
- Ignoring Critical or Important findings
- Treating style preferences as blockers while missing behavioral defects
- Trusting the implementation agent as its own final reviewer

## Completion condition

The review is complete only when:

- Findings are categorized by actual severity
- Every blocking finding has a disposition
- Required fixes are verified
- The reviewer gives a clear merge/readiness verdict
