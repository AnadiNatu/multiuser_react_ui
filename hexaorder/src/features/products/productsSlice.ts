import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { productsService } from './productsService';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  fetchStatus: 'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  updateStatus: 'idle' | 'loading' | 'failed';
  deleteStatus: 'idle' | 'loading' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  fetchStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  message: null,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => productsService.getProducts()
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string) => productsService.getProductById(id)
);

export const createProduct = createAsyncThunk
  Product,
  Omit<Product, 'id'>,
  { rejectValue: string }
>('products/createProduct', async (payload, { rejectWithValue }) => {
  try {
    return await productsService.createProduct(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create product';
    return rejectWithValue(message);
  }
});

export const updateProduct = createAsyncThunk
  Product,
  { id: string; data: Partial<Product> },
  { rejectValue: string }
>('products/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await productsService.updateProduct(id, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update product';
    return rejectWithValue(message);
  }
});

export const deleteProduct = createAsyncThunk
  string,
  string,
  { rejectValue: string }
>('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await productsService.deleteProduct(id);
    return id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete product';
    return rejectWithValue(message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductMessage(state) {
      state.message = null;
      state.error = null;
      state.createStatus = 'idle';
      state.updateStatus = 'idle';
      state.deleteStatus = 'idle';
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.fetchStatus = 'failed';
        state.error = 'Unable to load products';
      })
      // Fetch single product
      .addCase(fetchProductById.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state) => {
        state.fetchStatus = 'failed';
        state.error = 'Unable to load product';
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.createStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = 'idle';
        state.items = [action.payload, ...state.items];
        state.message = 'Product created successfully';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload ?? 'Unable to create product';
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateStatus = 'idle';
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.message = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to update product';
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.deleteStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = 'idle';
        state.items = state.items.filter(p => p.id !== action.payload);
        state.message = 'Product deleted successfully';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload ?? 'Unable to delete product';
      });
  },
});

export const { clearProductMessage, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;