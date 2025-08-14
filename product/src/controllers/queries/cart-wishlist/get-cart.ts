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

    // Tax Exemption
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

    if (taxExemptionData.statusCode === 403) {
      return {
        statusCode: taxExemptionData.statusCode,
        success: taxExemptionData.success,
        message:
          "Access denied: You do not have permission to view this user's cart due to tax exemption restrictions.",
        __typename: "ErrorResponse",
      };
    }
    if (taxExemptionData.statusCode !== 200) {
      return {
        statusCode: taxExemptionData.statusCode,
        success: taxExemptionData.success,
        message: taxExemptionData.message,
        __typename: "ErrorResponse",
      };
    }

    console.log(taxExemptionData);

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

      if (shippingAddressData?.statusCode === 403) {
        return {
          statusCode: shippingAddressData.statusCode,
          success: shippingAddressData.success,
          message:
            "Access denied: You do not have permission to view this user's cart due to shipping address restriction.",
          __typename: "ErrorResponse",
        };
      }
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

    console.log(shippingAddressInfo);

    /* 
      {
        statusCode: 200,
        success: true,
        message: "Tax exemption fetched successfully",
        taxExemption: {
          id: "d1b6b662-965c-4715-ba27-e3baeafc65bd",
          taxNumber: "TAX_2971AFD",
          assumptionReason: "ZERO TAX",
          status: "Approved",
          expiryDate: "2025-12-31T23:59:59.000Z",
          createdAt: "2025-08-14T06:12:22.689Z",
          updatedAt: "2025-08-14T06:16:36.138Z",
        },
      }
      {
        statusCode: 200,
        success: true,
        message: "AddressBook fetched successfully",
        addressBook: {
          id: "e57acb50-2929-45f1-9a08-be4b331a6914",
          company: "Williams and Gomez Trading",
          streetOne: "113 Oak Extension",
          streetTwo: "Deserunt possimus a",
          city: "Baghlān",
          state: "BGL",
          zip: "1860",
          country: "AF",
          type: "SHIPPING",
          isDefault: false,
          createdAt: "2025-08-10T04:24:51.645Z",
          updatedAt: "2025-08-10T04:32:11.080Z",
        },
      }
    */

    // Calculate tax if the customer has no tax exemption certificate or if the certificate is expired or if the status is not "Approved"

    // Fetch cart
    const cart = await getCartByUserId(user.id);

    // Fetch tax options
    const taxOptions = await getTaxOptions();

    if (taxExemptionData) {
      // Type assertion to access pricesEnteredWithTax safely
      const pricesEnteredWithTax = (
        taxExemptionData as { pricesEnteredWithTax?: boolean }
      ).pricesEnteredWithTax;
      if (!pricesEnteredWithTax) {
      }
    }

    if (!cart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found.",
        __typename: "ErrorResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Cart fetched successfully.",
      cart: {
        id: cart.id,
        items: await Promise.all(
          (cart.items ?? []).map(async (item) => ({
            id: item.id,
            quantity: item.quantity,
            product: await mapProductRecursive(item.product),
            productVariation: item.productVariation
              ? await mapProductVariationRecursive(item.productVariation)
              : null,
            tax: 0,
          }))
        ),
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
        totalTax: 0,
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
