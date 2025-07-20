import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

// Defines a mapping for free shipping condition values
export const freeShippingConditionTypeMap: Record<string, string> = {
  NA: "N/A",
  Coupon: "Coupon",
  Minimum_Order_Amount: "Minimum Order Amount",
  Minimum_Order_Amount_or_Coupon: "Minimum Order Amount or Coupon",
  Minimum_Order_Amount_and_Coupon: "Minimum Order Amount & Coupon",
};

/**
 * Enum for free shipping condition types.
 *
 * Workflow:
 * 1. Defines the allowed values for free shipping condition types.
 *
 * @property {"N/A" | "Coupon" | "Minimum Order Amount" | "Minimum Order Amount or Coupon" | "Minimum Order Amount & Coupon"} value - The type of free shipping condition.
 */
export const FreeShippingConditionTypeEnum = z.preprocess((val) => {
  if (typeof val === "string" && freeShippingConditionTypeMap[val]) {
    return freeShippingConditionTypeMap[val];
  }
  return val;
}, z.enum([...new Set(Object.values(freeShippingConditionTypeMap))] as [string, ...string[]]));

/**
 * Defines the schema for validating a single shipping method object creation input.
 *
 * Workflow:
 * 1. Validates title as a non-empty string.
 * 2. Validates status as an optional boolean.
 * 3. Validates description as an optional string or null.
 * 4. Validates flatRate, freeShipping, localPickUp, and ups as optional objects with specific fields.
 * 5. Ensures exactly one shipping method type is provided.
 * 6. Validates shippingZoneId as a UUID string.
 * 7. Uses superRefine to ensure only one shipping method type is provided.
 * 8. Ensures that the shipping method is associated with a valid shipping zone.
 *
 * @property title - Shipping method title (non-empty string).
 * @property status - Optional shipping method status (boolean).
 * @property description - Optional shipping method description (string or null).
 * @property flatRate - Optional flat rate shipping method details.
 * @property freeShipping - Optional free shipping method details.
 * @property localPickUp - Optional local pick up shipping method details.
 * @property ups - Optional UPS shipping method details.
 * @property shippingZoneId - Shipping zone ID (UUID string).
 */
export const createShippingMethodSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    status: z.boolean().optional(),
    description: z.string().nullable().optional(),
    flatRate: z
      .object({
        title: z.string().min(1, "Flat rate title is required"),
        taxStatus: z.boolean().default(false),
        cost: z.number().min(0, "Flat rate cost must be non-negative"),
        costs: z.array(
          z.object({
            cost: z.number().min(0, "Flat rate cost must be non-negative"),
            shippingClassId: z.string().uuid(),
          })
        ),
      })
      .optional()
      .nullable(),
    freeShipping: z
      .object({
        title: z.string().min(1, "Free shipping title is required"),
        conditions: FreeShippingConditionTypeEnum,
        minimumOrderAmount: z
          .number()
          .min(0, "Minimum order amount must be non-negative")
          .optional()
          .nullable(),
        applyMinimumOrderRuleBeforeCoupon: z.boolean(),
      })
      .optional()
      .nullable(),
    localPickUp: z
      .object({
        title: z.string().min(1, "Local pick up title is required"),
        taxStatus: z.boolean().default(false),
        cost: z
          .number()
          .min(0, "Local pick up cost must be non-negative")
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
    ups: z
      .object({
        title: z.string().min(1, "UPS title is required"),
      })
      .optional()
      .nullable(),
    shippingZoneId: z.string().uuid("Invalid UUID format"),
  })
  .superRefine((data, ctx) => {
    const methods = [
      data.flatRate,
      data.freeShipping,
      data.localPickUp,
      data.ups,
    ];
    const count = methods.filter(Boolean).length;

    if (count > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Only one shipping method type can be provided (flatRate, freeShipping, localPickUp, or ups).",
        path: [],
      });
    }
  });

/**
 * Defines the schema for validating a single shipping method object update input.
 *
 * Workflow:
 * 1. Validates id as a UUID string.
 * 2. Validates title as an optional non-empty string.
 * 3. Validates status as an optional boolean.
 * 4. Validates description as an optional string or null.
 * 5. Validates flatRate, freeShipping, localPickUp, and ups as optional objects with specific fields.
 * 6. Ensures exactly one shipping method type is provided.
 * 7. Validates shippingZoneId as a UUID string.
 * 8. Uses superRefine to ensure only one shipping method type is provided.
 *
 * @property id - Shipping method ID (UUID string).
 * @property title - Optional shipping method title (non-empty string).
 * @property status - Optional shipping method status (boolean).
 * @property description - Optional shipping method description (string or null).
 * @property flatRate - Optional flat rate shipping method details.
 * @property freeShipping - Optional free shipping method details.
 * @property localPickUp - Optional local pick up method details.
 * @property ups - Optional UPS method details.
 * @property shippingZoneId - Optional shipping zone ID (UUID string).
 */
export const updateShippingMethodSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1, "Title is required").optional().nullable(),
    status: z.boolean().optional().nullable(),
    description: z.string().optional().nullable(),
    flatRate: z
      .object({
        id: z.string().uuid().optional().nullable(),
        title: z.string().min(1).optional().nullable(),
        taxStatus: z.boolean().optional().nullable(),
        cost: z.number().min(0).optional().nullable(),
        costs: z
          .array(
            z.object({
              id: z.string().uuid().optional().nullable(),
              cost: z.number().min(0).optional().nullable(),
              shippingClassId: z.string().uuid().optional().nullable(),
            })
          )
          .optional(),
      })
      .optional()
      .nullable(),
    freeShipping: z
      .object({
        id: z.string().uuid().optional().nullable(),
        title: z.string().min(1).optional().nullable(),
        conditions: FreeShippingConditionTypeEnum.optional().nullable(),
        minimumOrderAmount: z.number().min(0).optional().nullable(),
        applyMinimumOrderRuleBeforeCoupon: z.boolean().optional().nullable(),
      })
      .optional()
      .nullable(),
    localPickUp: z
      .object({
        id: z.string().uuid().optional().nullable(),
        title: z.string().min(1).optional().nullable(),
        taxStatus: z.boolean().optional().nullable(),
        cost: z.number().min(0).optional().nullable(),
      })
      .optional()
      .nullable(),
    ups: z
      .object({
        id: z.string().uuid().optional().nullable(),
        title: z.string().min(1).optional().nullable(),
      })
      .optional()
      .nullable(),
    shippingZoneId: z.string().uuid("Invalid UUID format"),
  })
  .superRefine((data, ctx) => {
    const methods = [
      { key: "flatRate", value: data.flatRate },
      { key: "freeShipping", value: data.freeShipping },
      { key: "localPickUp", value: data.localPickUp },
      { key: "ups", value: data.ups },
    ];

    const activeMethods = methods.filter((m) => !!m.value);

    // ✅ Rule 1: Only one shipping method allowed (or none)
    if (activeMethods.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Only one shipping method type can be provided (flatRate, freeShipping, localPickUp, or ups).",
        path: [],
      });
    }

    // ✅ Rule 2: If a method has fields (other than id), its id is required
    activeMethods.forEach(({ key, value }) => {
      if (value) {
        const hasOtherFields = Object.entries(value).some(
          ([field, val]) => field !== "id" && val !== undefined
        );

        if (hasOtherFields && !value.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `ID is required for ${key} when updating its fields`,
            path: [key, "id"],
          });
        }
      }
    });

    // ✅ Rule 3: Must provide at least one updatable field besides id and shippingZoneId
    const { id, shippingZoneId, ...rest } = data;
    const hasUpdateData = Object.values(rest).some(
      (val) => val !== undefined && val !== null
    );

    if (!hasUpdateData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field must be provided to update.",
        path: [],
      });
    }
  });

/**
 * Defines the schema for validating sorting options for shipping methods.
 *
 * Workflow:
 * 1. Validates sortBy as an optional enum with allowed values.
 * 2. Validates sortOrder as a required enum.
 *
 * @property sortBy - Optional field to sort by (title, status, createdAt).
 * @property sortOrder - Required field to specify the order (ascending or descending).
 */
export const shippingMethodSortingSchema = z.object({
  sortBy: z.enum(["title", "status", "createdAt"]).optional(),
  sortOrder: SortOrderTypeEnum,
});
