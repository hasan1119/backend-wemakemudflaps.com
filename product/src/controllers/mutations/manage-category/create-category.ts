import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getCategoryInfoByCategoryIdFromRedis,
  getCategoryNameExistFromRedis,
  getSubCategoryNameExistFromRedis,
  setCategoryInfoByCategoryIdInRedis,
  setCategoryNameExistInRedis,
  setSubCategoryInfoBySubCategoryIdInRedis,
  setSubCategoryNameExistInRedis,
} from "../../../helper/redis";
import {
  CreateCategoryResponseOrError,
  MutationCreateCategoryArgs,
} from "../../../types";
import { createCategorySchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  createCategoryOrSubCategory,
  findCategoryByName,
  getCategoryById,
  getSubCategoryById,
} from "../../service";

export const createCategory = async (
  _: any,
  args: MutationCreateCategoryArgs,
  { user }: Context
): Promise<CreateCategoryResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Check if user has permission to create a category
    const canCreate = await checkUserPermission({
      action: "canCreate",
      entity: "category",
      user,
    });

    if (!canCreate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to create category",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await createCategorySchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    const { categoryId, description, name, parentSubCategoryId, thumbnail } =
      validationResult.data;

    // Check for existing category/subcategory in Redis or database
    // Attempt to check for existing category in Redis
    let categoryExists;

    if (categoryId || parentSubCategoryId) {
      categoryExists = await getSubCategoryNameExistFromRedis(
        name,
        categoryId || parentSubCategoryId
      );
    } else {
      categoryExists = await getCategoryNameExistFromRedis(name);
    }

    if (!categoryExists) {
      categoryExists = await findCategoryByName(
        name,
        categoryId || parentSubCategoryId ? "subCategory" : "category",
        categoryId ? categoryId : undefined,
        parentSubCategoryId ? parentSubCategoryId : undefined
      );

      // console.log(categoryExists);

      if (categoryExists) {
        const promises = [];

        const categoryType =
          categoryId || parentSubCategoryId ? "subCategory" : "category";

        const pushCategoryPromises = () => {
          promises.push(
            setCategoryNameExistInRedis(name),
            setCategoryInfoByCategoryIdInRedis(
              categoryExists.id,
              categoryExists
            )
          );
        };

        const pushSubCategoryPromises = (id) => {
          promises.push(
            setSubCategoryNameExistInRedis(name, id),
            setSubCategoryInfoBySubCategoryIdInRedis(
              categoryExists.id,
              categoryExists
            )
          );
        };

        if (categoryType === "subCategory") {
          const id = categoryId || parentSubCategoryId;
          if (categoryId) {
            pushCategoryPromises();
          } else if (parentSubCategoryId) {
            pushSubCategoryPromises(id);
          }
        } else {
          pushCategoryPromises();
        }

        return {
          statusCode: 400,
          success: false,
          message:
            categoryId || parentSubCategoryId
              ? "Subcategory with this name already exists in parent"
              : "Category with this name already exists",
          __typename: "BaseResponse",
        };
      }
    } else {
      return {
        statusCode: 400,
        success: false,
        message:
          categoryId || parentSubCategoryId
            ? "Subcategory with this name already exists in parent"
            : "Category with this name already exists",
        __typename: "BaseResponse",
      };
    }

    // Validate parent category if categoryId is provided
    let parentCategoryExist;
    if (categoryId) {
      parentCategoryExist = await getCategoryInfoByCategoryIdFromRedis(
        categoryId
      );
      if (!parentCategoryExist) {
        parentCategoryExist = await getCategoryById(categoryId);
        if (!parentCategoryExist) {
          return {
            statusCode: 404,
            success: false,
            message: "Parent category not found",
            __typename: "BaseResponse",
          };
        }
        parentCategoryExist = {
          ...parentCategoryExist,
          subCategories: parentCategoryExist.subCategories ?? [],
          products: parentCategoryExist.products ?? [],
          createdBy: parentCategoryExist.createdBy as any,
          createdAt:
            parentCategoryExist.createdAt instanceof Date
              ? parentCategoryExist.createdAt.toISOString()
              : parentCategoryExist.createdAt,
          deletedAt:
            parentCategoryExist.deletedAt instanceof Date
              ? parentCategoryExist.deletedAt.toISOString()
              : parentCategoryExist.deletedAt,
        };
        await setCategoryInfoByCategoryIdInRedis(
          categoryId,
          parentCategoryExist
        );
      }
    }

    // Validate parent subcategory if parentSubCategoryId is provided
    let subParentCategoryExist;
    if (parentSubCategoryId) {
      subParentCategoryExist = await getSubCategoryById(parentSubCategoryId);
      if (!subParentCategoryExist) {
        return {
          statusCode: 404,
          success: false,
          message: "Parent subcategory not found",
          __typename: "BaseResponse",
        };
      }
      subParentCategoryExist = {
        ...subParentCategoryExist,
        category: subParentCategoryExist.parentSubCategory || null,
        parentSubCategory: subParentCategoryExist.parentSubCategory || null,
        subCategories: subParentCategoryExist.subCategories ?? [],
        products: subParentCategoryExist.products ?? [],
        createdBy: subParentCategoryExist.createdBy as any,
        createdAt:
          subParentCategoryExist.createdAt instanceof Date
            ? subParentCategoryExist.createdAt.toISOString()
            : subParentCategoryExist.createdAt,
        deletedAt:
          subParentCategoryExist.deletedAt instanceof Date
            ? subParentCategoryExist.deletedAt.toISOString()
            : subParentCategoryExist.deletedAt,
      };
      await setSubCategoryInfoBySubCategoryIdInRedis(
        parentSubCategoryId,
        subParentCategoryExist
      );
    }

    // Create the category or subcategory in the database
    const categoryResult = await createCategoryOrSubCategory(
      {
        categoryId,
        description,
        name,
        parentSubCategoryId,
        thumbnail,
      },
      user.id
    );

    const isSubCategory = categoryId || parentSubCategoryId;

    // Construct the response object
    let categoryResponse: any;
    if (!isSubCategory) {
      // Top-level category
      categoryResponse = {
        ...categoryResult,
        subCategories: categoryResult.subCategories ?? [],
        products: categoryResult.products ?? [],
        createdBy: categoryResult.createdBy as any,
        createdAt:
          categoryResult.createdAt instanceof Date
            ? categoryResult.createdAt.toISOString()
            : categoryResult.createdAt,
        deletedAt:
          categoryResult.deletedAt instanceof Date
            ? categoryResult.deletedAt.toISOString()
            : categoryResult.deletedAt,
      };
    } else {
      // Subcategory
      categoryResponse = {
        ...categoryResult,
        category: subParentCategoryExist?.category,
        parentSubCategory: subParentCategoryExist || null,
        subCategories: categoryResult.subCategories ?? [],
        products: categoryResult.products ?? [],
        createdBy: categoryResult.createdBy as any,
        createdAt:
          categoryResult.createdAt instanceof Date
            ? categoryResult.createdAt.toISOString()
            : categoryResult.createdAt,
        deletedAt:
          categoryResult.deletedAt instanceof Date
            ? categoryResult.deletedAt.toISOString()
            : categoryResult.deletedAt,
      };
    }

    // Cache the new category/subcategory in Redis
    const cachePromises = [];
    if (!isSubCategory) {
      cachePromises.push(
        setCategoryInfoByCategoryIdInRedis(categoryResult.id, categoryResponse),
        setCategoryNameExistInRedis(name)
      );
    } else if (categoryId) {
      cachePromises.push(
        setSubCategoryNameExistInRedis(name, categoryId),
        setSubCategoryInfoBySubCategoryIdInRedis(
          categoryResult.id,
          categoryResponse
        )
      );
    } else if (parentSubCategoryId) {
      cachePromises.push(
        setSubCategoryNameExistInRedis(name, parentSubCategoryId),
        setSubCategoryInfoBySubCategoryIdInRedis(
          categoryResult.id,
          categoryResponse
        )
      );
    }
    await Promise.all(cachePromises);

    return {
      statusCode: 201,
      success: true,
      message: isSubCategory
        ? "Subcategory created successfully"
        : "Category created successfully",
      data: categoryResponse,
      __typename: isSubCategory ? "SubCategoryResponse" : "CategoryResponse",
    };
  } catch (error: any) {
    console.error("Error creating category:", error);
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
