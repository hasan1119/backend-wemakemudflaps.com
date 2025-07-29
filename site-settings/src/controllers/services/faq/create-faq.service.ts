import { Faq } from "../../../entities";
import { MutationCreateFaqArgs } from "../../../types";
import { faqRepository } from "../repositories/repositories";

/**
 * Creates a new FAQ entry.
 *
 * Workflow:
 * 1. Validates and prepares FAQ creation input.
 * 2. Optionally, checks for duplicates (e.g., same question).
 * 3. Creates the FAQ with provided values and user context.
 *
 * @param data - Input data for creating the FAQ.
 * @param userId - User ID who creates this FAQ.
 * @returns Created Faq entity.
 */
export const createFaq = async (
  data: MutationCreateFaqArgs,
  userId: string
): Promise<Faq> => {
  const { question, answer } = data ?? {};

  const faq = faqRepository.create({
    question,
    answer,
    createdBy: userId ?? null,
  });

  return await faqRepository.save(faq);
};
