import type { MethodDef } from "./types";

export const normaliseName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Match a wallet row name ("bKash Personal", "Easy Paisa") to one of a country's brands. */
export const findMethod = (
  methods: MethodDef[],
  walletName: string,
): MethodDef | null => {
  const n = normaliseName(walletName);
  return methods.find((m) => m.match.some((s) => n.includes(s))) ?? null;
};
