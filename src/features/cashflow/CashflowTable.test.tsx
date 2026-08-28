import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  CashflowTable,
  formatCashflowValue,
  getCashflowTableBodyRows,
  getVisibleCashflowRows,
} from "./CashflowTable";
import {
  generateCashflowCategoryNodes,
  getCashflowChildren,
  getRootCashflowData,
} from "./mock-data";

function renderTable(data: ReturnType<typeof getRootCashflowData>) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <CashflowTable {...data} />
    </QueryClientProvider>,
  );
}

describe("CashflowTable", () => {
  it("renders every period and its opening balance", () => {
    const data = getRootCashflowData();
    const markup = renderTable(data);

    for (const period of data.periods) {
      expect(markup).toContain(period.label);
      expect(markup).toContain(
        formatCashflowValue(data.openingBalances[period.id]),
      );
    }
  });

  it("renders the root cashflow sections with their aggregate values", () => {
    const data = getRootCashflowData();
    const markup = renderTable(data);

    for (const node of data.nodes) {
      expect(markup).toContain(node.label);
      expect(markup).toContain(formatCashflowValue(node.values["2026-04"]));
    }
  });

  it("only includes descendants after their parent is expanded", () => {
    const root = getRootCashflowData();
    const children = new Map([["inflow", getCashflowChildren("inflow").nodes]]);

    expect(
      getVisibleCashflowRows(root.nodes, children, new Set()).map(
        ({ node }) => node.id,
      ),
    ).toEqual(["inflow", "outflow"]);
    expect(
      getVisibleCashflowRows(root.nodes, children, new Set(["inflow"])).map(
        ({ node }) => node.id,
      ),
    ).toEqual([
      "inflow",
      "inflow-subscriptions",
      "inflow-services",
      "inflow-other",
      "outflow",
    ]);
  });

  it("keeps a generated large category tree as individually addressable rows", () => {
    const generatedNodes = generateCashflowCategoryNodes({
      count: 1_200,
      parentId: "operations",
      section: "outflow",
    });
    const rows = getCashflowTableBodyRows(
      generatedNodes.map((node) => ({ node, depth: 2 })),
      new Set(),
    );

    expect(rows).toHaveLength(1_200);
    expect(rows[0]).toMatchObject({ type: "node", depth: 2 });
    expect(rows.at(-1)).toMatchObject({
      type: "node",
      node: { id: "operations-generated-1200" },
    });
  });
});
