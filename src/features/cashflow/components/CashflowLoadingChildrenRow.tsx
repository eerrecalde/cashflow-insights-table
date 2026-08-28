export function CashflowLoadingChildrenRow({
  depth,
  periodCount,
}: {
  depth: number;
  periodCount: number;
}) {
  return (
    <tr
      aria-live="polite"
      role="status"
      className="border-b border-zinc-100 bg-white text-zinc-500"
    >
      <td
        className="sticky left-0 z-10 border-r border-zinc-100 bg-white py-3 pr-5 text-sm"
        style={{ paddingLeft: `${1.25 + (depth + 1) * 1.5}rem` }}
      >
        Loading categories…
      </td>
      <td colSpan={periodCount} />
    </tr>
  );
}
