import { Brackets } from "typeorm";
import { ProductAttribute, ProductAttributeValue } from "../../../entities";
import {
  productAttributeRepository,
  productAttributeValueRepository,
} from "../repositories/repositories";

/**
 * Retrieves a Product Attribute entity by its ID.
 *
 * Workflow:
 * 1. Uses TypeORM to find the attribute by ID.
 * 2. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 *
 * @param id - The UUID of the product attribute to retrieve.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const getProductAttributeById = async (
  id: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.values", "values", "values.deletedAt IS NULL")
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.id = :id", { id })
    .andWhere("attribute.deletedAt IS NULL")
    .getOne();
};

/**
 * Retrieves multiple Product Attribute entities by their IDs.
 *
 * Workflow:
 * 1. Returns an empty array if the input array is empty.
 * 2. Uses TypeORM `In` to find all Product Attribute entities by ID.
 * 3. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 *
 * @param ids - An array of product attribute UUIDs to retrieve.
 * @returns A promise resolving to an array of Product Attribute entities.
 */
export const getProductAttributesByIds = async (
  ids: string[]
): Promise<ProductAttribute[]> => {
  if (!ids.length) return [];

  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.values", "values", "values.deletedAt IS NULL")
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.id IN (:...ids)", { ids })
    .andWhere("attribute.deletedAt IS NULL")
    .getMany();
};

/**
 * Retrieves multiple Product Attribute Value entities by their IDs.
 *
 * Workflow:
 * 1. Returns an empty array if the input array is empty.
 * 2. Uses TypeORM `In` to find all Product Attribute Value entities by ID.
 * 3. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 *
 * @param ids - An array of product attribute value UUIDs to retrieve.
 * @returns A promise resolving to an array of Product Attribute Value entities.
 */
export const getProductAttributeValuesByIds = async (
  ids: string[]
): Promise<ProductAttributeValue[]> => {
  if (!ids.length) return [];

  return await productAttributeValueRepository
    .createQueryBuilder("value")
    .leftJoinAndSelect(
      "value.attribute",
      "attribute",
      "attribute.deletedAt IS NULL"
    )
    .where("value.id IN (:...ids)", { ids })
    .andWhere("value.deletedAt IS NULL")
    .getMany();
};

/**
 * Finds a Product Attribute entity by its name (case-insensitive).
 *
 * @param name - The name of the attribute to find.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const findAttributeByName = async (
  name: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.values", "values", "values.deletedAt IS NULL")
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.name = :name", { name })
    .andWhere("attribute.deletedAt IS NULL")
    .getOne();
};

/**
 * Finds a system Product Attribute entity by its name (case-insensitive).
 *
 * Workflow:
 * 1. Uses TypeORM to find the attribute by name.
 * 2. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 * 3. Ensures the attribute is a system attribute (`systemAttribute = true`).
 *
 * @param name - The name of the system attribute to find.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const findSystemAttributeByName = async (
  name: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.values", "values", "values.deletedAt IS NULL")
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.name = :name", { name })
    .andWhere("attribute.deletedAt IS NULL")
    .getOne();
};

/**
 * Finds a system Product Attribute entity by its slug (case-insensitive).
 *
 * Workflow:
 * 1. Uses TypeORM to find the attribute by slug.
 * 2. Filters out soft-deleted attributes (`deletedAt IS NULL`).
 * 3. Ensures the attribute is a system attribute (`systemAttribute = true`).
 *
 * @param slug - The slug of the system attribute to find.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const findSystemAttributeBySlug = async (
  slug: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect(
      "attribute.values",
      "values",
      "values.deletedAt IS NULL  "
    )
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.slug = :slug", { slug })
    .andWhere("attribute.deletedAt IS NULL")
    .andWhere("attribute.systemAttribute = :system", { system: true })
    .getOne();
};

/**
 * Finds a Product Attribute entity by its slug (case-insensitive).
 *
 * @param slug - The slug of the attribute to find.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const findAttributeBySlug = async (
  slug: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect(
      "attribute.values",
      "values",
      "values.deletedAt IS NULL  "
    )
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.slug = :slug", { slug })
    .andWhere("attribute.deletedAt IS NULL")
    .getOne();
};

/**
 * Finds a System Product Attribute entity by its name (case-insensitive) to update attribute info.
 *
 * @param id - The UUID of the attribute.
 * @param name - The name of the attribute to find.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const findSystemAttributeByNameToUpdate = async (
  id: string,
  name: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.values", "values", "values.deletedAt IS NULL")
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.id != :id", { id })
    .andWhere("attribute.name = :name", { name })
    .andWhere("attribute.systemAttribute = :system", { system: true })
    .andWhere("attribute.deletedAt IS NULL")
    .getOne();
};

/**
 * Finds a System Product Attribute entity by its slug (case-insensitive) to update attribute info.
 *
 * @param id - The UUID of the attribute.
 * @param slug - The slug of the attribute to find.
 * @returns A promise resolving to the Product Attribute entity or null if not found.
 */
export const findSystemAttributeBySlugToUpdate = async (
  id: string,
  slug: string
): Promise<ProductAttribute | null> => {
  return await productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.values", "values", "values.deletedAt IS NULL")
    .leftJoinAndSelect(
      "attribute.systemAttributeRef",
      "systemAttributeRef",
      "systemAttributeRef.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.copiedAttributes",
      "copiedAttributes",
      "copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attribute.product",
      "product",
      "product.deletedAt IS NULL"
    )
    .where("attribute.id != :id", { id })
    .andWhere("attribute.slug = :slug", { slug })
    .andWhere("attribute.systemAttribute = :system", { system: true })
    .andWhere("attribute.deletedAt IS NULL")
    .getOne();
};

interface GetPaginatedAttributesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/** * Retrieves paginated system product attributes with optional search and sorting.
 *
 * Workflow:
 * 1. Calculates the skip value based on the current page and limit.
 * 2. Builds a query using TypeORM's QueryBuilder.
 * 3. Applies search filtering if a search term is provided.
 * 4. Applies sorting based on the provided sortBy and sortOrder.
 * 5. Executes the query to get both attributes and total count.
 *
 * @param page - The current page number (1-based index).
 * @param limit - The number of items per page.
 * @param search - Optional search term to filter attributes by name or slug.
 * @param sortBy - Optional field to sort by (name, slug, createdAt, deletedAt).
 * @param sortOrder - Sort order direction (asc, desc).
 * @return A promise resolving to an object containing the paginated attributes and total count.
 */
export const paginateSystemProductAttributes = async ({
  page,
  limit,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetPaginatedAttributesInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = productAttributeRepository
    .createQueryBuilder("attribute")
    .leftJoinAndSelect("attribute.systemAttributeRef", "systemAttribute")
    .leftJoinAndSelect("attribute.copiedAttributes", "copiedAttributes")
    .leftJoinAndSelect("attribute.values", "values")
    .leftJoinAndSelect("attribute.product", "product")
    .where("attribute.deletedAt IS NULL")
    .andWhere("attribute.systemAttribute = :system", { system: true });

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("attribute.name ILIKE :search", {
          search: searchTerm,
        }).orWhere("attribute.slug ILIKE :search", { search: searchTerm });
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`attribute.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [attributes, total] = await queryBuilder.getManyAndCount();

  return { attributes, total };
};
