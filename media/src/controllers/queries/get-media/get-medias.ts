import { Context } from "../../../context";
import {
  GetMediasResponseOrError,
  QueryGetAllMediasArgs,
} from "../../../types";
import { mediaCombinedSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getAllMedias as getMedias,
} from "../../services";

// Map GraphQL args to combined schema fields
const mapArgsToPagination = (args: QueryGetAllMediasArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Retrieves all media files with pagination, filtering, and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for media.
 * 2. Maps and validates input arguments using Zod.
 * 3. Fetches paginated and filtered media from the database.
 * 4. Returns a list of media or an appropriate error message.
 *
 * @param _ - Unused parent resolver parameter.
 * @param args - Query arguments for pagination, search, sorting, etc.
 * @param context - GraphQL context containing the authenticated user.
 * @returns A promise resolving to GetMediasResponseOrError.
 */
export const getAllMedias = async (
  _: any,
  args: QueryGetAllMediasArgs,
  { user }: Context
): Promise<GetMediasResponseOrError> => {
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view media
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "media",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view media(s) info",
        __typename: "BaseResponse",
      };
    }

    // Map and validate input
    const mappedArgs = mapArgsToPagination(args);

    const validationResult = await mediaCombinedSchema.safeParseAsync(
      mappedArgs
    );

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

    const { page, limit, search, sortBy, sortOrder } = validationResult.data;

    // Query media with pagination and sorting
    const { media, total } = await getMedias(
      page,
      limit,
      search,
      sortBy,
      sortOrder
    );

    // Convert dates to ISO strings
    const mediaWithIsoDates = media.map((item) => ({
      ...item,
      createdBy: item.createdBy as any,
      createdAt: item.createdAt.toISOString(),
      deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "Media file(s) fetched successfully",
      medias: mediaWithIsoDates,
      total,
      __typename: "MediasResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving paginated media:", error);
    return {
      statusCode: error.message.includes("validation failed") ? 400 : 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "ErrorResponse",
    };
  }
};
