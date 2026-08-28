import { type NextRequest, NextResponse } from "next/server";

import {
  getCashflowChildren,
  getRootCashflowData,
} from "@/features/cashflow/mock-data";

const MOCK_LATENCY_MS = 600;

export async function GET(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const parentId = request.nextUrl.searchParams.get("parentId");
  const data = parentId ? getCashflowChildren(parentId) : getRootCashflowData();

  return NextResponse.json(data);
}
