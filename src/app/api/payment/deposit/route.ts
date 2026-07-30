import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { generateTrxId } from "@/lib/utils";
import { NextRequest } from "next/server";

// export const POST = async (req: NextRequest) => {
//   try {
//     const { amount, transactionId, payFrom, walletId } =
//       (await req.json()) as MakeDepositInput;

//     const user = await findCurrentUser();

//     const depositWallet = await db.depositEWallet.findUnique({
//       where: { id: walletId },
//     });

//     if (!depositWallet) {
//       return Response.json(
//         { message: "Try with another Payment Wallet" },
//         { status: 404 }
//       );
//     }

//     if (amount < +depositWallet.minDeposit) {
//       return Response.json(
//         { message: `Minimum deposit amount ${depositWallet.minDeposit}` },
//         { status: 400 }
//       );
//     }

//     if (amount > +depositWallet.maxDeposit) {
//       return Response.json(
//         { message: `Miximum deposit amount ${depositWallet.maxDeposit}` },
//         { status: 400 }
//       );
//     }

//     const isFirstDeposit =
//       (
//         await db.deposit.findMany({
//           where: { userId: user!.id },
//         })
//       ).length == 0;

//     if (isFirstDeposit) {
//       const site = await db.site.findFirst({
//         where: {},
//         select: { firstDepositBonus: true, turnover: true },
//       });

//       await db.bonusWallet.update({
//         where: {
//           userId: user!.id,
//         },
//         data: {
//           balance: { increment: amount * (+site!.firstDepositBonus! / 100) },
//           turnOver: {
//             increment:
//               amount * (+site!.firstDepositBonus! / 100) * +site!.turnover!,
//           },
//         },
//       });
//     }

//     await db.deposit.create({
//       data: {
//         amount,
//         payFrom,
//         transactionId,
//         ewallet: {
//           connect: {
//             id: walletId,
//           },
//         },
//         user: {
//           connect: {
//             id: user!.id,
//           },
//         },
//       },
//     });

//     return Response.json(
//       { message: "Deposit Successfully Added" },
//       { status: 201 }
//     );
//   } catch {
//     return Response.json({ message: INTERNAL_SERVER_ERROR }, { status: 500 });
//   }
// };

export const POST = async (req: NextRequest) => {
  try {
    const { account_number, amount, ps } = await req.json();
    
    const user = await findCurrentUser();
    if (!user)
      return Response.json(
        { message: "Authentication failed" },
        { status: 401 },
      );

    const return_url = "https://www.livvbet.com";

    let data = {};
    switch (ps) {
      case "bkash_a":
        data = { return_url, account_number: account_number || user.phone };
        break;
      case "nagad_a":
        data = { return_url };
        break;
      case "upay":
        data = { return_url };
        break;
    }

    const trx_id = generateTrxId();

    const response = await fetch(
      `${process.env.APAY_DOMAIN}/Remotes/create-deposit?project_id=${process.env.APAY_PROJECT_ID}`,
      {
        method: "POST",
        headers: {
          apikey: `${process.env.APAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "BDT",
          payment_system: ps,
          custom_transaction_id: trx_id,
          custom_user_id: user.playerId,
          webhook_id: process.env.APAY_WEBHOOK_ID,
          data,
        }),
      },
    );
    const paymentData = await response.json();

    if (!paymentData.success) {
      return Response.json({ message: "Deposit Failed" }, { status: 500 });
    }

    await db.aPayDeposit.create({
      data: {
        orderId: paymentData.order_id,
        trxId: trx_id,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return Response.json(
      { payload: paymentData, success: true },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Deposit API Error:", error.message);
      console.error(error.stack);
    } else {
      console.error("Unknown error:", error);
    }

    return Response.json({ message: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
