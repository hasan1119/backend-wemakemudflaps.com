import { ShippingMethod } from "../../../entities";
import { updateShippingMethodSchema } from "../../../utils/data-validation/shipping-method/shipping-method.validation";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Updates a shipping method's title and status only.
 *
 * @param shippingMethodId - The UUID of the shipping method to update.
 * @param data - Partial data to update (title, status).
 * @returns A promise resolving to the updated shipping method entity.
 */
export const updateShippingMethod = async (
  shippingMethodId: string,
  data: any // Should be typed according to your GraphQL args
): Promise<ShippingMethod> => {
  // Validate input
  const parsed = updateShippingMethodSchema.safeParse({
    id: shippingMethodId,
    ...data,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  const { title, status } = parsed.data;

  await shippingMethodRepository.update(shippingMethodId, {
    ...(title !== undefined && title !== null && { title }),
    ...(status !== undefined && status !== null && { status }),
  });

  return await shippingMethodRepository.findOneByOrFail({
    id: shippingMethodId,
  });
};
