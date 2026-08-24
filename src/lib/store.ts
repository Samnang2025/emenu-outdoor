import { configureStore } from '@reduxjs/toolkit';
import cartReducer from "./cart/cartSlice"

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});
// test
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
