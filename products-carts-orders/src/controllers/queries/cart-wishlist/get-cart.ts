import { gql, GraphQLClient } from "graphql-request";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { ShippingZone } from "../../../entities";
import { CouponType } from "../../../entities/coupon.entity";
import { FreeShippingConditions } from "../../../entities/free-shipping.entity";
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
import { shippingZoneRepository } from "../../services/repositories/repositories";

const GET_TAX_EXEMPTION = gql`
  query GetTaxExemptionEntryByUserId($userId: ID!) {
    getTaxExemptionEntryByUserId(userId: $userId) {
      ... on BaseResponse {
        statusCode
        success
        message
      }
      ... on TaxExemptionResponse {
        statusCode
        success
        message
        taxExemption {
          id
          taxNumber
          assumptionReason
          status
          expiryDate
          createdAt
          updatedAt
        }
      }
      ... on ErrorResponse {
        statusCode
        success
        message
        errors {
          field
          message
        }
      }
    }
  }
`;

const GET_ADDRESS_BOOK = gql`
  query GetAddressBookEntryById($addressBookEntryById: ID!, $userId: ID!) {
    getAddressBookEntryById(id: $addressBookEntryById, userId: $userId) {
      ... on BaseResponse {
        statusCode
        success
        message
      }
      ... on AddressResponseBook {
        statusCode
        success
        message
        addressBook {
          id
          company
          streetOne
          streetTwo
          city
          state
          zip
          country
          type
          isDefault
          createdAt
          updatedAt
        }
      }
      ... on ErrorResponse {
        statusCode
        success
        message
        errors {
          field
          message
        }
      }
    }
  }
`;

const GET_SHOP_FOR_TAX = gql`
  query GetShopForDefaultTax {
    getShopForDefaultTax {
      ... on BaseResponse {
        statusCode
        success
        message
      }
      ... on ShopAddressResponse {
        statusCode
        success
        message
        shopAddress {
          id
          brunchName
          addressLine1
          addressLine2
          emails {
            type
            email
          }
          phones {
            type
            number
          }
          city
          state
          country
          zipCode
          direction
          isActive
          openingAndClosingHours {
            opening
            closing
          }
          isEveryDayOpen
          weeklyOffDays {
            day
          }
          isDefaultForTax
        }
      }
      ... on ErrorResponse {
        statusCode
        success
        message
        errors {
          field
          message
        }
      }
    }
  }
`;

/**
 * Fetches the default store address for tax calculations using GraphQL.
 * @param token - The authorization token for the GraphQL request.
 * @returns The default store address (with isDefaultForTax: true) or null if none found.
 */
async function getActiveStoreAddress(token?: string): Promise<{
  country: string;
  state?: string;
  city?: string;
  postcode?: string;
} | null> {
  try {
    const ShopClient = new GraphQLClient(
      process.env.SITE_SETTINGS_URL || "http://localhost:4004",
      {
        headers: {
          Authorization: `Bearer ${token}` || "",
        },
      }
    );

    const response = await ShopClient.request(GET_SHOP_FOR_TAX);

    const shopData = (response as { getShopForDefaultTax?: any })
      .getShopForDefaultTax;

    if (shopData?.statusCode !== 200 || !shopData?.shopAddress) {
      console.error(
        "Error fetching default tax address:",
        shopData?.message || "No shop address found"
      );
      return null;
    }

    const shopAddress = shopData.shopAddress;

    if (!shopAddress.isDefaultForTax) {
      console.error("Shop address is not marked as default for tax");
      return null;
    }

    return {
      country: shopAddress.country || "",
      state: shopAddress.state || undefined,
      city: shopAddress.city || undefined,
      postcode: shopAddress.zipCode || undefined,
    };
  } catch (error) {
    console.error("Error fetching store address via GraphQL:", error);
    return null;
  }
}

/**
 * Matches a shipping zone based on the shipping address.
 * @param shippingAddress - The user's shipping address.
 * @returns The matched ShippingZone or null if none found.
 */
async function getMatchedShippingZone(shippingAddress: {
  country: string;
  state?: string;
  city?: string;
  zip?: string;
}): Promise<ShippingZone | null> {
  try {
    const zones = await shippingZoneRepository.find({
      where: { deletedAt: null },
      relations: [
        "shippingMethods",
        "shippingMethods.flatRate",
        "shippingMethods.freeShipping",
        "shippingMethods.localPickUp",
      ],
    });

    for (const zone of zones) {
      // Match by zip code
      if (
        zone.zipCodes &&
        shippingAddress.zip &&
        zone.zipCodes.includes(shippingAddress.zip)
      ) {
        return zone;
      }
      // Match by regions
      if (zone.regions) {
        const matchedRegion = zone.regions.find(
          (region) =>
            (!region.country ||
              region.country.toLowerCase() ===
                shippingAddress.country.toLowerCase()) &&
            (!region.state ||
              !shippingAddress.state ||
              region.state.toLowerCase() ===
                shippingAddress.state.toLowerCase()) &&
            (!region.city ||
              !shippingAddress.city ||
              region.city.toLowerCase() === shippingAddress.city.toLowerCase())
        );
        if (matchedRegion) {
          return zone;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return null;
  }
}

/**
 * Calculates shipping cost and tax for the cart.
 * @param shippingZone - The matched shipping zone.
 * @param cartItems - The cart items to calculate shipping for.
 * @param taxAddress - The address for tax calculation.
 * @param pricesEnteredWithTax - Whether prices include tax.
 * @param cartTotal - The total cart price before shipping and discounts.
 * @param hasValidCoupon - Whether a valid free shipping coupon is applied.
 * @returns Shipping cost, tax, and total with tax.
 */
async function calculateShippingCostAndTax(
  shippingZone: ShippingZone | null,
  cartItems: any[],
  taxAddress: {
    country: string;
    state?: string;
    city?: string;
    postcode?: string;
  } | null,
  pricesEnteredWithTax: boolean,
  cartTotal: number,
  hasValidCoupon: boolean
): Promise<{
  shippingCost: number;
  shippingTax: number;
  shippingTotalCostWithTax: number;
}> {
  if (!shippingZone || !shippingZone.shippingMethods) {
    return { shippingCost: 0, shippingTax: 0, shippingTotalCostWithTax: 0 };
  }

  // Filter active shipping methods
  const activeMethods = shippingZone.shippingMethods.filter(
    (method) => method.status && method.deletedAt === null
  );
  if (!activeMethods.length) {
    return { shippingCost: 0, shippingTax: 0, shippingTotalCostWithTax: 0 };
  }

  // Select the first active method
  const method = activeMethods[0];

  let shippingCost = 0;
  let shippingTax = 0;

  // Handle different shipping method types
  if (method.flatRate && method.flatRate.taxStatus) {
    // Calculate FlatRate cost
    for (const item of cartItems) {
      if (!item.product) continue;
      const shippingClassId =
        item.productVariation?.shippingClass || item.product.shippingClass;
      if (shippingClassId && method.flatRate.costs) {
        const flatRateCost = method.flatRate.costs.find(
          (cost) => cost.shippingClass.id === shippingClassId
        );
        if (flatRateCost) {
          shippingCost += flatRateCost.cost * item.quantity;
        } else {
          shippingCost += method.flatRate.cost * item.quantity;
        }
      } else {
        shippingCost += method.flatRate.cost * item.quantity;
      }
    }

    // Calculate tax for FlatRate if taxStatus is true
    if (method.flatRate.taxStatus && taxAddress) {
      const taxClassId = method.flatRate.taxStatus
        ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
        : null;
      if (taxClassId) {
        const taxRate = await getTaxRateByTaxClassAndAddress(
          taxClassId,
          taxAddress
        );
        if (taxRate) {
          if (pricesEnteredWithTax) {
            const taxRateDecimal = taxRate.rate / 100;
            const baseAmount = shippingCost / (1 + taxRateDecimal);
            shippingTax = shippingCost - baseAmount;
          } else {
            shippingTax = shippingCost * (taxRate.rate / 100);
          }
        }
      }
    }
  } else if (method.freeShipping) {
    // Check FreeShipping conditions
    const conditions = method.freeShipping.conditions;
    let isFreeShippingEligible = false;

    if (conditions === FreeShippingConditions.NA) {
      isFreeShippingEligible = true;
    } else if (conditions === FreeShippingConditions.COUPON && hasValidCoupon) {
      isFreeShippingEligible = true;
    } else if (
      conditions === FreeShippingConditions.MINIMUM_ORDER_AMOUNT &&
      method.freeShipping.minimumOrderAmount !== null &&
      cartTotal >= method.freeShipping.minimumOrderAmount
    ) {
      isFreeShippingEligible = true;
    } else if (
      conditions === FreeShippingConditions.MINIMUM_ORDER_AMOUNT_OR_COUPON &&
      (hasValidCoupon ||
        (method.freeShipping.minimumOrderAmount !== null &&
          cartTotal >= method.freeShipping.minimumOrderAmount))
    ) {
      isFreeShippingEligible = true;
    } else if (
      conditions === FreeShippingConditions.MINIMUM_ORDER_AMOUNT_AND_COUPON &&
      hasValidCoupon &&
      method.freeShipping.minimumOrderAmount !== null &&
      cartTotal >= method.freeShipping.minimumOrderAmount
    ) {
      isFreeShippingEligible = true;
    }

    if (isFreeShippingEligible) {
      shippingCost = 0;
      shippingTax = 0;
    } else if (activeMethods.length > 1) {
      // Try the next active method
      const nextMethod = activeMethods[1];
      if (nextMethod.flatRate && nextMethod.flatRate.taxStatus) {
        for (const item of cartItems) {
          if (!item.product) continue;
          const shippingClassId =
            item.productVariation?.shippingClass || item.product.shippingClass;
          if (shippingClassId && nextMethod.flatRate.costs) {
            const flatRateCost = nextMethod.flatRate.costs.find(
              (cost) => cost.shippingClass.id === shippingClassId
            );
            if (flatRateCost) {
              shippingCost += flatRateCost.cost * item.quantity;
            } else {
              shippingCost += nextMethod.flatRate.cost * item.quantity;
            }
          } else {
            shippingCost += nextMethod.flatRate.cost * item.quantity;
          }
        }

        if (nextMethod.flatRate.taxStatus && taxAddress) {
          const taxClassId = nextMethod.flatRate.taxStatus
            ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
            : null;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(
              taxClassId,
              taxAddress
            );
            if (taxRate) {
              if (pricesEnteredWithTax) {
                const taxRateDecimal = taxRate.rate / 100;
                const baseAmount = shippingCost / (1 + taxRateDecimal);
                shippingTax = shippingCost - baseAmount;
              } else {
                shippingTax = shippingCost * (taxRate.rate / 100);
              }
            }
          }
        }
      } else if (nextMethod.localPickUp && nextMethod.localPickUp.taxStatus) {
        shippingCost = nextMethod.localPickUp.cost;
        if (nextMethod.localPickUp.taxStatus && taxAddress) {
          const taxClassId = nextMethod.localPickUp.taxStatus
            ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
            : null;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(
              taxClassId,
              taxAddress
            );
            if (taxRate) {
              if (pricesEnteredWithTax) {
                const taxRateDecimal = taxRate.rate / 100;
                const baseAmount = shippingCost / (1 + taxRateDecimal);
                shippingTax = shippingCost - baseAmount;
              } else {
                shippingTax = shippingCost * (taxRate.rate / 100);
              }
            }
          }
        }
      }
    }
  } else if (method.localPickUp && method.localPickUp.taxStatus) {
    shippingCost = method.localPickUp.cost;
    if (method.localPickUp.taxStatus && taxAddress) {
      const taxClassId = method.localPickUp.taxStatus
        ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
        : null;
      if (taxClassId) {
        const taxRate = await getTaxRateByTaxClassAndAddress(
          taxClassId,
          taxAddress
        );
        if (taxRate) {
          if (pricesEnteredWithTax) {
            const taxRateDecimal = taxRate.rate / 100;
            const baseAmount = shippingCost / (1 + taxRateDecimal);
            shippingTax = shippingCost - baseAmount;
          } else {
            shippingTax = shippingCost * (taxRate.rate / 100);
          }
        }
      }
    }
  }

  // Round to two decimal places as per requirement
  shippingCost = parseFloat(shippingCost.toFixed(2));
  shippingTax = parseFloat(shippingTax.toFixed(2));
  const shippingTotalCostWithTax = parseFloat(
    (shippingCost + shippingTax).toFixed(2)
  );

  return { shippingCost, shippingTax, shippingTotalCostWithTax };
}

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
