import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationUploadMediaFilesArgs,
} from "../../../types";
import { createUploadMediaFilesSchema } from "../../../utils/data-validation";
import { checkUserPermission } from "../../services";
import { checkUserAuth } from "../../services/session-check/session-check";
import { uploadMediaFiles as uploadFiles } from "../../services/upload-and-delete/upload-and-delete-media-files";

export const uploadMediaFiles = async (
  _: any,
  args: MutationUploadMediaFilesArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  const data = args.inputs;

  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to create a role
    const canCreate = await checkUserPermission({
      action: "canCreate",
      entity: "media",
      user,
    });

    if (!canCreate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create role",
        __typename: "BaseResponse",
      };
    }

    // Create schema with context user.id for validation
    const UploadMediaFilesSchema = createUploadMediaFilesSchema(user.id);

    // Validate input data using Zod schema
    const validationResult = await UploadMediaFilesSchema.safeParseAsync(data);

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

    await uploadFiles(validationResult.data);

    return {
      statusCode: 200,
      success: true,
      message: "Media files uploaded successfully",
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
