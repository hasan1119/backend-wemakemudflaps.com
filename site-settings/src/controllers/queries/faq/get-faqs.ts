import { z } from "zod";
import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getFaqsAndCountFromRedis,
  setFaqsAndCountInRedis,
} from "../../../helper/redis";
import { GetFaqsResponseOrError, QueryGetAllFaqsArgs } from "../../../types";
import {
  faqsSortingSchema,
  paginationSchema,
} from "../../../utils/data-validation";
import { paginateFaqs } from "../../services";

// Combine pagination and sorting schemas for validation
const combinedSchema = z.intersection(paginationSchema, faqsSortingSchema);

// Map GraphQL input arguments to schema fields
const mapArgsToPagination = (args: QueryGetAllFaqsArgs) => ({
  page: args.page,
  limit: args.limit,
  search: args.search,
  sortBy: args.sortBy || "createdAt",
  sortOrder: args.sortOrder || "desc",
});

/**
 * Handles fetching a paginated list of FAQs with optional search and sorting.
 *
 * Workflow:
 * 1. Verifies user authentication and checks read permission for FAQs.
 * 2. Validates input (page, limit, search, sortBy, sortOrder) using Zod schemas.
 * 3. Attempts to retrieve FAQs and total count from Redis for performance.
 * 4. On cache miss, fetches FAQs from the database with pagination, search, and sorting.
 * 5. Maps database FAQs to response format.
 * 6. Caches FAQs and total count in Redis.
 * 7. Returns a success response or error if validation, permission, or retrieval fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing page, limit, search, sortBy, and sortOrder.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a GetFaqsResponseOrError object containing status, message, faqs, total count, and errors if applicable.
 */
export const getAllFaqs = async (
  _: any,
  args: QueryGetAllFaqsArgs,
  { user }: Context
): Promise<GetFaqsResponseOrError> => {
  try {
    // Map and validate input arguments
    const mappedArgs = mapArgsToPagination(args);
    const validationResult = await combinedSchema.safeParseAsync(mappedArgs);

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

    const { page, limit, search, sortBy, sortOrder } = mappedArgs;

    // Ensure sortOrder is "asc" or "desc"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Attempt to retrieve cached FAQs and total count from Redis
    let faqsData;
    let total;

    const cachedData = await getFaqsAndCountFromRedis(
      page,
      limit,
      search,
      sortBy,
      safeSortOrder
    );

    faqsData = cachedData.faqs;
    total = cachedData.count;

    if (!faqsData) {
      // On cache miss, fetch FAQs from database
      const { faqs: dbFaqs, total: queryTotal } = await paginateFaqs({
        page,
        limit,
        search,
        sortBy,
        sortOrder: safeSortOrder,
      });

      total = queryTotal;

      // Map database FAQs to response format
      faqsData = dbFaqs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        createdBy: faq.createdBy as any,
        createdAt: faq.createdAt?.toISOString() || null,
        deletedAt: faq.deletedAt?.toISOString() || null,
      }));

      // Cache FAQs and total count in Redis
      await setFaqsAndCountInRedis(
        page,
        limit,
        search,
        sortBy,
        safeSortOrder,
        faqsData,
        total
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: "FAQs fetched successfully",
      faqs: faqsData,
      total,
      __typename: "FaqPaginationResponse",
    };
  } catch (error: any) {
    console.error("Error fetching FAQs:", {
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
