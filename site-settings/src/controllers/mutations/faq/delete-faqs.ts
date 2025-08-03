import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearFaqsAndCountCache,
  getFaqInfoByIdFromRedis,
  removeFaqInfoByIdFromRedis,
} from "../../../helper/redis";
import { BaseResponseOrError, MutationDeleteFaqsArgs } from "../../../types";
import { idsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getFaqsByIds,
  hardDeleteFaq,
} from "../../services";

/**
 * Handles hard deletion of FAQs with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to delete FAQs.
 * 2. Validates input IDs using Zod schema.
 * 3. Retrieves FAQ data from Redis or database for each ID.
 * 4. Performs hard deletion for each FAQ.
 * 5. Clears related cache entries in Redis.
 * 6. Returns a success response with deleted FAQ questions or error if validation, permission, or deletion fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing FAQ IDs.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const deleteFaqs = async (
  _: any,
  args: MutationDeleteFaqsArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to delete FAQs
    const canDelete = await checkUserPermission({
      action: "canDelete",
      entity: "site_settings",
      user,
    });

    if (!canDelete) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to delete FAQ(s)",
        __typename: "BaseResponse",
      };
    }

    const { ids } = args;

    // Validate input data with Zod schema
    const idsResult = await idsSchema.safeParseAsync({ ids });

    if (!idsResult.success) {
      const errors = idsResult.error.errors.map((e) => ({
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

    // Attempt to retrieve FAQ data from Redis
    const cachedFaqs = await Promise.all(ids.map(getFaqInfoByIdFromRedis));

    const foundFaqs: any[] = [];
    const missingIds: string[] = [];

    cachedFaqs.forEach((faq, index) => {
      if (faq) {
        foundFaqs.push(faq);
      } else {
        missingIds.push(ids[index]);
      }
    });

    // Fetch missing FAQs from the database
    if (missingIds.length > 0) {
      const dbFaqs = await getFaqsByIds(missingIds);

      if (dbFaqs.length !== missingIds.length) {
        const dbFoundIds = new Set(dbFaqs.map((t) => t.id));
        const notFoundFaqs = missingIds
          .filter((id) => !dbFoundIds.has(id))
          .map((id) => id);

        return {
          statusCode: 404,
          success: false,
          message: `FAQs not found with IDs: ${notFoundFaqs.join(", ")}`,
          __typename: "BaseResponse",
        };
      }

      foundFaqs.push(...dbFaqs);
    }

    const deletedFaqQuestions: string[] = [];

    for (const faqData of foundFaqs) {
      const { id, question } = faqData;

      // Perform hard delete
      await hardDeleteFaq(id);

      // Clear Redis cache for this FAQ
      await Promise.all([
        removeFaqInfoByIdFromRedis(id),
        clearFaqsAndCountCache(),
      ]);

      deletedFaqQuestions.push(question);
    }

    return {
      statusCode: 200,
      success: true,
      message: deletedFaqQuestions.length
        ? `FAQ(s) permanently deleted successfully: ${deletedFaqQuestions.join(
            ", "
          )}`
        : "No FAQs deleted",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error deleting FAQ:", error);

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
