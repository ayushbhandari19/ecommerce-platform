import type { Product } from "@/types/product";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type ProductsResponse = {
    success: boolean;
    count: number;
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export async function getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);

    const result = (await response.json()) as ProductsResponse;

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return result.products;
}
export async function getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);

    const result = (await response.json()) as {
        success: boolean;
        product: Product;
        message?: string;
    };

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch product");
    }

    return result.product;
}
export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
};

type LoginResponse = {
    success: boolean;
    message: string;
    token: string;
    user: AuthUser;
};

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const result = (await response.json()) as LoginResponse;

    if (!response.ok) {
        throw new Error(result.message || "Login failed");
    }

    return result;
}
export async function register(
    name: string,
    email: string,
    password: string
  ) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
  
    const result = (await response.json()) as {
      success: boolean;
      message: string;
    };
  
    if (!response.ok) {
      throw new Error(result.message || "Registration failed");
    }
  
    return result;
  }
  export async function authFetch(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = localStorage.getItem("token");
  
    const headers = new Headers(options.headers);
  
    headers.set("Content-Type", "application/json");
  
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  }
  export type CartItem = {
    id: number;
    quantity: number;
    product: Product;
  };
  
  export type Cart = {
    id: number;
    userId: number;
    items: CartItem[];
  };
  
  type CartResponse = {
    success: boolean;
    cart: Cart;
  };
  
  export async function getCart(): Promise<Cart> {
    const response = await authFetch("/cart");
  
    const result = (await response.json()) as CartResponse;
  
    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }
  
    return result.cart;
  }
  
  export async function addToCart(
    productId: number,
    quantity: number
  ): Promise<Cart> {
    const response = await authFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });
  
    const result = (await response.json()) as CartResponse & {
      message?: string;
    };
  
    if (!response.ok) {
      throw new Error(result.message || "Failed to add product to cart");
    }
  
    return result.cart;
  }
  
  export async function updateCartItem(
    itemId: number,
    quantity: number
  ): Promise<Cart> {
    const response = await authFetch(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({
        quantity,
      }),
    });
  
    const result = (await response.json()) as CartResponse & {
      message?: string;
    };
  
    if (!response.ok) {
      throw new Error(result.message || "Failed to update cart");
    }
  
    return result.cart;
  }
  
  export async function removeFromCart(itemId: number): Promise<Cart> {
    const response = await authFetch(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  
    const result = (await response.json()) as CartResponse & {
      message?: string;
    };
  
    if (!response.ok) {
      throw new Error(result.message || "Failed to remove item");
    }
  
    return result.cart;
  }
  
  export async function clearCart(): Promise<Cart> {
    const response = await authFetch("/cart", {
      method: "DELETE",
    });
  
    const result = (await response.json()) as CartResponse & {
      message?: string;
    };
  
    if (!response.ok) {
      throw new Error(result.message || "Failed to clear cart");
    }
  
    return result.cart;
  }