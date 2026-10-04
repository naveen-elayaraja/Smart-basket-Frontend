"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";

type Product = {
  product_id: number;
  product_name: string;
  barcode: string;
  price: number;
  discount_percent: number;
  gst_percent: number;
  weight: number;
  stock_quantity: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [backendStatus, setBackendStatus] = useState("Loading products...");
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setBackendStatus("Backend: Connected");
      })
      .catch(() => {
        setBackendStatus("Backend: Disconnected");
        setError("Unable to load products.");
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-3xl font-bold text-white">
              SB
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Smart Basket
            </h1>

            <p className="mt-3 text-gray-500">
              Smart shopping. Simple billing. Secure checkout.
            </p>

            <p className="mt-4 text-sm font-medium text-gray-600">
              {backendStatus}
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Products
            </h2>

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-red-600">
                {error}
              </p>
            )}

            {products.length === 0 && !error && (
              <p className="text-gray-500">Loading products...</p>
            )}

            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="rounded-2xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {product.product_name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Barcode: {product.barcode}
                      </p>
                    </div>

                    <p className="text-xl font-bold text-gray-900">
                      ₹{product.price}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600 sm:grid-cols-4">
                    <div>
                      <p className="font-medium text-gray-900">Weight</p>
                      <p>{product.weight} kg</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">Discount</p>
                      <p>{product.discount_percent}%</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">GST</p>
                      <p>{product.gst_percent}%</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">Stock</p>
                      <p>{product.stock_quantity}</p>
                    </div>
                  </div>

                  <button className="mt-5 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800">
                    Add to Basket
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}