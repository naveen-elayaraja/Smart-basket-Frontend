
const API_BASE_URL = "";

async function handleResponse<T>(
  response: Response,
  errorMessage: string
): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || `${errorMessage} (${response.status})`
    );
  }

  return data as T;
}

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
  });

  return handleResponse(response, "Backend health check failed");
}

export async function getProducts() {
  const response = await fetch("/api/products", {
    cache: "no-store",
  });

  return handleResponse(response, "Failed to fetch products");
}

export async function addToCart(
  cartId: string,
  userId: number,
  basketId: number,
  productId: number,
  quantity: number = 1
) {
  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(cartId ? { cart_id: cartId } : {}),
      user_id: userId,
      basket_id: basketId,
      product_id: productId,
      quantity,
    }),
  });

  return handleResponse(response, "Failed to add product to basket");
}

export async function getCart(cartId: string) {
  if (!cartId) return [];

  const response = await fetch(
    `/api/cart/${encodeURIComponent(cartId)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) {
    return [];
  }

  return handleResponse<any[]>(response, "Failed to fetch cart");
}

export async function updateCartItemQuantity(
  cartId: string,
  cartItemId: number,
  quantity: number
) {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const response = await fetch(
    `/api/cart/${encodeURIComponent(cartId)}/items/${cartItemId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    }
  );

  return handleResponse(
    response,
    "Failed to update cart item quantity"
  );
}

export async function removeCartItem(
  cartId: string,
  cartItemId: number
) {
  const response = await fetch(
    `/api/cart/${encodeURIComponent(cartId)}/items/${cartItemId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response, "Failed to remove cart item");
}
