import { Brackets, In } from "typeorm";
import { FAQ } from "../../../entities";
import { faqRepository } from "../repositories/repositories";

/**
 * Retrieves a single FAQ by its ID (excluding soft-deleted).
 *
 * @param id - The UUID of the FAQ.
 * @returns A promise resolving to the FAQ entity or null if not found.
 */
export const getFaqById = async (id: string): Promise<FAQ | null> => {
  return await faqRepository.findOne({
    where: { id, deletedAt: null },
  });
};

/**
 * Retrieves multiple FAQs by their IDs (excluding soft-deleted).
 *
 * @param ids - Array of UUIDs.
 * @returns A promise resolving to an array of matching FAQs.
 */
export const getFaqsByIds = async (ids: string[]): Promise<FAQ[]> => {
  if (!ids.length) return [];
  return await faqRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
  });
};

interface GetPaginatedFaqsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Retrieves paginated FAQs with optional search and sorting.
 *
 * @param params - Pagination and search/sort parameters.
 * @returns Object containing list of FAQs and total count.
 */
export const paginateFaqs = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedFaqsInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = faqRepository
    .createQueryBuilder("faq")
    .where("faq.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("faq.question ILIKE :search", { search: searchTerm }).orWhere(
          "faq.answer ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`faq.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [faqs, total] = await queryBuilder.getManyAndCount();

  return { faqs, total };
};
