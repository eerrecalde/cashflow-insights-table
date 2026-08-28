import { describe, expect, it } from "vitest";

import {
  cashflowExpansionReducer,
  initialCashflowExpansionState,
} from "./useCashflowExpansion";

describe("cashflowExpansionReducer", () => {
  it("expands and collapses a section without changing the prior state", () => {
    const expanded = cashflowExpansionReducer(initialCashflowExpansionState, {
      type: "toggle-section",
      id: "inflow",
    });
    const collapsed = cashflowExpansionReducer(expanded, {
      type: "toggle-section",
      id: "inflow",
    });

    expect(initialCashflowExpansionState.expandedGroupIds.has("inflow")).toBe(
      false,
    );
    expect(expanded.expandedGroupIds.has("inflow")).toBe(true);
    expect(collapsed.expandedGroupIds.has("inflow")).toBe(false);
  });

  it("keeps independently expanded groups open", () => {
    const withSection = cashflowExpansionReducer(
      initialCashflowExpansionState,
      { type: "toggle-section", id: "outflow" },
    );
    const withGroup = cashflowExpansionReducer(withSection, {
      type: "toggle-group",
      id: "outflow-people",
    });

    expect(withGroup.expandedGroupIds).toEqual(
      new Set(["outflow", "outflow-people"]),
    );
  });
});
