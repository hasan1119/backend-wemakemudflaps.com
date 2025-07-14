import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearTaxClassesAndCountCache,
  getTaxClassValueExistFromRedis,
  setTaxClassInfoByIdInRedis,
  setTaxClassValueExistInRedis,
} from "../../../helper/redis";
import {
  CreateTaxClassResponseOrError,
  MutationCreateTaxClassArgs,
} from "../../../types";
import { createTaxClassSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTaxClass as createTaxClassService,
  findTaxClassByValue,
} from "../../services";

/**
 * Handles the creation of a new tax class in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create tax classes.
 * 2. Validates input (value, description) using Zod schema.
 * 3. Checks Redis for existing tax class value to prevent duplicates.
 * 4. Queries the database for tax class existence if not found in Redis.
 * 5. Creates the tax class in the database with audit information from the authenticated user.
 * 6. Caches the new tax class and its name existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax class name and slug.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const createTaxClass = async (
  _: any,
  args: MutationCreateTaxClassArgs,
  { user }: Context
): Promise<CreateTaxClassResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a tax class
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tax settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tax class(es)",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createTaxClassSchema.safeParseAsync(args);

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

    const { value, description } = result.data;

    // Attempt to check for existing tax class in Redis
    let taxClassExists = await getTaxClassValueExistFromRedis(value);

    if (!taxClassExists) {
      // On cache miss, check database for tax class existence
      const existingTaxClass = await findTaxClassByValue(value);

      if (existingTaxClass) {
        // Cache tax class existence in Redis
        await setTaxClassValueExistInRedis(value);

        return {
          statusCode: 400,
          success: false,
          message: `A tax class with this ${value} already exists`,
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message: `A tax class with this ${value} already exists`,
        __typename: "BaseResponse",
      };
    }

    // Create the tax class in the database
    const taxClass = await createTaxClassService(
      { value, description },
      user.id
    );

    // Cache tax class information and existence in Redis
    await Promise.all([
      setTaxClassInfoByIdInRedis(taxClass.id, taxClass),
      setTaxClassValueExistInRedis(taxClass.value),
      clearTaxClassesAndCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Tax class created successfully",
      taxClass: {
        id: taxClass.id,
        value: taxClass.value,
        description: taxClass.description,
        createdBy: taxClass.createdBy as any,
        createdAt:
          taxClass.createdAt instanceof Date
            ? taxClass.createdAt.toISOString()
            : taxClass.createdAt,
        deletedAt:
          taxClass.deletedAt instanceof Date
            ? taxClass.deletedAt.toISOString()
            : taxClass.deletedAt,
      },
      __typename: "TaxClassResponse",
    };
  } catch (error: any) {
    console.error("Error creating tax class:", error);
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
