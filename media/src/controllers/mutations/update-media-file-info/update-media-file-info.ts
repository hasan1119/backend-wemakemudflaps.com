import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationUpdateMediaFileInfoArgs,
} from "../../../types";
import { UpdateMediaFilesSchema } from "../../../utils/data-validation";
import { checkUserAuth, getMediaById } from "../../services";
import { updateMediaFileInfo as updateMedia } from "../../services/update-media-file-info/update-media-file-info";

export const updateMediaFileInfo = async (
  _: any,
  args: MutationUpdateMediaFileInfoArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  const { inputs } = args;
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data using Zod schema
    const validationResult = await UpdateMediaFilesSchema.safeParseAsync(
      inputs
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

    const { id, title, description, altText, dimension, length, category } =
      validationResult.data;

    let existingMedia;

    // Fetch media from database
    existingMedia = await getMediaById(id);

    if (!existingMedia) {
      return {
        statusCode: 404,
        success: false,
        message: `Media not found with this id: ${id} or has been deleted`,
        __typename: "ErrorResponse",
      };
    }

    // Prepare update object, excluding undefined fields
    if (title !== undefined) existingMedia.title = title;
    if (description !== undefined) existingMedia.description = description;
    if (altText !== undefined) existingMedia.altText = altText;
    if (dimension !== undefined) existingMedia.dimension = dimension;
    if (length !== undefined) existingMedia.length = length;
    if (category !== undefined) existingMedia.category = category;

    // Update media files in the database
    await updateMedia(existingMedia);

    return {
      statusCode: 200,
      success: true,
      message: "Media file(s) updated successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error during media update:", error);

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
