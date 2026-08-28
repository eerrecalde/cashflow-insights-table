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
    ? node.section === "inflow"
      ? "border-emerald-200 bg-emerald-50/70"
      : "border-rose-200 bg-rose-50/70"
    : "border-zinc-100 bg-white";
  const controlLabel = `${expanded ? "Collapse" : "Expand"} ${node.label}`;

  return (
    <tr className={`border-y transition-colors ${tone}`}>
      <th
        scope="row"
        className={`sticky left-0 z-10 min-w-64 border-r border-inherit bg-inherit py-3 pr-5 text-left ${
          isSection
            ? "font-semibold text-zinc-950"
            : "font-medium text-zinc-800"
        }`}
        style={{ paddingLeft: `${1.25 + depth * 1.5}rem` }}
      >
        {node.hasChildren ? (
          <button
            type="button"
            aria-label={controlLabel}
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 rounded-md text-left underline-offset-4 hover:text-zinc-600 hover:underline focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => onToggle(node)}
          >
            <span
              aria-hidden="true"
              className="grid size-4 place-items-center rounded-sm bg-zinc-200/70 text-[10px] leading-none text-zinc-700"
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
