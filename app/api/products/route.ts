import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "http://192.168.4.8:8000/products/",
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Raspberry Pi backend failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Products API connection failed:", error);

    return NextResponse.json(
      { error: "Cannot connect to Raspberry Pi" },
      { status: 502 }
    );
  }
}
