import type {
  CashflowChildrenResponse,
  CashflowRootResponse,
} from "./cashflow-types";

const CASHFLOW_ENDPOINT = "/api/cashflow";

export class CashflowApiError extends Error {
  constructor(status: number) {
    super(`Cashflow data could not be loaded (status ${status}).`);
    this.name = "CashflowApiError";
  }
}

async function requestCashflow<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) throw new CashflowApiError(response.status);

  return response.json() as Promise<T>;
}

export function fetchRootCashflowData(): Promise<CashflowRootResponse> {
  return requestCashflow<CashflowRootResponse>(CASHFLOW_ENDPOINT);
}

export function fetchCashflowChildren(
  parentId: string,
): Promise<CashflowChildrenResponse> {
  const searchParams = new URLSearchParams({ parentId });

  return requestCashflow<CashflowChildrenResponse>(
    `${CASHFLOW_ENDPOINT}?${searchParams}`,
  );
}
