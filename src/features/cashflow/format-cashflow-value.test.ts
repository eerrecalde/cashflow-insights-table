import { describe, expect, it } from "vitest";

import { formatCashflowValue } from "./format-cashflow-value";

describe("formatCashflowValue", () => {
  it("formats whole GBP values with the expected sign and separators", () => {
    expect(formatCashflowValue(1234567)).toBe("£1,234,567");
    expect(formatCashflowValue(-1250)).toBe("-£1,250");
  });
});
