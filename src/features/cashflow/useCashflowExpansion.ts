import type {
  CashflowExpansionAction,
  CashflowExpansionState,
} from "./cashflow-types";

export const initialCashflowExpansionState: CashflowExpansionState = {
  expandedGroupIds: new Set(),
};

export function cashflowExpansionReducer(
  state: CashflowExpansionState,
  action: CashflowExpansionAction,
): CashflowExpansionState {
  const expandedGroupIds = new Set(state.expandedGroupIds);

  switch (action.type) {
    case "toggle-section":
    case "toggle-group":
      if (expandedGroupIds.has(action.id)) {
        expandedGroupIds.delete(action.id);
      } else {
        expandedGroupIds.add(action.id);
      }

      return { expandedGroupIds };
  }
}
