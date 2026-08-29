import { afterEach, describe, expect, it, vi } from "vitest";

import { getMockCashflowResponse, MOCK_CASHFLOW_LATENCY_MS } from "./handler";

afterEach(() => vi.useRealTimers());

describe("getMockCashflowResponse", () => {
  it("delays and returns the root mock response", async () => {
    vi.useFakeTimers();
    const response = getMockCashflowResponse(null);

    await vi.advanceTimersByTimeAsync(MOCK_CASHFLOW_LATENCY_MS);

    await expect(response).resolves.toMatchObject({
      nodes: [
        { id: "inflow", parentId: null },
        { id: "outflow", parentId: null },
      ],
    });
  });

  it("returns only the requested mock parent’s direct children", async () => {
    vi.useFakeTimers();
    const response = getMockCashflowResponse("outflow-people");

    await vi.advanceTimersByTimeAsync(MOCK_CASHFLOW_LATENCY_MS);

    await expect(response).resolves.toEqual({
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
