"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchRootCashflowData } from "./cashflow-api";

export const cashflowRootQuery = queryOptions({
  queryKey: ["cashflow", "root"] as const,
  queryFn: fetchRootCashflowData,
  staleTime: 30_000,
});

export function useCashflowData() {
  return useQuery(cashflowRootQuery);
}
