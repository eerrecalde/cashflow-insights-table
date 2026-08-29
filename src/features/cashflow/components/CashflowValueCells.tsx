import type { CashflowRootResponse, PeriodValues } from "../cashflow-types";
import { formatCashflowValue } from "../format-cashflow-value";

export function CashflowValueCells({
  periods,
  values,
  emphasized = false,
}: Pick<CashflowRootResponse, "periods"> & {
  values: PeriodValues;
  emphasized?: boolean;
}) {
  return periods.map((period) => {
    const value = values[period.id] ?? 0;

    return (
      <td
        key={period.id}
        className={`border-l border-zinc-200 px-4 py-2.5 text-right whitespace-nowrap text-zinc-800 tabular-nums transition-colors group-focus-within:bg-sky-50 group-hover:bg-sky-50 ${
          emphasized ? "font-semibold" : ""
        } ${period.isCurrent ? "bg-lime-50" : ""}`}
      >
        {formatCashflowValue(value)}
      </td>
    );
  });
}
