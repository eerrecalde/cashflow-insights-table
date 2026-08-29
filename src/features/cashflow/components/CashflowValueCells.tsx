import type { CashflowRootResponse, PeriodValues } from "../cashflow-types";
import { formatCashflowValue } from "../format-cashflow-value";

export function CashflowValueCells({
  periods,
  values,
}: Pick<CashflowRootResponse, "periods"> & { values: PeriodValues }) {
  return periods.map((period) => {
    const value = values[period.id] ?? 0;

    return (
      <td
        key={period.id}
        className="border-l border-zinc-200 px-4 py-2.5 text-right whitespace-nowrap text-zinc-800 tabular-nums"
      >
        {formatCashflowValue(value)}
      </td>
    );
  });
}
