---
name: systematic-debugging
description: Use when encountering any bug, test failure, build failure, performance problem, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

## Core principle

Always find the root cause before attempting a fix. A symptom patch is not a completed diagnosis.

```
NO FIX WITHOUT ROOT-CAUSE INVESTIGATION FIRST
```

Use this process for bugs, failed tests, build failures, integrations, performance problems, and unexpected behavior. Do not skip it because the issue looks simple or urgent.

## Phase 1: Root-cause investigation

Before editing implementation code:

1. Read the complete error and stack trace; record paths, line numbers, error codes, and warnings.
2. Reproduce the problem consistently and write the exact reproduction steps.
3. Inspect recent relevant changes, dependencies, configuration, and environment differences.
4. For multi-component flows, gather evidence at every boundary: inputs, outputs, state, and configuration propagation.
5. Trace invalid data or state backward through callers until the original trigger is identified. Read [root-cause-tracing.md](root-cause-tracing.md) when the failure appears deep in the call chain.

If reproduction is inconsistent, gather more evidence. Do not guess.

## Phase 2: Pattern analysis

1. Find the closest working example in the same repository.
2. Read the reference implementation completely.
3. List every difference between working and broken behavior, even apparently small ones.
4. Identify dependencies, configuration, state, lifecycle, and platform assumptions.

## Phase 3: Hypothesis and minimal test

1. State one hypothesis: `I think X is the root cause because Y evidence shows Z.`
2. Make the smallest possible diagnostic change or experiment.
3. Change one variable at a time.
4. If disproved, remove the experiment and form a new hypothesis.
5. If something is not understood, say so and research it; do not pretend certainty.

## Phase 4: Implement and verify

1. Create the smallest failing regression test or automated reproduction.
2. Use the `test-driven-development` skill.
3. Implement one fix at the source of the problem.
4. Avoid unrelated refactoring and “while I am here” changes.
5. Run the reproduction, focused tests, and relevant regression suite.
6. Use `verification-before-completion` before claiming success.

## Three-attempt rule

After three failed fix attempts, stop. Do not attempt a fourth patch without discussing whether the architecture or underlying assumption is wrong.

Warning signs include:

- Each fix exposes a different shared-state problem
- The proposed fix requires broad, unrelated refactoring
- Fixing one symptom produces another elsewhere

## Red flags

Return to Phase 1 if the reasoning sounds like:

- “Quick fix now, investigate later”
- “Just change this and see”
- “It is probably X” without evidence
- Multiple fixes bundled into one run
- Skipping regression tests
- Adapting a reference without reading it fully
- Proposing solutions before tracing the data flow
- Trying one more patch after multiple failed attempts

## Quick reference

| Phase | Work | Exit condition |
|---|---|---|
| Root cause | Reproduce, read errors, inspect changes, trace evidence | Understand what fails and why |
| Pattern | Compare working and broken examples | Relevant differences identified |
| Hypothesis | State and minimally test one theory | Hypothesis confirmed or rejected |
| Implementation | Regression test, one root fix, verification | Symptom resolved and tests pass |

## Supporting references

- [root-cause-tracing.md](root-cause-tracing.md)
- [defense-in-depth.md](defense-in-depth.md)
- [condition-based-waiting.md](condition-based-waiting.md)
