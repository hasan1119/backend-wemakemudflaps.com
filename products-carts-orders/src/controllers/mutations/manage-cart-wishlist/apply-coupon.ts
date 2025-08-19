import { GraphQLClient } from "graphql-request";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { Coupon, ShippingZone } from "../../../entities";
import { CouponType } from "../../../entities/coupon.entity";
import {
  ApplyCouponResponseOrError,
  MutationApplyCouponArgs,
} from "../../../types";
import { applyCouponSchema, idSchema } from "../../../utils/data-validation";
import DecodeToken from "../../../utils/jwt/decode-token";
import {
  checkUserAuth,
  findCouponsByCodes,
  getCartByUserId,
  getTaxOptions,
  getTaxRateByTaxClassAndAddress,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "../../services";
import { applyCoupon as applyCouponService } from "../../services/cart-wishlist/apply-coupon.service";
import {
  calculateShippingCostAndTax,
  GET_ADDRESS_BOOK,
  GET_TAX_EXEMPTION,
  getActiveStoreAddress,
  getMatchedShippingZone,
} from "../../services/cart-wishlist/shared/get-query.utils";

/**
 * Validates if a coupon is applicable to the cart.
 */
async function validateCoupon(
  coupon: Coupon,
  cartItems: any[],
  cartTotal: number,
  userEmail: string | null
): Promise<{ valid: boolean; message?: string }> {
  const currentDate = new Date();

  // Check expiry date
  if (coupon.expiryDate && new Date(coupon.expiryDate) < currentDate) {
    return { valid: false, message: `Coupon ${coupon.code} has expired.` };
  }

  // Check max usage
  if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} has reached its maximum usage limit.`,
    };
  }

  // Check allowed emails
  if (
    coupon.allowedEmails?.length &&
    userEmail &&
    !coupon.allowedEmails.includes(userEmail)
  ) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} is not allowed for your email address.`,
    };
  }

  // Check applicable/excluded products and categories
  const hasApplicableItems = cartItems.some((item) => {
    if (!item.product) return false;
    const productId = item.product.id;
    const productCategories =
      item.product.categories?.map((cat: any) => cat.id) || [];

    const isApplicableProduct =
      !coupon.applicableProducts ||
      coupon.applicableProducts.length === 0 ||
      coupon.applicableProducts.some((prod: any) => prod.id === productId);
    const isNotExcludedProduct =
      !coupon.excludedProducts ||
      coupon.excludedProducts.length === 0 ||
      !coupon.excludedProducts.some((prod: any) => prod.id === productId);
    const isApplicableCategory =
      !coupon.applicableCategories ||
      coupon.applicableCategories.length === 0 ||
      coupon.applicableCategories.some((cat: any) =>
        productCategories.includes(cat.id)
      );
    const isNotExcludedCategory =
      !coupon.excludedCategories ||
      coupon.excludedCategories.length === 0 ||
      !coupon.excludedCategories.some((cat: any) =>
        productCategories.includes(cat.id)
      );

    return (
      isApplicableProduct &&
      isNotExcludedProduct &&
      isApplicableCategory &&
      isNotExcludedCategory
    );
  });

  if (!hasApplicableItems) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} is not applicable to any items in your cart.`,
    };
  }

  // Validate discount value
  if (
    coupon.discountType === CouponType.PERCENTAGE_DISCOUNT &&
    (coupon.discountValue <= 0 || coupon.discountValue > 100)
  ) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} has an invalid percentage discount value.`,
    };
  }

  // For FIXED_CART_DISCOUNT, ensure discountValue does not exceed cartTotal
  if (
    coupon.discountType === CouponType.FIXED_CART_DISCOUNT &&
    coupon.discountValue <= 0
  ) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} has an invalid fixed discount value.`,
    };
  }

  // For FIXED_PRODUCT_DISCOUNT, ensure discountValue is valid for at least one item
  if (
    coupon.discountType === CouponType.FIXED_PRODUCT_DISCOUNT &&
    coupon.discountValue <= 0
  ) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} has an invalid fixed product discount value.`,
    };
  }

  // Calculate adjusted cart total for minimumSpend/maximumSpend validation
  let adjustedCartTotal = cartTotal;
  if (coupon.discountType === CouponType.FIXED_CART_DISCOUNT) {
    adjustedCartTotal = Math.max(0, cartTotal - coupon.discountValue);
  } else if (
    coupon.discountType === CouponType.PERCENTAGE_DISCOUNT ||
    coupon.discountType === CouponType.FIXED_PRODUCT_DISCOUNT
  ) {
    let discountTotal = 0;
    for (const item of cartItems) {
      if (!item.product) continue;
      const productId = item.product.id;
      const productCategories =
        item.product.categories?.map((cat: any) => cat.id) || [];
      const isApplicable =
        (!coupon.applicableProducts ||
          coupon.applicableProducts.length === 0 ||
          coupon.applicableProducts.some(
            (prod: any) => prod.id === productId
          )) &&
        (!coupon.excludedProducts ||
          coupon.excludedProducts.length === 0 ||
          !coupon.excludedProducts.some(
            (prod: any) => prod.id === productId
          )) &&
        (!coupon.applicableCategories ||
          coupon.applicableCategories.length === 0 ||
          coupon.applicableCategories.some((cat: any) =>
            productCategories.includes(cat.id)
          )) &&
        (!coupon.excludedCategories ||
          coupon.excludedCategories.length === 0 ||
          !coupon.excludedCategories.some((cat: any) =>
            productCategories.includes(cat.id)
          ));

      if (isApplicable) {
        let price = item.product.regularPrice ?? 0;
        if (
          item.product.salePrice &&
          (!item.product.salePriceStartAt ||
            new Date(item.product.salePriceStartAt) <= currentDate) &&
          (!item.product.salePriceEndAt ||
            new Date(item.product.salePriceEndAt) >= currentDate)
        ) {
          price = item.product.salePrice;
        }
        if (item.productVariation) {
          price = item.productVariation.regularPrice ?? price;
          if (
            item.productVariation.salePrice &&
            (!item.productVariation.salePriceStartAt ||
              new Date(item.productVariation.salePriceStartAt) <=
                currentDate) &&
            (!item.productVariation.salePriceEndAt ||
              new Date(item.productVariation.salePriceEndAt) >= currentDate)
          ) {
            price = item.productVariation.salePrice;
          }
        }
        // Apply tiered pricing
        const tierPricingInfo = item.productVariation
          ? await item.productVariation.tierPricingInfo
          : await item.product.tierPricingInfo;
        if (tierPricingInfo && tierPricingInfo.tieredPrices) {
          const tieredPrices = await tierPricingInfo.tieredPrices;
          const applicableTier = tieredPrices.find(
            (tier) =>
              tier.minQuantity !== null &&
              tier.maxQuantity !== null &&
              item.quantity >= tier.minQuantity &&
              item.quantity <= tier.maxQuantity
          );
          if (applicableTier && tierPricingInfo.pricingType) {
            if (
              tierPricingInfo.pricingType === "Fixed" &&
              applicableTier.fixedPrice !== null
            ) {
              price = applicableTier.fixedPrice;
            } else if (
              tierPricingInfo.pricingType === "Percentage" &&
              applicableTier.percentageDiscount !== null
            ) {
              price = price * (1 - applicableTier.percentageDiscount / 100);
            }
          }
        }
        if (coupon.discountType === CouponType.PERCENTAGE_DISCOUNT) {
          discountTotal += price * item.quantity * (coupon.discountValue / 100);
        } else if (coupon.discountType === CouponType.FIXED_PRODUCT_DISCOUNT) {
          discountTotal += coupon.discountValue * item.quantity;
        }
      }
    }
    adjustedCartTotal = Math.max(0, cartTotal - discountTotal);
  }

  // Validate minimumSpend and maximumSpend
  if (coupon.minimumSpend && adjustedCartTotal < coupon.minimumSpend) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} requires a minimum spend of ${coupon.minimumSpend}.`,
    };
  }
  if (coupon.maximumSpend && adjustedCartTotal > coupon.maximumSpend) {
    return {
      valid: false,
      message: `Coupon ${coupon.code} cannot be applied to a cart total exceeding ${coupon.maximumSpend}.`,
    };
  }

  return { valid: true };
}

/**
 * Checks if a coupon is a valid free shipping coupon for the cart.
 */
async function isValidFreeShippingCoupon(
  coupon: Coupon,
  cartItems: any[],
  adjustedCartTotal: number,
  userEmail: string | null,
  currentDate: Date
): Promise<boolean> {
  if (!coupon.freeShipping) return false;

  // Check general coupon validity using validateCoupon
  const validation = await validateCoupon(
    coupon,
    cartItems,
    adjustedCartTotal,
    userEmail
  );
  if (!validation.valid) return false;

  // Additional free shipping-specific checks
  const isApplicable = cartItems.some((item) => {
    if (!item.product) return false;
    const productId = item.product.id;
    const productCategories =
      item.product.categories?.map((cat: any) => cat.id) || [];
    return (
      (!coupon.applicableProducts ||
        coupon.applicableProducts.length === 0 ||
        coupon.applicableProducts.some((prod: any) => prod.id === productId)) &&
      (!coupon.excludedProducts ||
        coupon.excludedProducts.length === 0 ||
        !coupon.excludedProducts.some((prod: any) => prod.id === productId)) &&
      (!coupon.applicableCategories ||
        coupon.applicableCategories.length === 0 ||
        coupon.applicableCategories.some((cat: any) =>
          productCategories.includes(cat.id)
        )) &&
      (!coupon.excludedCategories ||
        coupon.excludedCategories.length === 0 ||
        !coupon.excludedCategories.some((cat: any) =>
          productCategories.includes(cat.id)
        ))
    );
  });

  return isApplicable;
}

/**
 * Applies a coupon to the user's cart.
 */
export const applyCoupon = async (
  _: any,
  args: MutationApplyCouponArgs,
  { user, req }: Context
): Promise<ApplyCouponResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await applyCouponSchema.safeParseAsync(args);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    // Validate input shipping and billing ID with Zod schema
    if (args.shippingAddressId || args.billingAddressId) {
      const [shippingResult, billingResult] = await Promise.all([
        idSchema.safeParseAsync({ id: args.shippingAddressId }),
        idSchema.safeParseAsync({ id: args.billingAddressId }),
      ]);

      if (!shippingResult.success || !billingResult.success) {
        const errors = [
          ...(shippingResult.error?.errors || []),
          ...(billingResult.error?.errors || []),
        ].map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        return {
          statusCode: 400,
          success: false,
          message: "Validation failed",
          errors,
          __typename: "ErrorResponse",
        };
      }
    }

    const { couponCodes, shippingAddressId, billingAddressId } = args;

    // Fetch user cart
    const userCart = await getCartByUserId(user.id);
    if (!userCart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found",
        __typename: "ErrorResponse",
      };
    }

    if (!userCart.items || userCart.items.length === 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Cannot apply coupon to an empty cart",
        __typename: "ErrorResponse",
      };
    }

    // Fetch coupons
    const coupons = await findCouponsByCodes(couponCodes);
    if (coupons.length !== couponCodes.length) {
      return {
        statusCode: 400,
        success: false,
        message: "One or more coupon codes are invalid",
        __typename: "ErrorResponse",
      };
    }

    // Extract user email from token
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = token ? await DecodeToken(token) : null;
    const userEmail = decoded?.email || null;

    // Calculate cart total for validation
    let cartTotal = 0;
    const currentDate = new Date();
    for (const item of userCart.items) {
      if (!item.product) continue;
      let price = item.product.regularPrice ?? 0;
      if (
        item.product.salePrice &&
        (!item.product.salePriceStartAt ||
          new Date(item.product.salePriceStartAt) <= currentDate) &&
        (!item.product.salePriceEndAt ||
          new Date(item.product.salePriceEndAt) >= currentDate)
      ) {
        price = item.product.salePrice;
      }
      if (item.productVariation) {
        price = item.productVariation.regularPrice ?? price;
        if (
          item.productVariation.salePrice &&
          (!item.productVariation.salePriceStartAt ||
            new Date(item.productVariation.salePriceStartAt) <= currentDate) &&
          (!item.productVariation.salePriceEndAt ||
            new Date(item.productVariation.salePriceEndAt) >= currentDate)
        ) {
          price = item.productVariation.salePrice;
        }
      }
      const tierPricingInfo = item.productVariation
        ? await item.productVariation.tierPricingInfo
        : await item.product.tierPricingInfo;
      if (tierPricingInfo && tierPricingInfo.tieredPrices) {
        const tieredPrices = await tierPricingInfo.tieredPrices;
        const applicableTier = tieredPrices.find(
          (tier) =>
            tier.minQuantity !== null &&
            tier.maxQuantity !== null &&
            item.quantity >= tier.minQuantity &&
            item.quantity <= tier.maxQuantity
        );
        if (applicableTier && tierPricingInfo.pricingType) {
          if (
            tierPricingInfo.pricingType === "Fixed" &&
            applicableTier.fixedPrice !== null
          ) {
            price = applicableTier.fixedPrice;
          } else if (
            tierPricingInfo.pricingType === "Percentage" &&
            applicableTier.percentageDiscount !== null
          ) {
            price = price * (1 - applicableTier.percentageDiscount / 100);
          }
        }
      }
      cartTotal += price * item.quantity;
    }
    cartTotal = parseFloat(cartTotal.toFixed(2));

    // Validate coupons
    for (const coupon of coupons) {
      const validation = await validateCoupon(
        coupon,
        userCart.items,
        cartTotal,
        userEmail
      );
      if (!validation.valid) {
        return {
          statusCode: 400,
          success: false,
          message: validation.message || `Coupon ${coupon.code} is invalid`,
          __typename: "ErrorResponse",
        };
      }
    }

    // Apply coupons
    const updatedCart = await applyCouponService(coupons, userCart, user.id);

    // Fetch tax options and address for full cart response
    const UserClient = new GraphQLClient(
      CONFIG.USER_GRAPH_URL || "http://localhost:4001",
      {
        headers: {
          Authorization: `Bearer ${token}` || "",
        },
      }
    );

    const taxExemption = await UserClient.request(GET_TAX_EXEMPTION, {
      userId: decoded.id,
    });
    const taxExemptionData =
      (taxExemption as { getTaxExemptionEntryByUserId?: any })
        .getTaxExemptionEntryByUserId || null;
    if (taxExemptionData.statusCode !== 200) {
      return {
        statusCode: taxExemptionData.statusCode,
        success: taxExemptionData.success,
        message: taxExemptionData.message,
        __typename: "ErrorResponse",
      };
    }

    let shippingAddressInfo;
    let billingAddressInfo;
    if (shippingAddressId) {
      const shippingAddress = await UserClient.request(GET_ADDRESS_BOOK, {
        addressBookEntryById: shippingAddressId,
        userId: decoded.id,
      });
      const shippingAddressData =
        (shippingAddress as { getAddressBookEntryById?: any })
          .getAddressBookEntryById || null;
      if (shippingAddressData?.statusCode !== 200) {
        return {
          statusCode: shippingAddressData.statusCode,
          success: shippingAddressData.success,
          message: shippingAddressData.message,
          __typename: "ErrorResponse",
        };
      }
      if (shippingAddressData.addressBook.type !== "SHIPPING") {
        return {
          statusCode: 400,
          success: false,
          message: "Provided address is not a valid shipping address.",
          __typename: "ErrorResponse",
        };
      }
      shippingAddressInfo = shippingAddressData;
    }

    if (billingAddressId) {
      const billingAddress = await UserClient.request(GET_ADDRESS_BOOK, {
        addressBookEntryById: billingAddressId,
        userId: decoded.id,
      });
      const billingAddressData =
        (billingAddress as { getAddressBookEntryById?: any })
          .getAddressBookEntryById || null;
      if (billingAddressData?.statusCode !== 200) {
        return {
          statusCode: billingAddressData.statusCode,
          success: billingAddressData.success,
          message: billingAddressData.message,
          __typename: "ErrorResponse",
        };
      }
      if (billingAddressData.addressBook.type !== "BILLING") {
        return {
          statusCode: 400,
          success: false,
          message: "Provided address is not a valid billing address.",
          __typename: "ErrorResponse",
        };
      }
      billingAddressInfo = billingAddressData;
    }

    const taxOptions = await getTaxOptions();
    const pricesEnteredWithTax = taxOptions?.pricesEnteredWithTax || false;
    const taxCalculateBasedOn = taxOptions?.calculateTaxBasedOn || null;

    let calculateTax = true;
    if (
      taxExemptionData?.taxExemption &&
      taxExemptionData.taxExemption.status === "Approved" &&
      new Date(taxExemptionData.taxExemption.expiryDate) > currentDate
    ) {
      calculateTax = false;
    }

    let taxAddress: {
      country: string;
      state?: string;
      city?: string;
      postcode?: string;
    } | null = null;
    if (calculateTax) {
      if (taxCalculateBasedOn === "SHIPPING_ADDRESS") {
        if (shippingAddressInfo) {
          taxAddress = {
            country: shippingAddressInfo.addressBook.country,
            state: shippingAddressInfo.addressBook.state,
            city: shippingAddressInfo.addressBook.city,
            postcode: shippingAddressInfo.addressBook.zip,
          };
        } else if (shippingAddressId) {
          return {
            statusCode: 400,
            success: false,
            message: "Shipping address is required for tax calculation",
            __typename: "ErrorResponse",
          };
        }
      } else if (taxCalculateBasedOn === "BILLING_ADDRESS") {
        if (billingAddressInfo) {
          taxAddress = {
            country: billingAddressInfo.addressBook.country,
            state: billingAddressInfo.addressBook.state,
            city: billingAddressInfo.addressBook.city,
            postcode: billingAddressInfo.addressBook.zip,
          };
        } else if (billingAddressId) {
          return {
            statusCode: 400,
            success: false,
            message: "Billing address is required for tax calculation",
            __typename: "ErrorResponse",
          };
        } else {
          return {
            statusCode: 400,
            success: false,
            message: "Billing address ID is required for tax calculation",
            __typename: "ErrorResponse",
          };
        }
      } else if (taxCalculateBasedOn === "STORE_ADDRESS") {
        taxAddress = await getActiveStoreAddress(token);
        if (!taxAddress) {
          calculateTax = false;
        }
      }
    }

    // Recalculate cart totals with discounts
    let productTax = 0;
    let discountTotal = 0;
    const cartItemsWithTax = await Promise.all(
      (updatedCart.items ?? []).map(async (item) => {
        if (!item.product) {
          return {
            id: item.id,
            quantity: item.quantity,
            product: null,
            productVariation: null,
            tax: 0,
            discount: 0,
          };
        }

        let price = item.product.regularPrice ?? 0;
        if (
          item.product.salePrice &&
          (!item.product.salePriceStartAt ||
            new Date(item.product.salePriceStartAt) <= currentDate) &&
          (!item.product.salePriceEndAt ||
            new Date(item.product.salePriceEndAt) >= currentDate)
        ) {
          price = item.product.salePrice;
        }
        if (item.productVariation) {
          price = item.productVariation.regularPrice ?? price;
          if (
            item.productVariation.salePrice &&
            (!item.productVariation.salePriceStartAt ||
              new Date(item.productVariation.salePriceStartAt) <=
                currentDate) &&
            (!item.productVariation.salePriceEndAt ||
              new Date(item.productVariation.salePriceEndAt) >= currentDate)
          ) {
            price = item.productVariation.salePrice;
          }
        }
        const tierPricingInfo = item.productVariation
          ? await item.productVariation.tierPricingInfo
          : await item.product.tierPricingInfo;
        if (tierPricingInfo && tierPricingInfo.tieredPrices) {
          const tieredPrices = await tierPricingInfo.tieredPrices;
          const applicableTier = tieredPrices.find(
            (tier) =>
              tier.minQuantity !== null &&
              tier.maxQuantity !== null &&
              item.quantity >= tier.minQuantity &&
              item.quantity <= tier.maxQuantity
          );
          if (applicableTier && tierPricingInfo.pricingType) {
            if (
              tierPricingInfo.pricingType === "Fixed" &&
              applicableTier.fixedPrice !== null
            ) {
              price = applicableTier.fixedPrice;
            } else if (
              tierPricingInfo.pricingType === "Percentage" &&
              applicableTier.percentageDiscount !== null
            ) {
              price = price * (1 - applicableTier.percentageDiscount / 100);
            }
          }
        }

        let itemDiscount = 0;
        const productId = item.product.id;
        const productCategories =
          item.product.categories?.map((cat: any) => cat.id) || [];

        for (const coupon of updatedCart.coupons ?? []) {
          const isApplicable =
            (!coupon.applicableProducts ||
              coupon.applicableProducts.length === 0 ||
              coupon.applicableProducts.some(
                (prod: any) => prod.id === productId
              )) &&
            (!coupon.excludedProducts ||
              coupon.excludedProducts.length === 0 ||
              !coupon.excludedProducts.some(
                (prod: any) => prod.id === productId
              )) &&
            (!coupon.applicableCategories ||
              coupon.applicableCategories.length === 0 ||
              coupon.applicableCategories.some((cat: any) =>
                productCategories.includes(cat.id)
              )) &&
            (!coupon.excludedCategories ||
              coupon.excludedCategories.length === 0 ||
              !coupon.excludedCategories.some((cat: any) =>
                productCategories.includes(cat.id)
              )) &&
            (!coupon.expiryDate || new Date(coupon.expiryDate) > currentDate) &&
            (coupon.maxUsage === null || coupon.usageCount < coupon.maxUsage) &&
            (!coupon.allowedEmails ||
              coupon.allowedEmails.length === 0 ||
              (userEmail && coupon.allowedEmails.includes(userEmail)));

          if (isApplicable) {
            if (coupon.discountType === CouponType.FIXED_PRODUCT_DISCOUNT) {
              itemDiscount += coupon.discountValue * item.quantity;
            } else if (coupon.discountType === CouponType.PERCENTAGE_DISCOUNT) {
              itemDiscount +=
                price * item.quantity * (coupon.discountValue / 100);
            }
          }
        }

        itemDiscount = Math.min(itemDiscount, price * item.quantity);
        discountTotal += itemDiscount;

        let itemTax = 0;
        if (
          calculateTax &&
          taxAddress &&
          item.product.taxStatus !== "SHIPPING_ONLY"
        ) {
          const taxClassId =
            item.productVariation?.taxClass?.id ?? item.product.taxClass?.id;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(
              taxClassId,
              taxAddress
            );
            if (taxRate) {
              const taxableAmount =
                (price - itemDiscount / item.quantity) * item.quantity;
              if (pricesEnteredWithTax) {
                const taxRateDecimal = taxRate.rate / 100;
                const baseAmount = taxableAmount / (1 + taxRateDecimal);
                itemTax = taxableAmount - baseAmount;
              } else {
                itemTax = taxableAmount * (taxRate.rate / 100);
              }
              productTax += itemTax;
            }
          }
        }

        return {
          id: item.id,
          quantity: item.quantity,
          product: await mapProductRecursive(item.product),
          productVariation: item.productVariation
            ? await mapProductVariationRecursive(item.productVariation)
            : null,
          tax: parseFloat(itemTax.toFixed(2)),
          discount: parseFloat(itemDiscount.toFixed(2)),
          subtotal: parseFloat(
            (price * item.quantity - itemDiscount).toFixed(2)
          ),
        };
      })
    );

    // Apply FIXED_CART_DISCOUNT
    for (const coupon of updatedCart.coupons ?? []) {
      const isValidCoupon =
        (!coupon.expiryDate || new Date(coupon.expiryDate) > currentDate) &&
        (coupon.maxUsage === null || coupon.usageCount < coupon.maxUsage) &&
        (!coupon.allowedEmails ||
          coupon.allowedEmails.length === 0 ||
          (userEmail && coupon.allowedEmails.includes(userEmail)));
      if (
        isValidCoupon &&
        coupon.discountType === CouponType.FIXED_CART_DISCOUNT
      ) {
        const hasApplicableItems = cartItemsWithTax.some((item) => {
          if (!item.product) return false;
          const productId = item.product.id;
          const productCategories =
            item.product.categories?.map((cat: any) => cat.id) || [];
          const isApplicable =
            (!coupon.applicableProducts ||
              coupon.applicableProducts.length === 0 ||
              coupon.applicableProducts.some(
                (prod: any) => prod.id === productId
              )) &&
            (!coupon.excludedProducts ||
              coupon.excludedProducts.length === 0 ||
              !coupon.excludedProducts.some(
                (prod: any) => prod.id === productId
              )) &&
            (!coupon.applicableCategories ||
              coupon.applicableCategories.length === 0 ||
              coupon.applicableCategories.some((cat: any) =>
                productCategories.includes(cat.id)
              )) &&
            (!coupon.excludedCategories ||
              coupon.excludedCategories.length === 0 ||
              !coupon.excludedCategories.some((cat: any) =>
                productCategories.includes(cat.id)
              ));
          return isApplicable;
        });

        if (hasApplicableItems) {
          discountTotal += coupon.discountValue;
        }
      }
    }

    discountTotal = Math.min(discountTotal, cartTotal);
    discountTotal = parseFloat(discountTotal.toFixed(2));

    const adjustedCartTotal = parseFloat(
      (cartTotal - discountTotal).toFixed(2)
    );

    // Check for valid free shipping coupon
    const freeShippingChecks = await Promise.all(
      (updatedCart.coupons ?? []).map(async (coupon) =>
        isValidFreeShippingCoupon(
          coupon,
          updatedCart.items,
          adjustedCartTotal,
          userEmail,
          currentDate
        )
      )
    );
    const hasValidCoupon = freeShippingChecks.some(Boolean); // If any coupon is valid, this will be true

    // Calculate shipping
    let shippingZone: ShippingZone | null = null;
    if (shippingAddressInfo) {
      shippingZone = await getMatchedShippingZone({
        country: shippingAddressInfo.addressBook.country,
        state: shippingAddressInfo.addressBook.state,
        city: shippingAddressInfo.addressBook.city,
        zip: shippingAddressInfo.addressBook.zip,
      });
    }

    const { shippingCost, shippingTax, shippingTotalCostWithTax } =
      await calculateShippingCostAndTax(
        shippingZone,
        updatedCart.items,
        taxAddress,
        pricesEnteredWithTax,
        adjustedCartTotal,
        hasValidCoupon
      );

    // Calculate final totals
    const productTotalWithoutTax = parseFloat(
      (cartTotal - discountTotal).toFixed(2)
    );
    const productTotalCostWithTax = parseFloat(
      (cartTotal - discountTotal + productTax).toFixed(2)
    );
    const inTotal = parseFloat(
      (productTotalCostWithTax + shippingTotalCostWithTax).toFixed(2)
    );

    return {
      statusCode: 200,
      success: true,
      message: "Coupons applied successfully",
      cart: {
        id: updatedCart.id,
        items: cartItemsWithTax,
        coupons: (updatedCart.coupons ?? []).map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description ?? null,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          allowedEmails: coupon.allowedEmails ?? [],
          applicableCategories: (coupon.applicableCategories ?? []).map(
            (cat) => ({
              id: cat.id,
              name: cat.name,
            })
          ),
          excludedCategories: (coupon.excludedCategories ?? []).map((cat) => ({
            id: cat.id,
            name: cat.name,
          })),
          applicableProducts: (coupon.applicableProducts ?? []).map((prod) => ({
            id: prod.id,
            name: prod.name,
          })),
          excludedProducts: (coupon.excludedProducts ?? []).map((prod) => ({
            id: prod.id,
            name: prod.name,
          })),
          freeShipping: coupon.freeShipping ?? false,
          usageCount: coupon.usageCount ?? 0,
          maximumSpend: coupon.maximumSpend ?? null,
          minimumSpend: coupon.minimumSpend ?? null,
          maxUsage: coupon.maxUsage ?? null,
          expiryDate:
            coupon.expiryDate instanceof Date
              ? coupon.expiryDate.toISOString()
              : coupon.expiryDate ?? null,
          createdBy: coupon.createdBy as any,
          createdAt:
            coupon.createdAt instanceof Date
              ? coupon.createdAt.toISOString()
              : coupon.createdAt ?? null,
          deletedAt:
            coupon.deletedAt instanceof Date
              ? coupon.deletedAt.toISOString()
              : coupon.deletedAt ?? null,
        })),
        productTotalWithoutTax,
        productTax: parseFloat(productTax.toFixed(2)),
        productTotalCostWithTax,
        shippingTax,
        shippingCost,
        shippingTotalCostWithTax,
        discountTotal: parseFloat(discountTotal.toFixed(2)),
        inTotal,
        createdBy: updatedCart.createdBy as any,
        createdAt:
          updatedCart.createdAt instanceof Date
            ? updatedCart.createdAt.toISOString()
            : updatedCart.createdAt ?? null,
        deletedAt:
          updatedCart.deletedAt instanceof Date
            ? updatedCart.deletedAt.toISOString()
            : updatedCart.deletedAt ?? null,
      },
      __typename: "CartResponse",
    };
  } catch (error: any) {
    console.error("Error applying coupon:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
