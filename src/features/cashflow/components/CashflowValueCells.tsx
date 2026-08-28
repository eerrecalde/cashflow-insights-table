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
        className="px-5 py-3 text-right whitespace-nowrap text-zinc-800 tabular-nums"
      >
        {formatCashflowValue(value)}
      </td>
    );
  });
}
