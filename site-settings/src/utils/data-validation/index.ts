/**
 * Exports common schemas for general use in media-related operations.
 *
 * Workflow:
 * 1. Provides schemas for UUID validation, pagination, sorting, and trash skipping.
 * 2. Includes combined schema for media-related queries.
 */
export {
  idSchema,
  idsSchema,
  paginationSchema,
  skipTrashSchema,
  SortOrderTypeEnum,
} from "./common/common";

/**
 * Exports schemas specifically for site settings validation.
 *
 * Workflow:
 * 1. Provides schema for validating site settings data.
 */
export { siteSettingsSchema } from "./site-settings/site-settings";

/**
 * Exports schemas for validating FAQ data.
 *
 * Workflow:
 * 1. Provides schema for creating, updating, and retrieving FAQs.
 * 2. Includes validation for question and answer fields.
 */
export { createFaqSchema, faqsSortingSchema, updateFaqSchema } from "./faq/faq";
