export type UserRole = 'standard' | 'lockedOut' | 'problem' | 'performanceGlitch';

export interface User {
  username: string;
  password: string;
}

export type Users = Record<UserRole, User>;

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}
