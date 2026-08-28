import { describe, expect, it } from "vitest";

import {
  getCashflowTableBodyRows,
  getVisibleCashflowRows,
} from "./cashflow-table-rows";
import {
  generateCashflowCategoryNodes,
  getCashflowChildren,
  getRootCashflowData,
} from "./mock-data";

describe("cashflow table rows", () => {
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

  it("adds a loading row immediately after a loading parent", () => {
    const [inflow] = getRootCashflowData().nodes;
    const rows = getCashflowTableBodyRows(
      [{ node: inflow, depth: 0 }],
      new Set([inflow.id]),
    );

    expect(rows).toEqual([
      { type: "node", node: inflow, depth: 0 },
      { type: "loading", id: "inflow-loading", depth: 0 },
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
