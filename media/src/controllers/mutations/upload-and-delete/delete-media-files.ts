import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationDeleteMediaFilesArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import { checkUserAuth } from "../../services/session-check/session-check";
import { deleteMediaFiles as deleteFiles } from "../../services/upload-and-delete/upload-and-media-files";

export const deleteMediaFiles = async (
  _: any,
  args: MutationDeleteMediaFilesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  const { ids } = args;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Validate input data using Zod schema
    const validationResult = await idsSchema.safeParseAsync({ ids });

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Converts the path array to a string
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

    await deleteFiles(ids);

    return {
      statusCode: 200,
      success: true,
      message: "Media file(s) uploaded successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error during media upload:", error);

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
