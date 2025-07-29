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
  findSystemAttributeByNameToUpdate,
  findSystemAttributeBySlugToUpdate,
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

    const { id } = result.data;

    const currentProductAttribute = await getProductAttributeById(id); // fallback to DB

    if (!currentProductAttribute) {
      return {
        statusCode: 404,
        success: false,
        message: `Product attribute not found with this id: ${id}, or it may have been deleted`,
        __typename: "BaseResponse",
      };
    }

    if (currentProductAttribute.systemAttribute) {
      // Check if the system attribute name or slug is being updated and if it already exists
      const existingSystemAttribute = await findSystemAttributeByNameToUpdate(
        id,
        args.name
      );

      if (existingSystemAttribute) {
        return {
          statusCode: 409,
          success: false,
          message: `System attribute with name "${args.name}" already exists`,
          __typename: "BaseResponse",
        };
      }

      const existingSystemAttributeSlug =
        await findSystemAttributeBySlugToUpdate(id, args.slug);
      if (existingSystemAttributeSlug) {
        return {
          statusCode: 409,
          success: false,
          message: `System attribute with slug "${args.slug}" already exists`,
          __typename: "BaseResponse",
        };
      }
    }

    currentProductAttribute.systemAttribute && delete args.forVariation;

    // Update the product attribute in the database
    const updatedProductAttribute = await updateAttributeWithValues(
      args,
      currentProductAttribute
    );

    // Await the related product if it's a Promise
    const resolvedProduct =
      currentProductAttribute.product instanceof Promise
        ? await currentProductAttribute.product
        : currentProductAttribute.product;

    return {
      statusCode: 200,
      success: true,
      message: "Product attribute updated successfully",
      attribute: {
        id: updatedProductAttribute.id,
        name: updatedProductAttribute.name,
        slug: updatedProductAttribute.slug,
        systemAttribute: updatedProductAttribute.systemAttribute,
        values: updatedProductAttribute.values.map((value) => ({
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
        product: resolvedProduct
          ? {
              id: resolvedProduct.id,
              name: resolvedProduct.name,
            }
          : null,
        visible: updatedProductAttribute.visible,
        forVariation: updatedProductAttribute.forVariation,
        createdBy: updatedProductAttribute.createdBy as any,
        createdAt: updatedProductAttribute.createdAt.toISOString(),
        deletedAt:
          updatedProductAttribute.deletedAt instanceof Date
            ? updatedProductAttribute.deletedAt.toISOString()
            : updatedProductAttribute.deletedAt,
      },
      __typename: "ProductAttributeResponse",
    };
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
