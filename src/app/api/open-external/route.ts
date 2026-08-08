import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: targetUrl,
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="external-redirect"',
    },
  });
}
