# Component Maturity

| Component | Maturity | Consumer | Notes |
|---|---|---|---|
| `AppShell` | Candidate | Operations layout | Stable shell contract; one route group |
| `DataTable` | Experimental | Task preview table | Sorting/filtering deferred to Sprint 3; React Compiler opts out at the `useReactTable` adapter boundary because TanStack Table owns internal memoization |
| `StatusBadge` | Experimental | Task preview table | Current vocabulary covers foundation scenario only |
| `InlineBanner` | Experimental | Task Inbox mock boundary | One informational tone only |

Approval, evidence, timeline, command-palette, loading, empty, and error components remain unimplemented until their consuming screens establish the required contracts.
