import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  clearBrandsAndCountCache,
  setBrandInfoByIdInRedis,
  setBrandNameExistInRedis,
  setBrandSlugExistInRedis,
} from "../../../helper/redis";
import {
  CreateTaxOptionsResponseOrError,
  MutationCreateTaxOptionsArgs,
} from "../../../types";
import { createdTaxOptionsSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createBrand as createBrandService,
} from "../../services";

export const createTaxOptions = async (
  _: any,
  args: MutationCreateTaxOptionsArgs,
  { user }: Context
): Promise<CreateTaxOptionsResponseOrError> => {
  try {
    // Verify user authentication
    const authError = checkUserAuth(user);
    if (authError) return authError;

    // Check if user has permission to create tax options
    const hasPermission = await checkUserPermission({
      user,
      action: "canCreate",
      entity: "tax settings",
    });

    if (!hasPermission) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create tax options",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const result = await createdTaxOptionsSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const { name, slug, thumbnail } = result.data;

    // Create the brand in the database
    const brand = await createBrandService({ name, slug, thumbnail }, user.id);

    // Cache brand information and existence in Redis
    await Promise.all([
      setBrandInfoByIdInRedis(brand.id, brand),
      setBrandNameExistInRedis(brand.name),
      setBrandSlugExistInRedis(brand.slug),
      clearBrandsAndCountCache(),
    ]);

    return {
      statusCode: 201,
      success: true,
      message: "Brand created successfully",
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        thumbnail: brand.thumbnail as any,
        createdBy: brand.createdBy as any,
        createdAt:
          brand.createdAt instanceof Date
            ? brand.createdAt.toISOString()
            : brand.createdAt,
        deletedAt:
          brand.deletedAt instanceof Date
            ? brand.deletedAt.toISOString()
            : brand.deletedAt,
      },
      __typename: "BrandResponse",
    };
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return {
      statusCode: 500,
      success: false,
      message:
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
