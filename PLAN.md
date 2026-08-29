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

| Item                | Planned outcome                                         | Actual outcome / deviation | Reason                                                                                                                                                  |
| ------------------- | ------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data contract       | Lazy root and child requests                            | Implemented                | Added deterministic periods, opening balances, root rows, and direct-child responses behind a 600 ms mock delay.                                        |
| Data access         | Query provider, typed fetcher, initial states           | Implemented                | Added a browser-stable TanStack Query provider, typed root/child fetchers, and visible initial loading and retryable error states.                      |
| Static table shell  | Period headers, opening balances, sticky labels, scroll | Implemented                | Added a semantic static table with all period columns, root section totals, a sticky first column, and horizontal scrolling.                            |
| Table interaction   | Reducer-backed expand/collapse                          | Implemented                | Added reducer-controlled section and group toggles, typed lazy child queries, nesting, and an in-table child-loading state.                             |
| Large-list behavior | Virtualized category rows                               | Implemented                | Added a bounded TanStack Virtual window for the scrollable category body and a deterministic 1,200-row generated branch to exercise it.                 |
| Polymorphic label   | Button for expandable rows, static element for leaves   | Implemented                | Expandable rows use native buttons with explicit names and expanded state; non-expandable rows remain static text.                                      |
| Verification        | Format, lint, build, manual interaction check           | Implemented                | Formatting, 13 unit tests, lint, the standard production build, and desktop-browser checks of the rendered table plus Inflow expansion pass all passed. |

## Follow-up: cashflow componentization

This follow-up preserves the completed challenge behaviour while making the cashflow feature easier to navigate and reuse. Feature-owned code stays together under `src/features/cashflow`; `components` is a child of that feature, not a sibling. A top-level `src/components` folder is reserved for UI with consumers in more than one feature.

### Target structure

```text
src/features/cashflow/
  components/
    CashflowDataState.tsx
    CashflowTable.tsx
    CashflowTableHeader.tsx
    CashflowOpeningBalanceRow.tsx
    CashflowNodeRow.tsx
    CashflowLoadingChildrenRow.tsx
    CashflowValueCells.tsx
  hooks/
    useCashflowChildren.ts
    useCashflowVirtualRows.ts
  cashflow-api.ts
  cashflow-table-rows.ts
  cashflow-types.ts
  format-cashflow-value.ts
  mock-data.ts
  useCashflowData.ts
  useCashflowExpansion.ts
```

`CashflowDataState` moves into `components` because it is the feature's UI entry point. API contracts, mock data, types, pure table derivation, formatting, and data/expansion hooks remain at the feature root. The two new hooks are justified by their stateful third-party integrations; simple computed values and one-off callbacks do not become hooks.

### Work packages

| ID  | Task                                  | Done when                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7   | Extract pure cashflow table logic     | Currency formatting plus visible/loading-row derivation live in focused non-React modules; their tests move with them and cover the current behaviour.                                                                                                                                                                                                                         |
| 8   | Extract feature-owned row components  | The header, opening-balance row, node row, lazy-loading row, and reusable value cells live in `src/features/cashflow/components`; accessibility semantics remain covered by unit tests.                                                                                                                                                                                        |
| 9   | Extract integration hooks and compose | Child-query aggregation and virtualization each have a focused hook; `CashflowTable` is table composition only, with no behaviour change. Review the React Compiler compatibility warning from TanStack Virtual and either resolve it with a supported integration or document why it remains. Updated tests cover the same expansion, lazy-loading, and large-list behaviour. |
| 10  | Verify refactor                       | All imports are feature-local, no premature generic components are introduced, and tests, format, lint, webpack production build, and manual interaction checks pass.                                                                                                                                                                                                          |

### Acceptance checklist

- [ ] Cashflow-specific UI is in `src/features/cashflow/components`, while only cross-feature UI may move to a top-level `src/components` in the future.
- [ ] Each extracted component has one rendering responsibility and no duplicated period-value markup.
- [ ] Pure row derivation and value formatting are outside React components and are unit-tested directly.
- [ ] Child-query management and virtualization are isolated in focused hooks; simple helpers are not disguised as hooks.
- [ ] The refactor preserves the completed challenge's API shape, accessibility semantics, expansion behaviour, sticky columns, and virtualization.
- [ ] `npm test`, `npm run format:check`, `npm run lint`, and `npm run build -- --webpack` pass.

### Outcome and decision log

Update this table as each follow-up package is implemented. Do not amend the completed challenge outcome log above.

| Item | Planned outcome                       | Actual outcome / deviation | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---- | ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7    | Extract pure cashflow table logic     | Implemented                | Extracted GBP formatting and visible/loading-row derivation into focused modules with direct unit coverage, preserving the table's rendering behaviour.                                                                                                                                                                                                                                                                                                                      |
| 8    | Extract feature-owned row components  | Implemented                | Extracted the header, opening-balance row, node row, loading row, and shared period-value cells into feature-local components, with direct tests for table and accessible-control semantics.                                                                                                                                                                                                                                                                                 |
| 9    | Extract integration hooks and compose | Implemented                | Moved child-query aggregation and virtualization into focused hooks, leaving `CashflowTable` to compose the table. Used React's supported `"use no memo"` directive around TanStack Virtual's mutable instance so `getVirtualItems()` is not cached by React Compiler. The React Hooks rule continues to warn because it cannot prove this mutable API is used locally; the hook returns only its current item snapshot and no global lint suppression was added.            |
| 10   | Verify refactor                       | Implemented                | Moved the data-state UI into feature-local `components`, verified feature-local imports and the absence of premature generic components, and added a structural entry-point test. `npm test` (20 tests), formatting, lint, and `npm run build -- --webpack` pass; lint retains the documented TanStack Virtual compatibility warning. Manual internal-browser checks confirmed section expansion and lazy nested-group loading with the expected accessible expanded states. |

## Follow-up: brief alignment and scale validation

This follow-up closes the gaps identified by comparing the implementation with the technical-challenge brief. It does not add product features such as filtering, editing, charts, or export. The normal demo remains small enough to inspect manually; scale fixtures exist solely to establish that the table supports the stated 10k-100k category range.

### Work packages

| ID  | Task                                   | Done when                                                                                                                                                                                                          |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 11  | Prove 10k-100k scale                   | Generated fixtures cover 10,000 and 100,000 categories without adding all rows to the DOM. Tests assert a bounded virtual window and retain direct-child lazy loading.                                             |
| 12  | Clarify and cache the mock contract    | The route documents and returns cache-friendly responses, including appropriate cache headers. Root and child response responsibilities remain explicit, typed, and independently tested.                          |
| 13  | Align the table with the CSV reference | The visual treatment is tightened toward the supplied reference while retaining clear section hierarchy, accessibility, sticky labels, horizontal scrolling, and non-jarring loading states.                       |
| 14  | Remove incidental complexity           | Unused dependencies are removed. The TanStack Virtual React Compiler warning is resolved with a supported integration or retained only with a concise, evidence-based decision recorded in the outcome log.        |
| 15  | Verify brief alignment                 | Unit and interaction tests cover scale, caching, and expansion; visual checks cover the reference-oriented table shell; `npm test`, `npm run format:check`, `npm run lint`, and `npm run build -- --webpack` pass. |

### Acceptance checklist

- [ ] The codebase exercises both 10,000- and 100,000-category fixtures, with a bounded rendered-row count.
- [ ] Tree descendants are still requested only when their parent is expanded.
- [ ] Root and child responses are cacheable through stable request URLs and explicit route cache headers.
- [ ] The table remains recognisably CSV-like rather than introducing new dashboard features.
- [ ] The first column remains sticky while period columns scroll horizontally.
- [ ] Expand/collapse controls and loading states retain their existing accessible semantics.
- [ ] No unused table library remains in production dependencies.
- [ ] Any remaining React Compiler warning has a documented, supported rationale.
- [ ] `npm test`, `npm run format:check`, `npm run lint`, and `npm run build -- --webpack` pass.

### Outcome and decision log

Update this table during implementation. Do not amend the preceding plans or outcome logs after the fact.

| Item | Planned outcome                        | Actual outcome / deviation | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11   | Prove 10k-100k scale                   | Implemented                | Added deterministic, direct-child scale fixtures for 10,000 and 100,000 categories. The integration tests assert each fixture retains a 25-row-or-fewer virtual window, while dedicated fixture coverage confirms all generated rows remain direct children of the expandable parent.                                                                                                                                                                                                   |
| 12   | Clarify and cache the mock contract    | Implemented                | Documented the root-versus-direct-child response responsibilities, added overloads that preserve their distinct response types, and returned short-lived public cache headers for both stable request URLs. Direct route tests verify each contract and its cache header.                                                                                                                                                                                                               |
| 13   | Align the table with the CSV reference | Implemented                | Reworked the table into a denser spreadsheet treatment: a plain bordered grid, compact neutral headers, visible cell boundaries, understated section bands, and a wider desktop surface. Sticky labels, horizontal scrolling, accessibility, and loading semantics remain unchanged.                                                                                                                                                                                                    |
| 14   | Remove incidental complexity           | Implemented                | Removed the unused `@tanstack/react-table` production dependency. `@tanstack/react-virtual` remains because it is the bounded-DOM implementation required by the brief; its current adapter intentionally returns a mutable instance, which React's `incompatible-library` rule skips for compiler safety. The adapter call is isolated in a `"use no memo"` hook that exposes only the current virtual-row snapshot and total size, so the exception cannot leak into table rendering. |
| 15   | Verify brief alignment                 | Implemented                | Verified the completed brief-alignment work with 27 passing unit and interaction tests spanning scale fixtures, cache headers, and expansion behaviour. `npm run format:check`, `npm run lint`, and `npm run build -- --webpack` pass; lint retains only the documented TanStack Virtual React Compiler compatibility warning. A fresh desktop-browser check confirmed the compact CSV-like table shell and accessible Inflow expansion state.                                          |

## Follow-up: reference table polish

The user approved a small presentational pass based on the provided reference image. It intentionally excludes the reference's editing, row-selection, deletion, and drag-reordering affordances because those imply mutations outside the challenge scope.

| Item | Planned outcome                     | Actual outcome / deviation | Reason                                                                                                                                                                                                                                                                                                       |
| ---- | ----------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 16   | Add low-complexity reference polish | Implemented                | Period headers now show stacked month/year labels, the supplied current period is softly highlighted, category rows can carry small decorative accent dots, group and section totals have stronger emphasis, and hover/focus feedback is present. No new endpoint, mutation, or table interaction was added. |
