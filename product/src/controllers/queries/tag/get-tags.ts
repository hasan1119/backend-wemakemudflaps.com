import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTagsCountFromRedis,
  getTagsFromRedis,
  setTagsCountInRedis,
  setTagsInRedis,
} from "../../../helper/redis";
import { GetTagsResponseOrError, QueryGetAllTagsArgs } from "../../../types";
import {
  paginationSchema,
  tagsSortingSchema,
} from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  countTagsWithSearch,
  paginateTags,
} from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, tagsSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllTagsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of tags with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for tags.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve tags and total count from Redis for performance.
 * 4. On cache miss, fetches tags from the database with pagination, search, and sorting.
 * 5. Maps database tags to cached format, including creator details.
 * 6. Caches tags and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTagsResponseOrError object containing status, message, tags, total count, and errors if applicable.
 */
export const getAllTags = async (
  _: any,
  args: QueryGetAllTagsArgs,
  { user }: Context
): Promise<GetTagsResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view tags
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "tag",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view tags info",
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

    // Attempt to retrieve cached tags and total count from Redis
    let tagsData = await getTagsFromRedis(
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    let total = await getTagsCountFromRedis(search, sortBy, safeSortOrder);

    if (!tagsData) {
      // On cache miss, fetch tags from database
      const { tags: dbTags, total: queryTotal } = await paginateTags({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
      });

      total = queryTotal;

      // Map database tags to response format
      tagsData = dbTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        totalProducts: tag?.products.length || 0,
        createdBy: tag.createdBy as any,
        createdAt: tag.createdAt?.toISOString() || null,
        deletedAt: tag.deletedAt?.toISOString() || null,
      }));

      // Cache tags and total count in Redis
      await Promise.all([
        setTagsInRedis(page, limit, search, sortBy, sortOrder, tagsData),
        setTagsCountInRedis(search, sortBy, sortOrder, total),
      ]);
    }

    // Calculate total if not found in Redis
    if (total === 0) {
      total = await countTagsWithSearch(search);
      await setTagsCountInRedis(search, sortBy, sortOrder, total);
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tag(s) fetched successfully",
      tags: tagsData,
      total,
      __typename: "TagPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching tags:", {
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
