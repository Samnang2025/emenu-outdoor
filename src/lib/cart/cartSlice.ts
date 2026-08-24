import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/model';

const initialState: CartState = {
  items: [],
  totalItems: 0.00,
  totalPrice: 0.00,
};

const roundToTwoDecimals = (num: number) => {
  return parseFloat(num.toFixed(2));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, promo_price, price, comment } = action.payload;
      const cartItemId = `${id}-${comment || ''}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);
      const itemPrice = promo_price || price;
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotalPrice = roundToTwoDecimals(existingItem.quantity * itemPrice);
      } else {
        const newItem = {
          ...action.payload,
          cartItemId,
          quantity: 1,
          subtotalPrice: roundToTwoDecimals(1 * itemPrice),
        };
        state.items.push(newItem);
      }
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
      state.totalPrice = roundToTwoDecimals(
        state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
      ); // Update totalPrice
    },
    removeFromCart: (state, action: PayloadAction<{ cartItemId?: string; itemId?: string }>) => {
      const { cartItemId, itemId } = action.payload;
      const targetId = cartItemId || itemId;
      const existingItem = state.items.find(item => (item.cartItemId || item.id) === targetId);
      if (existingItem) {
        state.items = state.items.filter(item => (item.cartItemId || item.id) !== targetId);
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
        state.totalPrice = roundToTwoDecimals(
          state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
        ); // Update totalPrice
      }
    },
    updateCartItem: (state, action: PayloadAction<{ cartItemId?: string; itemId?: string; quantity: number }>) => {
      const { cartItemId, itemId, quantity } = action.payload;
      const targetId = cartItemId || itemId;
      const existingItem = state.items.find(item => (item.cartItemId || item.id) === targetId);
      if (existingItem) {
        existingItem.quantity = quantity;
        const itemPrice = existingItem.promo_price || existingItem.price;
        existingItem.subtotalPrice = roundToTwoDecimals(quantity * itemPrice);
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
        state.totalPrice = roundToTwoDecimals(
          state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
        ); // Update totalPrice
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    }
  },
});

export const { addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
