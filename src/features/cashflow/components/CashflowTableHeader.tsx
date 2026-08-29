import type { CashflowRootResponse } from "../cashflow-types";

export function CashflowTableHeader({
  periods,
}: Pick<CashflowRootResponse, "periods">) {
  return (
    <thead>
      <tr className="bg-zinc-100 text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
        <th
          scope="col"
          className="sticky top-0 left-0 z-30 min-w-64 border-r border-b border-zinc-300 bg-zinc-100 px-4 py-2.5 text-left"
        >
          Cashflow category
        </th>
        {periods.map((period) => (
          <th
            key={period.id}
            scope="col"
            className="sticky top-0 z-20 min-w-36 border-b border-l border-zinc-300 bg-zinc-100 px-4 py-2.5 text-right"
          >
            <time dateTime={period.date}>{period.label}</time>
          </th>
        ))}
      </tr>
    </thead>
  );
}
