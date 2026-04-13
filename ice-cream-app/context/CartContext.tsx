import React, { createContext, useState, useContext } from "react";

// 1. Definimos qué datos tiene un producto en el carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
}

// 2. Definimos qué funciones y datos ofrece el carrito a la app
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. El "Provider" que envolverá la aplicación
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Función para añadir productos
  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Si ya existe, sumamos 1 a la cantidad
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Si es nuevo, lo agregamos con cantidad 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Función para eliminar un producto
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Función para vaciar el carrito
  const clearCart = () => setCart([]);

  // Cálculo del precio total automático
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 4. El "Hook" para usar el carrito en cualquier pantalla
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};
