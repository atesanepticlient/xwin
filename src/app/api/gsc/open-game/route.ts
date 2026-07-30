import { findCurrentUser } from "@/data/user";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

interface LaunchGameRequest {
  game_code?: string;
  product_code: number;
  game_type: string;
  language_code?: number;
  ip: string;
  platform: "WEB" | "DESKTOP" | "MOBILE";
  widget_id?: string;
  is_widget_login?: boolean;
  operator_lobby_url: string;
}

interface LaunchGameResponse {
  code: number;
  message: string;
  url?: string;
  content?: string;
  widget_url?: string;
  transfer_account?: string;
  transfer_password?: string;
}

function generateSignature(
  requestTime: string,
  secretKey: string,
  operatorCode: string,
  key: string,
): string {
  const signatureString = `${requestTime}${secretKey}${key}${operatorCode}`;
  return createHash("md5").update(signatureString).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.GSC_SECRET_KEY;
    const operatorCode = process.env.GSC_OPERATOR_CODE;
    const operatorUrl = process.env.GSC_BASE_URL;

    // Validate environment variables
    if (!secretKey || !operatorCode || !operatorUrl) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
        },
        { status: 500 },
      );
    }

    const user: any = await findCurrentUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication Failed" },
        { status: 401 },
      );

    // Parse request body
    const body: LaunchGameRequest = await req.json();
    console.log({ body });
    // Validate required fields
    const requiredFields = [
      "product_code",
      "game_type",
      "ip",
      "platform",
      "operator_lobby_url",
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          {
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        );
      }
    }

    // Validate platform enum
    if (!["WEB", "DESKTOP", "MOBILE"].includes(body.platform)) {
      return NextResponse.json(
        {
          error: "Invalid platform. Must be WEB, DESKTOP, or MOBILE",
        },
        { status: 400 },
      );
    }

    // Generate current timestamp (seconds)
    const requestTime = Math.floor(Date.now() / 1000);

    // Generate signature: md5(request_time + secret_key + "launchgame" + operator_code)
    const sign = generateSignature(
      requestTime.toString(),
      secretKey,
      operatorCode,
      "launchgame",
    );

    // const phone = user.phone;
    const password = user.id;
    const nickname = user.name;
    const currency = "IDR";
    const curency2 = "IDR2";

    // Helper to build payload for a given currency
    const buildPayload = (currencyValue: string) => {
      const payload = {
        operator_code: operatorCode,
        member_account: user.playerId,
        password: password,
        nickname: nickname || "",
        currency: currencyValue,
        game_code: body.game_code || null,
        product_code: body.product_code,
        game_type: body.game_type,
        language_code: body.language_code || 0,
        ip: body.ip,
        platform: body.platform,
        // widget_id: body.widget_id || undefined,
        // is_widget_login: body.is_widget_login || false,
        sign,
        request_time: requestTime,
        operator_lobby_url: body.operator_lobby_url,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === undefined &&
          delete payload[key as keyof typeof payload],
      );

      return payload;
    };

    // Helper to call the GSC+ Launch Game API
    const callLaunchGame = async (
      payload: ReturnType<typeof buildPayload>,
    ): Promise<LaunchGameResponse> => {
      const res = await fetch(`${operatorUrl}/api/operators/launch-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accpet: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json: LaunchGameResponse = await res.json();
      return json;
    };

    // First attempt with primary currency (IDR)
    const launchGamePayload = buildPayload(currency);
    console.log({ launchGamePayload });
    let result = await callLaunchGame(launchGamePayload);
    console.log({ result, codeType: typeof result.code });

    // If the first attempt failed (code !== 0), retry once with the second currency (IDR2)
    // Use Number() to guard against the API returning code as a string (e.g. "0")
    if (Number(result.code) !== 200) {
      const launchGamePayload2 = buildPayload(curency2);
      console.log({ launchGamePayload2 });
      result = await callLaunchGame(launchGamePayload2);
      console.log({ result2: result });
    }

    // Return whatever the final result is (success from currency, success from curency2,
    // or the failure from curency2 if both attempts failed)
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Launch Game API Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
