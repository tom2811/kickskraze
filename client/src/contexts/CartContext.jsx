import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { currentUser } = useAuth();

  // Load cart from localStorage
  useEffect(() => {
    if (currentUser) {
      const savedCart = localStorage.getItem(`cart_${currentUser.uid}`);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  // Save cart to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser]);

  const addToCart = useCallback((item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id && i.size === item.size);
      if (existingItem) {
        return prevItems.map(i => 
          i._id === item._id && i.size === item.size 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((itemId, size, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId && item.size === size 
          ? { ...item, quantity: newQuantity } 
          : item
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((itemId, size) => {
    setCartItems(prevItems => prevItems.filter(item => !(item._id === itemId && item.size === size)));
  }, []);

  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const isItemInCart = useCallback((itemId, size) => {
    return cartItems.some(item => item._id === itemId && item.size === size);
  }, [cartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (currentUser) {
      localStorage.removeItem(`cart_${currentUser.uid}`);
    }
  }, [currentUser]);

  const contextValue = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    toggleCart,
    cartTotal,
    isItemInCart,
    clearCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
