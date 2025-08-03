import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import { getTaxExemptionsByUserIdFromRedis } from "../../../helper/redis";
import {
  GetTaxExemptionsResponseOrError,
  QueryGetTaxExemptionEntryByUserIdArgs,
  TaxExemptionStatus,
} from "../../../types";
import {
  checkUserAuth,
  checkUserPermission,
  getTaxExemptionByUserId,
} from "../../services";

/**
 * Handles fetching a tax exemption entry by user ID.
 *
 * Workflow:
 * 1. Checks authentication.
 * 2. Verifies ownership or permission to view another user’s data.
 * 3. Tries to get from Redis, falls back to DB.
 * 4. Returns a formatted response or error.
 */
export const getTaxExemptionEntryByUserId = async (
  _: any,
  args: QueryGetTaxExemptionEntryByUserIdArgs,
  { user }: Context
): Promise<GetTaxExemptionsResponseOrError> => {
  try {
    const authError = checkUserAuth(user);
    if (authError) return authError;

    const isOwn = args.userId === user.id;

    if (!isOwn) {
      const hasPermission = await checkUserPermission({
        user,
        action: "canRead",
        entity: "tax_exemption",
      });

      if (!hasPermission) {
        return {
          statusCode: 403,
          success: false,
          message:
            "You do not have permission to view another user's tax exemption",
          __typename: "BaseResponse",
        };
      }
    }

    // Try from Redis
    let taxExemption = await getTaxExemptionsByUserIdFromRedis(args.userId);

    // Fallback to DB
    if (!taxExemption) {
      const entity = await getTaxExemptionByUserId(args.userId);

      if (!entity) {
        return {
          statusCode: 404,
          success: false,
          message: "Tax exemption not found for this user",
          __typename: "BaseResponse",
        };
      }

      taxExemption = {
        id: entity.id,
        taxNumber: entity.taxNumber,
        assumptionReason: entity.assumptionReason,
        taxCertificate: entity.taxCertificate as any,
        status: entity.status as TaxExemptionStatus,
        expiryDate: entity.expiryDate ? entity.expiryDate.toISOString() : null,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Tax exemption fetched successfully",
      taxExemption,
      __typename: "TaxExemptionResponse",
    };
  } catch (error: any) {
    console.error("Error fetching tax exemption by user ID:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong. Please try again later."
          : error.message || "Internal server error.",
      __typename: "BaseResponse",
    };
  }
};
