import type { UserRole } from '../types';

export const Routes = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkoutInfo: '/checkout-step-one.html',
  checkoutOverview: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;

export const SortOption = {
  NameAsc: 'az',
  NameDesc: 'za',
  PriceAsc: 'lohi',
  PriceDesc: 'hilo',
} as const;

export type SortOption = (typeof SortOption)[keyof typeof SortOption];

export const TAX_RATE = 0.08;

export const ErrorMessages = {
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
} as const;

export const accessDeniedMessage = (path: string): string =>
  `Epic sadface: You can only access '${path}' when you are logged in.`;

/** Where the auth setup project saves each role's logged-in browser state. */
export const authFile = (role: UserRole): string => `playwright/.auth/${role}.json`;
