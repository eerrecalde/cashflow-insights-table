import { type NextRequest, NextResponse } from "next/server";

import { getMockCashflowResponse } from "@/mocks/cashflow/handler";

import { cashflowCacheControl } from "./cache";

/**
 * The root URL returns periods, opening balances, and top-level sections.
 * A stable `parentId` URL returns only that parent’s direct child nodes.
 */
export async function GET(request: NextRequest) {
  const parentId = request.nextUrl.searchParams.get("parentId");

  return NextResponse.json(await getMockCashflowResponse(parentId), {
    headers: { "Cache-Control": cashflowCacheControl },
  });
}
