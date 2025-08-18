import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getShopAddressesFromRedis,
  setShopAddressesToRedis,
} from "../../../helper/redis";
import {
  GetShopAddressesResponseOrError,
  QueryGetShopAddressesArgs,
} from "../../../types";
import { paginationSchema } from "../../../utils/data-validation";
import { getShopAddresses as getShopAddressesService } from "../../services";

/**
 * Handles the retrieval of shop addresses with pagination and search functionality.
 *
 * @param _ - Unused parent argument.
 * @param args - Arguments containing pagination and search parameters.
 * @param context - Context containing user information.
 * @returns Response containing shop addresses or an error message.
 */
export const getShopAddresses = async (
  _: any,
  args: QueryGetShopAddressesArgs,
  { user }: Context
): Promise<GetShopAddressesResponseOrError> => {
  try {
    // Validate input data with Zod schema
    const result = await paginationSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
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

    const { page, limit, search } = result.data;

    const forCustomer = user?.id ? false : true;

    //  Attempt to fetch shop addresses and count from Redis cache
    const cachedData = await getShopAddressesFromRedis(
      page,
      limit,
      search,
      forCustomer
    );

    if (cachedData.shopAddresses && cachedData.count !== null) {
      // If cached data found, return it immediately without querying DB
      return {
        statusCode: 200,
        success: true,
        message: "Shop addresses fetched successfully",
        shopAddresses: cachedData.shopAddresses as any,
        total: cachedData.count,
        __typename: "ShopAddressesResponse",
      };
    }

    //  If no cache, fetch data from database or service layer
    const { data, total } = await getShopAddressesService(
      page,
      limit,
      search,
      forCustomer
    );

    //  Cache the fresh data in Redis for future requests
    await setShopAddressesToRedis(
      page,
      limit,
      search,
      data as any,
      total,
      3600,
      forCustomer
    );

    //  Return the fetched data
    return {
      statusCode: 200,
      success: true,
      message: "Shop addresses fetched successfully",
      shopAddresses: data as any,
      total,
      __typename: "ShopAddressesResponse",
    };
  } catch (error: any) {
    console.error("Error fetching shop addresses:", {
      message: error.message,
    });

    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
