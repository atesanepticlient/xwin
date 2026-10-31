import type { NextRequest } from "next/server";
import type { findCurrentUser } from "@/data/user";

export type PaymentFlow = "deposit" | "withdraw";

/** ISO 3166-1 alpha-2, upper-case ("BD", "PK") */
export type CountryCode = string;

/** One key per e-wallet brand. Add a key here when you add a new brand. */
export type MethodKey =
  | "bkash"
  | "nagad"
  | "upay"
  | "rocket"
  | "jazzcash"
  | "easypaisa";

export type ProviderKey = "beidou" | "pk-demo";

export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof findCurrentUser>>
>;

/** Normalised view of a DepositEWallet / WithdrawEWallet row. */
export interface WalletRow {
  id: string;
  walletName: string;
  image: string;
  isActive: boolean;
  isRecommended: boolean;
  category: "MOBILE_BANKING" | "CRYPTO";
  min: number;
  max: number;
  crypto: null | {
    currencyCode: string;
    network: string;
    address: string;
    qrCodeImage: string | null;
    memo: string | null;
  };
}

export interface PaymentContext {
  req: NextRequest;
  user: CurrentUser;
  ip: string;
  /** Resolved payment country, null when the account has no e-wallet country. */
  country: CountryCode | null;
  currency: string | null;
  /** Parsed JSON body (empty object for GET). */
  body: Record<string, unknown>;
  /** Set by the root route after it already loaded the wallet row. */
  wallet?: WalletRow;
}

export interface FlowHandlers {
  get(ctx: PaymentContext): Promise<Response>;
  post(ctx: PaymentContext): Promise<Response>;
}

export interface RouteSet {
  deposit: FlowHandlers;
  withdraw: FlowHandlers;
}

/* ---------- provider adapter contract ---------- */

export interface ProviderRequest {
  ctx: PaymentContext;
  method: MethodKey;
  wallet: WalletRow;
  /** Amount in the user's wallet currency. */
  amount: number;
  /** Withdraw destination number / deposit payer number. */
  account?: string;
}

export interface ProviderResult {
  ok: boolean;
  /** HTTP status to use when ok === false. */
  status?: number;
  message?: string;
  /** Where the user is sent to finish the payment (hosted checkout). */
  redirectUrl?: string;
  /** True for placeholder providers that do not move money. */
  demo?: boolean;
}

export interface PaymentProvider {
  key: ProviderKey;
  /** Demo providers never debit the wallet and never persist anything. */
  isDemo?: boolean;
  deposit(req: ProviderRequest): Promise<ProviderResult>;
  withdraw(req: ProviderRequest): Promise<ProviderResult>;
}
