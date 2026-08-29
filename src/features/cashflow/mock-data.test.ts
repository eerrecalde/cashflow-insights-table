import { describe, expect, it } from "vitest";

import {
  cashflowScaleFixtureCounts,
  getCashflowChildren,
  getCashflowScaleFixture,
  getRootCashflowData,
  periods,
} from "./mock-data";

describe("getRootCashflowData", () => {
  it("returns the complete root model with opening balances for every period", () => {
    const data = getRootCashflowData();

    expect(data.periods).toEqual(periods);
    expect(data.nodes).toHaveLength(2);
    expect(data.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "inflow",
          kind: "section",
          parentId: null,
          hasChildren: true,
        }),
        expect.objectContaining({
          id: "outflow",
          kind: "section",
          parentId: null,
          hasChildren: true,
        }),
      ]),
    );

    for (const period of data.periods) {
      expect(data.openingBalances[period.id]).toEqual(expect.any(Number));
      expect(data.nodes.every((node) => period.id in node.values)).toBe(true);
    }
  });
});

describe("getCashflowChildren", () => {
  it("returns only the direct children of the requested group", () => {
    const data = getCashflowChildren("outflow-people");

    expect(data.nodes.map((node) => node.id)).toEqual([
      "outflow-salaries",
      "outflow-contractors",
    ]);
    expect(data.nodes.every((node) => node.parentId === "outflow-people")).toBe(
      true,
    );
  });

  it("returns an empty collection for an unknown parent", () => {
    expect(getCashflowChildren("unknown-parent")).toEqual({ nodes: [] });
  });
});

describe("getCashflowScaleFixture", () => {
  it.each(cashflowScaleFixtureCounts)(
    "generates %i direct children without changing the demo tree",
    (count) => {
      const { parent, children } = getCashflowScaleFixture(count);

      expect(parent.hasChildren).toBe(true);
      expect(children).toHaveLength(count);
      expect(children.every((child) => child.parentId === parent.id)).toBe(
        true,
      );
      expect(children.at(-1)?.id).toBe(`${parent.id}-generated-${count}`);
    },
  );
});
