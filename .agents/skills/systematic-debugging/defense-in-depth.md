# Defense-in-Depth Validation

After identifying the root cause of invalid data, make recurrence structurally difficult.

Consider four layers:

1. **Entry validation:** reject obviously invalid user/API input.
2. **Domain validation:** enforce business rules where the operation is performed.
3. **Environment guards:** prevent dangerous operations in tests, development, or unsupported platform states.
4. **Focused diagnostics:** preserve enough context to investigate unexpected bypasses.

Do not add redundant checks blindly. Map the actual data flow, place each check where it protects a distinct boundary, and test that the important layers catch realistic bypasses.
