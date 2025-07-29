import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getFaqInfoByIdFromRedis,
  setFaqInfoByIdInRedis,
} from "../../../helper/redis";
import { GetFaqByIdResponseOrError, QueryGetFaqByIdArgs } from "../../../types";
import { idSchema } from "../../../utils/data-validation";
import { getFaqById as getFaqByIdService } from "../../services";

/**
 * Handles retrieving an FAQ by its ID with validation and Redis caching.
 *
 * Workflow:
 * 1. Validates input FAQ ID using Zod schema.
 * 2. Attempts to retrieve FAQ data from Redis for performance optimization.
 * 3. Fetches FAQ data from the database if not found in Redis and caches it.
 * 4. Returns a success response with FAQ data or an error if validation or retrieval fails.
 *
 * Note: No permission check is performed here.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing the FAQ ID.
 * @param context - GraphQL context (not used here but kept for signature consistency).
 * @returns A promise resolving to a GetFaqByIdResponseOrError object containing status, message, FAQ data, and errors if applicable.
 */
export const getFaqById = async (
  _: any,
  args: QueryGetFaqByIdArgs,
  _context: Context
): Promise<GetFaqByIdResponseOrError> => {
  try {
    // Validate input FAQ ID with Zod schema
    const validationResult = await idSchema.safeParseAsync(args);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { id } = args;

    // Attempt to retrieve cached FAQ data from Redis
    let faqData = await getFaqInfoByIdFromRedis(id);

    if (!faqData) {
      // On cache miss, fetch FAQ data from database
      const dbFaq = await getFaqByIdService(id);

      if (!dbFaq) {
        return {
          statusCode: 404,
          success: false,
          message: `FAQ not found with this id: ${id}, or it may have been deleted or moved to the trash`,
          __typename: "BaseResponse",
        };
      }

      faqData = {
        id: dbFaq.id,
        question: dbFaq.question,
        answer: dbFaq.answer,
        createdBy: dbFaq.createdBy as any,
        createdAt:
          dbFaq.createdAt instanceof Date
            ? dbFaq.createdAt.toISOString()
            : dbFaq.createdAt,
        deletedAt:
          dbFaq.deletedAt instanceof Date
            ? dbFaq.deletedAt.toISOString()
            : dbFaq.deletedAt,
      };

      // Cache FAQ data in Redis
      await setFaqInfoByIdInRedis(id, faqData);
    }

    return {
      statusCode: 200,
      success: true,
      message: "FAQ fetched successfully",
      faq: faqData,
      __typename: "FaqResponseById",
    };
  } catch (error: any) {
    console.error("Error retrieving FAQ:", {
      message: error.message,
    });

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
