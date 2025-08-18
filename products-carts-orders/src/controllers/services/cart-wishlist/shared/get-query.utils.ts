import { gql, GraphQLClient } from "graphql-request";
import { ShippingZone } from "../../../../entities";
import { FreeShippingConditions } from "../../../../entities/free-shipping.entity";
import { shippingZoneRepository } from "../../repositories/repositories";
import { getTaxOptions } from "../../tax-options/get-tax-options.service";
import { getTaxRateByTaxClassAndAddress } from "../../tax-rate/get-tax-rate.service";

export const GET_TAX_EXEMPTION = gql`
  query GetTaxExemptionEntryByUserId($userId: ID!) {
    getTaxExemptionEntryByUserId(userId: $userId) {
      ... on BaseResponse {
        statusCode
        success
        message
      }
      ... on TaxExemptionResponse {
        statusCode
        success
        message
        taxExemption {
          id
          taxNumber
          assumptionReason
          status
          expiryDate
          createdAt
          updatedAt
        }
      }
      ... on ErrorResponse {
        statusCode
        success
        message
        errors {
          field
          message
        }
      }
    }
  }
`;

export const GET_ADDRESS_BOOK = gql`
  query GetAddressBookEntryById($addressBookEntryById: ID!, $userId: ID!) {
    getAddressBookEntryById(id: $addressBookEntryById, userId: $userId) {
      ... on BaseResponse {
        statusCode
        success
        message
      }
      ... on AddressResponseBook {
        statusCode
        success
        message
        addressBook {
          id
          company
          streetOne
          streetTwo
          city
          state
          zip
          country
          type
          isDefault
          createdAt
          updatedAt
        }
      }
      ... on ErrorResponse {
        statusCode
        success
        message
        errors {
          field
          message
        }
      }
    }
  }
`;

export const GET_SHOP_FOR_TAX = gql`
  query GetShopForDefaultTax {
    getShopForDefaultTax {
      ... on BaseResponse {
        statusCode
        success
        message
      }
      ... on ShopAddressResponse {
        statusCode
        success
        message
        shopAddress {
          id
          brunchName
          addressLine1
          addressLine2
          emails {
            type
            email
          }
          phones {
            type
            number
          }
          city
          state
          country
          zipCode
          direction
          isActive
          openingAndClosingHours {
            opening
            closing
          }
          isEveryDayOpen
          weeklyOffDays {
            day
          }
          isDefaultForTax
        }
      }
      ... on ErrorResponse {
        statusCode
        success
        message
        errors {
          field
          message
        }
      }
    }
  }
`;

/**
 * Fetches the default store address for tax calculations using GraphQL.
 * @param token - The authorization token for the GraphQL request.
 * @returns The default store address (with isDefaultForTax: true) or null if none found.
 */
export async function getActiveStoreAddress(token?: string): Promise<{
  country: string;
  state?: string;
  city?: string;
  postcode?: string;
} | null> {
  try {
    const ShopClient = new GraphQLClient(
      process.env.SITE_SETTINGS_URL || "http://localhost:4004",
      {
        headers: {
          Authorization: `Bearer ${token}` || "",
        },
      }
    );

    const response = await ShopClient.request(GET_SHOP_FOR_TAX);

    const shopData = (response as { getShopForDefaultTax?: any })
      .getShopForDefaultTax;

    if (shopData?.statusCode !== 200 || !shopData?.shopAddress) {
      console.error(
        "Error fetching default tax address:",
        shopData?.message || "No shop address found"
      );
      return null;
    }

    const shopAddress = shopData.shopAddress;

    if (!shopAddress.isDefaultForTax) {
      console.error("Shop address is not marked as default for tax");
      return null;
    }

    return {
      country: shopAddress.country || "",
      state: shopAddress.state || undefined,
      city: shopAddress.city || undefined,
      postcode: shopAddress.zipCode || undefined,
    };
  } catch (error) {
    console.error("Error fetching store address via GraphQL:", error);
    return null;
  }
}

/**
 * Matches a shipping zone based on the shipping address.
 * @param shippingAddress - The user's shipping address.
 * @returns The matched ShippingZone or null if none found.
 */
export async function getMatchedShippingZone(shippingAddress: {
  country: string;
  state?: string;
  city?: string;
  zip?: string;
}): Promise<ShippingZone | null> {
  try {
    const zones = await shippingZoneRepository.find({
      where: { deletedAt: null },
      relations: [
        "shippingMethods",
        "shippingMethods.flatRate",
        "shippingMethods.freeShipping",
        "shippingMethods.localPickUp",
      ],
    });

    for (const zone of zones) {
      // Match by zip code
      if (
        zone.zipCodes &&
        shippingAddress.zip &&
        zone.zipCodes.includes(shippingAddress.zip)
      ) {
        return zone;
      }
      // Match by regions
      if (zone.regions) {
        const matchedRegion = zone.regions.find(
          (region) =>
            (!region.country ||
              region.country.toLowerCase() ===
                shippingAddress.country.toLowerCase()) &&
            (!region.state ||
              !shippingAddress.state ||
              region.state.toLowerCase() ===
                shippingAddress.state.toLowerCase()) &&
            (!region.city ||
              !shippingAddress.city ||
              region.city.toLowerCase() === shippingAddress.city.toLowerCase())
        );
        if (matchedRegion) {
          return zone;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return null;
  }
}

/**
 * Calculates shipping cost and tax for the cart.
 */
export async function calculateShippingCostAndTax(
  shippingZone: ShippingZone | null,
  cartItems: any[],
  taxAddress: {
    country: string;
    state?: string;
    city?: string;
    postcode?: string;
  } | null,
  pricesEnteredWithTax: boolean,
  cartTotal: number,
  hasValidCoupon: boolean
): Promise<{
  shippingCost: number;
  shippingTax: number;
  shippingTotalCostWithTax: number;
}> {
  if (!shippingZone || !shippingZone.shippingMethods) {
    return { shippingCost: 0, shippingTax: 0, shippingTotalCostWithTax: 0 };
  }

  const activeMethods = shippingZone.shippingMethods.filter(
    (method) => method.status && method.deletedAt === null
  );
  if (!activeMethods.length) {
    return { shippingCost: 0, shippingTax: 0, shippingTotalCostWithTax: 0 };
  }

  const method = activeMethods[0];
  let shippingCost = 0;
  let shippingTax = 0;

  if (method.flatRate && method.flatRate.taxStatus) {
    for (const item of cartItems) {
      if (!item.product) continue;
      const shippingClassId =
        item.productVariation?.shippingClass || item.product.shippingClass;
      if (shippingClassId && method.flatRate.costs) {
        const flatRateCost = method.flatRate.costs.find(
          (cost) => cost.shippingClass.id === shippingClassId
        );
        if (flatRateCost) {
          shippingCost += flatRateCost.cost * item.quantity;
        } else {
          shippingCost += method.flatRate.cost * item.quantity;
        }
      } else {
        shippingCost += method.flatRate.cost * item.quantity;
      }
    }

    if (method.flatRate.taxStatus && taxAddress) {
      const taxClassId = method.flatRate.taxStatus
        ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
        : null;
      if (taxClassId) {
        const taxRate = await getTaxRateByTaxClassAndAddress(
          taxClassId,
          taxAddress
        );
        if (taxRate) {
          if (pricesEnteredWithTax) {
            const taxRateDecimal = taxRate.rate / 100;
            const baseAmount = shippingCost / (1 + taxRateDecimal);
            shippingTax = shippingCost - baseAmount;
          } else {
            shippingTax = shippingCost * (taxRate.rate / 100);
          }
        }
      }
    }
  } else if (method.freeShipping) {
    const conditions = method.freeShipping.conditions;
    let isFreeShippingEligible = false;

    if (conditions === FreeShippingConditions.NA) {
      isFreeShippingEligible = true;
    } else if (conditions === FreeShippingConditions.COUPON && hasValidCoupon) {
      isFreeShippingEligible = true;
    } else if (
      conditions === FreeShippingConditions.MINIMUM_ORDER_AMOUNT &&
      method.freeShipping.minimumOrderAmount !== null &&
      cartTotal >= method.freeShipping.minimumOrderAmount
    ) {
      isFreeShippingEligible = true;
    } else if (
      conditions === FreeShippingConditions.MINIMUM_ORDER_AMOUNT_OR_COUPON &&
      (hasValidCoupon ||
        (method.freeShipping.minimumOrderAmount !== null &&
          cartTotal >= method.freeShipping.minimumOrderAmount))
    ) {
      isFreeShippingEligible = true;
    } else if (
      conditions === FreeShippingConditions.MINIMUM_ORDER_AMOUNT_AND_COUPON &&
      hasValidCoupon &&
      method.freeShipping.minimumOrderAmount !== null &&
      cartTotal >= method.freeShipping.minimumOrderAmount
    ) {
      isFreeShippingEligible = true;
    }

    if (isFreeShippingEligible) {
      shippingCost = 0;
      shippingTax = 0;
    } else if (activeMethods.length > 1) {
      const nextMethod = activeMethods[1];
      if (nextMethod.flatRate && nextMethod.flatRate.taxStatus) {
        for (const item of cartItems) {
          if (!item.product) continue;
          const shippingClassId =
            item.productVariation?.shippingClass || item.product.shippingClass;
          if (shippingClassId && nextMethod.flatRate.costs) {
            const flatRateCost = nextMethod.flatRate.costs.find(
              (cost) => cost.shippingClass.id === shippingClassId
            );
            if (flatRateCost) {
              shippingCost += flatRateCost.cost * item.quantity;
            } else {
              shippingCost += nextMethod.flatRate.cost * item.quantity;
            }
          } else {
            shippingCost += nextMethod.flatRate.cost * item.quantity;
          }
        }

        if (nextMethod.flatRate.taxStatus && taxAddress) {
          const taxClassId = nextMethod.flatRate.taxStatus
            ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
            : null;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(
              taxClassId,
              taxAddress
            );
            if (taxRate) {
              if (pricesEnteredWithTax) {
                const taxRateDecimal = taxRate.rate / 100;
                const baseAmount = shippingCost / (1 + taxRateDecimal);
                shippingTax = shippingCost - baseAmount;
              } else {
                shippingTax = shippingCost * (taxRate.rate / 100);
              }
            }
          }
        }
      } else if (nextMethod.localPickUp && nextMethod.localPickUp.taxStatus) {
        shippingCost = nextMethod.localPickUp.cost;
        if (nextMethod.localPickUp.taxStatus && taxAddress) {
          const taxClassId = nextMethod.localPickUp.taxStatus
            ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
            : null;
          if (taxClassId) {
            const taxRate = await getTaxRateByTaxClassAndAddress(
              taxClassId,
              taxAddress
            );
            if (taxRate) {
              if (pricesEnteredWithTax) {
                const taxRateDecimal = taxRate.rate / 100;
                const baseAmount = shippingCost / (1 + taxRateDecimal);
                shippingTax = shippingCost - baseAmount;
              } else {
                shippingTax = shippingCost * (taxRate.rate / 100);
              }
            }
          }
        }
      }
    }
  } else if (method.localPickUp && method.localPickUp.taxStatus) {
    shippingCost = method.localPickUp.cost;
    if (method.localPickUp.taxStatus && taxAddress) {
      const taxClassId = method.localPickUp.taxStatus
        ? await getTaxOptions().then((opt) => opt.shippingTaxClass?.id)
        : null;
      if (taxClassId) {
        const taxRate = await getTaxRateByTaxClassAndAddress(
          taxClassId,
          taxAddress
        );
        if (taxRate) {
          if (pricesEnteredWithTax) {
            const taxRateDecimal = taxRate.rate / 100;
            const baseAmount = shippingCost / (1 + taxRateDecimal);
            shippingTax = shippingCost - baseAmount;
          } else {
            shippingTax = shippingCost * (taxRate.rate / 100);
          }
        }
      }
    }
  }

  shippingCost = parseFloat(shippingCost.toFixed(2));
  shippingTax = parseFloat(shippingTax.toFixed(2));
  const shippingTotalCostWithTax = parseFloat(
    (shippingCost + shippingTax).toFixed(2)
  );

  return { shippingCost, shippingTax, shippingTotalCostWithTax };
}
