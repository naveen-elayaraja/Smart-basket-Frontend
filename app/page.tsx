
"use client";

import { useEffect, useState } from "react";
import { addToCart, getCart, getProducts } from "@/lib/api";

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

type CartItem = {
  cart_item_id: number;
  basket_id: number;
  product_name: string;
  unit_price: number;
  weight: number;
  cart_id: string;
  product_id: number;
  user_id: number;
  quantity: number;
  discount_percent: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [backendStatus, setBackendStatus] = useState("Loading products...");
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

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

  const handleAddToBasket = async (productId: number) => {
    try {
      setCartMessage("Adding to basket...");

      await addToCart(
        "11111111-1111-1111-1111-111111111111",
        1,
        1,
        productId,
        1
      );

      const updatedCart = await getCart(
        "11111111-1111-1111-1111-111111111111"
      );

      setCartItems(updatedCart);
      setCartMessage("Product added to basket successfully.");
    } catch {
      setCartMessage("Failed to add product to basket.");
    }
  };

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

            {cartMessage && (
              <p className="mb-4 text-center text-sm font-medium text-gray-600">
                {cartMessage}
              </p>
            )}

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

                  <button
                    onClick={() => handleAddToBasket(product.product_id)}
                    className="mt-5 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                  >
                    Add to Basket
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Your Basket
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your basket is empty.</p>
            ) : (
              <div className="grid gap-4">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="rounded-2xl border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.product_name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.unit_price * item.quantity}
                      </p>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      Total weight: {item.weight * item.quantity} kg
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

