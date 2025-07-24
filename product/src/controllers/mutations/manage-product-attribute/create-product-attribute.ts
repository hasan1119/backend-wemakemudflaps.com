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
  findSystemAttributeByName,
  findSystemAttributeBySlug,
  getProductAttributeById,
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

  if (isSystemAttribute) {
    // Step 4: Check for existing system attribute by name
    const existingSystemAttribute = await findSystemAttributeByName(args.name);

    if (existingSystemAttribute) {
      return {
        statusCode: 409,
        success: false,
        message: `System attribute with name "${args.name}" already exists`,
        __typename: "BaseResponse",
      };
    }

    // Check for existing system attribute by slug
    const existingSystemAttributeSlug = await findSystemAttributeBySlug(
      args.slug
    );

    if (existingSystemAttributeSlug) {
      return {
        statusCode: 409,
        success: false,
        message: `System attribute with slug "${args.slug}" already exists`,
        __typename: "BaseResponse",
      };
    }
  }

  let existingCustomAttribute = null;

  if (args.systemAttributeId) {
    // Step 4: Check for existing custom attribute by name
    existingCustomAttribute = await getProductAttributeById(
      args.systemAttributeId
    );

    if (!existingCustomAttribute) {
      return {
        statusCode: 409,
        success: false,
        message: `System attribute with this id: ${args.systemAttributeId} does not exist`,
        __typename: "BaseResponse",
      };
    }
  }

  // Step 5: Create the attribute
  const productAttribute = isSystemAttribute
    ? await createSystemAttributeWithValues(user.id, args)
    : await createAttributeWithValues(user.id, args, existingCustomAttribute);

  return {
    statusCode: 201,
    success: true,
    message: "Product attribute created successfully",
    attribute: {
      id: productAttribute.id,
      name: productAttribute.name,
      slug: productAttribute.slug,
      systemAttribute: productAttribute.systemAttribute,
      values: productAttribute.values.map((value) => ({
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
