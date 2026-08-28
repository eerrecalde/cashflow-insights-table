"use client";

import { useQueries } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useReducer, useRef } from "react";

import {
  getCashflowTableBodyRows,
  getVisibleCashflowRows,
} from "./cashflow-table-rows";
import { CashflowLoadingChildrenRow } from "./components/CashflowLoadingChildrenRow";
import { CashflowNodeRow } from "./components/CashflowNodeRow";
import { CashflowOpeningBalanceRow } from "./components/CashflowOpeningBalanceRow";
import { CashflowTableHeader } from "./components/CashflowTableHeader";
import type { CashflowNode, CashflowRootResponse } from "./cashflow-types";
import { cashflowChildrenQuery } from "./useCashflowData";
import {
  cashflowExpansionReducer,
  initialCashflowExpansionState,
} from "./useCashflowExpansion";

export function CashflowTable({
  periods,
  openingBalances,
  nodes,
}: CashflowRootResponse) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [expansion, dispatch] = useReducer(
    cashflowExpansionReducer,
    initialCashflowExpansionState,
  );
  const expandedNodeIds = [...expansion.expandedGroupIds];
  const childQueries = useQueries({
    queries: expandedNodeIds.map((nodeId) => cashflowChildrenQuery(nodeId)),
  });
  const childrenByParentId = new Map(
    expandedNodeIds.map((nodeId, index) => [
      nodeId,
      childQueries[index]?.data?.nodes ?? [],
    ]),
  );
  const visibleRows = getVisibleCashflowRows(
    nodes,
    childrenByParentId,
    expansion.expandedGroupIds,
  );
  const queryByParentId = new Map(
    expandedNodeIds.map((nodeId, index) => [nodeId, childQueries[index]]),
  );
  const loadingParentIds = new Set(
    visibleRows
      .filter(
        ({ node }) =>
          node.hasChildren &&
          expansion.expandedGroupIds.has(node.id) &&
          queryByParentId.get(node.id)?.isPending,
      )
      .map(({ node }) => node.id),
  );
  const tableBodyRows = getCashflowTableBodyRows(visibleRows, loadingParentIds);
  const rowVirtualizer = useVirtualizer({
    count: tableBodyRows.length,
    estimateSize: () => 49,
    getItemKey: (index) => {
      const row = tableBodyRows[index];
      return row?.type === "node" ? row.node.id : (row?.id ?? index);
    },
    getScrollElement: () => scrollElementRef.current,
    initialRect: { height: 600, width: 0 },
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  function toggleNode(node: CashflowNode) {
    dispatch({
      type: node.kind === "section" ? "toggle-section" : "toggle-group",
      id: node.id,
    });
  }

  return (
    <section aria-labelledby="cashflow-table-title">
      <div className="mb-5">
        <h1
          id="cashflow-table-title"
          className="text-xl font-semibold text-zinc-950"
        >
          Cashflow insights
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Opening balances and projected cash movement by month.
        </p>
      </div>

      <div
        ref={scrollElementRef}
        aria-busy={loadingParentIds.size > 0}
        className="max-h-[70vh] overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm"
      >
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">
            Cashflow opening balances, inflow, and outflow by period
          </caption>
          <CashflowTableHeader periods={periods} />
          <tbody>
            <CashflowOpeningBalanceRow
              periods={periods}
              openingBalances={openingBalances}
            />
            {virtualRows[0]?.start ? (
              <tr aria-hidden="true">
                <td
                  colSpan={periods.length + 1}
                  style={{ height: virtualRows[0].start }}
                />
              </tr>
            ) : null}
            {virtualRows.map((virtualRow) => {
              const row = tableBodyRows[virtualRow.index];

              if (!row) return null;

              return row.type === "node" ? (
                <CashflowNodeRow
                  key={virtualRow.key}
                  node={row.node}
                  depth={row.depth}
                  periods={periods}
                  expanded={expansion.expandedGroupIds.has(row.node.id)}
                  onToggle={toggleNode}
                />
              ) : (
                <CashflowLoadingChildrenRow
                  key={virtualRow.key}
                  depth={row.depth}
                  periodCount={periods.length}
                />
              );
            })}
            {virtualRows.length > 0 ? (
              <tr aria-hidden="true">
                <td
                  colSpan={periods.length + 1}
                  style={{
                    height:
                      rowVirtualizer.getTotalSize() -
                      (virtualRows.at(-1)?.end ?? 0),
                  }}
                />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
