import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearFaqsAndCountCache,
  setFaqInfoByIdInRedis,
} from "../../../helper/redis";
import {
  CreateFaqResponseOrError,
  MutationCreateFaqArgs,
} from "../../../types";
import { createFaqSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createFaq as createFaqService,
} from "../../services";

/**
 * Handles the creation of a new FAQ entry in the system.
 *
 * Workflow:
 * 1. Verifies user authentication and permission to create FAQs.
 * 2. Validates input (question and answer) using Zod schema.
 * 3. Checks Redis for existing FAQ question to prevent duplicates.
 * 4. Queries the database for FAQ existence if not found in Redis.
 * 5. Creates the FAQ in the database with audit information from the authenticated user.
 * 6. Caches the new FAQ and its question existence in Redis for future requests.
 * 7. Returns a success response or error if validation, permission, or creation fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing FAQ question and answer.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a CreateFaqResponseOrError object.
 */
export const createFaq = async (
  _: any,
  args: MutationCreateFaqArgs,
  { user }: Context
): Promise<CreateFaqResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create a FAQ
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "site_settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create FAQs",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createFaqSchema.safeParseAsync(args);

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

    const { question, answer } = result.data;

    // Create the FAQ in the database
    const faq = await createFaqService({ question, answer }, user.id);

    // Cache FAQ information in Redis
    await Promise.all([
      setFaqInfoByIdInRedis(faq.id, faq),
      clearFaqsAndCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "FAQ created successfully",
      faq: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        createdBy: faq.createdBy as any,
        createdAt:
          faq.createdAt instanceof Date
            ? faq.createdAt.toISOString()
            : faq.createdAt,
        deletedAt:
          faq.deletedAt instanceof Date
            ? faq.deletedAt.toISOString()
            : faq.deletedAt,
      },
      __typename: "FaqResponse",
    };
  } catch (error: any) {
    console.error("Error creating FAQ:", error);
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
