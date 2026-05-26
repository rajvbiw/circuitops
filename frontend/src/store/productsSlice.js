import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Fetch products with search, categories, pagination, sorting filters
export const fetchProducts = createAsyncThunk('products/fetchAll', async (filters, thunkAPI) => {
  try {
    const response = await api.get('/products', { params: filters });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

// Fetch all available store categories
export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, thunkAPI) => {
  try {
    const response = await api.get('/products/categories');
    return response.data.categories;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load categories');
  }
});

// Fetch detailed product from database via slug
export const fetchProductDetail = createAsyncThunk('products/fetchDetail', async (slug, thunkAPI) => {
  try {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load product details');
  }
});

const initialState = {
  products: [],
  categories: [],
  currentProduct: null,
  relatedProducts: [],
  pagination: {
    page: 1,
    limit: 9,
    totalPages: 1,
    totalProducts: 0
  },
  loading: false,
  detailLoading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetail: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
          totalProducts: action.payload.totalProducts
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch Detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.related || [];
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProductDetail } = productsSlice.actions;
export default productsSlice.reducer;
