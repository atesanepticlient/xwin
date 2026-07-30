import { PrismaClient, WalletCategory } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------
// 1. Wallet Catalogue
// ---------------------------------------------------------------------

const MOBILE_BANKING = [
  {
    walletName: "bKash",
    walletImage:
      "https://static.freepnglogo.com/images/all_img/1701541855%E0%A6%AC%E0%A6%BF%E0%A6%95%E0%A6%BE%E0%A6%B6-%E0%A6%B2%E0%A6%97%E0%A7%8B.png",
    isRecommended: true,
    isActive: true,
    minDeposit: 100,
    maxDeposit: 25000,
    minWithdraw: 100,
    maxWithdraw: 25000,
  },
  {
    walletName: "Nagad",
    walletImage: "https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png",
    isRecommended: true,
    isActive: true,
    minDeposit: 100,
    maxDeposit: 30000,
    minWithdraw: 100,
    maxWithdraw: 30000,
  },
  {
    walletName: "Rocket",
    walletImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rocket_mobile_banking_logo.svg/3840px-Rocket_mobile_banking_logo.svg.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 100,
    maxDeposit: 20000,
    minWithdraw: 100,
    maxWithdraw: 20000,
  },
];

const CRYPTO = [
  {
    walletName: "Bitcoin (BTC)",
    currencyCode: "BTC",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png",
    isRecommended: true,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only BTC on the Bitcoin network to this address.",
    depositNumberOrAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Bitcoin",
  },
  {
    walletName: "Ethereum (ETH)",
    currencyCode: "ETH",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
    isRecommended: true,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only ETH on the Ethereum (ERC20) network to this address.",
    depositNumberOrAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976",
    network: "ERC20",
  },
  {
    walletName: "Tether (USDT)",
    currencyCode: "USDT",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png",
    isRecommended: true,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules:
      "Send only USDT on the BEP20 (BSC) network to this address. Do not use TRC20 or ERC20.",
    depositNumberOrAddress: "0x35Fc65A6B6b0A0F5f78ce1E0aDBb1D1D5B6b6b6b",
    network: "BEP20",
  },
  {
    walletName: "BNB",
    currencyCode: "BNB",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only BNB on the BEP20 (BSC) network to this address.",
    depositNumberOrAddress: "bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23",
    network: "BEP20",
  },
  {
    walletName: "Ripple (XRP)",
    currencyCode: "XRP",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules:
      "Send only XRP to this address. A destination tag may be required — contact support before sending.",
    depositNumberOrAddress: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
    network: "XRP Ledger",
    memo: "Contact support for destination tag",
  },
  {
    walletName: "Cardano (ADA)",
    currencyCode: "ADA",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only ADA on the Cardano network to this address.",
    depositNumberOrAddress:
      "addr1q9u5w3g3n8f9z8f9z8f9z8f9z8f9z8f9z8f9z8f9z8f9z8f9z8f9z8f",
    network: "Cardano",
  },
  {
    walletName: "Solana (SOL)",
    currencyCode: "SOL",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png",
    isRecommended: true,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only SOL on the Solana network to this address.",
    depositNumberOrAddress: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2Kv1r",
    network: "Solana",
  },
  {
    walletName: "Dogecoin (DOGE)",
    currencyCode: "DOGE",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/doge.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only DOGE on the Dogecoin network to this address.",
    depositNumberOrAddress: "D8vFz4p1L37jdg9WPo6ZY2sZTgV7Qgnog2",
    network: "Dogecoin",
  },
  {
    walletName: "TRON (TRX)",
    currencyCode: "TRX",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/trx.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only TRX on the TRON network to this address.",
    depositNumberOrAddress: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
    network: "TRON",
  },
  {
    walletName: "Litecoin (LTC)",
    currencyCode: "LTC",
    walletImage:
      "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ltc.png",
    isRecommended: false,
    isActive: true,
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 100000,
    rules: "Send only LTC on the Litecoin network to this address.",
    depositNumberOrAddress: "ltc1qxyeqrmxr5s4d2rq0m6hz3nt8u9k5s7c3f2j8v9",
    network: "Litecoin",
  },
];

const ALL_WALLETS = [
  ...MOBILE_BANKING.map((w) => ({
    ...w,
    category: WalletCategory.MOBILE_BANKING,
  })),
  ...CRYPTO.map((w) => ({ ...w, category: WalletCategory.CRYPTO })),
];

// ---------------------------------------------------------------------
// 2. Seed DepositEWallet + WithdrawEWallet (+ CryptoWallet for crypto rows)
// ---------------------------------------------------------------------

async function seedCheckoutWallets() {
  const names = ALL_WALLETS.map((w) => w.walletName);

  // CryptoWallet cascades on delete via depositEWalletId relation, so
  // deleting the DepositEWallet rows is enough to clean those up too.
  await prisma.depositEWallet.deleteMany({
    where: { walletName: { in: names } },
  });
  await prisma.withdrawEWallet.deleteMany({
    where: { walletName: { in: names } },
  });

  for (const w of ALL_WALLETS) {
    const depositWallet = await prisma.depositEWallet.create({
      data: {
        walletName: w.walletName,
        walletImage: w.walletImage,
        minDeposit: w.minDeposit,
        maxDeposit: w.maxDeposit,
        isRecommended: w.isRecommended,
        isActive: w.isActive,
        category: w.category,
      },
    });

    await prisma.withdrawEWallet.create({
      data: {
        walletName: w.walletName,
        walletImage: w.walletImage,
        minWithdraw: w.minWithdraw,
        maxWithdraw: w.maxWithdraw,
        isRecommended: w.isRecommended,
        isActive: w.isActive,
        category: w.category,
      },
    });

    // Only crypto entries get a CryptoWallet row, 1:1 with the deposit method.
    if (w.category === WalletCategory.CRYPTO) {
      await prisma.cryptoWallet.create({
        data: {
          currencyCode: w.currencyCode,
          network: w.network,
          address: w.depositNumberOrAddress,
          memo: w.memo || null,
          isActive: w.isActive,
          depositEWalletId: depositWallet.id,
        },
      });
    }
  }

  console.log(
    `✅ Seeded ${ALL_WALLETS.length} DepositEWallet + WithdrawEWallet rows (${CRYPTO.length} with CryptoWallet)`,
  );
}

// ---------------------------------------------------------------------
// 3. Seed generic eWallet + per-agent (AgEWallet) + per-admin (AdEWallet)
// ---------------------------------------------------------------------

async function getOrCreateDemoAgent() {
  const existing = await prisma.agent.findFirst();
  if (existing) return existing;

  return prisma.agent.create({
    data: {
      email: "demo.agent@example.com",
      phone: "01711999999",
      fullName: "Demo Agent",
      password: "CHANGE_ME_HASHED_PASSWORD",
      documents: JSON.stringify({ nidFront: "", nidBack: "", faceVideo: "" }),
      isActive: true,
      isVerified: true,
      isEmailVerified: true,
      promo: "DEMO10",
    },
  });
}

async function getOrCreateDemoAdmin() {
  const existing = await prisma.admin.findFirst();
  if (existing) return existing;

  return prisma.admin.create({
    data: {
      email: "admin@example.com",
      twoFAEmail: "admin.2fa@example.com",
      fullName: "Demo Admin",
      password: "CHANGE_ME_HASHED_PASSWORD",
    },
  });
}

async function seedAgentAndAdminWallets() {
  const agent = await getOrCreateDemoAgent();
  const admin = await getOrCreateDemoAdmin();

  const names = ALL_WALLETS.map((w) => w.walletName);

  const oldEWallets = await prisma.eWallet.findMany({
    where: { walletName: { in: names } },
    select: { id: true },
  });
  const oldIds = oldEWallets.map((e) => e.id);

  if (oldIds.length > 0) {
    await prisma.agEWallet.deleteMany({ where: { eWalletId: { in: oldIds } } });
    await prisma.adEWallet.deleteMany({ where: { eWalletId: { in: oldIds } } });
    await prisma.eWallet.deleteMany({ where: { id: { in: oldIds } } });
  }

  for (const w of ALL_WALLETS) {
    const eWallet = await prisma.eWallet.create({
      data: {
        walletName: w.walletName,
        image: w.walletImage,
      },
    });

    const depositPayload = {
      accountOrAddress: w.depositNumberOrAddress || null,
      network: w.network || null,
      min: w.minDeposit,
      max: w.maxDeposit,
      instructions: w.rules || "Deposit to the registered account.",
    };

    const withdrawPayload = {
      accountOrAddress: w.depositNumberOrAddress || null,
      network: w.network || null,
      min: w.minWithdraw,
      max: w.maxWithdraw,
      instructions: w.network
        ? `Payouts sent on the ${w.network} network.`
        : "Payouts sent to the registered account.",
    };

    await prisma.agEWallet.create({
      data: {
        deposit: depositPayload,
        withdraw: withdrawPayload,
        eWalletId: eWallet.id,
        isRecommended: w.isRecommended,
        isActive: w.isActive,
        agentId: agent.id,
      },
    });

    await prisma.adEWallet.create({
      data: {
        deposit: depositPayload,
        withdraw: withdrawPayload,
        eWalletId: eWallet.id,
        isRecommended: w.isRecommended,
        isActive: w.isActive,
        adminId: admin.id,
      },
    });
  }

  console.log(
    `✅ Seeded ${ALL_WALLETS.length} eWallet rows, linked to agent "${agent.email}" and admin "${admin.email}"`,
  );
}

// ---------------------------------------------------------------------
// 4. Main Execution
// ---------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding payment wallets...");
  await seedCheckoutWallets();
  await seedAgentAndAdminWallets();
  console.log("🎉 Done.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
