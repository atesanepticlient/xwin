import type { CountryCode, MethodKey, PaymentFlow, ProviderKey } from "./types";

/**
 * Which e-wallet brands exist in which country, and which provider handles
 * each brand. This is the ONLY place that needs editing to move a brand to a
 * different provider or to add a new country/brand.
 *
 * Crypto is not listed here: it is available in every country.
 */
export interface MethodDef {
  key: MethodKey;
  label: string;
  /** Lower-case, letters/digits only; matched against the wallet row name. */
  match: string[];
  providers: Record<PaymentFlow, ProviderKey>;
}

export const COUNTRY_METHODS: Record<CountryCode, MethodDef[]> = {
  BD: [
    { key: "bkash", label: "bKash", match: ["bkash"], providers: { deposit: "beidou", withdraw: "beidou" } },
    { key: "nagad", label: "Nagad", match: ["nagad"], providers: { deposit: "beidou", withdraw: "beidou" } },
    { key: "rocket", label: "Rocket", match: ["rocket"], providers: { deposit: "beidou", withdraw: "beidou" } },
    // Upay: Beidou has no Upay payType yet. Until you add one in providers/beidou.ts
    // (PAY_TYPE), Upay answers "isn't wired up yet", same as your old UI did.
    { key: "upay", label: "Upay", match: ["upay"], providers: { deposit: "beidou", withdraw: "beidou" } },
  ],
  PK: [
    { key: "jazzcash", label: "JazzCash", match: ["jazzcash"], providers: { deposit: "pk-demo", withdraw: "pk-demo" } },
    { key: "easypaisa", label: "EasyPaisa", match: ["easypaisa", "easypesa"], providers: { deposit: "pk-demo", withdraw: "pk-demo" } },
  ],
};

export const normaliseName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getCountryMethods = (country: CountryCode | null): MethodDef[] =>
  country ? (COUNTRY_METHODS[country.toUpperCase()] ?? []) : [];

/** Match a wallet row name ("bKash Personal", "Easy Paisa") to a method of that country. */
export function findMethodForCountry(
  country: CountryCode | null,
  walletName: string,
): MethodDef | null {
  const n = normaliseName(walletName);
  return (
    getCountryMethods(country).find((m) => m.match.some((s) => n.includes(s))) ??
    null
  );
}

export const hasEwalletCountry = (country: CountryCode | null) =>
  getCountryMethods(country).length > 0;
