# Root-Cause Tracing

Use this when a failure appears deep in a stack or invalid state reaches a distant consumer.

## Process

1. Record the visible symptom and the code that directly produces it.
2. Identify the caller and the exact value/state passed into the failing function.
3. Repeat one level upward: who supplied that value and under what assumptions?
4. Continue until you find the earliest point where correct state became invalid.
5. Fix the source, then add appropriate validation at meaningful boundaries.

When manual tracing is insufficient, add temporary diagnostic output before the dangerous operation. Capture:

- Inputs and normalized values
- Current lifecycle/state
- Environment or platform information
- Timestamp where relevant
- Stack trace/call chain

Remove noisy instrumentation after the cause is understood, or convert useful signals into focused production diagnostics.

Never stop at “where it crashed” when you can trace back to “where the invalid state originated.”
