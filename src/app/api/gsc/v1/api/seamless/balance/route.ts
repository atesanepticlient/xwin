import { db } from "@/lib/db";
import { accpectedCurrency, generateGSCPlatformSignature } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import pMap from "p-map";

type BatchRequest = {
  member_account: string;
  product_code: number;
};

type BalanceResponse = {
  member_account: string;
  code: number;
  message: string;
  balance: number;
  product_code: number;
};

/**
 * Per GSC+ API appendix "Currency Code":
 * Suffix "2" currencies (e.g. BDT2, IDR2, USD2, THB2, MMK2...) are 1:1000
 * Suffix "3" currencies (e.g. IDR3, MMK3, MYR3, VND3) are 1:100
 * Everything else is 1:1
 *
 * "When the currency ratio is 1:1000 (or 1:100), operators are required to
 * perform the conversion themselves before responding with the balances."
 *
 * Our wallet.balance is always stored in the BASE unit (ratio 1:1), so to
 * respond in the requested scaled currency we must DIVIDE by the ratio.
 */
function getCurrencyRatio(currency: string): number {
  if (/2$/.test(currency)) return 1000;
  if (/3$/.test(currency)) return 100;
  return 1;
}

function toScaledBalance(rawBalance: number, currency: string): number {
  const ratio = getCurrencyRatio(currency);
  return Number((rawBalance / ratio).toFixed(4));
}

export async function POST(req: NextRequest) {
  try {
    let body: {
      operator_code: string;
      currency: string;
      sign: string;
      request_time: string;
      batch_requests: BatchRequest[];
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid JSON body",
        },
        { status: 200 },
      );
    }

    const { operator_code, currency, sign, request_time, batch_requests } =
      body;

    if (
      !operator_code ||
      !currency ||
      !sign ||
      !request_time ||
      !Array.isArray(batch_requests)
    ) {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid Parameters",
        },
        { status: 200 },
      );
    }

    const isValidRequests = batch_requests.every(
      (item) =>
        typeof item.member_account === "string" &&
        typeof item.product_code === "number",
    );

    if (!isValidRequests) {
      return NextResponse.json(
        {
          code: 999,
          message: "Invalid Parameters",
        },
        { status: 200 },
      );
    }

    if (!accpectedCurrency.includes(currency)) {
      return NextResponse.json(
        {
          code: 999,
          message: "Expect currency error",
        },
        { status: 200 },
      );
    }

    let responseData: BalanceResponse[] = batch_requests.map((item) => ({
      member_account: item.member_account,
      product_code: item.product_code,
      code: 0,
      message: "",
      balance: 0,
    }));

    const MEMBER_OP_CODE = process.env.GSC_OPERATOR_CODE!;
    const SECRET_KEY = process.env.GSC_SECRET_KEY!;

    if (operator_code !== MEMBER_OP_CODE) {
      responseData = responseData.map((entry) => ({
        ...entry,
        code: 1002, // API proxy key error (per PDF Seamless wallet code table)
        message: "Invalid Operator code",
      }));

      return NextResponse.json({ data: responseData }, { status: 200 });
    }

    // Per PDF 2.1 Balance: sign = md5(operator_code + request_time + "getbalance" + secret_key)
    const platformSign = generateGSCPlatformSignature(
      request_time,
      SECRET_KEY,
      MEMBER_OP_CODE,
      "getbalance",
    );

    if (platformSign !== sign) {
      responseData = responseData.map((entry) => ({
        ...entry,
        code: 1004,
        message: "API signature is invalid",
      }));

      return NextResponse.json({ data: responseData }, { status: 200 });
    }

    responseData = await pMap(responseData, async (entry) => {
      const user = await db.users.findFirst({
        where: {
          playerId: entry.member_account,
        },
        select: {
          wallet: {
            select: {
              balance: true,
            },
          },
        },
      });

      if (!user) {
        return {
          ...entry,
          code: 1000,
          message: "API member does not exist",
        };
      }

      const rawBalance = Number(user.wallet?.balance);

      return {
        ...entry,
        code: 0,
        message: "",
        // Convert to the requested currency's ratio (e.g. BDT2 -> /1000) and
        // return a NUMBER (not a string), per PDF 2.1 Data.balance spec.
        balance: toScaledBalance(rawBalance, currency),
      };
    });

    return NextResponse.json(
      {
        data: responseData,
        code: 0,
        message: "",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR ON GET_BALANCE API:", error);

    return NextResponse.json(
      {
        code: 999,
        message: "Internal server error",
      },
      { status: 200 },
    );
  }
}
