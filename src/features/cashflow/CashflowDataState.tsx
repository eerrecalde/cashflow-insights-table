"use client";

import { useCashflowData } from "./useCashflowData";
import { CashflowTable } from "./CashflowTable";

function LoadingState() {
  return (
    <section aria-busy="true" aria-live="polite" className="space-y-4">
      <div className="h-7 w-52 animate-pulse rounded bg-zinc-200" />
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="h-12 animate-pulse border-b border-zinc-200 bg-zinc-100" />
        <div className="space-y-3 p-4">
          <div className="h-5 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-5 w-11/12 animate-pulse rounded bg-zinc-100" />
          <div className="h-5 w-10/12 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
      <p className="text-sm text-zinc-600">Loading cashflow data…</p>
    </section>
  );
}

export function CashflowDataState() {
  const { data, error, isPending, refetch } = useCashflowData();

  if (isPending) return <LoadingState />;

  if (error) {
    return (
      <section
        aria-live="assertive"
        className="rounded-lg border border-red-200 bg-red-50 p-5"
      >
        <h1 className="font-semibold text-red-950">
          Cashflow data is unavailable
        </h1>
        <p className="mt-1 text-sm text-red-800">
          Please try loading the table again.
        </p>
        <button
          type="button"
          className="mt-4 rounded-md bg-red-950 px-3 py-2 text-sm font-medium text-white"
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </section>
    );
  }

  return <CashflowTable {...data} />;
}
