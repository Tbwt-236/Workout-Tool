# Condition-Based Waiting

Flaky tests often wait for guessed durations. Prefer the actual condition:

```typescript
await waitFor(() => getResult() !== undefined);
expect(getResult()).toBeDefined();
```

Use condition-based waiting for state changes, async completion, visible UI, events, files, and item counts.

Every wait must:

- Re-read fresh state on each poll
- Use a bounded timeout
- Produce a useful timeout message
- Avoid excessive polling frequency

An arbitrary duration is acceptable only when timing behavior itself is under test, and the reason and interval must be documented.
