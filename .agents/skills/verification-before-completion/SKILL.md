---
name: verification-before-completion
description: Use before claiming work is complete, fixed, or passing, and before committing or moving to the next task; requires fresh evidence from the relevant verification commands
---

# Verification Before Completion

## Core principle

Evidence before claims, always.

```
NO COMPLETION CLAIM WITHOUT FRESH VERIFICATION EVIDENCE
```

## Verification gate

Before any statement that implies completion or correctness:

1. **Identify:** Which command or observable behavior would prove the claim?
2. **Run:** Execute the complete, relevant verification now.
3. **Read:** Inspect the full output, exit status, failure count, and warnings.
4. **Compare:** Check the result against the specification and acceptance criteria.
5. **Report:** State the actual status and include the evidence. If verification failed or could not run, say so explicitly.

## Evidence required

| Claim | Required evidence | Not sufficient |
|---|---|---|
| Tests pass | Fresh test output with zero relevant failures | A previous run or “should pass” |
| Type/lint checks pass | Fresh complete check output | Checking only one file |
| Build succeeds | Fresh build with successful exit | Lint or unit tests alone |
| Bug is fixed | Original reproduction/regression test now passes | Code changed |
| Requirements met | Acceptance criteria checked one by one | Tests alone |
| Agent work completed | Diff inspected and independently verified | Agent reports success |
| Mobile UI works | Observed simulator/device flow and expected state | Static code inspection |

## Regression-test proof

For an important bug fix:

1. Run the regression test with the fix and observe it pass.
2. Temporarily demonstrate that the test fails without the fix when safe and practical.
3. Restore the fix and observe the test pass again.

## Red flags

Stop and verify when you are about to say:

- “Should work”
- “Probably fixed”
- “Looks correct”
- “Done” without current output
- “The agent said it passed”

Also stop before committing, merging, starting the next task, or delegating further work without reviewing evidence.

## Reporting format

```
Verification performed:
- command or observed flow
- result / exit status
- acceptance criteria checked

Remaining limitations:
- anything not run or not proven
```

Confidence is not evidence. Partial verification proves only the part that was run.
