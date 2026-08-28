import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CashflowApiError,
  fetchCashflowChildren,
  fetchRootCashflowData,
} from "./cashflow-api";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

describe("cashflow API fetchers", () => {
  it("fetches the typed root endpoint", async () => {
    const payload = { periods: [], openingBalances: {}, nodes: [] };
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    await expect(fetchRootCashflowData()).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith("/api/cashflow");
  });

  it("encodes a parent ID when requesting direct children", async () => {
    const payload = { nodes: [] };
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    await expect(fetchCashflowChildren("parent / id")).resolves.toEqual(
      payload,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cashflow?parentId=parent+%2F+id",
    );
  });

  it("throws a useful error for failed responses", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });

    await expect(fetchRootCashflowData()).rejects.toEqual(
      expect.objectContaining<CashflowApiError>({
        name: "CashflowApiError",
        message: "Cashflow data could not be loaded (status 503).",
      }),
    );
  });
});
