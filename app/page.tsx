"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking backend...");

  useEffect(() => {
    checkBackendHealth()
      .then(() => {
        setBackendStatus("Backend: Connected");
      })
      .catch(() => {
        setBackendStatus("Backend: Disconnected");
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-3xl font-bold text-white">
          SB
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Smart Basket
        </h1>

        <p className="mt-3 text-gray-500">
          Smart shopping. Simple billing. Secure checkout.
        </p>

        <button className="mt-8 w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white transition hover:bg-gray-800">
          Start Shopping
        </button>

        <p className="mt-6 text-sm text-gray-400">
          Smart Trolley System
        </p>

        <p className="mt-4 text-sm font-medium text-gray-600">
          {backendStatus}
        </p>
      </div>
    </main>
  );
}