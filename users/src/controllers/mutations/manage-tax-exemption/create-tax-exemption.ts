import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getTaxExemptionsByUserIdFromRedis } from "../../../helper/redis";
import {
  CreateTaxExemptionResponseOrError,
  MutationCreateTaxExemptionEntryArgs,
  TaxExemptionStatus,
} from "../../../types";
import { createTaxExemptionSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createTaxExemption,
  getTaxExemptionByUserId,
} from "../../services";

/**
 * Handles the creation of a new tax exemption entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication and also check the permission to create tax exemption.
 * 2. Validates input (taxNumber, assumptionReason, taxCertificate, expiryDate) using Zod schema.
 * 3. Creates the tax exemption entry in the database with audit information from the authenticated user.
 * 4. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing tax exemption fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateTaxExemptionResponseOrError object containing status, message, and errors if applicable.
 */
export const createTaxExemptionEntry = async (
  _: any,
  args: MutationCreateTaxExemptionEntryArgs,
  { user }: Context
): Promise<CreateTaxExemptionResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Validate input data with Zod schema
    const result = await createTaxExemptionSchema.safeParseAsync(args);

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

    // Check permission if the user is creating on behalf of someone else
    if (args.userId !== user.id) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canCreate",
        entity: "tax exemption",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to create tax exemption for another user",
          __typename: "BaseResponse",
        };
      }
    }

    //  Attempt to get from Redis cache
    let taxExemptionExist = await getTaxExemptionsByUserIdFromRedis(
      args.userId
    );

    //  Fallback to DB if not in cache
    if (!taxExemptionExist) {
      const entity = await getTaxExemptionByUserId(args.userId);
      if (entity) {
        return {
          statusCode: 404,
          success: false,
          message: "Tax exemption documents already exist for this user",
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 404,
        success: false,
        message: "Tax exemption documents already exist for this user",
        __typename: "BaseResponse",
      };
    }

    // Create the tax exemption entry
    const taxExemption = await createTaxExemption(args);

    return {
      statusCode: 201,
      success: true,
      message: "Tax exemption entry created successfully",
      taxExemption: {
        id: taxExemption.id,
        taxNumber: taxExemption.taxNumber,
        assumptionReason: taxExemption.assumptionReason,
        taxCertificate: taxExemption.taxCertificate as any,
        status: taxExemption.status as TaxExemptionStatus,
        expiryDate: taxExemption.expiryDate
          ? taxExemption.expiryDate instanceof Date
            ? taxExemption.expiryDate.toISOString()
            : taxExemption.expiryDate
          : null,
        createdAt:
          taxExemption.createdAt instanceof Date
            ? taxExemption.createdAt.toISOString()
            : taxExemption.createdAt,
        updatedAt:
          taxExemption.updatedAt instanceof Date
            ? taxExemption.updatedAt.toISOString()
            : taxExemption.updatedAt,
      },
      __typename: "TaxExemptionResponse",
    };
  } catch (error: any) {
    console.error("Error creating tax exemption:", error);
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
