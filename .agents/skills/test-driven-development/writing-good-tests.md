# Writing Good Tests

Load this reference when writing or changing tests, adding mocks, or adding test cleanup/helpers.

## Two governing principles

```
1. Every test names the break it catches.
2. Every test exercises the real thing.
```

## Name the break

Before writing the test body, state which production change would make the test fail and why that change would be a bug.

- Derive expected values independently with literals or hand-checked fixtures.
- Do not calculate the expected value using the same helper or algorithm under test.
- Test observable behavior, not private structure, constants, or exact source text.
- Test your contract at a framework boundary, not behavior owned by the framework itself.
- Trivial forwarding code needs a test only when it validates, normalizes, defaults, derives, enforces, or causes a side effect.

## Exercise the real thing

- Assert real component behavior, not the existence or call count of a mock unless that call is itself the public contract.
- Learn a real dependency's side effects before replacing it.
- Mock only the slowest or external boundary and keep dependent behavior real.
- Make doubles specific enough that the wrong branch cannot satisfy the test.
- Mock complete realistic data structures rather than convenient partial shapes.
- Keep test-only cleanup and helpers out of production classes.
- Prefer a small integration test when mock setup becomes more complex than the behavior.

## Mutation check

Before finishing, mentally introduce realistic bugs. At least one test should fail for each relevant mutation:

- Wrong constant or argument
- Wrong branch
- Missing state change or side effect
- Empty/default return
- Missing validation for zero, empty, unauthorized, or malformed input

If no test would fail, the behavior is unprotected or the test is tautological.

## Warning signs

- Setup and assertion use the same computed object
- Expected values are hidden in loops, builders, or production helpers
- A test greps source text rather than running behavior
- Assertions target a `*-mock` element
- A production method exists only for tests
- Mock setup is most of the test
- A test exists only for coverage and checks no outcome
