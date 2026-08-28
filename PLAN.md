# Cashflow Insights Table - Implementation Plan

## Purpose

Build the technical-challenge table only: a performant, typed cashflow table with opening balances, inflow/outflow sections, grouped categories, and expand/collapse behavior. The visual direction is the supplied CSV-like example.

This document records the plan before implementation. The **Outcome and decision log** section is intentionally left for implementation notes and deviations, so a reviewer can distinguish intent from the final result.

## Scope

### Included

- One Next.js App Router page.
- Opening Balance values for each time period.
- Inflow and Outflow sections that can be expanded and collapsed.
- Flat categories and nested category groups.
- Sticky first column and horizontally scrollable period columns.
- Loading states for the initial request and lazy-loaded group children.
- Virtualized rows suitable for a large category tree.
- A typed mock API with intentional latency, shaped to be replaced by a real API later.

### Explicitly excluded

- Authentication, database, persistence, and mutations.
- Charts, filters, sorting, search, editing, export, and a design system.
- Extra application pages or generic shared-component infrastructure.

## Architecture

The application remains one route, composed from a small feature module rather than a monolithic page.

```text
src/
  app/
    page.tsx                       # Page composition and query provider
    api/cashflow/route.ts          # Delayed mock endpoint

  features/cashflow/
    CashflowTable.tsx              # Table and virtualization orchestration
    CashflowTableHeader.tsx        # Period headers
    CashflowRow.tsx                # Virtualized row rendering
    CashflowRowLabel.tsx           # Sticky label and expand control
    cashflow-api.ts                # Typed fetcher
    cashflow-types.ts              # API, row, and action types
    mock-data.ts                   # Deterministic mock-data generation
    useCashflowData.ts             # Query hook
    useCashflowExpansion.ts        # Expansion reducer hook
```

Components will be introduced only when they own a distinct rendering responsibility. There will be no generic table, button, or design-system layer for this one-screen task.

## Data contract

`GET /api/cashflow` returns the initial table model. `GET /api/cashflow?parentId=<id>` returns only a group’s direct children when the user expands it.

The response will contain:

- `periods`: stable IDs, ISO dates, and display labels.
- `openingBalances`: values keyed by period ID.
- `nodes`: direct category/group children containing `id`, `parentId`, `kind`, `label`, `hasChildren`, and values keyed by period ID.

Group rows include server-provided aggregate values. The browser must not calculate every descendant total before rendering. The mock handler will wait approximately 600 ms to make loading feedback observable.

## State and library responsibilities

| Concern                             | Approach         | Reason                                                                     |
| ----------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| Remote data, loading, errors, cache | TanStack Query   | Keeps endpoint state out of rendering code and caches lazy child requests. |
| Table columns and row model         | TanStack Table   | Provides headless table behavior without an imposed UI.                    |
| Rendered row count                  | TanStack Virtual | Keeps the DOM bounded when category counts grow.                           |
| Section/group expansion             | `useReducer`     | Local interaction state is independent from remote data.                   |
| Styling                             | Tailwind v4      | Enough for the target visual; no component library required.               |

### Intentional TypeScript patterns

- `useCashflowData()` centralizes typed API access and Query configuration.
- `useCashflowExpansion()` uses a reducer with a discriminated-union action type, for example `toggle-section` and `toggle-group`.
- `CashflowRowLabel` is polymorphic only where semantics vary: an expandable label renders as a `button`; a leaf label uses a non-interactive element. Props are typed according to the chosen element.

TanStack Query is not used as a table engine; it owns remote state. TanStack Table and Virtual own the table and scale-related work.

## Work packages

Each package produces a visible or independently verifiable result. They are small enough to implement and review one at a time, while preserving the dependency order.

| ID  | Task               | Done when                                                                                                       |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| 1   | Typed mock API     | Types, deterministic mock data, and a delayed route handler return root rows and direct children by `parentId`. |
| 2   | Data access        | Query provider, typed fetcher, and initial loading/error states are in place.                                   |
| 3   | Static table shell | Period headers, opening balances, sticky labels, and horizontal scrolling match the required table structure.   |
| 4   | Tree interaction   | Inflow/Outflow and category groups expand/collapse through the reducer; child groups load lazily.               |
| 5   | Scale              | Visible category rows are virtualized and the table stays responsive with a large generated tree.               |
| 6   | Finish and verify  | Visual hierarchy is refined; controls are accessible; format, lint, build, and manual interaction checks pass.  |

No package adds functionality outside the stated challenge. For example, sorting or filters would be a new scope decision, not an implied follow-up to the table shell.

## Acceptance checklist

- [ ] Opening balances appear for all displayed periods.
- [ ] Inflow and Outflow sections expand and collapse.
- [ ] Groups expand and collapse, loading their children only when needed.
- [ ] Flat and grouped categories both render correctly.
- [ ] The first column stays visible while period columns scroll horizontally.
- [ ] Initial and lazy-loading states are clear and non-jarring.
- [ ] Rows are virtualized; expanding a large tree does not create an unbounded DOM.
- [ ] The mock contract can be replaced by a real endpoint without changing table components.
- [ ] `npm run format:check`, `npm run lint`, and `npm run build` pass.

## Outcome and decision log

Update this section during implementation. Do not rewrite the plan above after the fact.

| Item                | Planned outcome                                         | Actual outcome / deviation | Reason                                                                                                                                  |
| ------------------- | ------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Data contract       | Lazy root and child requests                            | Implemented                | Added deterministic periods, opening balances, root rows, and direct-child responses behind a 600 ms mock delay.                        |
| Data access         | Query provider, typed fetcher, initial states           | Implemented                | Added a browser-stable TanStack Query provider, typed root/child fetchers, and visible initial loading and retryable error states.      |
| Static table shell  | Period headers, opening balances, sticky labels, scroll | Implemented                | Added a semantic static table with all period columns, root section totals, a sticky first column, and horizontal scrolling.            |
| Table interaction   | Reducer-backed expand/collapse                          | Implemented                | Added reducer-controlled section and group toggles, typed lazy child queries, nesting, and an in-table child-loading state.             |
| Large-list behavior | Virtualized category rows                               | Implemented                | Added a bounded TanStack Virtual window for the scrollable category body and a deterministic 1,200-row generated branch to exercise it. |
| Polymorphic label   | Button for expandable rows, static element for leaves   | Pending                    |                                                                                                                                         |
| Verification        | Format, lint, build, manual interaction check           | Pending                    |                                                                                                                                         |
