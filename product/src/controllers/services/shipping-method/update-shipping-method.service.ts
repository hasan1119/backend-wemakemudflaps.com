import { FlatRate, ShippingMethod } from "../../../entities";
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
 * Workflow:
 * 1. Finds the shipping method by ID.
 * 2. Applies the changes from the input.
 * 3. Saves and returns the updated shipping method entity.
 *
 * @param shippingMethodId - The ID of the shipping method to update.
 * @param data - The data to update on the shipping method.
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

  // 1. Update FlatRate (if provided)
  if (data.flatRate) {
    const flatRateData = data.flatRate;

    let flatRate: FlatRate;
    if (flatRateData.id) {
      flatRate = await flatRateRepository.findOneOrFail({
        where: { id: flatRateData.id },
        relations: ["costs"],
      });

      if (flatRateData.title !== undefined) flatRate.title = flatRateData.title;
      if (flatRateData.taxStatus !== undefined)
        flatRate.taxStatus = flatRateData.taxStatus;
      if (flatRateData.cost !== undefined) flatRate.cost = flatRateData.cost;

      if (flatRateData.costs) {
        const updatedCosts: FlatRateCost[] = [];

        for (const costData of flatRateData.costs) {
          let cost: FlatRateCost;

          if (costData.id) {
            cost = await flatRateCostRepository.findOneByOrFail({
              id: costData.id,
            });
            cost.cost = costData.cost;
            cost.shippingClass = { id: costData.shippingClassId } as any;
          } else {
            cost = flatRateCostRepository.create({
              cost: costData.cost,
              shippingClass: { id: costData.shippingClassId } as any,
              flatRate: { id: flatRate.id } as any,
            });
          }

          updatedCosts.push(cost);
        }

        flatRate.costs = updatedCosts;
      }

      await flatRateRepository.save(flatRate);
    }

    shippingMethod.flatRate = flatRate;
  }

  // 2. Update FreeShipping
  if (data.freeShipping) {
    const freeShippingData = data.freeShipping;

    if (freeShippingData.id) {
      const freeShippingEntity = await freeShippingRepository.findOneOrFail({
        where: { id: freeShippingData.id },
      });

      if (freeShippingData.title !== undefined)
        freeShippingEntity.title = freeShippingData.title;

      if (freeShippingData.conditions !== undefined)
        freeShippingEntity.conditions = freeShippingData.conditions;

      if (freeShippingData.minimumOrderAmount !== undefined)
        freeShippingEntity.minimumOrderAmount =
          freeShippingData.minimumOrderAmount;

      shippingMethod.freeShipping = freeShippingEntity;
    }
  }

  // 3. Update LocalPickUp
  if (data.localPickUp) {
    const localPickUpData = data.localPickUp;

    if (localPickUpData.id) {
      const localPickUpEntity = await localPickUpRepository.findOneOrFail({
        where: { id: localPickUpData.id },
      });

      if (localPickUpData.title !== undefined)
        localPickUpEntity.title = localPickUpData.title;

      if (localPickUpData.cost !== undefined)
        localPickUpEntity.cost = localPickUpData.cost;

      if (localPickUpData.taxStatus !== undefined)
        localPickUpEntity.taxStatus = localPickUpData.taxStatus;

      shippingMethod.localPickUp = localPickUpEntity;
    }
  }

  // 4. Update UPS
  if (data.ups) {
    const upsData = data.ups;

    if (upsData.id) {
      // Assuming you have a UPS entity and repository similar to the others
      const upsEntity = await upsRepository.findOneOrFail({
        where: { id: upsData.id },
      });

      if (upsData.title !== undefined) upsEntity.title = upsData.title;

      shippingMethod.ups = upsEntity;
    }
  }

  // Save final updated shipping method
  await shippingMethodRepository.save(shippingMethod);

  return shippingMethod;
};
