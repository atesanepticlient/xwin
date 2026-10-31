import { createCountryRoutes, noEwalletRoutes } from "./routes";
import type { CountryCode, RouteSet } from "./types";

/**
 * country code -> its route set. To add a country: add it to catalog.ts and
 * to this map, then add app/api/payment/<code>/{deposit,withdraw}/route.ts.
 */
export const bdRoutes = createCountryRoutes("BD");
export const pkRoutes = createCountryRoutes("PK");

const COUNTRY_ROUTES: Record<CountryCode, RouteSet> = {
  BD: bdRoutes,
  PK: pkRoutes,
};

export const getCountryRoutes = (country: CountryCode | null): RouteSet =>
  (country && COUNTRY_ROUTES[country.toUpperCase()]) || noEwalletRoutes;
