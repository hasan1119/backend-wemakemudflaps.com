import { ILike, In } from "typeorm";
import { Tag } from "../../../entities";
import { tagRepository } from "../repositories/repositories";

/**
 * Counts the number of non-deleted products associated with a specific tag.
 *
 * @param tagId - The UUID of the tag.
 * @returns A promise resolving to the number of linked, non-deleted products.
 */
export const countProductsForTag = async (tagId: string): Promise<number> => {
  const result = await tagRepository
    .createQueryBuilder("tag")
    .innerJoin("tag.products", "product", "product.deletedAt IS NULL")
    .where("tag.id = :tagId", { tagId })
    .andWhere("tag.deletedAt IS NULL")
    .getCount();

  return result;
};

/**
 * Finds a Tag entity by its name (case-insensitive).
 *
 * @param name - The name of the tag to find.
 * @returns A promise resolving to the Tag entity or null if not found.
 */
export const findTagByName = async (name: string): Promise<Tag | null> => {
  return await tagRepository.findOne({
    where: {
      name: ILike(name),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Retrieves a single Tag entity by its ID.
 *
 * Workflow:
 * 1. Queries the tagRepository to find a tag that matches the provided ID.
 * 2. Includes the "products" relation to load associated products.
 * 3. Returns the Tag entity or null if not found.
 *
 * @param id - The UUID of the tag to retrieve.
 * @returns A promise that resolves to the Tag entity, or null if no match is found.
 */
export const getTagById = async (id: string): Promise<Tag | null> => {
  return await tagRepository.findOne({
    where: { id },
    relations: ["products"],
  });
};

/**
 * Retrieves multiple Tag entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all tag IDs in the provided list.
 * 3. Filters out soft-deleted tags (deletedAt IS NULL).
 * 4. Includes the "products" relation for each tag.
 * 5. Returns an array of matching Tag entities.
 *
 * @param ids - An array of tag UUIDs to retrieve.
 * @returns A promise resolving to an array of Tag entities.
 */
export const getTagsByIds = async (ids: string[]): Promise<Tag[]> => {
  if (!ids.length) return [];

  return await tagRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

interface GetPaginatedTagsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of tags based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted tags and apply search conditions if provided.
 * 3. Queries the tagRepository to fetch tags with pagination, sorting, and filtering.
 * 4. Includes the "products" relation.
 * 5. Returns an object with the list of tags and the total count of matching tags.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated tags and total count.
 */
export const paginateTags = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedTagsInput) => {
  const skip = (page - 1) * limit;

  const where: any[] = [{ deletedAt: null }];

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    where.push(
      { name: ILike(searchTerm), deletedAt: null },
      { slug: ILike(searchTerm), deletedAt: null }
    );
  }

  const [tags, total] = await tagRepository.findAndCount({
    where,
    skip,
    take: limit,
    order: {
      [sortBy]: sortOrder,
    },
    relations: ["products"],
  });

  return { tags, total };
};

/**
 * Handles counting tags matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted tags and apply search conditions if provided.
 * 2. Queries the tagRepository to count tags matching the criteria.
 * 3. Returns the total number of matching tags.
 *
 * @param search - Optional search term to filter by name or slug (case-insensitive).
 * @returns A promise resolving to the total number of matching tags.
 */
export const countTagsWithSearch = async (search?: string): Promise<number> => {
  const where: any[] = [{ deletedAt: null }];

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    where.push(
      { name: ILike(searchTerm), deletedAt: null },
      { slug: ILike(searchTerm), deletedAt: null }
    );
  }

  return await tagRepository.count({ where });
};
