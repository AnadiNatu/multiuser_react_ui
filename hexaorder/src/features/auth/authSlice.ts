import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { User } from '../../types';
import { authService } from './authService';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getStoredUser(),
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials.email, credentials.password);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to log in';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      authService.clearSession();
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        authService.storeUser(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
        state.error = null;
        authService.storeUser(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to log in';
      });
  },
});

export const { logoutUser, updateUser } = authSlice.actions;
export default authSlice.reducer;