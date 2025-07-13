import { ILike, Not } from "typeorm";
import { Category } from "../../../entities";
import { categoryRepository } from "../repositories/repositories";

/**
 * Fetches a Category entity by name OR slug within scope.
 *
 * @param name - The name of the category.
 * @param slug - The slug of the category.
 * @param parentCategoryId - (Optional) The parent category ID for scoped search (null for root categories).
 * @returns A matched Category or null.
 */
export async function findCategoryByNameOrSlug(
  name: string,
  slug: string,
  parentCategoryId?: string | null
): Promise<Category | null> {
  // Build where conditions for name and slug within the same parent scope
  const conditions = [
    {
      name: ILike(name),
      deletedAt: null,
      parentCategory: parentCategoryId ? { id: parentCategoryId } : null,
    },
    {
      slug: ILike(slug),
      deletedAt: null,
      parentCategory: parentCategoryId ? { id: parentCategoryId } : null,
    },
  ];

  return categoryRepository.findOne({
    where: conditions,
    relations: ["parentCategory", "subCategories"],
  });
}

/**
 * Finds a category by name or slug (excluding the current one) within its scope.
 *
 * @param id - ID of the category being updated (to exclude it).
 * @param name - New name being checked.
 * @param slug - New slug being checked (optional).
 * @param parentCategoryId - (Optional) The parent category ID for scoped search.
 * @returns A matching record if conflict exists, else null.
 */
export async function findCategoryByNameOrSlugToUpdateScoped(
  id: string,
  name: string,
  slug: string | undefined,
  parentCategoryId?: string | null
): Promise<Category | null> {
  const whereConditions: any[] = [
    {
      name: ILike(name),
      id: Not(id),
      deletedAt: null,
      parentCategory: parentCategoryId ? { id: parentCategoryId } : null,
    },
  ];

  if (slug) {
    whereConditions.push({
      slug: ILike(slug),
      id: Not(id),
      deletedAt: null,
      parentCategory: parentCategoryId ? { id: parentCategoryId } : null,
    });
  }

  // Check if any conflicting category exists
  const conflict = await categoryRepository.findOne({
    where: whereConditions,
  });

  if (conflict) return conflict;

  // Also check children of current category for conflicts
  const current = await categoryRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["subCategories"],
  });

  if (
    current?.subCategories?.some((child) => {
      const nameMatch =
        typeof child.name === "string" &&
        typeof name === "string" &&
        child.name.toLowerCase() === name.toLowerCase();
      const slugMatch =
        typeof child.slug === "string" &&
        typeof slug === "string" &&
        child.slug.toLowerCase() === slug.toLowerCase();
      return nameMatch || slugMatch;
    })
  ) {
    return current;
  }

  return null;
}

/**
 * Fetches a Category by its ID with all nested subcategories.
 *
 * @param id - UUID of the Category to fetch.
 * @returns Promise<Category | null>
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  // Fetch the category with first-level subcategories and products
  const category = await categoryRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["parentCategory", "subCategories"],
  });

  if (!category) return null;

  // Fetch nested subcategories recursively
  category.subCategories = await fetchNestedCategories(category.id);

  // Format dates to ISO strings
  category.createdAt = new Date(category.createdAt).toISOString() as any;

  return category;
}

/**
 * Fetches multiple categories by their IDs (not soft-deleted).
 *
 * @param ids - Array of category UUIDs.
 * @returns Array of Category entities.
 */
export async function getCategoryByIds(ids: string[]): Promise<Category[]> {
  if (!ids.length) return [];

  // Fetch categories with first-level subcategories and products
  const categories = await categoryRepository.find({
    where: ids.map((id) => ({ id, deletedAt: null })),
    relations: ["parentCategory", "subCategories"],
  });

  // Fetch nested subcategories for each category
  for (const category of categories) {
    category.subCategories = await fetchNestedCategories(category.id);
    category.createdAt = new Date(category.createdAt).toISOString() as any;
  }

  return categories;
}

/**
 * Recursively fetches subcategories for a given category.
 *
 * @param parentCategoryId - UUID of the parent category.
 * @returns Promise<Category[]>
 */
async function fetchNestedCategories(
  parentCategoryId: string | null
): Promise<Category[]> {
  const subCategories = await categoryRepository.find({
    where: {
      parentCategory: parentCategoryId ? { id: parentCategoryId } : null,
      deletedAt: null,
    },
    relations: ["parentCategory"],
    order: { position: "ASC" },
  });

  for (const subCategory of subCategories) {
    subCategory.subCategories = await fetchNestedCategories(subCategory.id);
    subCategory.createdAt = new Date(
      subCategory.createdAt
    ).toISOString() as any;
  }

  return subCategories;
}

/**
 * Recursively filters and prunes categories that don’t match the search term.
 */
function filterCategoryTreeBySearch(
  cat: Category,
  searchTerm: string
): Category | null {
  const term = searchTerm.toLowerCase();

  const matches = [cat.name, cat.description, cat.slug]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));

  const filteredSubCategories = (cat.subCategories || [])
    .map((sub) => filterCategoryTreeBySearch(sub, searchTerm))
    .filter((sub): sub is Category => sub !== null);

  if (matches || filteredSubCategories.length > 0) {
    return {
      ...cat,
      subCategories: filteredSubCategories,
    };
  }

  return null;
}

/**
 * Recursively checks if a category or any of its subcategories match the search term.
 *
 * @param cat - Category to check.
 * @param searchTerm - Term to search for.
 * @returns boolean
 */
function categoryMatchesSearch(cat: Category, searchTerm: string): boolean {
  const term = searchTerm.toLowerCase();
  const fields = [cat.name, cat.description, cat.slug].filter(Boolean);

  const match = fields.some((f) => f.toLowerCase().includes(term));
  if (match) return true;

  return (cat.subCategories || []).some((sub) =>
    categoryMatchesSearch(sub, searchTerm)
  );
}

/**
 * Handles pagination of categories including their nested subcategories.
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
}: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const skip = (page - 1) * limit;

  const allowedSortFields = ["name", "createdAt", "position"] as const;
  const safeSortBy = allowedSortFields.includes(sortBy as any)
    ? (sortBy as (typeof allowedSortFields)[number])
    : "position";

  const safeSortOrder =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc";

  const query = categoryRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect(
      "category.subCategories",
      "subCategory",
      "subCategory.deletedAt IS NULL"
    )
    .where("category.deletedAt IS NULL")
    .andWhere("category.parentCategory IS NULL")
    .orderBy(
      `category.${safeSortBy}`,
      safeSortOrder.toUpperCase() as "ASC" | "DESC"
    )
    .skip(skip)
    .take(limit);

  const [categories, _total] = await query.getManyAndCount();

  for (const category of categories) {
    category.subCategories = await fetchNestedCategories(category.id);
    category.createdAt = new Date(category.createdAt).toISOString() as any;
  }

  let filteredCategories = categories;

  if (search?.trim()) {
    filteredCategories = categories
      .map((cat) => filterCategoryTreeBySearch(cat, search))
      .filter((cat): cat is Category => cat !== null);
  }

  return { categories: filteredCategories, total: filteredCategories.length };
};
