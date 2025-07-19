import { ShippingMethod } from "../../../entities";
import { FlatRateCost } from "../../../entities/flat-rate-cost.entity";
import { MutationUpdateShippingMethodArgs } from "../../../types";
import {
  flatRateCostRepository,
  flatRateRepository,
  freeShippingRepository,
  localPickUpRepository,
  shippingMethodRepository,
  upsRepository,
} from "../repositories/repositories";

/**
 * Updates an existing shipping method with the provided data.
 *
 * This version does not create new nested entities; it only updates existing ones.
 *
 * @param shippingMethod - The existing shipping method entity to update.
 * @param data - The update input data.
 * @returns The updated ShippingMethod entity.
 */
export const updateShippingMethod = async (
  shippingMethod: ShippingMethod,
  data: MutationUpdateShippingMethodArgs
): Promise<ShippingMethod> => {
  if (data.title !== undefined) shippingMethod.title = data.title;
  if (data.status !== undefined) shippingMethod.status = data.status;
  if (data.description !== undefined)
    shippingMethod.description = data.description;

  // Reset all embedded method types
  shippingMethod.flatRate = null;
  shippingMethod.freeShipping = null;
  shippingMethod.localPickUp = null;
  shippingMethod.ups = null;

  // 1. Update FlatRate if provided
  if (data.flatRate?.id) {
    const flatRate = await flatRateRepository.findOneOrFail({
      where: { id: data.flatRate.id },
      relations: ["costs"],
    });

    flatRate.title = data.flatRate.title ?? flatRate.title;
    flatRate.taxStatus = data.flatRate.taxStatus ?? flatRate.taxStatus;
    flatRate.cost = data.flatRate.cost ?? flatRate.cost;

    if (data.flatRate.costs) {
      const updatedCosts: FlatRateCost[] = [];

      for (const costData of data.flatRate.costs) {
        if (!costData.id) continue; // Skip if no ID; no new creation

        const cost = await flatRateCostRepository.findOneOrFail({
          where: { id: costData.id },
        });

        cost.cost = costData.cost ?? cost.cost;
        cost.shippingClass = { id: costData.shippingClassId } as any;

        updatedCosts.push(cost);
      }

      flatRate.costs = updatedCosts;
    }

    await flatRateRepository.save(flatRate);
    shippingMethod.flatRate = flatRate;
  }

  // 2. Update FreeShipping if provided
  if (data.freeShipping?.id) {
    const freeShipping = await freeShippingRepository.findOneOrFail({
      where: { id: data.freeShipping.id },
    });

    freeShipping.title = data.freeShipping.title ?? freeShipping.title;
    freeShipping.conditions =
      data.freeShipping.conditions ?? freeShipping.conditions;
    freeShipping.minimumOrderAmount =
      data.freeShipping.minimumOrderAmount ?? freeShipping.minimumOrderAmount;

    await freeShippingRepository.save(freeShipping);
    shippingMethod.freeShipping = freeShipping;
  }

  // 3. Update LocalPickUp if provided
  if (data.localPickUp?.id) {
    const localPickUp = await localPickUpRepository.findOneOrFail({
      where: { id: data.localPickUp.id },
    });

    localPickUp.title = data.localPickUp.title ?? localPickUp.title;
    localPickUp.cost = data.localPickUp.cost ?? localPickUp.cost;
    localPickUp.taxStatus = data.localPickUp.taxStatus ?? localPickUp.taxStatus;

    await localPickUpRepository.save(localPickUp);
    shippingMethod.localPickUp = localPickUp;
  }

  // 4. Update UPS if provided
  if (data.ups?.id) {
    const ups = await upsRepository.findOneOrFail({
      where: { id: data.ups.id },
    });

    ups.title = data.ups.title ?? ups.title;

    await upsRepository.save(ups);
    shippingMethod.ups = ups;
  }

  await shippingMethodRepository.save(shippingMethod);
  return shippingMethod;
};
