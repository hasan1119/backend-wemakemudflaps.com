import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getTaxExemptionsByUserIdFromRedis } from "../../../helper/redis";
import {
  MutationUpdateTaxExemptionEntryArgs,
  TaxExemptionStatus,
  UpdateTaxExemptionResponseOrError,
} from "../../../types";
import { updateTaxExemptionSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxExemptionByUserId,
  updateTaxExemption as updateTaxExemptionService,
} from "../../services";

/**
 * Handles the update of a tax exemption entry for a user.
 *
 * Workflow:
 * 1. Verifies user authentication.
 * 2. Validates input (id, taxNumber, assumptionReason, taxCertificate, expiryDate).
 * 3. Checks Redis or DB for entry existence and ownership.
 * 4. If not own, checks permission.
 * 5. Updates entry and cache.
 * 6. Returns structured response.
 */
export const updateTaxExemptionEntry = async (
  _: any,
  args: MutationUpdateTaxExemptionEntryArgs,
  { user }: Context
): Promise<UpdateTaxExemptionResponseOrError> => {
  try {
    const authError = checkUserAuth(user);
    if (authError) return authError;

    const result = await updateTaxExemptionSchema.safeParseAsync(args);
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

    //  Attempt to get from Redis cache
    let taxExemption;

    taxExemption = await getTaxExemptionsByUserIdFromRedis(args.userId);

    //  Fallback to DB if not in cache
    if (!taxExemption) {
      const entity = await getTaxExemptionByUserId(args.userId);
      if (!entity) {
        return {
          statusCode: 404,
          success: false,
          message: "Tax exemption not found with of this user",
          __typename: "BaseResponse",
        };
      }
    }

    const isOwn = args.userId === user.id;

    if (isOwn) {
      if (args.status) {
        const hasPermission = await checkUserPermission({
          user,
          action: "canUpdate",
          entity: "tax_exemption",
        });

        if (!hasPermission) {
          return {
            statusCode: 403,
            success: false,
            message:
              "You are not allowed to change the status of your own tax exemption",
            __typename: "BaseResponse",
          };
        }
      }
    } else {
      const hasPermission = await checkUserPermission({
        user,
        action: "canUpdate",
        entity: "tax_exemption",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to update tax exemption for another user",
          __typename: "BaseResponse",
        };
      }
    }

    const updated = await updateTaxExemptionService(args);

    return {
      statusCode: 200,
      success: true,
      message: "Tax exemption updated successfully",
      taxExemption: {
        id: updated.id,
        taxNumber: updated.taxNumber,
        assumptionReason: updated.assumptionReason,
        taxCertificate: updated.taxCertificate as any,
        status: updated.status as TaxExemptionStatus,
        expiryDate: updated.expiryDate
          ? updated.expiryDate instanceof Date
            ? updated.expiryDate.toISOString()
            : updated.expiryDate
          : null,
        createdAt:
          updated.createdAt instanceof Date
            ? updated.createdAt.toISOString()
            : updated.createdAt,
        updatedAt:
          updated.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : updated.updatedAt,
      },
      __typename: "TaxExemptionResponse",
    };
  } catch (error: any) {
    console.error("Error updating tax exemption:", error);
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
