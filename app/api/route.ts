import { NextResponse } from "next/server";

export async function GET() {
  const data = { hello: "world" };

  return NextResponse.json({ data });
}
