import type {
  CashflowChildrenResponse,
  CashflowRootResponse,
} from "@/features/cashflow/cashflow-types";
import { getCashflowChildren, getRootCashflowData } from "./mock-data";

export const MOCK_CASHFLOW_LATENCY_MS = 600;

/**
 * Simulates the HTTP service until a real cashflow backend is available.
 * The table feature never imports this module; it consumes the API contract.
 */
export function getMockCashflowResponse(
  parentId: null,
): Promise<CashflowRootResponse>;
export function getMockCashflowResponse(
  parentId: string,
): Promise<CashflowChildrenResponse>;
export function getMockCashflowResponse(
  parentId: string | null,
): Promise<CashflowRootResponse | CashflowChildrenResponse>;
export async function getMockCashflowResponse(
  parentId: string | null,
): Promise<CashflowRootResponse | CashflowChildrenResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_CASHFLOW_LATENCY_MS));

  return parentId ? getCashflowChildren(parentId) : getRootCashflowData();
}
