"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";

import type { CashflowTableBodyRow } from "../cashflow-table-rows";

export function useCashflowVirtualRows(
  scrollElementRef: RefObject<HTMLDivElement | null>,
  tableBodyRows: CashflowTableBodyRow[],
) {
  // TanStack Virtual exposes a mutable instance. Opt out of React Compiler
  // memoization so getVirtualItems() is reevaluated after scroll updates. The
  // React Hooks integration rule still warns because it cannot verify this
  // local usage; keep virtualizer methods inside this hook and do not disable
  // that rule globally.
  "use no memo";

  const rowVirtualizer = useVirtualizer({
    count: tableBodyRows.length,
    estimateSize: () => 49,
    getItemKey: (index) => {
      const row = tableBodyRows[index];
      return row?.type === "node" ? row.node.id : (row?.id ?? index);
    },
    getScrollElement: () => scrollElementRef.current,
    initialRect: { height: 600, width: 0 },
    overscan: 8,
  });

  return {
    rowVirtualizer,
    virtualRows: rowVirtualizer.getVirtualItems(),
  };
}
