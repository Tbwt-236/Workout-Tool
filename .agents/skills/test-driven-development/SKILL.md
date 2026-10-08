---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your human partner):**
- Throwaway prototypes
- Generated code
- Configuration files

Thinking "skip TDD just this once"? Stop. That's rationalization.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

Implement fresh from tests. Period.

## Red-Green-Refactor

### RED - Write Failing Test

Write one minimal test showing what should happen.

<Good>
```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```
Clear name, tests real behavior, one thing
</Good>

<Bad>
```typescript
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```
Vague name, tests mock not code
</Bad>

**Requirements:**
- One behavior
- Clear name
- Real code (no mocks unless unavoidable)

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

Run the narrowest relevant test command. Confirm:
- Test fails (not errors)
- Failure message is expected
- Fails because feature is missing (not because of a typo)

**Test passes?** You're testing existing behavior. Fix the test.

**Test errors?** Fix the error, then re-run until it fails correctly.

### GREEN - Minimal Code

Write the simplest code that passes the test.

Don't add features, refactor unrelated code, or improve beyond the test.

### Verify GREEN - Watch It Pass

**MANDATORY.** Confirm:
- The focused test passes
- Other tests still pass
- Output is clean (no errors or warnings)

**Test fails?** Fix code, not the test.

**Other tests fail?** Fix them now.

### REFACTOR - Clean Up

Only after green:
- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.

### Repeat

Write the next failing test for the next behavior.

## Good Tests

| Quality | Good | Bad |
|---------|------|-----|
| Minimal | One behavior | Multiple behaviors joined by "and" |
| Clear | Name describes behavior | `test('test1')` |
| Shows intent | Demonstrates desired API | Obscures what code should do |

When writing or changing tests, read [writing-good-tests.md](writing-good-tests.md).

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. |
| "I'll test after" | A test that passes immediately does not prove it can catch the bug. |
| "I already tested manually" | Manual checks are not repeatable regression protection. |
| "Deleting work is wasteful" | Keeping unverified implementation is a larger long-term cost. |
| "Need to explore first" | Explore if needed, discard the spike, then restart with TDD. |
| "Test setup is hard" | Hard-to-test code is often hard-to-use code; simplify the design. |

## Red Flags - STOP and Start Over

- Production code before test
- Test written after implementation
- Test passes immediately
- Cannot explain why the test failed
- Tests deferred until later
- Reliance on manual testing alone
- Keeping earlier code as a reference while claiming test-first work

## Verification Checklist

Before marking implementation complete:

- [ ] Each new behavior has a test
- [ ] Each new test was observed failing first
- [ ] Each failure occurred for the expected reason
- [ ] Only minimal code was added to pass
- [ ] Focused tests pass
- [ ] Full relevant suite passes
- [ ] Output contains no unexpected errors or warnings
- [ ] Tests exercise real behavior; mocks are used only when unavoidable
- [ ] Important edge and error cases are covered

If these boxes cannot be checked, do not claim TDD was followed.

## Debugging Integration

For a bug, first write a failing regression test that reproduces it. The test proves the fix and prevents recurrence.

## Final Rule

```
Production code -> test existed and failed first
Otherwise       -> not TDD
```

No exception without explicit approval from the human partner.
