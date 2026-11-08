export type Lang = 'en' | 'fa';
export type L10n = Record<Lang, string>;

export type Room = 'living' | 'dining' | 'bedroom' | 'lighting' | 'decor';
export type ProductType =
  | 'sofas' | 'armchairs' | 'coffee-tables' | 'side-tables' | 'dining-tables'
  | 'rugs' | 'lighting' | 'decor' | 'shelving';
export type Kind = 'sofa' | 'lamp' | 'vase' | 'table' | 'rug' | 'shelf';
export type ColorId = 'indigo' | 'sage' | 'oat' | 'saffron' | 'charcoal' | 'white';
export type City = 'ahvaz' | 'shiraz' | 'tehran';
export type DeliveryMethod = 'home' | 'pickup';
export type SortKey = 'newest' | 'price-asc' | 'price-desc';

/** Prices are whole Toman. */
export interface Product {
  id: string;
  name: L10n;
  room: Room;
  type: ProductType;
  kind: Kind;
  price: number;
  colors: ColorId[];
  stock: number;
  isNew: boolean;
  /** Higher is newer. */
  createdAt: number;
  description: L10n;
  /** Tile background and accent colour for the illustration. */
  bg: string;
  accent: string;
}

export interface ListParams {
  room?: Room;
  types?: ProductType[];
  colors?: ColorId[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  q?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  /** Count per type for the current room/colour/price/stock/search filters, ignoring the type filter. */
  facets: Partial<Record<ProductType, number>>;
  priceRange: { min: number; max: number };
}

export interface CartLine { productId: string; color: ColorId; qty: number }

export interface Quote {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  /** Set when a discount code was given but is not valid for this cart. */
  codeError?: 'invalid' | 'min_subtotal';
}

export interface CartLineView {
  product: Product;
  color: ColorId;
  qty: number;
  lineTotal: number;
}

export interface CartView {
  lines: CartLineView[];
  count: number;
  city: City;
  method: DeliveryMethod;
  code: string;
  quote: Quote;
}

export interface CheckoutInput {
  name: string;
  phone: string;
  city: City;
  postal: string;
  address: string;
  method: DeliveryMethod;
  card: { number: string; expiry: string; cvv: string };
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: string;
  name: L10n;
  kind: Kind;
  color: ColorId;
  bg: string;
  accent: string;
  qty: number;
  unit: number;
}

export interface Order {
  id: string;
  createdAt: number;
  status: OrderStatus;
  lines: OrderLine[];
  quote: Quote;
  customer: { name: string; phone: string };
  delivery: { method: DeliveryMethod; city: City; postal: string; address: string };
  payment: { method: 'simulated'; last4: string };
}

export interface Account { name: string; email: string; phone: string }
