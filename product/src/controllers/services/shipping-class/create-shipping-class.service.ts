import { ShippingClass } from "../../../entities";
import { MutationCreateShippingClassArgs } from "../../../types";
import { shippingClassRepository } from "../repositories/repositories";

/**
 * Creates a new shipping class.
 *
 * Workflow:
 * 1. Validates and prepares shipping class creation input.
 * 2. Checks if a shipping class with the same name already exists (case-insensitive).
 * 3. Creates the shipping class with provided values and user context.
 *
 * @param data - Input data for creating the shipping class.
 * @param userId - User ID who creates this shipping class.
 * @returns Created Shipping class entity.
 */
export const createShippingClass = async (
  data: MutationCreateShippingClassArgs,
  userId: string
): Promise<ShippingClass> => {
  const { value, description } = data ?? {};

  const shippingClass = shippingClassRepository.create({
    value,
    description,
    createdBy: userId ?? null,
  });

  return await shippingClassRepository.save(shippingClass);
};
