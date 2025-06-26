/**
 * Exports GraphQL queries for retrieving category data.
 *
 * Workflow:
 * 1. Provides queries for fetching details of a specific category/sub category by its ID.
 * 2. Enables retrieval of all categories in the system.
 * 5. Facilitates listing all categories in the system.
 */
export { getCategoryById } from "./queries/category/get-category-by-id";
export { getSubCategoryById } from "./queries/category/get-sub-category-by-id";
