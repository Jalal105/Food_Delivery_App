import { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('bitedash-cart') || '[]'),
  restaurantId: localStorage.getItem('bitedash-cart-restaurant') || null,
  restaurantName: localStorage.getItem('bitedash-cart-restaurant-name') || '',
};

function persist(state) {
  localStorage.setItem('bitedash-cart', JSON.stringify(state.items));
  localStorage.setItem('bitedash-cart-restaurant', state.restaurantId || '');
  localStorage.setItem('bitedash-cart-restaurant-name', state.restaurantName || '');
}

function reducer(state, action) {
  let newState;
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurantId, restaurantName } = action.payload;
      // If from different restaurant, clear cart first
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        newState = { items: [{ ...item, quantity: 1 }], restaurantId, restaurantName };
        persist(newState); return newState;
      }
      const existing = state.items.find((i) => i._id === item._id);
      if (existing) {
        newState = { ...state, items: state.items.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i), restaurantId, restaurantName };
      } else {
        newState = { ...state, items: [...state.items, { ...item, quantity: 1 }], restaurantId, restaurantName };
      }
      persist(newState); return newState;
    }
    case 'REMOVE_ITEM':
      newState = { ...state, items: state.items.filter((i) => i._id !== action.payload) };
      if (newState.items.length === 0) { newState.restaurantId = null; newState.restaurantName = ''; }
      persist(newState); return newState;
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      if (qty <= 0) {
        newState = { ...state, items: state.items.filter((i) => i._id !== id) };
      } else {
        newState = { ...state, items: state.items.map((i) => i._id === id ? { ...i, quantity: qty } : i) };
      }
      if (newState.items.length === 0) { newState.restaurantId = null; newState.restaurantName = ''; }
      persist(newState); return newState;
    }
    case 'CLEAR':
      newState = { items: [], restaurantId: null, restaurantName: '' };
      persist(newState); return newState;
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addItem = useCallback((item, restaurantId, restaurantName) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, restaurantId, restaurantName } });
  }, []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const updateQty = useCallback((id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, clearCart, subtotal, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
