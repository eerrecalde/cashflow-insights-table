"use client";

import { useQueries } from "@tanstack/react-query";

import {
  getCashflowTableBodyRows,
  getVisibleCashflowRows,
} from "../cashflow-table-rows";
import type { CashflowNode } from "../cashflow-types";
import { cashflowChildrenQuery } from "../useCashflowData";

export function useCashflowChildren(
  nodes: CashflowNode[],
  expandedGroupIds: ReadonlySet<string>,
) {
  const expandedNodeIds = [...expandedGroupIds];
  const childQueries = useQueries({
    queries: expandedNodeIds.map((nodeId) => cashflowChildrenQuery(nodeId)),
  });
  const childrenByParentId = new Map(
    expandedNodeIds.map((nodeId, index) => [
      nodeId,
      childQueries[index]?.data?.nodes ?? [],
    ]),
  );
  const queryByParentId = new Map(
    expandedNodeIds.map((nodeId, index) => [nodeId, childQueries[index]]),
  );
  const visibleRows = getVisibleCashflowRows(
    nodes,
    childrenByParentId,
    expandedGroupIds,
  );
  const loadingParentIds = new Set(
    visibleRows
      .filter(
        ({ node }) =>
          node.hasChildren &&
          expandedGroupIds.has(node.id) &&
          queryByParentId.get(node.id)?.isPending,
      )
      .map(({ node }) => node.id),
  );

  return {
    loadingParentIds,
    tableBodyRows: getCashflowTableBodyRows(visibleRows, loadingParentIds),
  };
}
