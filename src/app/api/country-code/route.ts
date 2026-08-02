import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ipwho.is", {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    console.log({ res });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch country" },
        { status: 500 },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      country: data.country_name,
      countryCode: data.country_code,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
