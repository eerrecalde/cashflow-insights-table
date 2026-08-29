import { type NextRequest, NextResponse } from "next/server";

import { getMockCashflowResponse } from "@/mocks/cashflow/handler";

export async function GET(request: NextRequest) {
  const parentId = request.nextUrl.searchParams.get("parentId");

  return NextResponse.json(await getMockCashflowResponse(parentId));
}
