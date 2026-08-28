import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  CashflowTable,
  formatCashflowValue,
  getVisibleCashflowRows,
} from "./CashflowTable";
import { getCashflowChildren, getRootCashflowData } from "./mock-data";

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
});
