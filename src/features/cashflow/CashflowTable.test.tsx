import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CashflowTable, formatCashflowValue } from "./CashflowTable";
import { getRootCashflowData } from "./mock-data";

describe("CashflowTable", () => {
  it("renders every period and its opening balance", () => {
    const data = getRootCashflowData();
    const markup = renderToStaticMarkup(<CashflowTable {...data} />);

    for (const period of data.periods) {
      expect(markup).toContain(period.label);
      expect(markup).toContain(
        formatCashflowValue(data.openingBalances[period.id]),
      );
    }
  });

  it("renders the root cashflow sections with their aggregate values", () => {
    const data = getRootCashflowData();
    const markup = renderToStaticMarkup(<CashflowTable {...data} />);

    for (const node of data.nodes) {
      expect(markup).toContain(node.label);
      expect(markup).toContain(formatCashflowValue(node.values["2026-04"]));
    }
  });
});
