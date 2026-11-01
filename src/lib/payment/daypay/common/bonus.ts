import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { calculateBonus } from "@/lib/helpers";

/**
 * Deposit bonus helpers. Moved verbatim from the old
 * api/(payment)/(daypay)/daypay/collection/route.ts so every country's
 * callback can use them. Only change: the bonus message shows the user's
 * wallet currency instead of a hard-coded "BDT".
 */

export const setPayinBonus = async (
  tx: Prisma.TransactionClient,
  userId: string,
  payinAmount: number,
): Promise<void> => {
  const allPayinBonus = await tx.payinBonus.findMany({
    where: { userId },
  });

  const bonusSetting = await tx.bonusSetting.findUnique({
    where: { id: "global" },
  });

  if (!bonusSetting) return;

  const wallet = await tx.wallet.findUnique({
    where: { userId },
    select: { currencyCode: true },
  });
  const currency = wallet?.currencyCode ?? "BDT";

  const now = new Date();

  // Sequential loop safely executes inside the transaction
  for (const bonus of allPayinBonus) {
    if (!bonus.claimedBonus && bonus.isActive && bonus.expiry > now) {
      let bonusAmount = 0;
      let message = "";

      if (bonus.type === "FIRST_PAYIN") {
        bonusAmount = calculateBonus(
          payinAmount,
          bonusSetting.firstPayin,
          bonusSetting.firstPayinUpTo,
        );
        message = "First deposit bonus has been added to your account";
      } else if (bonus.type === "INVITATION") {
        bonusAmount = calculateBonus(
          payinAmount,
          bonusSetting.referPayin,
          bonusSetting.referPayinUpTo,
        );
        message = "Invitation bonus has been added to your account";
      }

      // 1. Deactivate bonus and record claimed amount
      await tx.payinBonus.update({
        where: { id: bonus.id },
        data: { isActive: false, claimedBonus: bonusAmount },
      });

      // 2. Credit wallet and notify user if bonus > 0
      if (bonusAmount > 0) {
        await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: bonusAmount } },
        });

        await tx.message.create({
          data: {
            user: { connect: { id: userId } },
            title: `${bonusAmount} ${currency} Bonus added`,
            description: message,
          },
        });
      }
    }
  }
};

export const setReferBonusToReferer = async (
  tx: Prisma.TransactionClient,
  userId: string,
  payinAmount: number,
) => {
  const deposit = await tx.deposit.findMany({
    where: { userId, status: "ACCEPTED" },
  });
  if (deposit.length > 1) return;

  const userWithReferrer = await db.users.findUnique({
    where: { id: userId },
    select: {
      referredById: true, // Direct ID of the parent Referral record
      referredBy: {
        select: {
          userId: true, // The User ID of the person who referred them
          user: {
            select: {
              id: true,
              referId: true, // Their promo/referral code (e.g., "REF123")
              email: true,
            },
          },
        },
      },
    },
  });

  const referrerUserId = userWithReferrer?.referredBy?.userId;
  if (!referrerUserId) return;

  const bonusSetting = await tx.bonusSetting.findUnique({
    where: { id: "global" },
  });
  if (!bonusSetting) return;

  const invitationCashback = await db.cashback.create({
    data: {
      userId: referrerUserId,
      type: "INVITATION",
      amount: null, // Can be null or updated later
      expiry: null, // Admin will set expiry later when making claimable: true
      hasClaimed: false,
      claimable: false, // Initially false until activated
    },
  });

  if (!invitationCashback) return;

  const bonusAmount = calculateBonus(
    payinAmount,
    bonusSetting.inviationCode,
    bonusSetting.referPayinUpTo,
  );

  if (bonusAmount > 0) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    await tx.cashback.update({
      where: { id: invitationCashback?.id },
      data: {
        amount: bonusAmount,
        hasClaimed: false,
        claimable: true,
        expiry: expiryDate,
      },
    });
    await tx.message.create({
      data: {
        user: { connect: { id: userId } },
        title: `Bonus cashback added`,
        description: "You got new cashback bonus! Please claim this",
      },
    });
  }
};
