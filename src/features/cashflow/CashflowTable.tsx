"use client";

import { useQueries } from "@tanstack/react-query";
import { useReducer } from "react";

import type {
  CashflowNode,
  CashflowRootResponse,
  PeriodValues,
} from "./cashflow-types";
import { cashflowChildrenQuery } from "./useCashflowData";
import {
  cashflowExpansionReducer,
  initialCashflowExpansionState,
} from "./useCashflowExpansion";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  currency: "GBP",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: "currency",
});

export function formatCashflowValue(value: number) {
  return currencyFormatter.format(value);
}

type VisibleRow = { node: CashflowNode; depth: number };

export function getVisibleCashflowRows(
  nodes: CashflowNode[],
  childrenByParentId: ReadonlyMap<string, CashflowNode[]>,
  expandedGroupIds: ReadonlySet<string>,
  depth = 0,
): VisibleRow[] {
  return nodes.flatMap((node) => {
    const row = { node, depth };
    const children = childrenByParentId.get(node.id) ?? [];

    return node.hasChildren && expandedGroupIds.has(node.id)
      ? [
          row,
          ...getVisibleCashflowRows(
            children,
            childrenByParentId,
            expandedGroupIds,
            depth + 1,
          ),
        ]
      : [row];
  });
}

function ValueCells({
  periods,
  values,
}: Pick<CashflowRootResponse, "periods"> & { values: PeriodValues }) {
  return periods.map((period) => {
    const value = values[period.id] ?? 0;

    return (
      <td
        key={period.id}
        className="px-5 py-3 text-right whitespace-nowrap text-zinc-800 tabular-nums"
      >
        {formatCashflowValue(value)}
      </td>
    );
  });
}

function NodeRow({
  node,
  depth,
  periods,
  expanded,
  onToggle,
}: Pick<CashflowRootResponse, "periods"> & {
  node: CashflowNode;
  depth: number;
  expanded: boolean;
  onToggle: (node: CashflowNode) => void;
}) {
  const isSection = node.kind === "section";
  const tone = isSection
    ? node.section === "inflow"
      ? "border-emerald-200 bg-emerald-50/70"
      : "border-rose-200 bg-rose-50/70"
    : "border-zinc-100 bg-white";

  return (
    <tr className={`border-y ${tone}`}>
      <th
        scope="row"
        className={`sticky left-0 z-10 min-w-64 border-r border-inherit bg-inherit py-3 pr-5 text-left ${
          isSection
            ? "font-semibold text-zinc-950"
            : "font-medium text-zinc-800"
        }`}
        style={{ paddingLeft: `${1.25 + depth * 1.5}rem` }}
      >
        {node.hasChildren ? (
          <button
            type="button"
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 rounded text-left hover:text-zinc-600 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:outline-none"
            onClick={() => onToggle(node)}
          >
            <span aria-hidden="true" className="text-xs">
              {expanded ? "▾" : "▸"}
            </span>
            {node.label}
          </button>
        ) : (
          <span>{node.label}</span>
        )}
      </th>
      <ValueCells periods={periods} values={node.values} />
    </tr>
  );
}

function LoadingChildrenRow({
  depth,
  periodCount,
}: {
  depth: number;
  periodCount: number;
}) {
  return (
    <tr
      aria-live="polite"
      className="border-b border-zinc-100 bg-white text-zinc-500"
    >
      <td
        className="sticky left-0 z-10 border-r border-zinc-100 bg-white py-3 pr-5 text-sm"
        style={{ paddingLeft: `${1.25 + (depth + 1) * 1.5}rem` }}
      >
        Loading categories…
      </td>
      <td colSpan={periodCount} />
    </tr>
  );
}

export function CashflowTable({
  periods,
  openingBalances,
  nodes,
}: CashflowRootResponse) {
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

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">
            Cashflow opening balances, inflow, and outflow by period
          </caption>
          <thead>
            <tr className="bg-zinc-50 text-xs font-medium tracking-wide text-zinc-500 uppercase">
              <th
                scope="col"
                className="sticky left-0 z-20 min-w-64 border-r border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-left"
              >
                Cashflow category
              </th>
              {periods.map((period) => (
                <th
                  key={period.id}
                  scope="col"
                  className="min-w-36 border-b border-zinc-200 px-5 py-3 text-right"
                >
                  <time dateTime={period.date}>{period.label}</time>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-200 bg-white">
              <th
                scope="row"
                className="sticky left-0 z-10 min-w-64 border-r border-zinc-200 bg-white px-5 py-3 text-left font-medium text-zinc-700"
              >
                Opening balance
              </th>
              <ValueCells periods={periods} values={openingBalances} />
            </tr>
            {visibleRows.flatMap(({ node, depth }) => {
              const query = queryByParentId.get(node.id);
              const isLoadingChildren =
                node.hasChildren &&
                expansion.expandedGroupIds.has(node.id) &&
                query?.isPending;

              return [
                <NodeRow
                  key={node.id}
                  node={node}
                  depth={depth}
                  periods={periods}
                  expanded={expansion.expandedGroupIds.has(node.id)}
                  onToggle={toggleNode}
                />,
                ...(isLoadingChildren
                  ? [
                      <LoadingChildrenRow
                        key={`${node.id}-loading`}
                        depth={depth}
                        periodCount={periods.length}
                      />,
                    ]
                  : []),
              ];
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
