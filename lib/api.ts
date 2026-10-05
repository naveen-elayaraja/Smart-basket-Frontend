const API_BASE_URL = "http://127.0.0.1:8000";

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed");
  }

  return response.json();
}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products/`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}
export async function updateCartItemQuantity(
  cartId: string,
  cartItemId: number,
  quantity: number
) {
  const response = await fetch(
    `${API_BASE_URL}/cart/${cartId}/items/${cartItemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update cart item quantity");
  }

  return response.json();
}
export async function addToCart(
  cartId: string,
  userId: number,
  basketId: number,
  productId: number,
  quantity: number
) {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cart_id: cartId,
      user_id: userId,
      basket_id: basketId,
      product_id: productId,
      quantity,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add product to basket");
  }

  return response.json();
}
export async function getCart(cartId: string) {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }

  return response.json();
}
export async function removeCartItem(
  cartId: string,
  cartItemId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/cart/${cartId}/items/${cartItemId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove cart item");
  }

  return response.json();
}