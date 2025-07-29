import { faqRepository } from "../repositories/repositories";

/**
 * Permanently deletes a FAQ from the database.
 *
 * @param faqId - The UUID of the FAQ to hard delete.
 */
export const hardDeleteFaq = async (faqId: string): Promise<void> => {
  await faqRepository.delete({ id: faqId });
};
