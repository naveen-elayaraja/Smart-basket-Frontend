
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addToCart,
  getCart,
  getProducts,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/api";

type Product = {
  product_id: number;
  product_name: string;
  price: number;
  weight?: number;
  stock_quantity?: number;
  image_url?: string;
  image_path?: string;
};

type CartItem = {
  cart_item_id: number;
  cart_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  weight?: number;
};

const USER_ID = 1;
const BASKET_ID = 1;

const PRODUCT_IMAGES: Record<string, string> = {
  atta:
    "https://www.starquik.com/cdn/shop/files/SQ100273_bdd14243-b491-47a8-94b6-bf6657f0962f.jpg?v=1751696107&width=416",
  aashirvaadSalt:
    "https://services.kpnfresh.com/media/v1/products/images/ddafb9f3-32b4-4282-a88e-356a95a059e5/aashirvaad-iodized-salt.webp?c_type=C1",
  cookies:
    "https://prithvienterprises.co.in/cdn/shop/files/sliding_images_jpeg_73928f15_02d8_4eab_8fd4_a0e52c0f990cjpgts1723800414_6b403d40-6873-4db7-a8cc-a1ff7d6429c3.jpg?v=1746392058&width=800",
  swissRoll:
    "https://api.winkies.co.in/storage/019e641b-9ad0-7363-b1f6-ecf4c99046d0/CHOCOLATE-BOX.png",
  rice: "https://placehold.co/400x400/f8edce/754522?text=Rice",
  oil: "https://placehold.co/400x400/fff1b8/8a5a00?text=Cooking+Oil",
  milk: "https://placehold.co/400x400/dceeff/1454a0?text=Milk",
  salt: "https://placehold.co/400x400/f5e6d7/57391f?text=Salt",
  maggi: "https://placehold.co/400x400/fff0a8/b32418?text=Noodles",
  colgate: "https://placehold.co/400x400/e1edff/1549a0?text=Toothpaste",
  surf: "https://placehold.co/400x400/e6e5ff/3724a0?text=Detergent",
};

function getProductImage(product: {
  product_name: string;
  image_url?: string;
  image_path?: string;
}) {
  if (product.image_url) return product.image_url;
  if (product.image_path) return product.image_path;

  const name = product.product_name.toLowerCase();

  if (name.includes("aashirvaad") && name.includes("salt"))
    return PRODUCT_IMAGES.aashirvaadSalt;
  if (name.includes("atta")) return PRODUCT_IMAGES.atta;
  if (name.includes("cookie") || name.includes("sunfeast"))
    return PRODUCT_IMAGES.cookies;
  if (name.includes("winkies") || name.includes("swiss roll"))
    return PRODUCT_IMAGES.swissRoll;
  if (name.includes("rice")) return PRODUCT_IMAGES.rice;
  if (name.includes("oil")) return PRODUCT_IMAGES.oil;
  if (name.includes("milk")) return PRODUCT_IMAGES.milk;
  if (name.includes("salt")) return PRODUCT_IMAGES.salt;
  if (name.includes("maggi") || name.includes("noodle"))
    return PRODUCT_IMAGES.maggi;
  if (name.includes("colgate") || name.includes("toothpaste"))
    return PRODUCT_IMAGES.colgate;
  if (name.includes("surf") || name.includes("detergent"))
    return PRODUCT_IMAGES.surf;

  return `https://placehold.co/400x400/f1f5f9/334155?text=${encodeURIComponent(
    product.product_name
  )}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function ProductImage({
  name,
  src,
  className = "",
}: {
  name: string;
  src: string;
  className?: string;
}) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={name}
      loading="lazy"
      onError={() => {
        if (!imageSrc.includes("placehold.co")) {
          setImageSrc(
            `https://placehold.co/400x400/f1f5f9/334155?text=${encodeURIComponent(name)}`
          );
        }
      }}
      className={className}
    />
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState<number | null>(null);
  const [busyProduct, setBusyProduct] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshCart = useCallback(async (id: string) => {
    if (!id) {
      setCartItems([]);
      return;
    }

    const data = await getCart(id);
    const cartData = data as any;
    setCartItems(
      Array.isArray(cartData) ? cartData : cartData?.items ?? []
    );
  }, []);

  useEffect(() => {
    async function loadProducts() {
      console.log("PRODUCT LOAD STARTED");

      try {
        const data = await getProducts();
	console.log("PRODUCT API RESPONSE:", data);
        
        const productData = data as any;
          setProducts(
            Array.isArray(productData)
            ? productData
            : productData?.products ?? []
        );
      } catch (err) {
        console.error("PRODUCT LOAD FAILED:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  async function handleAdd(product: Product) {
  setBusyProduct(product.product_id);
  setError("");
  setMessage("");

  try {
    // Run camera recognition, servo control and weight verification first.
    setMessage(
      `Checking ${product.product_name}. Place the product in the basket when the doors open.`
    );

    const hardwareResponse = await fetch("/api/hardware/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.product_id }),
    });

    const hardwareResult = await hardwareResponse.json().catch(() => ({}));

    if (!hardwareResponse.ok || hardwareResult.success !== true) {
      throw new Error(
        hardwareResult.error ||
          "Hardware verification failed. The product was not added."
      );
    }

    // Add to the software cart only after both checks succeed.
    const result = await addToCart(
      cartId,
      USER_ID,
      BASKET_ID,
      product.product_id,
      1
    );

    const cartResult = result as {
      cart_id?: string;
    };
    const nextCartId = cartResult.cart_id || cartId;

    if (nextCartId) {
      setCartId(nextCartId);
      await refreshCart(nextCartId);
    }

    setMessage(
      `${product.product_name}: camera and weight verified. Added to cart.`
    );
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Unable to complete the add process."
    );
    setMessage("");
  } finally {
    setBusyProduct(null);
  }
}

  
      

  async function handleQuantity(item: CartItem, change: number) {
    setBusyItem(item.cart_item_id);
    setError("");
    setMessage("");

    const id = item.cart_id || cartId;

    try {
      const nextQuantity = item.quantity + change;

      if (nextQuantity <= 0) {
        await removeCartItem(id, item.cart_item_id);
      } else {
        await updateCartItemQuantity(
          id,
          item.cart_item_id,
          nextQuantity
        );
      }

      await refreshCart(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update quantity.");
    } finally {
      setBusyItem(null);
    }
  }

  async function handleDelete(item: CartItem) {
    setBusyItem(item.cart_item_id);
    setError("");

    const id = item.cart_id || cartId;

    try {
      await removeCartItem(id, item.cart_item_id);
      await refreshCart(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove product.");
    } finally {
      setBusyItem(null);
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.unit_price) *
        item.quantity *
        (1 - Number(item.discount_percent ?? 0) / 100),
    0
  );

  const gst = subtotal * 0.05;
  const total = subtotal + gst;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-3xl text-white">
              🛒
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Smart Basket
              </h1>
              <p className="text-sm text-slate-500">
                Scan · Add · Shop Smarter
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-5 xl:flex">
            <div className="text-sm font-bold">
              📷 1. Show Product
              <p className="font-normal text-slate-500">to camera</p>
            </div>
            <div className="text-sm font-bold">
              🧠 2. AI Recognizes
              <p className="font-normal text-slate-500">automatically</p>
            </div>
            <div className="text-sm font-bold">
              🛒 3. Added to Cart
              <p className="font-normal text-slate-500">in real time</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <div>
              <p className="text-sm font-bold text-green-800">
                Camera Integration
              </p>
              <p className="text-xs text-green-700">
                Manual shopping available
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_460px] lg:p-6 xl:grid-cols-[minmax(0,1fr)_510px]">
        <section>
          <div className="mb-5">
            <h2 className="text-3xl font-black tracking-tight">
              Our Products
            </h2>
            <p className="mt-1 text-slate-600">
              Choose a grocery product to add it to your basket.
            </p>
          </div>

          {message && (
            <p className="mb-4 rounded-xl bg-green-100 p-3 text-sm text-green-800">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              Loading products…
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              No products found. Check the backend connection.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.product_id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-4"
                >
                  <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:h-48">
                    <ProductImage
                      name={product.product_name}
                      src={getProductImage(product)}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <h3 className="line-clamp-2 min-h-12 text-sm font-bold sm:text-base">
                    {product.product_name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {product.weight != null
                      ? `${product.weight} kg`
                      : "Grocery"}
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {money(Number(product.price))}
                  </p>

                  <button
                    type="button"
                    onClick={() => void handleAdd(product)}
                    disabled={busyProduct === product.product_id}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-2 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:opacity-60 sm:text-base"
                  >
                    🛒{" "}
                    {busyProduct === product.product_id
                      ? "Adding…"
                      : "Add to Cart"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          <div className="flex items-center justify-between bg-green-50 px-5 py-5 sm:px-6">
            <h2 className="text-2xl font-black">🛒 Your Basket</h2>
            <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-green-700 px-3 text-lg font-bold text-white">
              {cartItems.length}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-3 text-5xl">🛍️</div>
              <p className="font-bold">Your basket is empty</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a product to start shopping.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex gap-3 px-4 py-4 sm:px-5"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                    <ProductImage
                      name={item.product_name}
                      src={getProductImage({
                        product_name: item.product_name,
                      })}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-bold">
                        {item.product_name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={busyItem === item.cart_item_id}
                        aria-label={`Remove ${item.product_name}`}
                        className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        🗑️
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.weight != null ? `${item.weight} kg` : "Grocery"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold">
                        {money(Number(item.unit_price))}
                      </p>

                      <div className="flex items-center overflow-hidden rounded-full border border-slate-200">
                        <button
                          type="button"
                          onClick={() => void handleQuantity(item, -1)}
                          disabled={busyItem === item.cart_item_id}
                          aria-label={`Decrease ${item.product_name} quantity`}
                          className="h-9 w-9 bg-slate-50 text-lg hover:bg-slate-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="min-w-9 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleQuantity(item, 1)}
                          disabled={busyItem === item.cart_item_id}
                          aria-label={`Increase ${item.product_name} quantity`}
                          className="h-9 w-9 bg-slate-50 text-lg hover:bg-slate-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-right font-black">
                      {money(
                        Number(item.unit_price) *
                          item.quantity *
                          (1 - Number(item.discount_percent ?? 0) / 100)
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex justify-between py-2 text-sm text-slate-600">
              <span>Items ({itemCount})</span>
              <span className="font-semibold text-slate-900">
                {money(subtotal)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-sm text-slate-600">
              <span>GST (5%)</span>
              <span className="font-semibold text-slate-900">
                {money(gst)}
              </span>
            </div>

            <div className="my-3 border-t border-slate-200" />

            <div className="flex items-center justify-between gap-3 py-2">
              <span className="text-lg font-black">Total Amount</span>
              <span className="text-xl font-black text-green-700">
                {money(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage(
                  "Checkout screen is ready for the next payment integration step."
                )
              }
              disabled={cartItems.length === 0}
              className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-900 px-4 py-3 text-base font-bold text-white transition hover:bg-green-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              💳 Proceed to Checkout →
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Smart, convenient shopping
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
