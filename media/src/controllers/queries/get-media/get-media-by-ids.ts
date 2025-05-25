import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  GetMediaByIdsResponseOrError,
  QueryGetMediaByIdsArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../services";
import { getMediaByIds as getMediaWithId } from "./../../services/get-media/get-media";

export const getMediaByIds = async (
  _: any,
  args: QueryGetMediaByIdsArgs,
  { user }: Context
): Promise<GetMediaByIdsResponseOrError> => {
  const { ids } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data using Zod schema
    const validationResult = await idsSchema.safeParseAsync({ ids });

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

    // Retrieve media by IDs
    let mediaList = await getMediaWithId(ids);

    // Convert createdAt and deletedAt to ISO strings
    const formattedMediaList = mediaList.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
    }));

    return {
      statusCode: 200,
      success: true,
      message: `Retrieved media file(s) successfully`,
      media: formattedMediaList,
      __typename: "MediasResponse",
    };
  } catch (error: any) {
    console.error("Error retrieving media by IDs:", error);

    return {
      statusCode: 500,
      success: false,
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "ErrorResponse",
    };
  }
};
