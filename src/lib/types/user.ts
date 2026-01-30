import { Address } from './order';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
