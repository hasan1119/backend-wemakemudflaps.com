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

const GET_SHIPPING_ADDRESS = gql`
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
    if (args.shippingAddressId) {
      const validationResult = await idSchema.safeParseAsync({
        id: args.shippingAddressId,
      });

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
        }));

        return {
          statusCode: 400,
          success: false,
          message: "Validation failed",
          errors: errorMessages,
          __typename: "ErrorResponse",
        };
      }
    }

    const { shippingAddressId } = args;

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
      const shippingAddress = await UserClient.request(GET_SHIPPING_ADDRESS, {
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

    // Determine if tax should be calculated
    let calculateTax = true;
    if (
      taxExemptionData?.taxExemption &&
      taxExemptionData.taxExemption.status === "Approved" &&
      new Date(taxExemptionData.taxExemption.expiryDate) > new Date()
    ) {
      calculateTax = false;
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
        if (calculateTax && shippingAddressInfo) {
          // Determine tax class (variation takes precedence)
          const taxClassId =
            item.productVariation?.taxClass?.id ?? item.product.taxClass?.id;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(taxClassId, {
              country: shippingAddressInfo.addressBook.country,
              state: shippingAddressInfo.addressBook.state,
              city: shippingAddressInfo.addressBook.city,
              postcode: shippingAddressInfo.addressBook.zip,
            });

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
