"use client";

import { useReducer, useRef } from "react";

import { CashflowLoadingChildrenRow } from "./components/CashflowLoadingChildrenRow";
import { CashflowNodeRow } from "./components/CashflowNodeRow";
import { CashflowOpeningBalanceRow } from "./components/CashflowOpeningBalanceRow";
import { CashflowTableHeader } from "./components/CashflowTableHeader";
import type { CashflowNode, CashflowRootResponse } from "./cashflow-types";
import { useCashflowChildren } from "./hooks/useCashflowChildren";
import { useCashflowVirtualRows } from "./hooks/useCashflowVirtualRows";
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
  const { loadingParentIds, tableBodyRows } = useCashflowChildren(
    nodes,
    expansion.expandedGroupIds,
  );
  const { totalSize, virtualRows } = useCashflowVirtualRows(
    scrollElementRef,
    tableBodyRows,
  );

  function toggleNode(node: CashflowNode) {
    dispatch({
      type: node.kind === "section" ? "toggle-section" : "toggle-group",
      id: node.id,
    });
  }

  return (
    <section aria-labelledby="cashflow-table-title">
      <div className="mb-6 border-b border-zinc-200 pb-5">
        <h1
          id="cashflow-table-title"
          className="text-lg font-semibold tracking-tight text-zinc-950"
        >
          Cashflow insights
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Opening balances and projected cash movement by month.
        </p>
      </div>

      <div
        ref={scrollElementRef}
        aria-busy={loadingParentIds.size > 0}
        className="max-h-[70vh] overflow-auto border border-zinc-300 bg-white"
      >
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-[13px]">
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
                    height: totalSize - (virtualRows.at(-1)?.end ?? 0),
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
