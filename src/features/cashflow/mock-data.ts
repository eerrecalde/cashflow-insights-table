import type {
  CashflowChildrenResponse,
  CashflowNode,
  CashflowRootResponse,
  CashflowSection,
  Period,
  PeriodValues,
} from "./cashflow-types";

export const periods: Period[] = [
  { id: "2026-04", date: "2026-04-01", label: "Apr 2026" },
  { id: "2026-05", date: "2026-05-01", label: "May 2026" },
  { id: "2026-06", date: "2026-06-01", label: "Jun 2026" },
  { id: "2026-07", date: "2026-07-01", label: "Jul 2026" },
  { id: "2026-08", date: "2026-08-01", label: "Aug 2026" },
  { id: "2026-09", date: "2026-09-01", label: "Sep 2026" },
];

const values = (...amounts: number[]): PeriodValues =>
  Object.fromEntries(
    periods.map((period, index) => [period.id, amounts[index] ?? 0]),
  );

const node = (
  id: string,
  parentId: string | null,
  section: CashflowSection,
  label: string,
  amounts: number[],
  hasChildren = false,
  kind: CashflowNode["kind"] = hasChildren ? "group" : "category",
): CashflowNode => ({
  id,
  parentId,
  kind,
  section,
  label,
  hasChildren,
  values: values(...amounts),
});

export function generateCashflowCategoryNodes({
  count,
  parentId,
  section,
}: {
  count: number;
  parentId: string;
  section: CashflowSection;
}): CashflowNode[] {
  const sign = section === "inflow" ? 1 : -1;

  return Array.from({ length: count }, (_, index) => {
    const baseAmount = (index % 29) * 175 + 240;

    return node(
      `${parentId}-generated-${index + 1}`,
      parentId,
      section,
      `Generated category ${index + 1}`,
      periods.map((_, periodIndex) => sign * (baseAmount + periodIndex * 35)),
    );
  });
}

export const openingBalances = values(
  128_450,
  143_120,
  151_300,
  138_775,
  164_230,
  171_905,
);

const rootNodes: CashflowNode[] = [
  node(
    "inflow",
    null,
    "inflow",
    "Inflow",
    [83_900, 91_250, 88_300, 106_500, 112_900, 119_400],
    true,
    "section",
  ),
  node(
    "outflow",
    null,
    "outflow",
    "Outflow",
    [-69_230, -83_070, -100_825, -81_045, -105_225, -94_615],
    true,
    "section",
  ),
];

const childNodes: Record<string, CashflowNode[]> = {
  inflow: [
    node(
      "inflow-subscriptions",
      "inflow",
      "inflow",
      "Subscriptions",
      [45_600, 48_200, 50_100, 53_900, 57_300, 60_400],
    ),
    node(
      "inflow-services",
      "inflow",
      "inflow",
      "Professional services",
      [18_200, 22_500, 16_400, 24_600, 26_100, 27_800],
    ),
    node(
      "inflow-other",
      "inflow",
      "inflow",
      "Other income",
      [20_100, 20_550, 21_800, 28_000, 29_500, 31_200],
      true,
    ),
  ],
  "inflow-other": [
    node(
      "inflow-interest",
      "inflow-other",
      "inflow",
      "Interest received",
      [320, 350, 410, 470, 520, 600],
    ),
    node(
      "inflow-reimbursements",
      "inflow-other",
      "inflow",
      "Reimbursements",
      [5_480, 4_200, 5_100, 7_730, 8_400, 9_100],
    ),
    node(
      "inflow-tax-refunds",
      "inflow-other",
      "inflow",
      "Tax refunds",
      [14_300, 16_000, 16_290, 19_800, 20_580, 21_500],
    ),
  ],
  outflow: [
    node(
      "outflow-people",
      "outflow",
      "outflow",
      "People",
      [-38_200, -46_100, -55_700, -42_300, -58_800, -52_600],
      true,
    ),
    node(
      "outflow-operations",
      "outflow",
      "outflow",
      "Operations",
      [-17_830, -22_470, -27_125, -24_245, -27_925, -25_015],
      true,
    ),
    node(
      "outflow-other",
      "outflow",
      "outflow",
      "Other expenses",
      [-13_200, -14_500, -18_000, -14_500, -18_500, -17_000],
    ),
  ],
  "outflow-people": [
    node(
      "outflow-salaries",
      "outflow-people",
      "outflow",
      "Salaries",
      [-31_500, -38_000, -46_900, -35_000, -49_000, -44_000],
    ),
    node(
      "outflow-contractors",
      "outflow-people",
      "outflow",
      "Contractors",
      [-6_700, -8_100, -8_800, -7_300, -9_800, -8_600],
    ),
  ],
  "outflow-operations": [
    node(
      "outflow-software",
      "outflow-operations",
      "outflow",
      "Software",
      [-6_800, -7_100, -7_425, -7_800, -8_125, -8_015],
    ),
    node(
      "outflow-marketing",
      "outflow-operations",
      "outflow",
      "Marketing",
      [-11_030, -15_370, -19_700, -16_445, -19_800, -17_000],
    ),
    ...generateCashflowCategoryNodes({
      count: 1_200,
      parentId: "outflow-operations",
      section: "outflow",
    }),
  ],
};

export function getRootCashflowData(): CashflowRootResponse {
  return { periods, openingBalances, nodes: rootNodes };
}

export function getCashflowChildren(
  parentId: string,
): CashflowChildrenResponse {
  return { nodes: childNodes[parentId] ?? [] };
}
