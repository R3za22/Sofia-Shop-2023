import type {
  Account, CartView, CheckoutInput, ColorId, ContactInput, ContactReceipt, DeliveryMethod, City, ListParams, Order, Product, ProductPage,
} from '../types';

export type ApiErrorCode =
  | 'not_found' | 'network' | 'server' | 'validation' | 'invalid_code' | 'payment_declined' | 'out_of_stock' | 'empty_cart' | 'unauthorized';

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message?: string, public fields?: Record<string, string>) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

/** Everything the UI needs from a backend. Implemented by the mock and live adapters. */
export interface ShopApi {
  listProducts(params: ListParams): Promise<ProductPage>;
  getProduct(id: string): Promise<Product>;
  getCart(): Promise<CartView>;
  addToCart(productId: string, color: ColorId, qty: number, size?: string): Promise<CartView>;
  setQty(productId: string, color: ColorId, qty: number, size?: string): Promise<CartView>;
  removeLine(productId: string, color: ColorId, size?: string): Promise<CartView>;
  setDelivery(opts: { city?: City; method?: DeliveryMethod }): Promise<CartView>;
  /** Throws ApiError('invalid_code') and leaves the cart unchanged when the code is unknown. */
  applyCode(code: string): Promise<CartView>;
  checkout(input: CheckoutInput): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order>;
  /** Throws ApiError('unauthorized') when signed out. */
  getAccount(): Promise<Account>;
  /** Mock sign-in: any valid email and a password of 6+ characters. Throws 'validation' with `fields`, or 'unauthorized' for a wrong password. */
  signIn(email: string, password: string): Promise<Account>;
  signOut(): Promise<void>;
  getWishlist(): Promise<string[]>;
  /** Adds or removes the product and returns the new list of ids. */
  toggleWishlist(productId: string): Promise<string[]>;
  listWishlist(): Promise<Product[]>;
  sendContact(input: ContactInput): Promise<ContactReceipt>;
  /** Mock only: wipe local cart, orders and stock changes. */
  resetDemo(): Promise<void>;
}
