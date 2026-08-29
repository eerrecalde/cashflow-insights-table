import type { CashflowNode, CashflowRootResponse } from "../cashflow-types";
import { CashflowValueCells } from "./CashflowValueCells";

export function CashflowNodeRow({
  node,
  depth,
  periods,
  expanded,
  onToggle,
}: Pick<CashflowRootResponse, "periods"> & {
  node: CashflowNode;
  depth: number;
  expanded: boolean;
  onToggle: (node: CashflowNode) => void;
}) {
  const isSection = node.kind === "section";
  const tone = isSection
    ? "border-zinc-300 bg-zinc-100"
    : "border-zinc-200 bg-white";
  const controlLabel = `${expanded ? "Collapse" : "Expand"} ${node.label}`;

  return (
    <tr className={`border-b ${tone}`}>
      <th
        scope="row"
        className={`sticky left-0 z-10 min-w-64 border-r border-inherit bg-inherit py-2.5 pr-4 text-left ${
          isSection
            ? "font-semibold tracking-[0.01em] text-zinc-950"
            : "font-medium text-zinc-800"
        }`}
        style={{ paddingLeft: `${1.25 + depth * 1.5}rem` }}
      >
        {node.hasChildren ? (
          <button
            type="button"
            aria-label={controlLabel}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 text-left underline-offset-4 hover:text-zinc-600 hover:underline focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => onToggle(node)}
          >
            <span
              aria-hidden="true"
              className="grid size-3.5 place-items-center text-[11px] leading-none text-zinc-500"
            >
              {expanded ? "▾" : "▸"}
            </span>
            {node.label}
          </button>
        ) : (
          <span>{node.label}</span>
        )}
      </th>
      <CashflowValueCells periods={periods} values={node.values} />
    </tr>
  );
}
