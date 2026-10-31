import { db } from "@/lib/db";
import { findMethodForCountry } from "./catalog";
import type { CountryCode, PaymentFlow, WalletRow } from "./types";

const cryptoOf = (c: {
  currencyCode: string;
  network: string;
  address: string;
  qrCodeImage: string | null;
  memo: string | null;
} | null | undefined) =>
  c
    ? {
        currencyCode: c.currencyCode,
        network: c.network,
        address: c.address,
        qrCodeImage: c.qrCodeImage,
        memo: c.memo,
      }
    : null;

/** Load one wallet row (deposit or withdraw table) as a normalised WalletRow. */
export async function loadWallet(
  flow: PaymentFlow,
  id: string,
): Promise<WalletRow | null> {
  if (!id) return null;

  if (flow === "deposit") {
    const w = await db.depositEWallet.findUnique({
      where: { id },
      include: { cryptoWallet: true },
    });
    if (!w) return null;
    return {
      id: w.id,
      walletName: w.walletName,
      image: w.walletImage,
      isActive: w.isActive,
      isRecommended: w.isRecommended,
      category: w.category,
      min: Number(w.minDeposit),
      max: Number(w.maxDeposit),
      crypto: cryptoOf(w.cryptoWallet),
    };
  }

  const w = await db.withdrawEWallet.findUnique({ where: { id } });
  if (!w) return null;
  return {
    id: w.id,
    walletName: w.walletName,
    image: w.walletImage,
    isActive: w.isActive,
    isRecommended: w.isRecommended,
    category: w.category,
    min: Number(w.minWithdraw),
    max: Number(w.maxWithdraw),
    crypto: null,
  };
}

/** All active rows of one category. */
export async function listWallets(
  flow: PaymentFlow,
  category: "MOBILE_BANKING" | "CRYPTO",
): Promise<WalletRow[]> {
  if (flow === "deposit") {
    const rows = await db.depositEWallet.findMany({
      where: { isActive: true, category },
      orderBy: { isRecommended: "desc" },
      include: { cryptoWallet: true },
    });
    return rows.map((w) => ({
      id: w.id,
      walletName: w.walletName,
      image: w.walletImage,
      isActive: w.isActive,
      isRecommended: w.isRecommended,
      category: w.category,
      min: Number(w.minDeposit),
      max: Number(w.maxDeposit),
      crypto: cryptoOf(w.cryptoWallet),
    }));
  }

  const rows = await db.withdrawEWallet.findMany({
    where: { isActive: true, category },
    orderBy: { isRecommended: "desc" },
  });
  return rows.map((w) => ({
    id: w.id,
    walletName: w.walletName,
    image: w.walletImage,
    isActive: w.isActive,
    isRecommended: w.isRecommended,
    category: w.category,
    min: Number(w.minWithdraw),
    max: Number(w.maxWithdraw),
    crypto: null,
  }));
}

/**
 * E-wallet rows that really belong to this country. A row whose name is not
 * in the country's catalog is hidden (it cannot be processed anyway).
 */
export async function listCountryEwallets(
  flow: PaymentFlow,
  country: CountryCode | null,
): Promise<WalletRow[]> {
  if (!country) return [];
  const rows = await listWallets(flow, "MOBILE_BANKING");
  return rows.filter((w) => findMethodForCountry(country, w.walletName));
}

/** Same JSON shape the old /api/payment returned, so the UI store keeps working. */
export function toClientWallet(
  flow: PaymentFlow,
  w: WalletRow,
  opts: { country: CountryCode | null; hasAgent: boolean },
) {
  const method =
    w.category === "MOBILE_BANKING"
      ? findMethodForCountry(opts.country, w.walletName)
      : null;

  const base = {
    id: w.id,
    name: w.walletName,
    label: w.walletName,
    image: w.image,
    isRecommended: w.isRecommended,
    category: w.category,
    methodKey: method?.key ?? null,
  };

  if (flow === "deposit") {
    return {
      ...base,
      minDeposit: w.min,
      maxDeposit: w.max,
      isActive: w.isActive,
      ...(w.category === "CRYPTO" && w.crypto ? { crypto: w.crypto } : {}),
    };
  }
  return {
    ...base,
    minWithdraw: w.min,
    maxWithdraw: w.max,
    // Agent-linked users cash out through the agent, not through rails.
    isActive: opts.hasAgent ? false : w.isActive,
  };
}
