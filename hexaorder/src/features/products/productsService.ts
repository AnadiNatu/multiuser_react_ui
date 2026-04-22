import { apiService, API_ENDPOINTS } from '@/services/apiService';
import { Product, BackendProduct, ProductFormData } from '../../types';

// ─── Mapper ──────────────────────────────────────────────────────────────────

export function mapBackendProduct(p: BackendProduct | any): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    stock: p.stockQuantity ?? p.stock ?? 0,
    category: p.category,
    image: p.imageUrl || p.image || '',
    isActive: p.isActive ?? true,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    createdBy: p.createdBy,
    updatedBy: p.updatedBy,
  };
}

function mapProductList(json: any): Product[] {
  const raw: any[] = json.products || json;
  if (!Array.isArray(raw)) return [];
  return raw.map(mapBackendProduct);
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const productsService = {
  /**
   * Get products — endpoint varies by role
   * ADMIN → /product/admin/all  (returns wrapper with statistics)
   * USER/USER_TYPE1 → /product/user/search?keyword=
   */
  getProducts: async (rawRole?: string): Promise<{ products: Product[]; statistics?: any }> => {
    const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
    const isAdmin = rawRole && adminRoles.includes(rawRole);

    if (isAdmin) {
      const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_ADMIN_ALL);
      return {
        products: mapProductList(json),
        statistics: json.statistics,
      };
    }

    // Default: user search with empty keyword returns all active
    const json = await apiService.get<any>(`${API_ENDPOINTS.PRODUCT_USER_SEARCH}?keyword=`);
    return { products: mapProductList(json) };
  },

  /**
   * Search products by keyword — /product/user/search?keyword=
   */
  searchProducts: async (keyword: string): Promise<Product[]> => {
    const json = await apiService.get<any>(
      `${API_ENDPOINTS.PRODUCT_USER_SEARCH}?keyword=${encodeURIComponent(keyword)}`
    );
    return mapProductList(json);
  },

  /**
   * Get product by id — /product/user/details/{id}
   */
  getProductById: async (id: string): Promise<Product> => {
    const json = await apiService.get<BackendProduct>(API_ENDPOINTS.PRODUCT_USER_DETAILS(id));
    return mapBackendProduct(json);
  },

  /**
   * Create product — POST /product/admin/create (multipart)
   */
  createProduct: async (formData: ProductFormData, imageFile?: File | null): Promise<Product> => {
    const fd = new FormData();
    fd.append(
      'product',
      JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stock,
        category: formData.category,
        isActive: formData.isActive ?? true,
      })
    );
    if (imageFile) {
      fd.append('image', imageFile);
    }

    const json = await apiService.upload<any>(API_ENDPOINTS.PRODUCT_ADMIN_CREATE, fd, 'POST');
    return mapBackendProduct(json.product || json);
  },

  /**
   * Update product — PUT /product/admin-type2/update-price/{id} (multipart)
   */
  updateProduct: async (
    id: string,
    formData: ProductFormData,
    imageFile?: File | null
  ): Promise<Product> => {
    const fd = new FormData();
    fd.append(
      'product',
      JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stockQuantity: formData.stock,
        category: formData.category,
        isActive: formData.isActive ?? true,
      })
    );
    if (imageFile) {
      fd.append('image', imageFile);
    }

    const json = await apiService.upload<any>(
      API_ENDPOINTS.PRODUCT_AT2_UPDATE_PRICE(id),
      fd,
      'PUT'
    );
    return mapBackendProduct(json.product || json);
  },

  /**
   * Delete product — DELETE /product/admin/delete/{id}
   */
  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.PRODUCT_ADMIN_DELETE(id));
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (category: string, rawRole?: string): Promise<Product[]> => {
    const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
    const isAdmin = rawRole && adminRoles.includes(rawRole);

    const endpoint = isAdmin
      ? API_ENDPOINTS.PRODUCT_AT2_CATEGORY(category)
      : API_ENDPOINTS.PRODUCT_UT1_CATEGORY(category);

    const json = await apiService.get<any>(endpoint);
    return mapProductList(json);
  },

  /**
   * Get all categories — /product/user-type1/categories
   */
  getCategories: async (): Promise<{ categories: string[]; categoryCounts: Record<string, number> }> => {
    const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_UT1_CATEGORIES);
    return {
      categories: json.categories || [],
      categoryCounts: json.categoryCounts || {},
    };
  },

  /**
   * Get featured products — /product/user-type1/featured
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    const json = await apiService.get<any>(API_ENDPOINTS.PRODUCT_UT1_FEATURED);
    return mapProductList(json);
  },

  /**
   * Products by price range
   */
  getProductsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    const json = await apiService.get<any>(
      `${API_ENDPOINTS.PRODUCT_UT2_PRICE_RANGE}?minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
    return mapProductList(json);
  },

  /**
   * Products sorted by price
   */
  getProductsSortedByPrice: async (order: 'asc' | 'desc' = 'asc'): Promise<Product[]> => {
    const json = await apiService.get<any>(`${API_ENDPOINTS.PRODUCT_UT2_SORTED}?order=${order}`);
    return mapProductList(json);
  },

  /**
   * Compare products (USER_TYPE2)
   */
  compareProducts: async (ids: string[]): Promise<Product[]> => {
    const numericIds = ids.map(Number);
    const json = await apiService.post<any>(API_ENDPOINTS.PRODUCT_UT2_COMPARE, numericIds);
    return mapProductList(json);
  },

  /**
   * Update stock (ADMIN_TYPE1)
   */
  updateStock: async (id: string, quantity: number, updatedBy?: string): Promise<Product> => {
    const json = await apiService.put<any>(
      `${API_ENDPOINTS.PRODUCT_AT1_UPDATE_STOCK(id)}?quantity=${quantity}`
    );
    return mapBackendProduct(json.product || json);
  },

  /**
   * Toggle active/inactive (ADMIN_TYPE2)
   */
  toggleActive: async (id: string): Promise<Product> => {
    const json = await apiService.patch<any>(API_ENDPOINTS.PRODUCT_AT2_TOGGLE_ACTIVE(id));
    return mapBackendProduct(json.product || json);
  },

  /**
   * Low stock products (ADMIN_TYPE1)
   */
  getLowStockProducts: async (threshold = 10): Promise<Product[]> => {
    const json = await apiService.get<any>(
      `${API_ENDPOINTS.PRODUCT_AT1_LOW_STOCK}?threshold=${threshold}`
    );
    return mapProductList(json);
  },
};