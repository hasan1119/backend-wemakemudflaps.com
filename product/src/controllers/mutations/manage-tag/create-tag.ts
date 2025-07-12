import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearAllTagCountCache,
  clearAllTagSearchCache,
  getTagNameExistFromRedis,
  getTagSlugExistFromRedis,
  setTagInfoByIdInRedis,
  setTagNameExistInRedis,
  setTagSlugExistInRedis,
} from "../../../helper/redis";
import {
  CreateTagResponseOrError,
  MutationCreateTagArgs,
} from "../../../types";
import { createTagSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTag as createTagService,
  findTagByName,
  findTagBySlug,
} from "../../services";

/**
 * Handles the creation of a new tag in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create tags.
 * 2. Validates input (name, slug) using Zod schema.
 * 3. Checks Redis for existing tag name to prevent duplicates.
 * 4. Queries the database for tag existence if not found in Redis.
 * 5. Creates the tag in the database with audit information from the authenticated user.
 * 6. Caches the new tag and its name existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tag name and slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createTag = async (
  _: any,
  args: MutationCreateTagArgs,
  { user }: Context
): Promise<CreateTagResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a tag
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tag",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tags",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createTagSchema.safeParseAsync(args);

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

    const { name, slug } = result.data;

    // Attempt to check for existing tag in Redis
    let tagExists = await getTagNameExistFromRedis(name);

    if (!tagExists) {
      // On cache miss, check database for tag existence
      const existingTag = await findTagByName(name);

      if (existingTag) {
        // Cache tag existence in Redis
        await setTagNameExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: `A tag with this ${name} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A tag with this ${name} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Attempt to check for existing tag slug in Redis
    let tagSlug = await getTagSlugExistFromRedis(slug);

    if (!tagSlug) {
      // On cache miss, check database for tag existence
      const existingSlugTag = await findTagBySlug(name);

      if (existingSlugTag) {
        // Cache tag existence in Redis
        await setTagSlugExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: `A tag with this ${slug} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A tag with this ${slug} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Create the tag in the database
    const tag = await createTagService({ name, slug }, user.id);

    // Cache tag information and existence in Redis
    await Promise.all([
      setTagInfoByIdInRedis(tag.id, tag),
      setTagNameExistInRedis(tag.name),
      setTagSlugExistInRedis(tag.slug),
      clearAllTagSearchCache(),
      clearAllTagCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Tag created successfully",
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdBy: tag.createdBy as any,
        createdAt:
          tag.createdAt instanceof Date
            ? tag.createdAt.toISOString()
            : tag.createdAt,
        deletedAt:
          tag.deletedAt instanceof Date
            ? tag.deletedAt.toISOString()
            : tag.deletedAt,
      },
      __typename: "TagResponse",
    };
  } catch (error: any) {
    console.error("Error creating tag:", error);
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
