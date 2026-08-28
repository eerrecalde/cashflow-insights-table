import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CashflowTable } from "./CashflowTable";
import { formatCashflowValue } from "./format-cashflow-value";
import { getRootCashflowData } from "./mock-data";

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

  it("gives expandable rows an accessible, collapsed control", () => {
    const markup = renderTable(getRootCashflowData());

    expect(markup).toContain('aria-label="Expand Inflow"');
    expect(markup).toContain('aria-label="Expand Outflow"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('type="button"');
    expect(markup).toContain('<th scope="row"');
    expect(markup).toContain(">Opening balance</th>");
  });
});
