import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  MutationUpdateProductAttributeArgs,
  UpdateProductAttributeResponseOrError,
} from "../../../types";
import { UpdateProductAttributeInputSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  findAttributeByNameToUpdate,
  findBrandBySlugToUpdate,
  getProductAttributeById,
  updateAttributeWithValues,
} from "../../services";

/**
 * Updates a product attribute with new values.
 *
 * @param _ - Unused parent parameter
 * @param args - Arguments containing the ID and updated fields of the product attribute
 * @param user - Authenticated user context
 * @returns A response indicating success or failure of the update operation
 */
export const updateProductAttribute = async (
  _: any,
  args: MutationUpdateProductAttributeArgs,
  { user }: Context
): Promise<UpdateProductAttributeResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "product",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update product attributes",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await UpdateProductAttributeInputSchema.safeParseAsync(args);
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

    const { id, name, slug, values } = result.data;

    const currentProductAttribute = await getProductAttributeById(id); // fallback to DB

    if (!currentProductAttribute) {
      return {
        statusCode: 404,
        success: false,
        message: `Product attribute not found with this id: ${id}, or it may have been deleted`,
        __typename: "BaseResponse",
      };
    }

    // Check for duplicate name (if changed)
    if (typeof name === "string" && name !== currentProductAttribute.name) {
      const nameExists = await findAttributeByNameToUpdate(id, name);

      if (nameExists) {
        return {
          statusCode: 400,
          success: false,
          message: `Brand name: "${name}" already exists`,
          __typename: "BaseResponse",
        };
      }

      // Check for duplicate name (if changed)
      if (slug && slug !== currentProductAttribute.slug) {
        const slugExists = await findBrandBySlugToUpdate(id, slug);

        if (slugExists) {
          return {
            statusCode: 400,
            success: false,
            message: `Brand slug: "${slug}" already exists`,
            __typename: "BaseResponse",
          };
        }
      }

      // Update the product attribute in the database
      const updatedProductAttribute = await updateAttributeWithValues(id, args);

      return {
        statusCode: 200,
        success: true,
        message: "Product attribute updated successfully",
        attribute: {
          id: updatedProductAttribute.id,
          name: updatedProductAttribute.name,
          slug: updatedProductAttribute.slug,
          systemAttribute: updatedProductAttribute.systemAttribute,
          values: await Promise.all(
            updatedProductAttribute.values.map(async (val: any) => ({
              ...val,
              attribute:
                val.attribute && typeof val.attribute.then === "function"
                  ? await val.attribute
                  : val.attribute,
            }))
          ),
          createdBy: updatedProductAttribute.createdBy as any,
          createdAt: updatedProductAttribute.createdAt.toISOString(),
          deletedAt:
            updatedProductAttribute.deletedAt instanceof Date
              ? updatedProductAttribute.deletedAt.toISOString()
              : updatedProductAttribute.deletedAt,
        },
        __typename: "ProductAttributeResponse",
      };
    }
  } catch (error: any) {
    console.error("Error updating product attribute:", error);
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
