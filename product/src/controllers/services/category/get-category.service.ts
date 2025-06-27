import { Brackets, ILike, Not } from "typeorm";
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
  });
}

interface GetPaginatedCategoriesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

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

  const allowedSortFields = ["name", "createdAt", "position"] as const;
  const safeSortBy = allowedSortFields.includes(sortBy as any)
    ? (sortBy as (typeof allowedSortFields)[number])
    : "position";

  const safeSortOrder =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc";

  const query = categoryRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.subCategories", "subCategory")
    .where("category.deletedAt IS NULL");

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;

    query.andWhere(
      new Brackets((qb) => {
        qb.where("category.name ILIKE :searchTerm", { searchTerm })
          .orWhere("category.description ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.name ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.description ILIKE :searchTerm", { searchTerm });
      })
    );
  }

  // Apply dynamic sorting on categories
  query.orderBy(
    `category.${safeSortBy}`,
    safeSortOrder.toUpperCase() as "ASC" | "DESC"
  );

  query.skip(skip).take(limit);

  const [categories, total] = await query.getManyAndCount();

  // Recursive function to sort subCategories array by position ascending (always)
  const sortSubCategoriesRecursively = (
    subs: SubCategory[] | null
  ): SubCategory[] | null => {
    if (!subs) return null;

    subs.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    subs.forEach((sub) => {
      if (sub.subCategories && sub.subCategories.length > 0) {
        sub.subCategories = sortSubCategoriesRecursively(sub.subCategories);
      }
    });

    return subs;
  };

  // Sort nested subcategories by position ascending for each category
  categories.forEach((cat) => {
    cat.subCategories = sortSubCategoriesRecursively(cat.subCategories);
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
