/**
 * The mock data is deterministic, so browsers and shared caches can reuse a
 * response briefly while still receiving a fresh response after revalidation.
 */
export const cashflowCacheControl =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=600";
