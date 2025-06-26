import { ILike, Not } from "typeorm";
import { Category } from "../../../entities/category.entity";
import { SubCategory } from "../../../entities/sub-category.entity";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";

/**
 * Fetches a Category or SubCategory entity by its name.
 *
 * @param name - The name of the category or subcategory.
 * @param type - Either "category" or "subCategory".
 * @param categoryId - (Optional) Category ID for scoping subCategory.
 * @param parentScopeId - (Optional) Parent SubCategory ID for nested subCategory.
 * @returns A Promise resolving to the matched Category or SubCategory, or null.
 */
export async function findCategoryByName(
  name: string,
  type: "category" | "subCategory",
  categoryId?: string,
  parentScopeId?: string
): Promise<Category | SubCategory | null> {
  if (type === "category") {
    return categoryRepository.findOne({
      where: { name: ILike(name), deletedAt: null },
      relations: ["subCategories", "products"],
    });
  }

  const [parentCategory, subParentCategory] = await Promise.all([
    categoryId
      ? categoryRepository.findOne({
          where: { id: categoryId, name: ILike(name), deletedAt: null },
          relations: ["subCategories", "products"],
        })
      : null,
    parentScopeId
      ? subCategoryRepository.findOne({
          where: { id: parentScopeId, name: ILike(name), deletedAt: null },
          relations: [
            "category",
            "parentSubCategory",
            "subCategories",
            "products",
          ],
        })
      : null,
  ]);

  if (parentCategory) return parentCategory;
  if (subParentCategory) return subParentCategory;

  return subCategoryRepository.findOne({
    where: {
      name: ILike(name),
      deletedAt: null,
      ...(categoryId && { category: { id: categoryId } }),
      ...(parentScopeId && { parentSubCategory: { id: parentScopeId } }),
    },
    relations: ["category", "parentSubCategory", "subCategories", "products"],
  });
}

/**
 * Finds a category or subcategory by name (excluding the current one) within its scope.
 *
 * @param id - ID of the entity being updated (to exclude it).
 * @param name - New name being checked.
 * @param type - Either "category" or "subCategory".
 * @param categoryId - (Optional) For subcategory: the parent category ID.
 * @param parentScopeId - (Optional) For subcategory: the parent subcategory ID.
 * @returns A matching record if conflict exists, else null.
 */
export async function findCategoryByNameToUpdateScoped(
  id: string,
  name: string,
  type: "category" | "subCategory",
  categoryId?: string,
  parentScopeId?: string
): Promise<Category | SubCategory | null> {
  if (type === "category") {
    // Regular category name check
    return categoryRepository.findOne({
      where: {
        name: ILike(name),
        id: Not(id),
        deletedAt: null,
      },
    });
  }

  // Subcategory scope-level conflict check
  const conflict = await subCategoryRepository.findOne({
    where: {
      name: ILike(name),
      id: Not(id),
      deletedAt: null,
      ...(categoryId && { category: { id: categoryId } }),
      ...(parentScopeId && { parentSubCategory: { id: parentScopeId } }),
    },
  });

  if (conflict) return conflict;

  const current = await subCategoryRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["subCategories"],
  });

  if (
    current?.subCategories?.some(
      (child) => child.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    return current;
  }

  return null;
}

/**
 * Fetches a Category by its ID along with all relations defined in the entity.
 *
 * Workflow:
 * 1. Queries the categoryRepository by the given ID.
 * 2. Loads all relations automatically (eager or specified).
 * 3. Returns the Category entity or null if not found.
 *
 * @param id - UUID of the Category to fetch.
 * @returns Promise<Category | null>
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  return await categoryRepository.findOne({
    where: { id },
    relations: ["subCategories"],
  });
}

/**
 * Fetches a SubCategory by its ID along with all relations defined in the entity.
 *
 * Workflow:
 * 1. Queries the subCategoryRepository by the given ID.
 * 2. Loads all relations automatically (eager or specified).
 * 3. Returns the SubCategory entity or null if not found.
 *
 * @param id - UUID of the SubCategory to fetch.
 * @returns Promise<SubCategory | null>
 */
export async function getSubCategoryById(
  id: string
): Promise<SubCategory | null> {
  return await subCategoryRepository.findOne({
    where: { id },
    relations: ["category", "parentSubCategory", "subCategories", "products"],
    select: {
      category: true,
      parentSubCategory: true,
    },
  });
}

interface GetPaginatedCategoriesInput {
  page: number;
  limit: number;
  search?: string;
  sortBy: keyof typeof sortFields;
  sortOrder: "asc" | "desc";
}

// Define allowed sortable fields for safety (optional)
const sortFields = {
  name: true,
  createdAt: true,
  position: true,
};

/**
 * Handles pagination of categories including their subCategories.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted categories and apply search conditions if provided.
 * 3. Queries the categoryRepository to fetch categories with pagination, sorting, and filtering.
 * 4. Includes relation for subCategories.
 * 5. Returns an object with the list of categories and the total count of matching categories.
 *
 * @param page - The current page number (1-based index).
 * @param limit - The number of categories to retrieve per page.
 * @param search - Optional search query to filter categories by name or description (case-insensitive).
 * @param sortBy - The field to sort categories by (e.g., "name", "createdAt", "position").
 * @param sortOrder - The sort direction ("asc" or "desc").
 * @returns A promise resolving to an object containing the paginated categories and total count.
 */
export const paginateCategories = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedCategoriesInput) => {
  const skip = (page - 1) * limit;

  const where: any[] = [{ deletedAt: null }];

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    where.push(
      { name: ILike(searchTerm), deletedAt: null },
      { description: ILike(searchTerm), deletedAt: null }
    );
  }

  // Safety check for sortBy to prevent SQL injection or invalid fields
  const order: Record<string, "asc" | "desc"> = {};
  if (sortFields[sortBy]) {
    order[sortBy] = sortOrder;
  } else {
    order["position"] = "asc"; // default order
  }

  const [categories, total] = await categoryRepository.findAndCount({
    where,
    skip,
    take: limit,
    order,
    relations: ["subCategories"], // Load subCategories relation
  });

  return {
    categories,
    total,
  };
};

/**
 * Handles counting categories matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted categories and apply search conditions if provided.
 * 2. Queries the categoryRepository to count categories matching the criteria.
 * 3. Returns the total number of matching categories.
 *
 * @param search - Optional search term to filter by name or description (case-insensitive).
 * @returns A promise resolving to the total number of matching categories.
 */
export const countCategoriesWithSearch = async (
  search?: string
): Promise<number> => {
  const where: any[] = [{ deletedAt: null }];

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    where.push(
      { name: ILike(searchTerm), deletedAt: null },
      { description: ILike(searchTerm), deletedAt: null }
    );
  }

  return await categoryRepository.count({ where });
};
