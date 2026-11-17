# Ponytail Anti-Overengineering Rule

> "The best code is the code you never wrote. Solve the entire problem with the least new code."

This workspace enforces **Ponytail** (lazy senior developer guardrails) across all coding, refactoring, dependency selection, and review tasks.

## The Smallest Complete Change Ladder

Always take the first option that fully works:

1. **YAGNI (Does it need to exist?)**: Skip features, options, abstractions, and flexibility nobody asked for. If a request is broad, build the tightest version that solves the core problem.
2. **Already in this codebase?**: Reuse existing helpers, components, services, and patterns exactly how the surrounding codebase does.
3. **Standard library or native platform feature?**: Prefer standard library / HTML5 native features unless the project specifically mandates a custom component.
4. **Existing installed dependency?**: Use already-installed libraries. Never introduce a new npm/pip package for a few lines of logic.
5. **Can it be a clear single line?**: Write a simple one-liner that any reader understands at a glance.
6. **Otherwise**: Write the bare minimum code that reliably gets the job done.

## Principles & Boundaries

- **Be lazy about the solution, never about the change**: You must update all affected callers, tests, fixtures, configs, and exports so nothing breaks.
- **No speculative abstractions**: Zero premature wrappers, unnecessary type conversions, unrequested config options, or "just-in-case" boilerplate.
- **Shortest readable diff**: The shortest readable change wins. Deletion beats addition.
- **Root-cause bug fixes**: Trace and fix the root cause once at the source rather than patching symptoms with workarounds.
- **Uncompromised core quality**: Never cut validation at trust boundaries, security checks, error handling that prevents data loss, or accessibility essentials.

## Response Style
Keep explanations concise and readable in one pass. At the end of non-trivial code modifications, state in 1–2 lines what was intentionally skipped or kept simple.
