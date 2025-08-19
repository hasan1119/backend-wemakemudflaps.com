import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getProductsAndCountFromRedis,
  setProductsAndCountInRedis,
} from "../../../helper/redis";
import {
  GetProductsResponseOrError,
  QueryGetAllProductsArgs,
} from "../../../types";
import {
  paginationSchema,
  productSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  mapProductRecursive,
  paginateProducts,
} from "../../services";

/**
 * Combine pagination and sorting schemas for validation
 */
const combinedSchema = z.intersection(paginationSchema, productSortingSchema);

/**
 * Map GraphQL input arguments to schema fields
 */
const mapArgsToPagination = (args: QueryGetAllProductsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
  filtering: args.filtering || {},
});

/**
 * Handles fetching a paginated list of products with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for products.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Fetches products from the database with pagination, search, and sorting.
 * 4. Maps database products to cached format, including creator details.
 * 5. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetProductsResponseOrError object containing status, message, products, total count, and errors if applicable.
 */
export const getAllProducts = async (
  _: any,
  args: QueryGetAllProductsArgs,
  { user }: Context
): Promise<GetProductsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view products
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "product",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view products info",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
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

    const { page, limit, search, sortBy, sortOrder, filtering } = mappedArgs;

    // Extract filter arrays for Redis key stability
    const brandIds = filtering.brandIds ?? null;
    const categoryIds = filtering.categoryIds ?? null;
    const tagIds = filtering.tagIds ?? null;
    const productDeliveryType = filtering.productDeliveryType ?? null;
    const forCustomer = false; // Always false for non-customer queries

    // Ensure sortOrder is "asc" or "desc"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const { products: cachedProducts, count: cachedCount } =
      await getProductsAndCountFromRedis(
        page,
        limit,
        search,
        sortBy,
        safeSortOrder,
        brandIds,
        categoryIds,
        tagIds,
        productDeliveryType,
        forCustomer
      );

    let productsData: any[];
    let total: number;

    if (cachedProducts && cachedCount !== null) {
      productsData = cachedProducts;
      total = cachedCount;
    } else {
      // Cache miss: Fetch from DB
      const { products: dbProducts, total: dbTotal } = await paginateProducts({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
        filtering,
      });
      // Fix: Explicitly call mapProductRecursive with only the product parameter
      productsData = await Promise.all(
        dbProducts.map((product) => mapProductRecursive(product))
      );
      total = dbTotal;

      // Cache results for next time
      await setProductsAndCountInRedis(
        page,
        limit,
        search,
        sortBy,
        safeSortOrder,
        brandIds,
        categoryIds,
        tagIds,
        productDeliveryType,
        forCustomer,
        productsData,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product(s) fetched successfully",
      products: productsData,
      total,
      __typename: "ProductPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching products:", {
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
