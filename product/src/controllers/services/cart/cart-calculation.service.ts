import { Cart } from "../../../entities";
import {
  AddressInfo,
  CartCalculationResult,
  CartCouponDetails,
  CartItemCalculation,
  CartShippingDetails,
  CartTaxDetails,
} from "./cart-calculation.types";

/**
 * Calculate comprehensive cart totals including tax, shipping, coupons, etc.
 * Similar to WooCommerce cart calculations
 */
export class CartCalculationService {
  /**
   * Calculate all cart totals and details
   * @param cart - Cart entity with items and coupons
   * @param userId - User ID for tax/shipping calculations
   * @param billingAddressId - Optional billing address ID
   * @param shippingAddressId - Optional shipping address ID
   * @returns Complete cart calculation result
   */
  static async calculateCartTotals(
    cart: Cart,
    userId: string,
    billingAddressId?: string,
    shippingAddressId?: string
  ): Promise<CartCalculationResult> {
    try {
      // For now, we'll use placeholder addresses - you can implement actual address fetching
      const billingAddress: AddressInfo | null = billingAddressId
        ? {
            id: billingAddressId,
            streetOne: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "US",
          }
        : null;

      const shippingAddress: AddressInfo | null = shippingAddressId
        ? {
            id: shippingAddressId,
            streetOne: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "US",
          }
        : null;

      // Calculate item subtotals
      const itemCalculations = await this.calculateItemSubtotals(cart.items);

      // Calculate subtotal (before coupons and taxes)
      const subtotal = itemCalculations.reduce(
        (sum, item) => sum + item.lineTotalWithTax,
        0
      );
      const subtotalTax = itemCalculations.reduce(
        (sum, item) => sum + item.lineTotalTax,
        0
      );

      // Apply coupons
      const couponDetails = await this.applyCouponsToCart(
        cart,
        subtotal,
        subtotalTax
      );

      // Calculate subtotal after coupons
      const subtotalAfterCoupons = subtotal - couponDetails.totalDiscount;

      // Calculate shipping
      const shippingDetails = await this.calculateShipping(
        cart,
        shippingAddress,
        subtotalAfterCoupons
      );

      // Calculate taxes
      const taxDetails = await this.calculateTaxes(
        cart,
        billingAddress,
        shippingAddress,
        subtotalAfterCoupons,
        shippingDetails.shippingTotal
      );

      // Calculate final totals
      const total =
        subtotalAfterCoupons +
        shippingDetails.shippingTotal +
        taxDetails.totalTax;

      return {
        // Basic totals
        itemsSubtotal: subtotal,
        itemsSubtotalTax: subtotalTax,
        subtotal: subtotal,
        subtotalAfterCoupons,
        shippingTotal: shippingDetails.shippingTotal,
        shippingTax: shippingDetails.shippingTax,
        taxTotal: taxDetails.totalTax,
        total,

        // Item details
        items: itemCalculations,

        // Applied coupons
        appliedCoupons: couponDetails.appliedCoupons,
        totalDiscount: couponDetails.totalDiscount,

        // Shipping details
        shippingDetails,

        // Tax details
        taxDetails,

        // Address information
        billingAddress,
        shippingAddress,

        // Calculation metadata
        pricesIncludeTax: false, // This should come from tax options
        taxDisplayMode: false, // This should come from tax options
        taxCalculatedOn: "SHIPPING_ADDRESS", // This should come from tax options
        currency: "USD", // You can make this configurable

        // Summary
        needsShipping: this.needsShipping(cart.items),
        isShippingRequired: this.isShippingRequired(cart.items),
        canShipToAddress: shippingAddress
          ? await this.canShipToAddress(shippingAddress)
          : false,

        calculatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error calculating cart totals:", error);
      throw new Error("Failed to calculate cart totals");
    }
  }

  /**
   * Calculate individual item subtotals with taxes
   */
  private static async calculateItemSubtotals(
    items: any[]
  ): Promise<CartItemCalculation[]> {
    const calculations: CartItemCalculation[] = [];

    for (const item of items) {
      const product = item.product;
      const variation = item.productVariation;
      const quantity = item.quantity;

      // Determine price (variation price takes precedence)
      let unitPrice = 0;
      let salePrice = 0;

      if (variation) {
        unitPrice = parseFloat(variation.regularPrice?.toString() || "0");
        salePrice = parseFloat(variation.salePrice?.toString() || "0");
      } else if (product) {
        unitPrice = parseFloat(product.regularPrice?.toString() || "0");
        salePrice = parseFloat(product.salePrice?.toString() || "0");
      }

      // Use sale price if available and valid
      const effectivePrice = salePrice > 0 ? salePrice : unitPrice;
      const lineTotal = effectivePrice * quantity;

      // Calculate tax for this item (simplified calculation)
      const taxAmount = await this.calculateItemTax(
        variation || product,
        effectivePrice,
        quantity
      );

      calculations.push({
        itemId: item.id,
        productId: product?.id,
        variationId: variation?.id,
        name: variation?.name || product?.name || "Unknown Product",
        sku: variation?.sku || product?.sku,
        quantity,
        unitPrice: effectivePrice,
        regularPrice: unitPrice,
        salePrice: salePrice > 0 ? salePrice : undefined,
        lineTotal,
        lineTotalTax: taxAmount,
        lineTotalWithTax: lineTotal + taxAmount,
        taxClass: variation?.taxClass || product?.taxClass,
        taxStatus: variation?.taxStatus || product?.taxStatus,
        weight: variation?.weight || product?.weight,
        dimensions: {
          length: variation?.length || product?.length,
          width: variation?.width || product?.width,
          height: variation?.height || product?.height,
          unit: variation?.dimensionUnit || product?.dimensionUnit,
        },
        shippingClass: variation?.shippingClass || product?.shippingClass,
      });
    }

    return calculations;
  }

  /**
   * Calculate taxes for the entire cart
   */
  private static async calculateTaxes(
    cart: Cart,
    billingAddress: AddressInfo | null,
    shippingAddress: AddressInfo | null,
    subtotal: number,
    shippingTotal: number
  ): Promise<CartTaxDetails> {
    // Simplified tax calculation - you'll need to implement the full tax logic
    const taxAddress = this.getTaxCalculationAddress(
      "SHIPPING_ADDRESS", // This should come from tax options
      billingAddress,
      shippingAddress
    );

    if (!taxAddress) {
      return {
        totalTax: 0,
        taxBreakdown: [],
        taxAddress: null,
        taxIncluded: false,
      };
    }

    // Simplified tax calculation - 8.5% as an example
    const taxRate = 8.5; // This should come from tax rates based on address
    const taxableAmount = subtotal + shippingTotal;
    const taxAmount = (taxableAmount * taxRate) / 100;

    return {
      totalTax: Math.round(taxAmount * 100) / 100,
      taxBreakdown: [
        {
          id: "default-tax",
          label: "Sales Tax",
          rate: taxRate,
          amount: taxAmount,
          taxableAmount,
          appliesToShipping: true,
          isCompound: false,
        },
      ],
      taxAddress,
      taxIncluded: false,
    };
  }

  /**
   * Calculate shipping costs
   */
  private static async calculateShipping(
    cart: Cart,
    shippingAddress: AddressInfo | null,
    subtotal: number
  ): Promise<CartShippingDetails> {
    if (!shippingAddress || !this.needsShipping(cart.items)) {
      return {
        shippingTotal: 0,
        shippingTax: 0,
        shippingMethods: [],
        selectedMethod: null,
        freeShippingApplied: false,
        freeShippingRemaining: 0,
      };
    }

    // Simplified shipping calculation
    const flatRateShipping = {
      id: "flat-rate",
      title: "Flat Rate Shipping",
      description: "Standard shipping rate",
      cost: 9.99,
      isFreeShipping: false,
      methodType: "flat_rate",
    };

    const freeShipping = {
      id: "free-shipping",
      title: "Free Shipping",
      description: "Free shipping on orders over $50",
      cost: 0,
      isFreeShipping: true,
      methodType: "free_shipping",
    };

    // Check if qualifies for free shipping
    const freeShippingThreshold = 50;
    const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

    const availableMethods = [flatRateShipping];
    if (qualifiesForFreeShipping) {
      availableMethods.push(freeShipping);
    }

    const selectedMethod = qualifiesForFreeShipping
      ? freeShipping
      : flatRateShipping;

    return {
      shippingTotal: selectedMethod.cost,
      shippingTax: 0,
      shippingMethods: availableMethods,
      selectedMethod,
      freeShippingApplied: qualifiesForFreeShipping,
      freeShippingRemaining: Math.max(0, freeShippingThreshold - subtotal),
    };
  }

  /**
   * Apply coupons to cart
   */
  private static async applyCouponsToCart(
    cart: Cart,
    subtotal: number,
    subtotalTax: number
  ): Promise<CartCouponDetails> {
    if (!cart.coupons?.length) {
      return {
        appliedCoupons: [],
        totalDiscount: 0,
        discountTax: 0,
      };
    }

    const appliedCoupons = [];
    let totalDiscount = 0;
    let discountTax = 0;

    for (const coupon of cart.coupons) {
      // Simplified coupon validation
      const isValid = true; // You should implement proper validation

      if (isValid) {
        let discount = 0;

        // Handle different discount types
        if (coupon.discountType.toString() === "PERCENTAGE") {
          discount =
            (subtotal * parseFloat(coupon.discountValue.toString())) / 100;
        } else if (coupon.discountType.toString() === "FIXED_CART") {
          discount = parseFloat(coupon.discountValue.toString());
        }

        // Apply minimum/maximum spend limits
        if (coupon.minimumSpend && subtotal < coupon.minimumSpend) {
          discount = 0;
        }
        if (coupon.maximumSpend && discount > coupon.maximumSpend) {
          discount = coupon.maximumSpend;
        }

        totalDiscount += discount;

        appliedCoupons.push({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description || "",
          discountType: coupon.discountType.toString(),
          discountValue: parseFloat(coupon.discountValue.toString()),
          discountAmount: discount,
          freeShipping: coupon.freeShipping || false,
        });
      }
    }

    return {
      appliedCoupons,
      totalDiscount: Math.min(totalDiscount, subtotal), // Can't discount more than subtotal
      discountTax,
    };
  }

  // Helper methods
  private static needsShipping(items: any[]): boolean {
    return items.some((item) => {
      const product = item.productVariation || item.product;
      return product?.productDeliveryType?.includes("PHYSICAL_PRODUCT");
    });
  }

  private static isShippingRequired(items: any[]): boolean {
    return this.needsShipping(items);
  }

  private static async canShipToAddress(
    address: AddressInfo
  ): Promise<boolean> {
    // Implement shipping zone validation logic
    return true;
  }

  private static getTaxCalculationAddress(
    calculateTaxBasedOn: string,
    billingAddress: AddressInfo | null,
    shippingAddress: AddressInfo | null
  ): AddressInfo | null {
    switch (calculateTaxBasedOn) {
      case "BILLING_ADDRESS":
        return billingAddress;
      case "SHIPPING_ADDRESS":
        return shippingAddress;
      case "STORE_ADDRESS":
        // Return store address from configuration
        return null;
      default:
        return shippingAddress;
    }
  }

  private static async calculateItemTax(
    item: any,
    price: number,
    quantity: number
  ): Promise<number> {
    // Simplified item tax calculation - 8.5% as example
    const taxRate = 8.5;
    return (price * quantity * taxRate) / 100;
  }
}
