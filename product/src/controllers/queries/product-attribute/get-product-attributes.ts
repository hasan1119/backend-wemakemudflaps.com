import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetAllProductAttributesResponseOrError,
  QueryGetAllProductAttributeArgs,
} from "../../../types";
import {
  paginationSchema,
  productAttributeSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  paginateSystemProductAttributes,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(
  paginationSchema,
  productAttributeSortingSchema
);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllProductAttributeArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of product attributes with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for product attributes.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve product attributes and total count from Redis for performance.
 * 4. On cache miss, fetches product attributes from the database with pagination, search, and sorting.
 * 5. Maps database product attributes to cached format, including creator details.
 * 6. Caches product attributes and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetAllProductAttributesResponseOrError object containing status, message, product attributes, total count, and errors if applicable.
 */
export const getAllProductAttribute = async (
  _: any,
  args: QueryGetAllProductAttributeArgs,
  { user }: Context
): Promise<GetAllProductAttributesResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view product attributes
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "product",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view product attributes info",
        __typename: "BaseResponse",
      };
    }

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

    // On cache miss, fetch attributes from database
    const { attributes: dbAttributes, total: queryTotal } =
      await paginateSystemProductAttributes({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
      });

    const total = queryTotal;

    // Map database product attribute to response format
    const attributesData = await Promise.all(
      dbAttributes.map(async (attribute) => ({
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug,
        systemAttribute: attribute.systemAttribute,
        values: await Promise.all(
          attribute.values.map(async (val: any) => ({
            ...val,
            attribute:
              val.attribute && typeof val.attribute.then === "function"
                ? await val.attribute
                : val.attribute,
          }))
        ),
        createdBy: attribute.createdBy as any,
        createdAt:
          attribute.createdAt instanceof Date
            ? attribute.createdAt.toISOString()
            : attribute.createdAt,
        deletedAt:
          attribute.deletedAt instanceof Date
            ? attribute.deletedAt.toISOString()
            : attribute.deletedAt,
      }))
    );

    return {
      statusCode: 200,
      success: true,
      message: "Product attribute fetched successfully",
      attributes: attributesData,
      totalCount: total,
      __typename: "ProductAttributePaginationResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving product attribute:", {
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
