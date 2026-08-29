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
        {periods.map((period) => {
          const [month, year] = period.label.split(" ");
          const tone = period.isCurrent ? "bg-lime-100" : "bg-zinc-100";

          return (
            <th
              key={period.id}
              scope="col"
              className={`sticky top-0 z-20 min-w-36 border-b border-l border-zinc-300 px-4 py-2 text-center ${tone}`}
            >
              <time
                dateTime={period.date}
                className="flex flex-col leading-tight normal-case"
              >
                <span className="text-[13px] font-semibold tracking-normal text-zinc-800">
                  {month}
                </span>
                <span className="mt-0.5 text-[11px] font-medium tracking-normal text-zinc-500">
                  {year}
                </span>
              </time>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
