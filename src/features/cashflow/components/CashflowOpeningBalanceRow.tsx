import type { CashflowRootResponse } from "../cashflow-types";
import { CashflowValueCells } from "./CashflowValueCells";

export function CashflowOpeningBalanceRow({
  periods,
  openingBalances,
}: Pick<CashflowRootResponse, "periods" | "openingBalances">) {
  return (
    <tr className="border-b border-zinc-300 bg-zinc-50">
      <th
        scope="row"
        className="sticky left-0 z-10 min-w-64 border-r border-zinc-300 bg-zinc-50 px-4 py-2.5 text-left font-medium text-zinc-700"
      >
        Opening balance
      </th>
      <CashflowValueCells periods={periods} values={openingBalances} />
    </tr>
  );
}
