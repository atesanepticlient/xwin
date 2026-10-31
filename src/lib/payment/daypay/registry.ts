import { bd, bdRoutes } from "./bd";
import { noEwalletRoutes } from "./common/routes";
import type { CountryCode, CountryModule, RouteSet } from "./common/types";
import { pk, pkRoutes } from "./pk";

/**
 * To add a country: create lib/payment/<code>/ (index.ts, provider.ts, ...),
 * add it here, then add app/api/payment/<code>/{deposit,withdraw}/route.ts.
 */
const COUNTRIES: { module: CountryModule; routes: RouteSet }[] = [
  { module: bd, routes: bdRoutes },
  { module: pk, routes: pkRoutes },
];

const find = (code: CountryCode | null) =>
  code
    ? COUNTRIES.find((c) => c.module.code === code.toUpperCase())
    : undefined;

export const getCountryModule = (
  code: CountryCode | null,
): CountryModule | null => find(code)?.module ?? null;

export const getCountryRoutes = (code: CountryCode | null): RouteSet =>
  find(code)?.routes ?? noEwalletRoutes;
