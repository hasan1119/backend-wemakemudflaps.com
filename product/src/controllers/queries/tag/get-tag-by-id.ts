import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getTagInfoByTagIdFromRedis,
  setTagInfoByTagIdInRedis,
} from "../../../helper/redis";
import { GetTagByIdResponseOrError, QueryGetTagByIdArgs } from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTagById as getTagByIdService,
} from "../../services";

/**
 * Handles retrieving a tag by its ID with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and checks permission to view tags.
 * 2. Validates input tag ID using Zod schema.
 * 3. Attempts to retrieve tag data from Redis for performance optimization.
 * 4. Fetches tag data from the database if not found in Redis and caches it.
 * 5. Returns a success response with tag data or an error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the tag ID.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetTagByIDResponseOrError object containing status, message, tag data, and errors if applicable.
 */
export const getTagById = async (
  _: any,
  args: QueryGetTagByIdArgs,
  { user }: Context
): Promise<GetTagByIdResponseOrError> => {
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
        message: "You do not have permission to view tag info",
        __typename: "BaseResponse",
      };
    }

    // Validate input tag ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

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

    const { id } = args;

    // Attempt to retrieve cached tag data from Redis
    let tagData = await getTagInfoByTagIdFromRedis(id);

    if (tagData.deletedAt) {
      return {
        statusCode: 404,
        success: false,
        message: `Tag not found with this id: ${id} or has been deleted`,
        __typename: "BaseResponse",
      };
    }

    if (!tagData) {
      // On cache miss, fetch tag data from database
      const dbTag = await getTagByIdService(id);

      if (!dbTag) {
        return {
          statusCode: 404,
          success: false,
          message: `Tag not found with this id: ${id} or has been deleted`,
          __typename: "BaseResponse",
        };
      }

      // Cache tag data in Redis
      await setTagInfoByTagIdInRedis(id, dbTag);
      tagData = dbTag;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tag fetched successfully",
      tag: {
        id: tagData.id,
        name: tagData.name,
        slug: tagData.slug,
        createdBy: tagData.createdBy as any,
        createdAt:
          tagData.createdAt instanceof Date
            ? tagData.createdAt.toISOString()
            : tagData.createdAt,
        deletedAt:
          tagData.deletedAt instanceof Date
            ? tagData.deletedAt.toISOString()
            : tagData.deletedAt,
      },
      __typename: "TagResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving tag:", {
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
