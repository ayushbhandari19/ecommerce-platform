"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  type Cart,
} from "@/lib/api";

type CartContextValue = {
  cart: Cart | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);

  async function refreshCart() {
    const token = localStorage.getItem("token");

    if (!token) {
      setCart(null);
      return;
    }

    try {
      const result = await getCart();
      setCart(result);
    } catch {
      setCart(null);
    }
  }

  async function addItem(productId: number, quantity: number) {
    const updatedCart = await addToCart(productId, quantity);
    setCart(updatedCart);
  }

  async function updateItem(itemId: number, quantity: number) {
    const updatedCart = await updateCartItem(itemId, quantity);
    setCart(updatedCart);
  }

  async function removeItem(itemId: number) {
    const updatedCart = await removeFromCart(itemId);
    setCart(updatedCart);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    getCart()
      .then((result) => {
        setCart(result);
      })
      .catch(() => {
        setCart(null);
      });
  }, []);

  const itemCount = useMemo(
    () =>
      cart?.items.reduce(
        (total, item) => total + item.quantity,
        0
      ) ?? 0,
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        refreshCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}