import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  CreateProductAttributeResponseOrError,
  MutationCreateProductAttributeArgs,
  MutationCreateSystemProductAttributeArgs,
} from "../../../types";
import { CreateProductAttributeInputSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createAttributeWithValues,
  createSystemAttributeWithValues,
  findAttributeByName,
  findAttributeBySlug,
} from "../../services";

/**
 * Shared logic to create a product attribute with validation, permission, and duplication checks.
 *
 * @param user - Authenticated user object
 * @param args - Input arguments for attribute creation
 * @returns CreateProductAttributeResponseOrError
 */
export const handleCreateProductAttribute = async (
  user: Context["user"],
  args: MutationCreateProductAttributeArgs,
  isSystemAttribute: boolean
): Promise<CreateProductAttributeResponseOrError> => {
  // Step 1: Check authentication
  const authError = checkUserAuth(user);
  if (authError) return authError;

  // Step 2: Check permission
  const hasPermission = await checkUserPermission({
    user,
    action: "canCreate",
    entity: "product",
  });

  if (!hasPermission) {
    return {
      statusCode: 403,
      success: false,
      message: "You do not have permission to create product attributes",
      __typename: "BaseResponse",
    };
  }

  // Step 3: Validate input
  const result = await CreateProductAttributeInputSchema.safeParseAsync(args);
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

  // Step 4: Check for duplicates
  const attributeExists = await findAttributeByName(name);
  if (attributeExists) {
    return {
      statusCode: 400,
      success: false,
      message: `A product attribute with the name "${name}" already exists`,
      __typename: "BaseResponse",
    };
  }

  const existingSlugAttribute = await findAttributeBySlug(slug);
  if (existingSlugAttribute) {
    return {
      statusCode: 400,
      success: false,
      message: `A product attribute with the slug "${slug}" already exists`,
      __typename: "BaseResponse",
    };
  }

  // Step 5: Create the attribute
  const productAttribute = isSystemAttribute
    ? await createSystemAttributeWithValues(user.id, args)
    : await createAttributeWithValues(user.id, args);

  return {
    statusCode: 201,
    success: true,
    message: "Product attribute created successfully",
    attribute: {
      id: productAttribute.id,
      name: productAttribute.name,
      slug: productAttribute.slug,
      systemAttribute: productAttribute.systemAttribute,
      values: await Promise.all(
        productAttribute.values.map(async (val: any) => ({
          ...val,
          attribute:
            val.attribute && typeof val.attribute.then === "function"
              ? await val.attribute
              : val.attribute,
        }))
      ),
      createdBy: productAttribute.createdBy as any,
      createdAt:
        productAttribute.createdAt instanceof Date
          ? productAttribute.createdAt.toISOString()
          : productAttribute.createdAt,
      deletedAt:
        productAttribute.deletedAt instanceof Date
          ? productAttribute.deletedAt.toISOString()
          : productAttribute.deletedAt,
    },
    __typename: "ProductAttributeResponse",
  };
};

/**
 * Handles the creation of a new system product attribute in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create product attributes.
 * 2. Validates input using Zod schema.
 * 3. Checks for existing product attribute by name and slug.
 * 4. Creates the product attribute with values if validation passes.
 * 5. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing product attribute data.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateProductAttributeResponseOrError object.
 */
export const createSystemProductAttribute = async (
  _: any,
  args: MutationCreateSystemProductAttributeArgs,
  { user }: Context
): Promise<CreateProductAttributeResponseOrError> => {
  try {
    return await handleCreateProductAttribute(user, args, true);
  } catch (error: any) {
    console.error("Error in createSystemProductAttribute:", error);
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

/**
 * Handles the creation of a new product attribute in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create product attributes.
 * 2. Validates input using Zod schema.
 * 3. Checks for existing product attribute by name and slug.
 * 4. Creates the product attribute with values if validation passes.
 * 5. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing product attribute data.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateProductAttributeResponseOrError object.
 */
export const createProductAttribute = async (
  _: any,
  args: MutationCreateProductAttributeArgs,
  { user }: Context
): Promise<CreateProductAttributeResponseOrError> => {
  try {
    return await handleCreateProductAttribute(user, args, false);
  } catch (error: any) {
    console.error("Error in createProductAttribute:", error);
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
