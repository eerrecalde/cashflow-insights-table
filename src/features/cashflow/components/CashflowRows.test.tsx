import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getRootCashflowData } from "../../../mocks/cashflow/mock-data";
import { formatCashflowValue } from "../format-cashflow-value";
import { CashflowLoadingChildrenRow } from "./CashflowLoadingChildrenRow";
import { CashflowNodeRow } from "./CashflowNodeRow";
import { CashflowOpeningBalanceRow } from "./CashflowOpeningBalanceRow";
import { CashflowTableHeader } from "./CashflowTableHeader";

const data = getRootCashflowData();

describe("cashflow row components", () => {
  it("renders every period and opening balance with table semantics", () => {
    const markup = renderToStaticMarkup(
      <table>
        <CashflowTableHeader periods={data.periods} />
        <tbody>
          <CashflowOpeningBalanceRow
            periods={data.periods}
            openingBalances={data.openingBalances}
          />
        </tbody>
      </table>,
    );

    expect(markup).toContain('<th scope="col"');
    expect(markup).toContain('<th scope="row"');
    expect(markup).toContain(">Opening balance</th>");
    expect(markup).toContain("bg-zinc-100");
    expect(markup).toContain("border-l border-zinc-200");

    for (const period of data.periods) {
      expect(markup).toContain(`dateTime="${period.date}"`);
      expect(markup).toContain(period.label.split(" ")[0]);
      expect(markup).toContain(period.label.split(" ")[1]);
      expect(markup).toContain(
        formatCashflowValue(data.openingBalances[period.id]),
      );
    }
  });

  it("uses accessible controls only for expandable rows", () => {
    const expandableNode = data.nodes[0];
    const leafNode = {
      ...expandableNode,
      id: "leaf",
      label: "Leaf category",
      hasChildren: false,
    };
    const markup = renderToStaticMarkup(
      <table>
        <tbody>
          <CashflowNodeRow
            node={expandableNode}
            depth={0}
            periods={data.periods}
            expanded={false}
            onToggle={() => undefined}
          />
          <CashflowNodeRow
            node={leafNode}
            depth={1}
            periods={data.periods}
            expanded={false}
            onToggle={() => undefined}
          />
        </tbody>
      </table>,
    );

    expect(markup).toContain('aria-label="Expand Inflow"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain(">Leaf category</span>");
    expect(markup.match(/<button/g)).toHaveLength(1);
    expect(markup).toContain(
      formatCashflowValue(expandableNode.values["2026-04"]),
    );
    expect(markup).toContain("border-zinc-300 bg-zinc-100");
    expect(markup).toContain("group-hover:bg-sky-50");
  });

  it("highlights the current period and renders category accents", () => {
    const currentPeriod = data.periods.find((period) => period.isCurrent);
    const category = {
      ...data.nodes[0],
      id: "accented-category",
      kind: "category" as const,
      label: "Accented category",
      hasChildren: false,
      accentColor: "#0ea5e9",
    };
    const markup = renderToStaticMarkup(
      <table>
        <CashflowTableHeader periods={data.periods} />
        <tbody>
          <CashflowNodeRow
            node={category}
            depth={0}
            periods={data.periods}
            expanded={false}
            onToggle={() => undefined}
          />
        </tbody>
      </table>,
    );

    expect(currentPeriod).toBeDefined();
    expect(markup).toContain("bg-lime-100");
    expect(markup).toContain("bg-lime-50");
    expect(markup).toContain("background-color:#0ea5e9");
  });

  it("announces lazy child loading", () => {
    const markup = renderToStaticMarkup(
      <table>
        <tbody>
          <CashflowLoadingChildrenRow
            depth={1}
            periodCount={data.periods.length}
          />
        </tbody>
      </table>,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Loading categories…");
  });
});
