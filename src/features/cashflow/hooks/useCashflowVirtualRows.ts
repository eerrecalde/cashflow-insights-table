"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";

import type { CashflowTableBodyRow } from "../cashflow-table-rows";

export function useCashflowVirtualRows(
  scrollElementRef: RefObject<HTMLDivElement | null>,
  tableBodyRows: CashflowTableBodyRow[],
) {
  "use no memo";

  // TanStack Virtual exposes a mutable instance, which React Compiler's
  // incompatible-library rule intentionally skips. Keep that supported opt-out
  // local and expose only the current render snapshot to the table.
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
    totalSize: rowVirtualizer.getTotalSize(),
    virtualRows: rowVirtualizer.getVirtualItems(),
  };
}
