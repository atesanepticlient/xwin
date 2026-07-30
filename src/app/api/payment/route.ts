import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const LIVVBET_CASH_ICON =
  "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1749203759/dollars_bhgsma.png";

export const GET = async () => {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user's agent status and currency in parallel
    const [agentData, userWallet] = await Promise.all([
      (user as { agentId?: string | null }).agentId !== undefined
        ? Promise.resolve({
            agentId: (user as { agentId?: string | null }).agentId,
          })
        : db.users.findUnique({
            where: { id: user.id },
            select: { agentId: true },
          }),
      db.wallet.findFirst({
        where: { userId: user.id },
        select: { currencyCode: true },
      }),
    ]);

    const hasAgent = Boolean(agentData?.agentId);
    const userCurrency = userWallet?.currencyCode?.toUpperCase();
    const isBDT = userCurrency === "BDT";

    // 2. Query ALL active deposit and withdraw options (no category filtering at DB level)
    const [depositWallets, withdrawWallets] = await Promise.all([
      db.depositEWallet.findMany({
        where: { isActive: true },
        orderBy: { isRecommended: "desc" },
        include: { cryptoWallet: true },
      }),
      db.withdrawEWallet.findMany({
        where: { isActive: true },
        orderBy: { isRecommended: "desc" },
      }),
    ]);

    // Helper: Apply BDT restriction ONLY to MOBILE_BANKING category
    const filterByMobileBankingRule = <T extends { category: string }>(
      wallets: T[],
    ) =>
      wallets.filter((wallet) => {
        if (wallet.category === "MOBILE_BANKING") {
          return isBDT; // MOBILE_BANKING requires BDT
        }
        return true; // Non-MOBILE_BANKING options (CRYPTO, etc.) are always allowed
      });

    // 3. Format Deposit Payload
    const depositPayload = filterByMobileBankingRule(depositWallets).map(
      (w) => ({
        id: w.id,
        name: w.walletName,
        label: w.walletName,
        image: w.walletImage,
        minDeposit: w.minDeposit,
        maxDeposit: w.maxDeposit,
        isActive: w.isActive,
        isRecommended: w.isRecommended,
        category: w.category,
        ...(w.category === "CRYPTO" && w.cryptoWallet
          ? {
              crypto: {
                currencyCode: w.cryptoWallet.currencyCode,
                network: w.cryptoWallet.network,
                address: w.cryptoWallet.address,
                qrCodeImage: w.cryptoWallet.qrCodeImage,
                memo: w.cryptoWallet.memo,
              },
            }
          : {}),
      }),
    );

    // 4. Format Withdraw Payload
    const withdrawBase = filterByMobileBankingRule(withdrawWallets).map(
      (w) => ({
        id: w.id,
        name: w.walletName,
        label: w.walletName,
        image: w.walletImage,
        minWithdraw: w.minWithdraw,
        maxWithdraw: w.maxWithdraw,
        isActive: hasAgent ? false : w.isActive,
        isRecommended: w.isRecommended,
        category: w.category,
      }),
    );

    const livvbetCash = {
      id: "livvbet-cash",
      name: "Livvbet Cash",
      label: "Livvbet Cash",
      type: "cash",
      isActive: hasAgent,
      image: LIVVBET_CASH_ICON,
      isRecommended: false,
    };

    // 5. Build category groups dynamically (filtering out empty categories)
    const depositCategories = [
      {
        methodName: "Recommended",
        wallets: depositPayload.filter((w) => w.isRecommended),
      },
      {
        methodName: "E-Wallet",
        wallets: depositPayload.filter((w) => w.category === "MOBILE_BANKING"),
      },
      {
        methodName: "Crypto",
        wallets: depositPayload.filter((w) => w.category === "CRYPTO"),
      },
    ].filter((cat) => cat.wallets.length > 0);

    const withdrawCategories = [
      {
        methodName: "Recommended",
        wallets: withdrawBase.filter((w) => w.isRecommended),
      },
      {
        methodName: "E-Wallet",
        wallets: withdrawBase.filter((w) => w.category === "MOBILE_BANKING"),
      },
      {
        methodName: "Crypto",
        wallets: withdrawBase.filter((w) => w.category === "CRYPTO"),
      },
      {
        methodName: "Livvbet Cash",
        wallets: [livvbetCash],
      },
    ].filter((cat) => cat.wallets.length > 0);

    return NextResponse.json(
      {
        payload: {
          deposit: depositCategories,
          withdraw: withdrawCategories,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Payment Methods API Error:",
      error instanceof Error ? error.stack || error.message : error,
    );
    return NextResponse.json(
      { message: INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
};
