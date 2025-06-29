import { Brackets, ILike, Not } from "typeorm";
import { Category } from "../../../entities/category.entity";
import { SubCategory } from "../../../entities/sub-category.entity";
import {
  categoryRepository,
  subCategoryRepository,
} from "../repositories/repositories";

/**
 * Fetches a Category or SubCategory entity by name OR slug within scope.
 *
 * @param name - The name of the category or subcategory.
 * @param slug - The slug of the category or subcategory.
 * @param type - Either "category" or "subCategory".
 * @param categoryId - (Optional) For subcategory: the parent category ID.
 * @param parentScopeId - (Optional) For subcategory: the parent subcategory ID.
 * @returns A matched Category or SubCategory or null.
 */
export async function findCategoryByName(
  name: string,
  slug: string,
  type: "category" | "subCategory",
  categoryId?: string,
  parentScopeId?: string
): Promise<Category | SubCategory | null> {
  if (type === "category") {
    return categoryRepository.findOne({
      where: [
        { name: ILike(name), deletedAt: null },
        { slug: ILike(slug), deletedAt: null },
      ],
      relations: ["subCategories", "products"],
    });
  }

  // First check if the parentCategory or subParentCategory itself matches
  const [parentCategory, subParentCategory] = await Promise.all([
    categoryId
      ? categoryRepository.findOne({
          where: [
            { id: categoryId, name: ILike(name), deletedAt: null },
            { id: categoryId, slug: ILike(slug), deletedAt: null },
          ],
          relations: ["subCategories", "products"],
        })
      : null,
    parentScopeId
      ? subCategoryRepository.findOne({
          where: [
            { id: parentScopeId, name: ILike(name), deletedAt: null },
            { id: parentScopeId, slug: ILike(slug), deletedAt: null },
          ],
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

  // Then look for a subCategory with either name or slug within scope
  return subCategoryRepository.findOne({
    where: [
      {
        name: ILike(name),
        deletedAt: null,
        ...(categoryId && { category: { id: categoryId } }),
        ...(parentScopeId && { parentSubCategory: { id: parentScopeId } }),
      },
      {
        slug: ILike(slug),
        deletedAt: null,
        ...(categoryId && { category: { id: categoryId } }),
        ...(parentScopeId && { parentSubCategory: { id: parentScopeId } }),
      },
    ],
    relations: ["category", "parentSubCategory", "subCategories", "products"],
  });
}

/**
 * Finds a category or subcategory by name or slug (excluding the current one) within its scope.
 *
 * @param id - ID of the entity being updated (to exclude it).
 * @param name - New name being checked.
 * @param slug - New slug being checked (optional).
 * @param type - Either "category" or "subCategory".
 * @param categoryId - (Optional) For subcategory: the parent category ID.
 * @param parentScopeId - (Optional) For subcategory: the parent subcategory ID.
 * @returns A matching record if conflict exists, else null.
 */
export async function findCategoryByNameToUpdateScoped(
  id: string,
  name: string,
  slug: string | undefined,
  type: "category" | "subCategory",
  categoryId?: string,
  parentScopeId?: string
): Promise<Category | SubCategory | null> {
  const whereConditions: any[] = [
    { name: ILike(name), id: Not(id), deletedAt: null },
  ];

  if (slug) {
    whereConditions.push({ slug: ILike(slug), id: Not(id), deletedAt: null });
  }

  if (type === "category") {
    return categoryRepository.findOne({
      where: whereConditions,
    });
  }

  // Build subcategory scoped conditions
  const subcategoryConditions = whereConditions.map((base) => ({
    ...base,
    ...(categoryId && { category: { id: categoryId } }),
    ...(parentScopeId && { parentSubCategory: { id: parentScopeId } }),
  }));

  const conflict = await subCategoryRepository.findOne({
    where: subcategoryConditions,
  });

  if (conflict) return conflict;

  // Also check children of current subcategory
  const current = await subCategoryRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["subCategories"],
  });

  if (
    current?.subCategories?.some((child) => {
      const nameMatch = child.name.toLowerCase() === name.toLowerCase();
      const slugMatch = slug
        ? child.slug.toLowerCase() === slug.toLowerCase()
        : false;
      return nameMatch || slugMatch;
    })
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
 * 2. Constructs a query to filter only non-deleted categories and subcategories.
 * 3. Applies optional search filters across category and subcategory fields.
 * 4. Sorts and paginates the result.
 * 5. Recursively sorts subCategories by position (ascending).
 * 6. Returns the filtered and paginated categories with total count.
 *
 * @param page - The current page number (1-based index).
 * @param limit - The number of categories to retrieve per page.
 * @param search - Optional search query to filter categories by name or description.
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

  // Safely handle sort field
  const allowedSortFields = ["name", "createdAt", "position"] as const;
  const safeSortBy = allowedSortFields.includes(sortBy as any)
    ? (sortBy as (typeof allowedSortFields)[number])
    : "position";

  const safeSortOrder =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc";

  // Build base query: only non-deleted categories
  const query = categoryRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect(
      "category.subCategories",
      "subCategory",
      "subCategory.deletedAt IS NULL" // Only join non-deleted subCategories
    )
    .where("category.deletedAt IS NULL"); // Only fetch non-deleted categories

  // Apply optional search on name/description of both categories and subcategories
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;

    query.andWhere(
      new Brackets((qb) => {
        qb.where("category.name ILIKE :searchTerm", { searchTerm })
          .orWhere("category.description ILIKE :searchTerm", { searchTerm })
          .orWhere("category.slug ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.name ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.description ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.slug ILIKE :searchTerm", { searchTerm });
      })
    );
  }

  // Apply dynamic sorting and pagination
  query
    .orderBy(
      `category.${safeSortBy}`,
      safeSortOrder.toUpperCase() as "ASC" | "DESC"
    )
    .skip(skip)
    .take(limit);

  const [categories, total] = await query.getManyAndCount();

  // Recursively sort subcategories by position ascending
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

  // Sort nested subcategories for each category
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
  const query = categoryRepository
    .createQueryBuilder("category")
    .leftJoin(
      "category.subCategories",
      "subCategory",
      "subCategory.deletedAt IS NULL"
    )
    .where("category.deletedAt IS NULL");

  if (search?.trim()) {
    const searchTerm = `%${search.trim()}%`;
    query.andWhere(
      new Brackets((qb) => {
        qb.where("category.name ILIKE :searchTerm", { searchTerm })
          .orWhere("category.description ILIKE :searchTerm", { searchTerm })
          .orWhere("category.slug ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.name ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.description ILIKE :searchTerm", { searchTerm })
          .orWhere("subCategory.slug ILIKE :searchTerm", { searchTerm });
      })
    );
  }

  return await query.getCount();
};
