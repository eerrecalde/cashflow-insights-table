export type CashflowNodeKind = "category" | "group" | "section";

export type CashflowSection = "inflow" | "outflow";

export type Period = {
  id: string;
  date: string;
  label: string;
  isCurrent?: boolean;
};

export type PeriodValues = Record<string, number>;

export type CashflowNode = {
  id: string;
  parentId: string | null;
  kind: CashflowNodeKind;
  section: CashflowSection;
  label: string;
  hasChildren: boolean;
  accentColor?: string;
  values: PeriodValues;
};

export type CashflowRootResponse = {
  periods: Period[];
  openingBalances: PeriodValues;
  nodes: CashflowNode[];
};

export type CashflowChildrenResponse = {
  nodes: CashflowNode[];
};

export type CashflowExpansionState = {
  expandedGroupIds: Set<string>;
};

export type CashflowExpansionAction =
  { type: "toggle-section"; id: string } | { type: "toggle-group"; id: string };
