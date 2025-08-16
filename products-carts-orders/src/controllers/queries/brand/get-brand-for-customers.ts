import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getBrandsAndCountFromRedis,
  setBrandsAndCountInRedis,
} from "../../../helper/redis";
import {
  GetBrandsResponseOrError,
  QueryGetAllBrandsArgs,
  QueryGetAllBrandsForCustomerArgs,
} from "../../../types";
import {
  brandsSortingSchema,
  paginationSchema,
} from "../../../utils/data-validation";
import { paginateBrands } from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, brandsSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllBrandsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of brands with optional search and sorting.
 *
 * Workflow:
 * 1. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 2. Attempts to retrieve brands and total count from Redis for performance.
 * 3. On cache miss, fetches brands from the database with pagination, search, and sorting.
 * 4. Maps database brands to cached format, including creator details.
 * 5. Caches brands and total count in Redis.
 * 6. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetBrandsResponseOrError object containing status, message, brands, total count, and errors if applicable.
 */
export const getAllBrandsForCustomers = async (
  _: any,
  args: QueryGetAllBrandsForCustomerArgs,
  { user }: Context
): Promise<GetBrandsResponseOrError> => {
  try {
    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

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

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Ensure sortOrder is "asc" or "desc"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Attempt to retrieve cached brands and total count from Redis
    let brandsData;
    let total;

    const cachedData = await getBrandsAndCountFromRedis(
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    brandsData = cachedData.brands;
    total = cachedData.count;

    if (!brandsData) {
      // On cache miss, fetch brands from database
      const { brands: dbBrands, total: queryTotal } = await paginateBrands({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
      });

      total = queryTotal;

      // Map database brands to response format
      brandsData = dbBrands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        thumbnail: brand.thumbnail as any,
        slug: brand.slug,
        totalProducts: brand?.products.length || 0,
        createdBy: brand.createdBy as any,
        createdAt: brand.createdAt?.toISOString() || null,
        deletedAt: brand.deletedAt?.toISOString() || null,
      }));

      // Cache brands and total count in Redis
      await setBrandsAndCountInRedis(
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        brandsData,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Brand(s) fetched successfully",
      brands: brandsData,
      total,
      __typename: "BrandPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching brands:", {
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
