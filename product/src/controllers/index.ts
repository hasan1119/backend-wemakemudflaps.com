/**
 * Exports GraphQL queries and mutations for managing category data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring categories or sub-categories.
 * 2. Enables retrieval of a specific category or sub-category by its ID.
 * 3. Facilitates listing all categories and sub-categories in the system.
 */
export { createCategory } from "./mutations/manage-category/create-category";
export { deleteCategory } from "./mutations/manage-category/delete-category";
export { restoreCategory } from "./mutations/manage-category/restore-category";
export { updateCategory } from "./mutations/manage-category/update-category";
export { updateCategoryPosition } from "./mutations/manage-category/update-category-position";
export { getAllCategories } from "./queries/category/get-categories";
export { getCategoryById } from "./queries/category/get-category-by-id";
export { getSubCategoryById } from "./queries/category/get-sub-category-by-id";

/**
 * Exports GraphQL queries and mutations for managing tag data.
 *
 * Workflow:
 * 1. Provides mutations for creating, updating, deleting, and restoring tags.
 * 2. Enables retrieval of a specific tag by its ID.
 * 3. Facilitates listing all tags in the system.
 */
export { createTag } from "./mutations/manage-tag/create-tag";
export { deleteTag } from "./mutations/manage-tag/delete-tag";
export { restoreTag } from "./mutations/manage-tag/restore-tag";
export { updateTag } from "./mutations/manage-tag/update-tag";
export { getTagById } from "./queries/tag/get-tag-by-id";
export { getAllTags } from "./queries/tag/get-tags";
