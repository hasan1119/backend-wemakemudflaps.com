import z from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating faq.
 *
 * Workflow:
 * 1. Validates that the question is a non-empty string.
 * 2. Validates that answer is a non-empty string.
 *
 * @property question - The question to be validated, must be a non-empty string.
 * @property answer - The answer to be validated, must be a non-empty string.
 */
export const createFaqSchema = z
  .object({
    question: z
      .string({ message: "Question is required" })
      .min(1, { message: "Question cannot be empty" }),
    answer: z
      .string({ message: "Answer is required" })
      .min(1, { message: "Answer cannot be empty" }),
  })
  .refine((data) => Object.values(data).some((value) => value !== null), {
    message: "At least one field must be provided",
  });

/**
 * Defines the schema for validating faq updates.
 *
 * Workflow:
 * 1. Validates that the question is a non-empty string if provided.
 * 2. Validates that the answer is a non-empty string if provided.
 *
 * @property id - The unique identifier for the FAQ, must be a valid UUID.
 * @property question - The question to be validated, must be a non-empty string if provided.
 * @property answer - The answer to be validated, must be a non-empty string if provided.
 */
export const updateFaqSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid ID format" }),
    question: z
      .string({ message: "Question is required" })
      .min(1, { message: "Question cannot be empty" })
      .optional()
      .nullable(),
    answer: z
      .string({ message: "Answer is required" })
      .min(1, { message: "Answer cannot be empty" })
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== "id" && data[key as keyof typeof data] !== undefined
      ),
    {
      message: "At least one field must be provided for update besides id",
      path: [],
    }
  );

/**
 * Defines the schema for validating faq sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (question, answer, createdAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (question, answer, createdAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const faqsSortingSchema = z.object({
  sortBy: z
    .enum(["question", "answer", "createdAt"], {
      message: "Sort field must be one of: question, answer, createdAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});
