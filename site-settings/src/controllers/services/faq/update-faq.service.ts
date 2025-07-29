import { FAQ } from "../../../entities";
import { MutationUpdateFaqArgs } from "../../../types";
import { faqRepository } from "../repositories/repositories";
import { getFaqById } from "./get-faq.service";

/**
 * Updates an existing FAQ entry.
 *
 * @param faqId - UUID of the FAQ to update.
 * @param data - Partial update input (question, answer etc.).
 * @returns A promise resolving to the updated FAQ entity.
 */
export const updateFaq = async (
  faqId: string,
  data: Partial<MutationUpdateFaqArgs>
): Promise<FAQ> => {
  await faqRepository.update(faqId, {
    ...(data.question !== undefined &&
      data.question !== null && { question: data.question }),
    ...(data.answer !== undefined &&
      data.answer !== null && { answer: data.answer }),
  });

  return await getFaqById(faqId);
};
