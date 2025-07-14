import { ShippingZone } from "../../../entities";
import { shippingZoneRepository } from "../repositories/repositories";

export const createShippingZone = async (
  data: MutationShippingZoneArgs
  userId?: string
): Promise<ShippingZone> => {
  const shippingZone = shippingZoneRepository.create({
    ...data,
    createdBy: userId,
  });

  await shippingZoneRepository.save(shippingZone);

  return shippingZone;
};
