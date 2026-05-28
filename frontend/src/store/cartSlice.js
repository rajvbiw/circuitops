import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

function getStoredToken() {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    return parsed?.token || null;
  } catch (error) {
    return null;
  }
}

export const fetchCart = createAsyncThunk('cart/fetch', async (_, thunkAPI) => {
  const token = getStoredToken();
  if (!token) {
    return thunkAPI.rejectWithValue('Please sign in to view your cart.');
  }

  try {
    const response = await api.get('/cart');
    return response.data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, thunkAPI) => {
  const token = getStoredToken();
  if (!token) {
    return thunkAPI.rejectWithValue('Please sign in to add items to your cart.');
  }

  try {
    const response = await api.post('/cart', { productId, quantity });
    thunkAPI.dispatch(fetchCart());
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
  }
});

export const updateCartQuantity = createAsyncThunk('cart/updateQuantity', async ({ productId, quantity }, thunkAPI) => {
  const token = getStoredToken();
  if (!token) {
    return thunkAPI.rejectWithValue('Please sign in to update your cart.');
  }

  try {
    const response = await api.put('/cart', { productId, quantity });
    thunkAPI.dispatch(fetchCart());
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, thunkAPI) => {
  const token = getStoredToken();
  if (!token) {
    return thunkAPI.rejectWithValue('Please sign in to manage your cart.');
  }

  try {
    const response = await api.delete(`/cart/${productId}`);
    thunkAPI.dispatch(fetchCart());
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, thunkAPI) => {
  const token = getStoredToken();
  if (!token) {
    return thunkAPI.rejectWithValue('Please sign in to manage your cart.');
  }

  try {
    const response = await api.delete('/cart');
    thunkAPI.dispatch(fetchCart());
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { resetCart } = cartSlice.actions;

// Selectors for quick calculations
export const selectCartSubtotal = (state) => 
  state.cart.items.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;
