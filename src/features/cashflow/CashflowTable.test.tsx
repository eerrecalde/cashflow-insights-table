import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CashflowTable } from "./CashflowTable";
import { CashflowDataState } from "./components/CashflowDataState";
import { getRootCashflowData } from "./mock-data";

function renderTable(data: ReturnType<typeof getRootCashflowData>) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <CashflowTable {...data} />
    </QueryClientProvider>,
  );
}

describe("CashflowTable", () => {
  it("composes the feature table shell", () => {
    const markup = renderTable(getRootCashflowData());

    expect(markup).toContain(
      '<section aria-labelledby="cashflow-table-title">',
    );
    expect(markup).toContain(">Cashflow insights</h1>");
    expect(markup).toContain(
      "Cashflow opening balances, inflow, and outflow by period",
    );
  });

  it("exports the data-state entry point from the feature components", () => {
    expect(CashflowDataState).toBeTypeOf("function");
  });
});
