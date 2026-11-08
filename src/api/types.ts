import type {
  Account, CartView, CheckoutInput, ColorId, DeliveryMethod, City, ListParams, Order, Product, ProductPage,
} from '../types';
import type { Errors } from '../lib/validate';

export type ApiErrorCode =
  | 'not_found' | 'network' | 'server' | 'validation' | 'invalid_code' | 'payment_declined' | 'out_of_stock' | 'empty_cart';

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message?: string, public fields?: Errors) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

/** Everything the UI needs from a backend. Implemented by the mock and live adapters. */
export interface ShopApi {
  listProducts(params: ListParams): Promise<ProductPage>;
  getProduct(id: string): Promise<Product>;
  getCart(): Promise<CartView>;
  addToCart(productId: string, color: ColorId, qty: number): Promise<CartView>;
  setQty(productId: string, color: ColorId, qty: number): Promise<CartView>;
  removeLine(productId: string, color: ColorId): Promise<CartView>;
  setDelivery(opts: { city?: City; method?: DeliveryMethod }): Promise<CartView>;
  /** Throws ApiError('invalid_code') and leaves the cart unchanged when the code is unknown. */
  applyCode(code: string): Promise<CartView>;
  checkout(input: CheckoutInput): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order>;
  getAccount(): Promise<Account>;
  /** Mock only: wipe local cart, orders and stock changes. */
  resetDemo(): Promise<void>;
}
