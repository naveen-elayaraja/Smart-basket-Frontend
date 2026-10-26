import { NextResponse } from "next/server";

export const runtime = "nodejs";


const BACKEND = "http://192.168.4.6:8000";
const BASKET_ID = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({
      error: "The backend returned an invalid response.",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cannot connect to Raspberry Pi.",
        details:
          error instanceof Error ? error.message : "Unknown connection error",
      },
      { status: 502 }
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cartId: string; cartItemId: string }> }
) {
  try {
    const { cartId, cartItemId } = await params;

    const response = await fetch(
      `${BACKEND}/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(cartItemId)}`,
      {
        method: "DELETE",
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({
      error: "The backend returned an invalid response.",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cannot connect to Raspberry Pi.",
        details:
          error instanceof Error ? error.message : "Unknown connection error",
      },
      { status: 502 }
    );
  }
}