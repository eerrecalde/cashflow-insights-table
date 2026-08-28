"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchCashflowChildren, fetchRootCashflowData } from "./cashflow-api";

export const cashflowRootQuery = queryOptions({
  queryKey: ["cashflow", "root"] as const,
  queryFn: fetchRootCashflowData,
  staleTime: 30_000,
});

export function useCashflowData() {
  return useQuery(cashflowRootQuery);
}

export function cashflowChildrenQuery(parentId: string) {
  return queryOptions({
    queryKey: ["cashflow", "children", parentId] as const,
    queryFn: () => fetchCashflowChildren(parentId),
    staleTime: 30_000,
  });
}
