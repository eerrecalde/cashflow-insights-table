export type CashflowNodeKind = "category" | "group" | "section";

export type CashflowSection = "inflow" | "outflow";

export type Period = {
  id: string;
  date: string;
  label: string;
};

export type PeriodValues = Record<string, number>;

export type CashflowNode = {
  id: string;
  parentId: string | null;
  kind: CashflowNodeKind;
  section: CashflowSection;
  label: string;
  hasChildren: boolean;
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
