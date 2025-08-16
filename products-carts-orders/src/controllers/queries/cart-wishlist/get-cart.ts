import { gql, GraphQLClient } from "graphql-request";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
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
 * Fetches the cart for the authenticated user.
 *
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

    // Validate input product ID with Zod schema
    if (args.shippingAddressId || args.billingAddressId) {
      // Validate input data with Zod schema
      const [shippingResult, billingResult] = await Promise.all([
        idSchema.safeParseAsync({ id: args.shippingAddressId }),
        idSchema.safeParseAsync({ id: args.billingAddressId }),
      ]);

      // Return detailed validation errors if input is invalid
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

    // Extract token from Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = token ? await DecodeToken(token) : null;

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
      // Fetch shipping address entry
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
      // Fetch billing address entry
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

    // Calculate taxes for cart items
    let totalTax = 0;
    const cartItemsWithTax = await Promise.all(
      (cart.items ?? []).map(async (item) => {
        if (!item.product) {
          return {
            id: item.id,
            quantity: item.quantity,
            product: null,
            productVariation: null,
            tax: 0,
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

        let itemTax = 0;
        if (calculateTax && taxAddress) {
          // Determine tax class (variation takes precedence)
          const taxClassId =
            item.productVariation?.taxClass?.id ?? item.product.taxClass?.id;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(
              taxClassId,
              taxAddress
            );
            if (taxRate) {
              const taxableAmount = price * item.quantity;
              if (pricesEnteredWithTax) {
                // Back-calculate tax: taxableAmount = price / (1 + rate)
                const taxRateDecimal = taxRate.rate / 100;
                const baseAmount = taxableAmount / (1 + taxRateDecimal);
                itemTax = taxableAmount - baseAmount;
              } else {
                // Tax-exclusive: tax = price * quantity * rate
                itemTax = taxableAmount * (taxRate.rate / 100);
              }
              totalTax += itemTax;
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
          tax: itemTax,
        };
      })
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
        totalTax,
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
