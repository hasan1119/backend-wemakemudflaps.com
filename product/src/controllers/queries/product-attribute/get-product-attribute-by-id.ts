import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getProductAttributeById as getProductAttributeByIdService } from "./../../services";

import {
  GetProductAttributeByIdResponseOrError,
  QueryGetProductAttributeByIdArgs,
} from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { checkUserAuth, checkUserPermission } from "../../services";

/**
 * Retrieves a product attribute by its ID.
 *
 * Workflow:
 * 1. Validates user authentication.
 * 2. Checks user permissions for reading product attributes.
 * 3. Validates the input ID.
 * 4. Fetches the product attribute from the database.
 *
 * @param _ - Unused parent parameter
 * @param args - Arguments containing the ID of the product attribute to retrieve
 * @param user - Authenticated user context
 * @returns A response containing the product attribute or an error message
 */
export const getProductAttributeById = async (
  _: any,
  args: QueryGetProductAttributeByIdArgs,
  { user }: Context
): Promise<GetProductAttributeByIdResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to view brands
    const canRead = await checkUserPermission({
      action: "canRead",
      entity: "product",
      user,
    });

    if (!canRead) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to view product attribute info",
        __typename: "BaseResponse",
      };
    }

    // Validate input product attribute ID with Zod schema
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

    // On cache miss, fetch product attribute data from database
    const dbProductAttribute = await getProductAttributeByIdService(id);

    if (!dbProductAttribute) {
      return {
        statusCode: 404,
        success: false,
        message: `Product attribute not found with this id: ${id}, or it may have been deleted`,
        __typename: "BaseResponse",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product attribute fetched successfully",
      attribute: {
        id: dbProductAttribute.id,
        name: dbProductAttribute.name,
        slug: dbProductAttribute.slug,
        systemAttribute: dbProductAttribute.systemAttribute,
        values: dbProductAttribute.values.map((value) => ({
          id: value.id,
          value: value.value,
          createdAt:
            value.createdAt instanceof Date
              ? value.createdAt.toISOString()
              : value.createdAt,
          deletedAt:
            value.deletedAt instanceof Date
              ? value.deletedAt.toISOString()
              : value.deletedAt,
        })),
        systemAttributeId: dbProductAttribute.systemAttributeRef?.id || null,
        createdBy: dbProductAttribute.createdBy as any,
        createdAt:
          dbProductAttribute.createdAt instanceof Date
            ? dbProductAttribute.createdAt.toISOString()
            : dbProductAttribute.createdAt,
        deletedAt:
          dbProductAttribute.deletedAt instanceof Date
            ? dbProductAttribute.deletedAt.toISOString()
            : dbProductAttribute.deletedAt,
      },
      __typename: "ProductAttributeResponse",
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
