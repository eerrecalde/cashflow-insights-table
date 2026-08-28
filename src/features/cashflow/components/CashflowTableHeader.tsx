import type { CashflowRootResponse } from "../cashflow-types";

export function CashflowTableHeader({
  periods,
}: Pick<CashflowRootResponse, "periods">) {
  return (
    <thead>
      <tr className="bg-zinc-50 text-xs font-medium tracking-wide text-zinc-500 uppercase">
        <th
          scope="col"
          className="sticky top-0 left-0 z-30 min-w-64 border-r border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-left"
        >
          Cashflow category
        </th>
        {periods.map((period) => (
          <th
            key={period.id}
            scope="col"
            className="sticky top-0 z-20 min-w-36 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-right"
          >
            <time dateTime={period.date}>{period.label}</time>
          </th>
        ))}
      </tr>
    </thead>
  );
}
