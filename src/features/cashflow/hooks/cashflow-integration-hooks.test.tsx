import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";

import type { CashflowTableBodyRow } from "../cashflow-table-rows";
import { cashflowChildrenQuery } from "../useCashflowData";
import {
  generateCashflowCategoryNodes,
  getCashflowChildren,
  getRootCashflowData,
} from "../mock-data";
import { useCashflowChildren } from "./useCashflowChildren";
import { useCashflowVirtualRows } from "./useCashflowVirtualRows";

function renderWithQueryClient(queryClient: QueryClient, children: ReactNode) {
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
}

function ChildRows({
  expandedGroupIds,
}: {
  expandedGroupIds: ReadonlySet<string>;
}) {
  const { nodes } = getRootCashflowData();
  const { loadingParentIds, tableBodyRows } = useCashflowChildren(
    nodes,
    expandedGroupIds,
  );

  return (
    <output data-loading-parents={[...loadingParentIds].join(",")}>
      {tableBodyRows.map((row) => (row.type === "node" ? row.node.id : row.id))}
    </output>
  );
}

function VirtualRowCount({
  tableBodyRows,
}: {
  tableBodyRows: CashflowTableBodyRow[];
}) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { rowVirtualizer, virtualRows } = useCashflowVirtualRows(
    scrollElementRef,
    tableBodyRows,
  );

  return (
    <output>{`${virtualRows.length}/${rowVirtualizer.getTotalSize()}`}</output>
  );
}

describe("cashflow integration hooks", () => {
  it("requests only expanded children and includes a loading row until they arrive", () => {
    const markup = renderWithQueryClient(
      new QueryClient(),
      <ChildRows expandedGroupIds={new Set(["inflow"])} />,
    );

    expect(markup).toContain("inflow-loading");
    expect(markup).toContain('data-loading-parents="inflow"');
  });

  it("uses cached children to preserve expanded tree rows without a loading state", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      cashflowChildrenQuery("inflow").queryKey,
      getCashflowChildren("inflow"),
    );
    const markup = renderWithQueryClient(
      queryClient,
      <ChildRows expandedGroupIds={new Set(["inflow"])} />,
    );

    expect(markup).toContain("inflow-subscriptions");
    expect(markup).not.toContain("inflow-loading");
  });

  it("keeps a large category branch within a bounded virtual window", () => {
    const tableBodyRows = generateCashflowCategoryNodes({
      count: 1_200,
      parentId: "operations",
      section: "outflow",
    }).map((node) => ({ type: "node" as const, node, depth: 2 }));
    const markup = renderToStaticMarkup(
      <VirtualRowCount tableBodyRows={tableBodyRows} />,
    );
    const [virtualRowCount, totalSize] = markup
      .replace(/<[^>]+>/g, "")
      .split("/")
      .map(Number);

    expect(virtualRowCount).toBeGreaterThan(0);
    expect(virtualRowCount).toBeLessThan(tableBodyRows.length);
    expect(totalSize).toBe(1_200 * 49);
  });
});
