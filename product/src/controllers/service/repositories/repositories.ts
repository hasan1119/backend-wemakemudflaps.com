import {
  Brand,
  Category,
  Coupon,
  Product,
  ProductAttribute,
  ProductAttributeValue,
  ProductPrice,
  ProductRequest,
  ProductReview,
  ProductTieredPrice,
  ProductVariation,
  ProductVariationAttribute,
  ProductVariationAttributeValue,
  ShippingClass,
  SubCategory,
  Tag,
  TaxClass,
  TaxStatus,
} from "../../../entities";
import { AppDataSource } from "../../../helper";

/**
 * Initializes repository for Brand entity.
 *
 * Workflow:
 * 1. Retrieves the Brand repository from AppDataSource for database operations.
 */
export const brandRepository = AppDataSource.getRepository(Brand);

/**
 * Initializes repository for Category entity.
 *
 * Workflow:
 * 1. Retrieves the Category repository from AppDataSource for database operations.
 */
export const categoryRepository = AppDataSource.getRepository(Category);

/**
 * Initializes repository for Coupon entity.
 *
 * Workflow:
 * 1. Retrieves the Coupon repository from AppDataSource for database operations.
 */
export const couponRepository = AppDataSource.getRepository(Coupon);

/**
 * Initializes repository for ProductAttributeValue entity.
 *
 * Workflow:
 * 1. Retrieves the ProductAttributeValue repository from AppDataSource for database operations.
 */
export const productAttributeValueRepository = AppDataSource.getRepository(
  ProductAttributeValue
);

/**
 * Initializes repository for ProductAttribute entity.
 *
 * Workflow:
 * 1. Retrieves the ProductAttribute repository from AppDataSource for database operations.
 */
export const productAttributeRepository =
  AppDataSource.getRepository(ProductAttribute);

/**
 * Initializes repository for ProductPrice entity.
 *
 * Workflow:
 * 1. Retrieves the ProductPrice repository from AppDataSource for database operations.
 */
export const productPriceRepository = AppDataSource.getRepository(ProductPrice);

/**
 * Initializes repository for ProductRequest entity.
 *
 * Workflow:
 * 1. Retrieves the ProductRequest repository from AppDataSource for database operations.
 */
export const productRequestRepository =
  AppDataSource.getRepository(ProductRequest);

/**
 * Initializes repository for ProductReview entity.
 *
 * Workflow:
 * 1. Retrieves the ProductReview repository from AppDataSource for database operations.
 */
export const productReviewRepository =
  AppDataSource.getRepository(ProductReview);

/**
 * Initializes repository for ProductTieredPrice entity.
 *
 * Workflow:
 * 1. Retrieves the ProductTieredPrice repository from AppDataSource for database operations.
 */
export const productTieredPriceRepository =
  AppDataSource.getRepository(ProductTieredPrice);

/**
 * Initializes repository for ProductVariationAttributeValue entity.
 *
 * Workflow:
 * 1. Retrieves the ProductVariationAttributeValue repository from AppDataSource for database operations.
 */
export const productVariationAttributeValueRepository =
  AppDataSource.getRepository(ProductVariationAttributeValue);

/**
 * Initializes repository for ProductVariationAttribute entity.
 *
 * Workflow:
 * 1. Retrieves the ProductVariationAttribute repository from AppDataSource for database operations.
 */
export const productVariationAttributeRepository = AppDataSource.getRepository(
  ProductVariationAttribute
);

/**
 * Initializes repository for ProductVariation entity.
 *
 * Workflow:
 * 1. Retrieves the ProductVariation repository from AppDataSource for database operations.
 */
export const productVariationRepository =
  AppDataSource.getRepository(ProductVariation);

/**
 * Initializes repository for Product entity.
 *
 * Workflow:
 * 1. Retrieves the Product repository from AppDataSource for database operations.
 */
export const productRepository = AppDataSource.getRepository(Product);

/**
 * Initializes repository for ShippingClass entity.
 *
 * Workflow:
 * 1. Retrieves the ShippingClass repository from AppDataSource for database operations.
 */
export const shippingClassRepository =
  AppDataSource.getRepository(ShippingClass);

/**
 * Initializes repository for SubCategory entity.
 *
 * Workflow:
 * 1. Retrieves the SubCategory repository from AppDataSource for database operations.
 */
export const subCategoryRepository = AppDataSource.getRepository(SubCategory);

/**
 * Initializes repository for Tag entity.
 *
 * Workflow:
 * 1. Retrieves the Tag repository from AppDataSource for database operations.
 */
export const tagRepository = AppDataSource.getRepository(Tag);

/**
 * Initializes repository for TaxClass entity.
 *
 * Workflow:
 * 1. Retrieves the TaxClass repository from AppDataSource for database operations.
 */
export const taxClassRepository = AppDataSource.getRepository(TaxClass);

/**
 * Initializes repository for TaxStatus entity.
 *
 * Workflow:
 * 1. Retrieves the TaxStatus repository from AppDataSource for database operations.
 */
export const taxStatusRepository = AppDataSource.getRepository(TaxStatus);
