import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  BaseResponseOrError,
  MutationDeleteProductAttributeArgs,
} from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getProductAttributesByIds,
  hardDeleteAttribute,
} from "../../services";

/**
 * Deletes one or more product attributes by their IDs.
 *
 * @param _ - Unused parent parameter
 * @param args - Arguments containing the IDs of the attributes to delete
 * @param user - Authenticated user context
 * @returns A response indicating success or failure of the deletion operation
 */
export const deleteProductAttribute = async (
  _: any,
  args: MutationDeleteProductAttributeArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete product attributes
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "product",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete product attribute(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids } = args;

    // Validate input data with Zod schemas
    const validationResult = await idsSchema.safeParseAsync({ ids });

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

    // Fetch missing product attribute from the database
    const dbAttributes = await getProductAttributesByIds(ids);
    if (dbAttributes.length !== ids.length) {
      const foundIds = new Set(dbAttributes.map((attr) => attr.id));
      const notFoundIds = ids.filter((id) => !foundIds.has(id));

      const notSystemAttributes = dbAttributes.filter(
        (attr) => attr.systemAttribute === false
      );

      if (notSystemAttributes.length > 0) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You can only delete system attributes. Non-system attributes cannot be deleted.",
          __typename: "BaseResponse",
        };
      }

      return {
        statusCode: 404,
        success: false,
        message: `Product attributes not found with IDs: ${notFoundIds.join(
          ", "
        )}`,
        __typename: "BaseResponse",
      };
    }

    const deletedAttributes: string[] = [];

    for (const attr of dbAttributes) {
      const { id, name } = attr;

      await hardDeleteAttribute(id);
      deletedAttributes.push(name);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedAttributes.length
        ? `Attribute(s) permanently deleted successfully: ${deletedAttributes.join(
            ", "
          )}`
        : "No attributes deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting brand:", error);

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
