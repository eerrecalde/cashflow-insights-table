import type {
  CashflowNode,
  CashflowRootResponse,
  PeriodValues,
} from "./cashflow-types";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  currency: "GBP",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: "currency",
});

export function formatCashflowValue(value: number) {
  return currencyFormatter.format(value);
}

function ValueCells({
  periods,
  values,
}: Pick<CashflowRootResponse, "periods"> & { values: PeriodValues }) {
  return periods.map((period) => {
    const value = values[period.id] ?? 0;

    return (
      <td
        key={period.id}
        className="px-5 py-3 text-right whitespace-nowrap text-zinc-800 tabular-nums"
      >
        {formatCashflowValue(value)}
      </td>
    );
  });
}

function SectionRow({
  node,
  periods,
}: Pick<CashflowRootResponse, "periods"> & { node: CashflowNode }) {
  const tone =
    node.section === "inflow"
      ? "border-emerald-200 bg-emerald-50/70"
      : "border-rose-200 bg-rose-50/70";

  return (
    <tr className={`border-y ${tone}`}>
      <th
        scope="row"
        className="sticky left-0 z-10 min-w-64 border-r border-inherit bg-inherit px-5 py-3 text-left font-semibold text-zinc-950"
      >
        {node.label}
      </th>
      <ValueCells periods={periods} values={node.values} />
    </tr>
  );
}

export function CashflowTable({
  periods,
  openingBalances,
  nodes,
}: CashflowRootResponse) {
  return (
    <section aria-labelledby="cashflow-table-title">
      <div className="mb-5">
        <h1
          id="cashflow-table-title"
          className="text-xl font-semibold text-zinc-950"
        >
          Cashflow insights
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Opening balances and projected cash movement by month.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">
            Cashflow opening balances, inflow, and outflow by period
          </caption>
          <thead>
            <tr className="bg-zinc-50 text-xs font-medium tracking-wide text-zinc-500 uppercase">
              <th
                scope="col"
                className="sticky left-0 z-20 min-w-64 border-r border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-left"
              >
                Cashflow category
              </th>
              {periods.map((period) => (
                <th
                  key={period.id}
                  scope="col"
                  className="min-w-36 border-b border-zinc-200 px-5 py-3 text-right"
                >
                  <time dateTime={period.date}>{period.label}</time>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-200 bg-white">
              <th
                scope="row"
                className="sticky left-0 z-10 min-w-64 border-r border-zinc-200 bg-white px-5 py-3 text-left font-medium text-zinc-700"
              >
                Opening balance
              </th>
              <ValueCells periods={periods} values={openingBalances} />
            </tr>
            {nodes.map((node) => (
              <SectionRow key={node.id} node={node} periods={periods} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
