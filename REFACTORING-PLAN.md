# Cashflow Feature Refactoring Plan

## Goal

Keep each file focused on one responsibility, make reused presentation explicit, and retain the current one-page challenge scope. The intended result is a small cashflow feature composed from feature-local components, hooks, and pure utilities—not a generic application-wide design system.

## Baseline findings

- `src/features/cashflow/CashflowTable.tsx` is 328 lines and currently owns five separate concerns: data-query aggregation, expansion-derived row state, virtualizer setup, formatting, and table/row rendering.
- `ValueCells` is already reused for both the opening-balance and category rows. It should become the shared value-cell component rather than be duplicated.
- `NodeRow`, `LoadingChildrenRow`, table headers, and the opening-balance row each have a distinct rendering responsibility. Keeping all of them in `CashflowTable.tsx` makes the table owner harder to scan and change safely.
- The visible-row and loading-row derivation functions are pure logic. They should remain framework-independent and move out of the rendered table module so they can be tested without rendering React.
- The repeated `useQueries`/`Map`/`Set` setup is a coherent remote-state concern. It belongs in one dedicated hook.
- `CashflowDataState.tsx` is already small. Its loading and error markup is only used once, so splitting it now would add files without adding reuse or clearer ownership.
- `mock-data.ts`, API access, data hook, expansion reducer, route handler, and provider are already appropriately small and single-purpose. Do not move them merely for symmetry.

## Target structure

```text
src/features/cashflow/
  components/
    CashflowDataState.tsx             # feature UI entry point and root query state
    CashflowTable.tsx                 # table composition only
    CashflowTableHeader.tsx           # column headers
    CashflowOpeningBalanceRow.tsx     # opening-balance presentation
    CashflowNodeRow.tsx               # expandable/leaf category row
    CashflowLoadingChildrenRow.tsx    # lazy-child loading row
    CashflowValueCells.tsx            # reused numeric period cells
  hooks/
    useCashflowChildren.ts            # lazy child queries and loading ids
    useCashflowVirtualRows.ts         # scroll ref and virtualizer setup
  cashflow-table-rows.ts              # visible and loading-row derivation
  format-cashflow-value.ts            # currency formatter and exported helper
  cashflow-api.ts
  cashflow-types.ts
  mock-data.ts
  useCashflowData.ts
  useCashflowExpansion.ts
```

The `components` directory is deliberately inside the cashflow feature. None of these components has a second feature consumer, so `src/components` would create a misleading implication of cross-application reuse.

## Proposed implementation order

1. Extract pure table logic first.
   - Move `VisibleRow`, `TableBodyRow`, `getVisibleCashflowRows`, and `getCashflowTableBodyRows` into `cashflow-table-rows.ts`.
   - Move `formatCashflowValue` and its formatter into `format-cashflow-value.ts`.
   - Move the related unit assertions from `CashflowTable.test.tsx` into focused `cashflow-table-rows.test.ts` and `format-cashflow-value.test.ts` files.

2. Extract reusable and single-purpose table presentation.
   - Create `CashflowValueCells`, then use it in `CashflowOpeningBalanceRow` and `CashflowNodeRow`.
   - Create `CashflowTableHeader`, `CashflowOpeningBalanceRow`, `CashflowNodeRow`, and `CashflowLoadingChildrenRow` under `components/`.
   - Keep accessibility semantics with the component that renders them: header scopes in the header, row scopes and expand button state in `CashflowNodeRow`, and live status in the loading row.

3. Extract stateful integration hooks.
   - Add `useCashflowChildren(expandedGroupIds)` to return `childrenByParentId` and `loadingParentIds`.
   - Add `useCashflowVirtualRows(rows)` to own the scroll ref, virtualizer, virtual items, and spacer measurements.
   - Do not create hooks for simple computed values or a single event handler. Hooks should encapsulate a stateful library integration or a reusable effectful concern.

4. Reduce the table component to composition.
   - Move the public table container to `components/CashflowTable.tsx` and update `CashflowDataState`’s import.
   - Limit it to expansion state, the two feature hooks, structure, and choosing the correct row component. It should not contain row markup, `Map` construction, formatting, or virtualizer configuration.
   - Keep only the table-level caption, title, scrolling container, and virtual spacer placement there.

5. Verify each extraction without changing behavior.
   - Preserve the existing root rendering, expansion, lazy-loading, sticky-column, and virtualization tests.
   - Add component-level markup tests only where a moved component owns behavior that is otherwise unprotected (for example the accessible expand control and loading status).
   - Run tests, formatting, lint, and the webpack production build after each logical phase. The current environment blocks Turbopack's local CSS helper port, so use `npm run build -- --webpack` for repeatable build verification here.

## Guardrails

- Prefer one feature-local component per distinct visual responsibility; do not turn every element into a component.
- Extract a utility only when it is reused or separates non-React logic from rendering.
- Extract a custom hook only for state, effects, subscriptions, or third-party hook integration—not simple helpers.
- Keep request contracts, mock data, and table-specific types in the cashflow feature.
- Avoid generic `Table`, `Button`, `Row`, or style utility abstractions until at least two independent consumers require the same contract.
- Do not alter product behaviour, API shape, virtualization strategy, or accessibility semantics during this refactor.

## Decision points before implementation

- Move only feature-owned UI into `src/features/cashflow/components/`; reserve `src/components/` for genuinely cross-feature UI later.
- Keep `CashflowDataState.tsx` in the feature's `components` folder as its UI entry point; its root-query responsibility does not make it cross-feature infrastructure.
- Make each phase independently shippable so a mechanical move cannot conceal behavioural changes.
