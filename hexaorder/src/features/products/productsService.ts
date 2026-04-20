import { Product } from '../../types';
import { MOCK_PRODUCTS } from '../../services/mockData';

const PRODUCTS_STORAGE_KEY = 'hexaorder.products';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sortProducts = (products: Product[]) =>
  [...products].sort((a, b) => a.name.localeCompare(b.name));

const readStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return MOCK_PRODUCTS;
  }

  const rawValue = localStorage.getItem(PRODUCTS_STORAGE_KEY);

  if (!rawValue) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }

  try {
    return sortProducts(JSON.parse(rawValue) as Product[]);
  } catch {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }
};

const persistProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(sortProducts(products)));
};

export const productsService = {
  getProducts: async (): Promise<Product[]> => {
    await delay(500);
    return readStoredProducts();
  },

  getProductById: async (id: string): Promise<Product> => {
    await delay(300);
    const products = readStoredProducts();
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(1000);

    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
    };

    const products = [newProduct, ...readStoredProducts()];
    persistProducts(products);

    return newProduct;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    await delay(800);

    const products = readStoredProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = { ...products[index], ...data };
    products[index] = updatedProduct;
    persistProducts(products);

    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(600);

    const products = readStoredProducts();
    const filtered = products.filter(p => p.id !== id);
    persistProducts(filtered);
  },
};