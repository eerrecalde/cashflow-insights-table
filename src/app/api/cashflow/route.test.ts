import { describe, expect, it } from "vitest";

import { NextRequest } from "next/server";

import { cashflowCacheControl } from "./cache";
import { GET } from "./route";

describe("GET /api/cashflow", () => {
  it("returns the cacheable root contract", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/cashflow"),
    );

    expect(response.headers.get("Cache-Control")).toBe(cashflowCacheControl);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        periods: expect.any(Array),
        openingBalances: expect.any(Object),
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: "inflow", parentId: null }),
          expect.objectContaining({ id: "outflow", parentId: null }),
        ]),
      }),
    );
  });

  it("returns the cacheable direct-child contract for a stable parent URL", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/cashflow?parentId=outflow-people"),
    );

    expect(response.headers.get("Cache-Control")).toBe(cashflowCacheControl);
    await expect(response.json()).resolves.toEqual({
      nodes: [
        expect.objectContaining({
          id: "outflow-salaries",
          parentId: "outflow-people",
        }),
        expect.objectContaining({
          id: "outflow-contractors",
          parentId: "outflow-people",
        }),
      ],
    });
  });
});
