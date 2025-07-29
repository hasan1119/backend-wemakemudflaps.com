import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearFaqsAndCountCache,
  getFaqInfoByIdFromRedis,
  setFaqInfoByIdInRedis,
} from "../../../helper/redis";
import {
  MutationUpdateFaqArgs,
  UpdateFaqResponseOrError,
} from "../../../types";
import { updateFaqSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  getFaqById,
  updateFaq as updateFaqService,
} from "../../services";

/**
 * Handles updating FAQ data (question and answer) with validation and permission checks.
 *
 * Workflow:
 * 1. Authenticates user and verifies permission to update FAQs.
 * 2. Validates input (id, question, answer) using Zod schema.
 * 3. Fetches current FAQ data from Redis or DB.
 * 4. Checks if updated question conflicts with existing FAQs.
 * 5. Updates the FAQ in the database.
 * 6. Updates Redis cache with new FAQ info and question existence key.
 * 7. Returns the updated FAQ or error if validation or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing FAQ ID and updated fields.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to an UpdateFaqResponseOrError.
 */
export const updateFaq = async (
  _: any,
  args: MutationUpdateFaqArgs,
  { user }: Context
): Promise<UpdateFaqResponseOrError> => {
  try {
    // Check user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Permission check
    const hasPermission = await checkUserPermission({
      user,
      action: "canUpdate",
      entity: "site settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update FAQs",
        __typename: "BaseResponse",
      };
    }

    // Validate input
    const result = await updateFaqSchema.safeParseAsync(args);

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

    const { id, question, answer } = result.data;

    // Get current FAQ data from Redis or DB
    let currentFaq;

    currentFaq = await getFaqInfoByIdFromRedis(id);

    if (!currentFaq) {
      currentFaq = await getFaqById(id);
      if (!currentFaq) {
        return {
          statusCode: 404,
          success: false,
          message: `FAQ not found with this id: ${id}, or it may have been deleted`,
          __typename: "BaseResponse",
        };
      }
    }

    // Update the FAQ in the database
    const updatedFaq = await updateFaqService(id, { question, answer });

    const updatedFaqData = {
      id: updatedFaq.id,
      question: updatedFaq.question,
      answer: updatedFaq.answer,
      createdBy: updatedFaq.createdBy as any,
      createdAt:
        updatedFaq.createdAt instanceof Date
          ? updatedFaq.createdAt.toISOString()
          : updatedFaq.createdAt,
      deletedAt:
        updatedFaq.deletedAt instanceof Date
          ? updatedFaq.deletedAt.toISOString()
          : updatedFaq.deletedAt,
    };

    // Update Redis cache
    await Promise.all([
      setFaqInfoByIdInRedis(id, updatedFaqData),
      clearFaqsAndCountCache(),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "FAQ updated successfully",
      faq: updatedFaqData,
      __typename: "FaqResponse",
    };
  } catch (error: any) {
    console.error("Error updating FAQ:", error);
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
