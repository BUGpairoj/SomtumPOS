import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { MenuItem, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  tableNumber: string;
  customerName: string;
  notes: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'UPDATE_SPICY_LEVEL'; payload: { index: number; spicyLevel: number } }
  | { type: 'UPDATE_NOTES'; payload: { index: number; notes: string } }
  | { type: 'UPDATE_ADDONS'; payload: { index: number; addons: number[] } }
  | { type: 'SET_TABLE_NUMBER'; payload: string }
  | { type: 'SET_CUSTOMER_NAME'; payload: string }
  | { type: 'SET_ORDER_NOTES'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  tableNumber: '',
  customerName: '',
  notes: '',
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item =>
          item.menuItem.id === action.payload.menuItem.id &&
          item.spicyLevel === action.payload.spicyLevel &&
          item.notes === action.payload.notes &&
          JSON.stringify(item.selectedAddons.sort()) === JSON.stringify(action.payload.selectedAddons.sort())
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }

      return { ...state, items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const newItems = [...state.items];
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: newItems.filter((_, index) => index !== action.payload.index),
        };
      }
      newItems[action.payload.index] = {
        ...newItems[action.payload.index],
        quantity: action.payload.quantity,
      };
      return { ...state, items: newItems };
    }

    case 'UPDATE_SPICY_LEVEL': {
      const newItems = [...state.items];
      newItems[action.payload.index] = {
        ...newItems[action.payload.index],
        spicyLevel: action.payload.spicyLevel,
      };
      return { ...state, items: newItems };
    }

    case 'UPDATE_NOTES': {
      const newItems = [...state.items];
      newItems[action.payload.index] = {
        ...newItems[action.payload.index],
        notes: action.payload.notes,
      };
      return { ...state, items: newItems };
    }

    case 'UPDATE_ADDONS': {
      const newItems = [...state.items];
      newItems[action.payload.index] = {
        ...newItems[action.payload.index],
        selectedAddons: action.payload.addons,
      };
      return { ...state, items: newItems };
    }

    case 'SET_TABLE_NUMBER':
      return { ...state, tableNumber: action.payload };

    case 'SET_CUSTOMER_NAME':
      return { ...state, customerName: action.payload };

    case 'SET_ORDER_NOTES':
      return { ...state, notes: action.payload };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, quantity?: number, spicyLevel?: number, notes?: string, addons?: number[]) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateSpicyLevel: (index: number, spicyLevel: number) => void;
  updateNotes: (index: number, notes: string) => void;
  updateAddons: (index: number, addons: number[]) => void;
  setTableNumber: (tableNumber: string) => void;
  setCustomerName: (customerName: string) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (
    menuItem: MenuItem,
    quantity = 1,
    spicyLevel = 0,
    notes = '',
    addons: number[] = []
  ) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { menuItem, quantity, spicyLevel, notes, selectedAddons: addons },
    });
  };

  const removeItem = (index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: index });
  };

  const updateQuantity = (index: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  };

  const updateSpicyLevel = (index: number, spicyLevel: number) => {
    dispatch({ type: 'UPDATE_SPICY_LEVEL', payload: { index, spicyLevel } });
  };

  const updateNotes = (index: number, notes: string) => {
    dispatch({ type: 'UPDATE_NOTES', payload: { index, notes } });
  };

  const updateAddons = (index: number, addons: number[]) => {
    dispatch({ type: 'UPDATE_ADDONS', payload: { index, addons } });
  };

  const setTableNumber = (tableNumber: string) => {
    dispatch({ type: 'SET_TABLE_NUMBER', payload: tableNumber });
  };

  const setCustomerName = (customerName: string) => {
    dispatch({ type: 'SET_CUSTOMER_NAME', payload: customerName });
  };

  const setOrderNotes = (notes: string) => {
    dispatch({ type: 'SET_ORDER_NOTES', payload: notes });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getSubtotal = () => {
    return state.items.reduce((total, item) => {
      let itemTotal = item.menuItem.price * item.quantity;
      // Add addon prices
      item.selectedAddons.forEach(addonId => {
        const addon = item.menuItem.addons.find(a => a.addonId === addonId);
        if (addon) {
          itemTotal += addon.addon.price * item.quantity;
        }
      });
      return total + itemTotal;
    }, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.07; // 7% VAT
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateSpicyLevel,
        updateNotes,
        updateAddons,
        setTableNumber,
        setCustomerName,
        setOrderNotes,
        clearCart,
        getSubtotal,
        getTax,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
