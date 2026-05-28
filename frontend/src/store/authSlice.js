import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Thunks
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', userData);
    const userWithToken = { ...response.data.user, token: response.data.token };
    localStorage.setItem('user', JSON.stringify(userWithToken));
    return { ...response.data, user: userWithToken };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', userData);
    const userWithToken = { ...response.data.user, token: response.data.token };
    localStorage.setItem('user', JSON.stringify(userWithToken));
    return { ...response.data, user: userWithToken };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const googleLoginUser = createAsyncThunk('auth/googleLogin', async (googleData, thunkAPI) => {
  try {
    const response = await api.post('/auth/google-login', googleData);
    const userWithToken = { ...response.data.user, token: response.data.token };
    localStorage.setItem('user', JSON.stringify(userWithToken));
    return { ...response.data, user: userWithToken };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Google authentication failed');
  }
});

export const fetchUserProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkAPI) => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    // If session expired / unauthorized, clean up local storage
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('user');
    }
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Session expired');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Even if the API call fails, we clean up locally
    console.warn('Logout API call failed, cleaning up locally:', error.message);
  } finally {
    localStorage.removeItem('user');
  }
});

const localUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  user: localUser,
  loading: false,
  error: null,
  isAuthenticated: !!localUser?.token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Google Login
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile fetch
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = {
          ...action.payload,
          token: state.user?.token
        };
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Force cleanup even on error
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
