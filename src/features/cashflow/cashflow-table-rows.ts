import type { CashflowNode } from "./cashflow-types";

export type VisibleCashflowRow = { node: CashflowNode; depth: number };

export type CashflowTableBodyRow =
  | { type: "node"; node: CashflowNode; depth: number }
  | { type: "loading"; id: string; depth: number };

export function getVisibleCashflowRows(
  nodes: CashflowNode[],
  childrenByParentId: ReadonlyMap<string, CashflowNode[]>,
  expandedGroupIds: ReadonlySet<string>,
  depth = 0,
): VisibleCashflowRow[] {
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

export function getCashflowTableBodyRows(
  visibleRows: VisibleCashflowRow[],
  loadingParentIds: ReadonlySet<string>,
): CashflowTableBodyRow[] {
  return visibleRows.flatMap(({ node, depth }) => [
    { type: "node" as const, node, depth },
    ...(loadingParentIds.has(node.id)
      ? [{ type: "loading" as const, id: `${node.id}-loading`, depth }]
      : []),
  ]);
}
