import { GraphQLClient } from "graphql-request";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { ShippingZone } from "../../../entities";
import { CouponType } from "../../../entities/coupon.entity";
import {
  GetCartOrWishListResponseOrError,
  QueryGetCartArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import DecodeToken from "../../../utils/jwt/decode-token";
import {
  checkUserAuth,
  getCartByUserId,
  getTaxOptions,
  getTaxRateByTaxClassAndAddress,
  mapProductRecursive,
  mapProductVariationRecursive,
} from "../../services";
import {
  calculateShippingCostAndTax,
  GET_ADDRESS_BOOK,
  GET_TAX_EXEMPTION,
  getActiveStoreAddress,
  getMatchedShippingZone,
} from "../../services/cart-wishlist/shared/get-query.utils";

/**
 * Validates if a coupon is applicable for free shipping based on cart items and user email.
 * @param coupon - The coupon to validate.
 * @param cartItems - The cart items to check against applicable/excluded products and categories.
 * @param cartTotal - The total cart price before discounts.
 * @param userEmail - The user's email from the JWT token.
 * @returns Whether the coupon is valid for free shipping.
 */
function isValidFreeShippingCoupon(
  coupon: any,
  cartItems: any[],
  cartTotal: number,
  userEmail: string | null
): boolean {
  // Check basic coupon validity
  if (
    !coupon.freeShipping ||
    (coupon.expiryDate && new Date(coupon.expiryDate) <= new Date()) ||
    (coupon.minimumSpend && cartTotal < coupon.minimumSpend) ||
    (coupon.maximumSpend && cartTotal > coupon.maximumSpend) ||
    (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage)
  ) {
    return false;
  }

  // Check allowedEmails
  if (coupon.allowedEmails && coupon.allowedEmails.length > 0 && userEmail) {
    if (!coupon.allowedEmails.includes(userEmail)) {
      return false;
    }
  }

  // Check applicable/excluded products and categories
  const hasApplicableItems = cartItems.some((item) => {
    if (!item.product) return false;

    const productId = item.product.id;
    const productCategories =
      item.product.categories?.map((cat: any) => cat.id) || [];

    // Check applicableProducts
    const isApplicableProduct =
      !coupon.applicableProducts ||
      coupon.applicableProducts.length === 0 ||
      coupon.applicableProducts.some((prod: any) => prod.id === productId);

    // Check excludedProducts
    const isNotExcludedProduct =
      !coupon.excludedProducts ||
      coupon.excludedProducts.length === 0 ||
      !coupon.excludedProducts.some((prod: any) => prod.id === productId);

    // Check applicableCategories
    const isApplicableCategory =
      !coupon.applicableCategories ||
      coupon.applicableCategories.length === 0 ||
      coupon.applicableCategories.some((cat: any) =>
        productCategories.includes(cat.id)
      );

    // Check excludedCategories
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

  return hasApplicableItems;
}

/**
 * Fetches the cart for the authenticated user.
 * @param _ - Unused parent argument.
 * @param args - The arguments for fetching the cart.
 * @param context - The context containing user information.
 * @returns A promise that resolves to the cart response or an error response.
 */
export const getCart = async (
  _: any,
  args: QueryGetCartArgs,
  { user, req }: Context
): Promise<GetCartOrWishListResponseOrError> => {
  try {
    // Auth check
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

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

    const { shippingAddressId, billingAddressId } = args;

    // Extract token and decode user email
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = token ? await DecodeToken(token) : null;
    const userEmail = decoded?.email || null;

    // Create GraphQL client for user subgraph
    const UserClient = new GraphQLClient(
      CONFIG.USER_GRAPH_URL || "http://localhost:4001",
      {
        headers: {
          Authorization: `Bearer ${token}` || "",
        },
      }
    );

    // Fetch tax exemption entry
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
          success: shippingAddressData.success,
          message: "Provided address is not a valid shipping address.",
          __typename: "ErrorResponse",
        };
      }

      shippingAddressInfo = shippingAddressData;
    }

    let billingAddressInfo;
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
          success: billingAddressData.success,
          message: "Provided address is not a valid billing address.",
          __typename: "ErrorResponse",
        };
      }

      billingAddressInfo = billingAddressData;
    }

    // Fetch cart
    const cart = await getCartByUserId(user.id);
    if (!cart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found.",
        __typename: "ErrorResponse",
      };
    }

    // Fetch tax options
    const taxOptions = await getTaxOptions();
    const pricesEnteredWithTax = taxOptions?.pricesEnteredWithTax || false;
    const taxCalculateBasedOn = taxOptions?.calculateTaxBasedOn || null;

    // Determine if tax should be calculated
    let calculateTax = true;
    if (
      taxExemptionData?.taxExemption &&
      taxExemptionData.taxExemption.status === "Approved" &&
      new Date(taxExemptionData.taxExemption.expiryDate) > new Date()
    ) {
      calculateTax = false;
    }

    // Determine address for tax calculation
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
        } else {
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
        } else {
          return {
            statusCode: 400,
            success: false,
            message: "Billing address is required for tax calculation",
            __typename: "ErrorResponse",
          };
        }
      } else if (taxCalculateBasedOn === "STORE_ADDRESS") {
        taxAddress = await getActiveStoreAddress(token);
        if (!taxAddress) {
          calculateTax = false; // Skip tax calculation if no store address found
        }
      }
    }

    // Calculate cart total and apply coupon discounts
    let cartTotal = 0;
    let productTax = 0;
    let discountTotal = 0;

    const cartItemsWithTax = await Promise.all(
      (cart.items ?? []).map(async (item) => {
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

        // Determine base price (salePrice if valid, else regularPrice)
        const currentDate = new Date();
        let basePrice = item.product.regularPrice ?? 0;
        if (
          item.product.salePrice &&
          (!item.product.salePriceStartAt ||
            new Date(item.product.salePriceStartAt) <= currentDate) &&
          (!item.product.salePriceEndAt ||
            new Date(item.product.salePriceEndAt) >= currentDate)
        ) {
          basePrice = item.product.salePrice;
        }
        if (item.productVariation) {
          basePrice = item.productVariation.regularPrice ?? basePrice;
          if (
            item.productVariation.salePrice &&
            (!item.productVariation.salePriceStartAt ||
              new Date(item.productVariation.salePriceStartAt) <=
                currentDate) &&
            (!item.productVariation.salePriceEndAt ||
              new Date(item.productVariation.salePriceEndAt) >= currentDate)
          ) {
            basePrice = item.productVariation.salePrice;
          }
        }

        // Apply tiered pricing
        let price = basePrice;
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
              price = basePrice * (1 - applicableTier.percentageDiscount / 100);
            }
          }
        }

        // Apply coupon discounts
        let itemDiscount = 0;
        const productId = item.product.id;
        const productCategories =
          item.product.categories?.map((cat: any) => cat.id) || [];

        for (const coupon of cart.coupons ?? []) {
          // Validate coupon for this item
          const isApplicableProduct =
            !coupon.applicableProducts ||
            coupon.applicableProducts.length === 0 ||
            coupon.applicableProducts.some(
              (prod: any) => prod.id === productId
            );
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
          const isValidCoupon =
            (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) &&
            (coupon.maxUsage === null || coupon.usageCount < coupon.maxUsage) &&
            (!coupon.allowedEmails ||
              coupon.allowedEmails.length === 0 ||
              (userEmail && coupon.allowedEmails.includes(userEmail))) &&
            isApplicableProduct &&
            isNotExcludedProduct &&
            isApplicableCategory &&
            isNotExcludedCategory;

          if (isValidCoupon) {
            if (coupon.discountType === CouponType.FIXED_PRODUCT_DISCOUNT) {
              itemDiscount += coupon.discountValue * item.quantity;
            } else if (coupon.discountType === CouponType.PERCENTAGE_DISCOUNT) {
              itemDiscount +=
                price * item.quantity * (coupon.discountValue / 100);
            }
            // Note: FIXED_CART_DISCOUNT is applied to cartTotal below
          }
        }

        // Ensure discount does not exceed item price
        itemDiscount = Math.min(itemDiscount, price * item.quantity);
        discountTotal += itemDiscount;

        // Calculate item tax
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

        // Add to cart total (before discounts)
        cartTotal += price * item.quantity;

        return {
          id: item.id,
          quantity: item.quantity,
          product: await mapProductRecursive(item.product),
          productVariation: item.productVariation
            ? await mapProductVariationRecursive(item.productVariation)
            : null,
          tax: parseFloat(itemTax.toFixed(2)),
          discount: parseFloat(itemDiscount.toFixed(2)),
        };
      })
    );

    // Apply FIXED_CART_DISCOUNT coupons
    for (const coupon of cart.coupons ?? []) {
      const isValidCoupon =
        (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) &&
        (coupon.maxUsage === null || coupon.usageCount < coupon.maxUsage) &&
        (!coupon.allowedEmails ||
          coupon.allowedEmails.length === 0 ||
          (userEmail && coupon.allowedEmails.includes(userEmail)));
      if (
        isValidCoupon &&
        coupon.discountType === CouponType.FIXED_CART_DISCOUNT
      ) {
        // Check if cart meets product/category restrictions
        const hasApplicableItems = cartItemsWithTax.some((item) => {
          if (!item.product) return false;
          const productId = item.product.id;
          const productCategories =
            item.product.categories?.map((cat: any) => cat.id) || [];
          const isApplicableProduct =
            !coupon.applicableProducts ||
            coupon.applicableProducts.length === 0 ||
            coupon.applicableProducts.some(
              (prod: any) => prod.id === productId
            );
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

        if (hasApplicableItems) {
          discountTotal += coupon.discountValue;
        }
      }
    }

    // Ensure discountTotal does not exceed cartTotal
    discountTotal = Math.min(discountTotal, cartTotal);
    discountTotal = parseFloat(discountTotal.toFixed(2));

    // Apply minimumSpend and maximumSpend for coupons after discounts
    let adjustedCartTotal = cartTotal - discountTotal;
    adjustedCartTotal = parseFloat(adjustedCartTotal.toFixed(2));

    // Check for valid free shipping coupon
    const hasValidCoupon = (cart.coupons ?? []).some((coupon) =>
      isValidFreeShippingCoupon(
        coupon,
        cart.items,
        adjustedCartTotal,
        userEmail
      )
    );

    // Calculate shipping cost and tax using adjusted cart total
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
        cart.items,
        taxAddress,
        pricesEnteredWithTax,
        adjustedCartTotal,
        hasValidCoupon
      );

    // Calculate final totals
    const productTotalCostWithTax = parseFloat(
      (cartTotal - discountTotal + productTax).toFixed(2)
    );
    const inTotal = parseFloat(
      (productTotalCostWithTax + shippingTotalCostWithTax).toFixed(2)
    );

    return {
      statusCode: 200,
      success: true,
      message: "Cart fetched successfully.",
      cart: {
        id: cart.id,
        items: cartItemsWithTax,
        coupons: (cart.coupons ?? []).map((coupon) => ({
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
        productTax: parseFloat(productTax.toFixed(2)),
        productTotalCostWithTax,
        shippingTax,
        shippingCost,
        shippingTotalCostWithTax,
        inTotal,
        createdBy: cart.createdBy as any,
        createdAt:
          cart.createdAt instanceof Date
            ? cart.createdAt.toISOString()
            : cart.createdAt ?? null,
        deletedAt:
          cart.deletedAt instanceof Date
            ? cart.deletedAt.toISOString()
            : cart.deletedAt ?? null,
      },
      __typename: "CartResponse",
    };
  } catch (error: any) {
    console.error("Error fetching cart:", error);
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
