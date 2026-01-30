import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}
