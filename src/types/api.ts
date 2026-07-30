import { Game } from "@/provider/type";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface GetBalanceInput {
  userName: string;
  cur: string;
}

export interface GetBalanceOutput {
  userName: string;
  cur: string;
  amt: Decimal;
  Err: string;
}

enum GamesTypes {
  Ba = "Ba",
  BC = "BC",
  Bi = "Bi",
  Bl = "Bl",
  Dc = "Dc",
  Dt = "Dt",
  Ft = "Ft",
  Ro = "Ro",
  Sd = "Sd",
  AH = "AH",
  BG = "BG",
  BP = "BP",
  BU = "BU",
  CL = "CL",
  MW = "MW",
  PD = "PD",
  RN = "RN",
  SL = "SL",
}
export interface FundTransferInput {
  userName: string;
  cur: string;
  amt: Decimal;
  requestId: number;
  cwTransId: number;
  transType: string;
  gameType: GamesTypes;
  commBaseAmt?: number;
  reverseRequestId?: number;
  accountDateTime: string;
  jackpotBetAmt: number;
}

export interface DepostisMethods {
  methodName: string;
  wallets:
    | Prisma.DepositEWalletGetPayload<object>[]
    | Prisma.DepositEWalletGetPayload<object>[];
}
export interface WithdrawMethods {
  methodName: string;
  wallets:
    | Prisma.DepositEWalletGetPayload<object>[]
    | Prisma.DepositEWalletGetPayload<object>[];
}

export interface PaymentDataOutput {
  payload: {
    withdraw: WithdrawMethods[];
    deposit: DepostisMethods[];
  };
}

export interface MakeDepositInput {
  payFrom: string;
  amount: number;
  transactionId: string;
  walletId: string;
}

export interface MakeWithdrawInput {
  payTo: string;
  amount: number;
  walletId: string;
}

export interface TransactionsOutput {
  payload: {
    withdraws: Prisma.WithdrawGetPayload<{
      include: { withdrawEWallet: true };
    }>[];
    deposits: Prisma.DepositGetPayload<{
      include: { ewallet: true };
    }>[];
  };
}

export interface MessageOutput {
  payload: Prisma.MessageGetPayload<object>[];
}

export interface CasinoGamesOutput {
  payload: {
    errorCode: string;
    games: Game[];
  };
}

export interface WalletBase {
  id: string;
  name: string;
  label: string;
  image: string;
  isActive: boolean;
  isRecommended: boolean;
  category: "MOBILE_BANKING" | "CRYPTO";
}

export interface CryptoWalletInfo {
  currencyCode: string;
  network: string;
  address: string;
  qrCodeImage?: string | null;
  memo?: string | null;
}

export interface DepositWallet extends WalletBase {
  minDeposit: number;
  maxDeposit: number;
  crypto?: CryptoWalletInfo;
}
export interface TransactionItem {
  id: string;
  kind: "DEPOSIT" | "WITHDRAW";
  amount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  merchantId: string;
  method: "MOBILE_BANKING" | "CRYPTO" | null;
  walletName: string | null;
  reference: string | null;
  createdAt: string;
}

export interface TransactionStatsBreakdown {
  counts: { PENDING: number; ACCEPTED: number; REJECTED: number };
  total: number;
  totalAmount: number;
}

export interface TransactionsResponse {
  items: TransactionItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  stats: {
    deposit: TransactionStatsBreakdown;
    withdraw: TransactionStatsBreakdown;
    pendingCount: number;
  };
}

export interface TransactionFilters {
  type: "all" | "deposit" | "withdraw";
  status: "all" | "PENDING" | "ACCEPTED" | "REJECTED";
  method: "all" | "MOBILE_BANKING" | "CRYPTO";
  from?: string;
  to?: string;
  search?: string;
  page: number;
}
