// Cart calculation related types and interfaces

export interface CartCalculationResult {
  // Basic totals
  itemsSubtotal: number;
  itemsSubtotalTax: number;
  subtotal: number;
  subtotalAfterCoupons: number;
  shippingTotal: number;
  shippingTax: number;
  taxTotal: number;
  total: number;

  // Item details
  items: CartItemCalculation[];

  // Applied coupons
  appliedCoupons: AppliedCoupon[];
  totalDiscount: number;

  // Shipping details
  shippingDetails: CartShippingDetails;

  // Tax details
  taxDetails: CartTaxDetails;

  // Address information
  billingAddress: AddressInfo | null;
  shippingAddress: AddressInfo | null;

  // Calculation metadata
  pricesIncludeTax: boolean;
  taxDisplayMode: boolean;
  taxCalculatedOn: string;
  currency: string;

  // Summary
  needsShipping: boolean;
  isShippingRequired: boolean;
  canShipToAddress: boolean;

  calculatedAt: string;
}

export interface CartItemCalculation {
  itemId: string;
  productId?: string;
  variationId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  regularPrice: number;
  salePrice?: number;
  lineTotal: number;
  lineTotalTax: number;
  lineTotalWithTax: number;
  taxClass?: any;
  taxStatus?: string;
  weight?: number;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  shippingClass?: any;
}

export interface CartTaxDetails {
  totalTax: number;
  taxBreakdown: TaxBreakdownItem[];
  taxAddress: AddressInfo | null;
  taxIncluded: boolean;
}

export interface TaxBreakdownItem {
  id: string;
  label: string;
  rate: number;
  amount: number;
  taxableAmount: number;
  appliesToShipping: boolean;
  isCompound: boolean;
}

export interface CartShippingDetails {
  shippingTotal: number;
  shippingTax: number;
  shippingMethods: ShippingMethodOption[];
  selectedMethod: ShippingMethodOption | null;
  freeShippingApplied: boolean;
  freeShippingRemaining: number;
}

export interface ShippingMethodOption {
  id: string;
  title: string;
  description?: string;
  cost: number;
  isFreeShipping: boolean;
  methodType: string;
}

export interface CartCouponDetails {
  appliedCoupons: AppliedCoupon[];
  totalDiscount: number;
  discountTax: number;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  freeShipping: boolean;
}

export interface AddressInfo {
  id: string;
  company?: string;
  streetOne: string;
  streetTwo?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
