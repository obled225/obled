import { CartItem } from './cart';
import { User } from './user';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}
