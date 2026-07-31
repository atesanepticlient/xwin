import { Prisma } from "@prisma/client";
import { db } from "./db";

export type ActionResult =
  | {
      success: false;
      code: number;
      message: string;
    }
  | {
      success: true;
      execute: (tx: Prisma.TransactionClient) => Promise<ActionResult | void>;
    };

export const errorResult = (code: number, message: string): ActionResult => ({
  success: false,
  code,
  message,
});

export const successResult = (
  execute: (tx: Prisma.TransactionClient) => Promise<ActionResult | void>,
): ActionResult => ({
  success: true,
  execute,
});

export const rollback = async ({
  userId,
  amount,
  betAmount,
  roundId,
}: {
  id: string;
  wagerCode?: string;
  roundId?: string;
  userId: string;
  amount: number;
  betAmount: number;
}): Promise<ActionResult> => {
  const existingBet = await db.bettingRecord.findFirst({
    where: {
      // orderNo: id,
      roundId,
      status: "SETTLED",
    },
  });

  if (!existingBet) {
    return errorResult(1006, "API bet does not exist");
  }

  const type = amount > 0 ? "Positive" : amount < 0 ? "Negative" : "Zero";
  const absAmount = Math.abs(amount);

  if (type === "Negative") {
    const wallet = await db.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || Number(wallet.balance) < absAmount) {
      return errorResult(1001, "API member balance is insufficient");
    }
  }

  return successResult(async (tx) => {
    try {
      const updateWallet: Prisma.walletUpdateInput = {};
      const updateBettingRecord: Prisma.BettingRecordUpdateInput = {};

      if (type === "Positive") {
        // DB wallet operation always uses the absolute value — the sign is
        // only used to decide increment vs decrement, never passed through
        // directly, so a mis-signed `amount` can't flip the direction.
        updateWallet.balance = { increment: absAmount };
        updateBettingRecord.profileNLoss = amount;
      } else {
        updateWallet.balance = { decrement: absAmount };
      }

      await tx.wallet.update({
        where: { userId },
        data: updateWallet,
      });
      await tx.bettingRecord.update({
        where: { id: existingBet.id },
        data: updateBettingRecord,
      });
    } catch {
      return errorResult(999, "Internal Server Error 1");
    }
  });
};

export const placeBet = async ({
  id,
  wagerCode,
  roundId,
  userId,
  amount,
  category,
  name,
}: {
  id: string;
  wagerCode: string;
  roundId: string;
  userId: string;
  amount: number;
  category: any;
  name: string;
}): Promise<ActionResult> => {
  const existingTrx = await db.bettingRecord.findFirst({
    where: {
      roundId,
    },
  });

  if (existingTrx) {
    return errorResult(1003, "Duplicate API transactions");
  }

  const absAmount = Math.abs(amount);

  const wallet = await db.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || Number(wallet.balance) < absAmount) {
    return errorResult(1001, "API member balance is insufficient");
  }
  return successResult(async (tx) => {
    try {
      await tx.bettingRecord.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          orderNo: id,
          wagerCode,
          roundId,
          status: "RUNNING",
          betAmount: absAmount,
          category,
          name,
        },
      });
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: absAmount,
          },
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 2");
    }
  });
};

export const getTip = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  const wallet = await db.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || Number(wallet.balance) < absAmount) {
    return errorResult(1001, "API member balance is insufficient");
  }

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: absAmount,
          },
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 3");
    }
  });
};

export const cancelBet = async ({
  amount,
  userId,
  roundId,
}: {
  id: string;
  amount: number;
  userId: string;
  roundId: string;
}): Promise<ActionResult> => {
  const existingBet = await db.bettingRecord.findFirst({
    where: {
      // orderNo: id,
      roundId,
    },
  });

  if (!existingBet) {
    return errorResult(1006, "API bet does not exist");
  }

  if (existingBet.status == "CANCELED") {
    return errorResult(1003, "Duplicate API transactions");
  }

  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.bettingRecord.update({
        where: { id: existingBet.id },
        data: {
          status: "CANCELED",
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 4");
    }
  });
};

export const adjustment = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const type = amount > 0 ? "Positive" : amount < 0 ? "Negative" : "Zero";
  const absAmount = Math.abs(amount);

  if (type === "Negative") {
    const wallet = await db.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || Number(wallet.balance) < absAmount) {
      return errorResult(1001, "API member balance is insufficient");
    }
  }

  return successResult(async (tx) => {
    try {
      const updateWallet: Prisma.walletUpdateInput = {};

      if (type === "Positive") {
        updateWallet.balance = { increment: absAmount };
      } else {
        updateWallet.balance = { decrement: absAmount };
      }

      await tx.wallet.update({
        where: { userId },
        data: updateWallet,
      });
    } catch {
      return errorResult(999, "Internal Server Error 5");
    }
  });
};

export const freeBet = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.message.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          title: "Free bet Bonus",
          description: "You have received Freebet Bonus",
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 6");
    }
  });
};

export const jackPot = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.message.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          title: "Jackpot Bonus",
          description: "You have received Jackpot Bonus",
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 7");
    }
  });
};

export const bonus = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.message.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          title: "Bonus added",
          description: "You have Bonus",
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 8");
    }
  });
};

export const promo = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.message.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          title: "Bonus added",
          description: "You have Bonus",
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 9");
    }
  });
};

export const leaderboardReward = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.message.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          title: "Loaderboard reward",
          description: "You have Bonus",
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 10");
    }
  });
};

export const settled = async ({
  roundId,
  amount,
  userId,
  betAmount,
}: {
  id: string;
  roundId: string;
  amount: number;
  userId: string;
  betAmount: number;
}): Promise<ActionResult> => {
  const existingBet = await db.bettingRecord.findFirst({
    where: {
      // orderNo: id,
      roundId,
    },
  });

  if (!existingBet) {
    return errorResult(1006, "API bet does not exist");
  }

  if (existingBet.status == "SETTLED") {
    return errorResult(1003, "Duplicate API transactions");
  }

  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
      await tx.bettingRecord.update({
        where: {
          id: existingBet.id,
        },
        data: {
          status: "SETTLED",
          // Profit/loss reporting keeps the signed amount so a loss (0
          // prize) still nets out correctly against betAmount.
          profileNLoss: amount,
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 11");
    }
  });
};

export const betPreserve = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  const wallet = await db.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || Number(wallet.balance) < absAmount) {
    return errorResult(1001, "API member balance is insufficient");
  }

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: absAmount,
          },
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 12");
    }
  });
};

export const betPreserveRefund = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<ActionResult> => {
  const absAmount = Math.abs(amount);

  return successResult(async (tx) => {
    try {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: absAmount,
          },
        },
      });
    } catch {
      return errorResult(999, "Internal Server Error 13");
    }
  });
};
