import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  setProductNameExistInRedis,
  setProductSlugExistInRedis,
} from "../../../helper/redis";
import {
  CreateProductResponseOrError,
  MutationCreateProductArgs,
} from "../../../types";
import { createProductSchema } from "../../../utils/data-validation/product/product";
import {
  checkUserAuth,
  checkUserPermission,
  createProduct as createProductService,
  findProductByName,
  findProductBySlug,
} from "../../services";

/**
 * Handles the creation of a new product in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create products.
 * 2. Validates input (name, slug, and other product details) using Zod schema.
 * 3. Checks Redis for existing product name and slug to prevent duplicates.
 * 4. Queries the database for product existence if not found in Redis.
 * 5. Creates the product in the database with audit information from the authenticated user.
 * 6. Caches the new product and its name/slug existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing product details.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateProductResponseOrError object containing status, message, and errors if applicable.
 */
export const createProduct = async (
  _: any,
  args: MutationCreateProductArgs,
  { user }: Context
): Promise<CreateProductResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a product
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "product",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create products",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createProductSchema.safeParseAsync({
      ...args,
      createdBy: user.id,
    });

    // Return detailed validation errors if input is invalid
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

    // Attempt to check for existing product in Redis
    let productExists;

    // productExists = await getProductNameExistFromRedis(name);

    if (!productExists) {
      // On cache miss, check database for product existence
      const existingProduct = await findProductByName(name);

      if (existingProduct) {
        // Cache product existence in Redis
        await setProductNameExistInRedis(name);

        return {
          statusCode: 400,
          success: false,
          message: `A product with this name: ${name} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A product with this name: ${name} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Attempt to check for existing product slug in Redis
    let productSlug;

    // productSlug = await getProductSlugExistFromRedis(slug);

    if (!productSlug) {
      // On cache miss, check database for product existence
      const existingSlugProduct = await findProductBySlug(slug);

      if (existingSlugProduct) {
        // Cache product existence in Redis
        await setProductSlugExistInRedis(slug);

        return {
          statusCode: 400,
          success: false,
          message: `A product with this slug: ${slug} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A product with this slug: ${slug} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Create the product in the database
    await createProductService(result.data as any, user.id);

    // const category = await getCategoryById(
    //   _,
    //   { id: args.categoryId },
    //   user as any
    // );

    // Cache product information and existence in Redis
    // await Promise.all([
    //   setProductInfoByIdInRedis(product.id, product),
    //   setProductNameExistInRedis(product.name),
    //   setProductSlugExistInRedis(product.slug),
    //   clearAllProductSearchCache(),
    // ]);

    return {
      statusCode: 201,
      success: true,
      message: "Product created successfully",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
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
