export interface ScreenPrint {
  position: string;
  size: string;
  ccValue: number;
  price: number;
}

export interface ShirtItem {
  name: string;
  color: string;
  size: string;
  quantity: number;
  pricePerPiece: number;
  totalPrice: number;
}

export interface ProductGroup {
  index: number;
  name: string;
  screenPrints: ScreenPrint[];
  screenPricePerPiece: number;
  shirts: ShirtItem[];
  subtotal: number;
}

export interface ParsedOrder {
  orderCode: string;
  productGroups: ProductGroup[];
  shippingCost: number;
  grandTotal: number;
  trackingLink: string;
}

export interface TableRow {
  date: string;
  orderCode: string;
  ccUsed: string;
  shirtName: string;
  size: string;
  color: string;
  quantity: number;
  screenLink: string;
  status: string;
  price: number;
  image: string;
}
