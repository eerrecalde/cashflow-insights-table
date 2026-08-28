const currencyFormatter = new Intl.NumberFormat("en-GB", {
  currency: "GBP",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: "currency",
});

export function formatCashflowValue(value: number) {
  return currencyFormatter.format(value);
}
