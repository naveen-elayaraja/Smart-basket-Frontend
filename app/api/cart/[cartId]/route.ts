import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cartId: string }> }
) {
  try {
    const { cartId } = await params;

    const response = await fetch(
      "http://192.168.4.8:8000/cart/" + encodeURIComponent(cartId),
      { cache: "no-store" }
    );

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Cannot connect to Raspberry Pi" },
      { status: 502 }
    );
  }
}
