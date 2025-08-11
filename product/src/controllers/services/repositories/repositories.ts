import {
  Brand,
  Cart,
  Category,
  Coupon,
  FlatRate,
  FlatRateCost,
  FreeShipping,
  LocalPickUp,
  Product,
  ProductAttribute,
  ProductAttributeValue,
  ProductBranchStock,
  ProductPrice,
  ProductRequest,
  ProductReview,
  ProductTieredPrice,
  ProductVariation,
  ProductVariationAttributeValue,
  ShippingClass,
  ShippingMethod,
  ShippingZone,
  Tag,
  TaxClass,
  TaxOptions,
  TaxRate,
  Ups,
  Wishlist,
  WishlistItem,
} from "../../../entities";
import { AppDataSource } from "../../../helper";
import { CartItem } from "./../../../entities/cart-item.entity";

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
 * Initializes repository for ProductVariationAttributeValue entity with relations.
 *
 * Workflow:
 * 1. Retrieves the ProductVariationAttributeValue repository from AppDataSource for database operations.
 */
export const productVariationAttributeValueRepository =
  AppDataSource.getRepository(ProductVariationAttributeValue);

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
 * Initializes repository for ProductBranchStock entity.
 *
 * Workflow:
 * 1. Retrieves the ProductBranchStock repository from AppDataSource for database operations.
 */
export const productBranchStockRepository =
  AppDataSource.getRepository(ProductBranchStock);

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
 * Initializes repository for TaxRate entity.
 *
 * Workflow:
 * 1. Retrieves the TaxRate repository from AppDataSource for database operations.
 */
export const taxRateRepository = AppDataSource.getRepository(TaxRate);

/**
 * Initializes repository for ShippingMethod entity.
 *
 * Workflow:
 * 1. Retrieves the ShippingMethod repository from AppDataSource for database operations.
 */
export const shippingMethodRepository =
  AppDataSource.getRepository(ShippingMethod);

/**
 * Initializes repository for FlatRate entity.
 *
 * Workflow:
 * 1. Retrieves the FlatRate repository from AppDataSource for database operations.
 */
export const flatRateRepository = AppDataSource.getRepository(FlatRate);

/**
 * Initializes repository for FreeShipping entity.
 *
 * Workflow:
 * 1. Retrieves the FreeShipping repository from AppDataSource for database operations.
 */
export const freeShippingRepository = AppDataSource.getRepository(FreeShipping);

/**
 * Initializes repository for LocalPickUp entity.
 *
 * Workflow:
 * 1. Retrieves the LocalPickUp repository from AppDataSource for database operations.
 */
export const localPickUpRepository = AppDataSource.getRepository(LocalPickUp);

/**
 * Initializes repository for Ups entity.
 *
 * Workflow:
 * 1. Retrieves the Ups repository from AppDataSource for database operations.
 */
export const upsRepository = AppDataSource.getRepository(Ups);

/**
 * Initializes repository for ShippingZone entity.
 *
 * Workflow:
 * 1. Retrieves the ShippingZone repository from AppDataSource for database operations.
 */
export const shippingZoneRepository = AppDataSource.getRepository(ShippingZone);

/* Initializes repository for FlatRateCost entity.
 *
 * Workflow:
 * 1. Retrieves the FlatRateCost repository from AppDataSource for database operations.
 */
export const flatRateCostRepository = AppDataSource.getRepository(FlatRateCost);

/**
 * Initializes repository for TaxOptions entity.
 *
 * Workflow:
 * 1. Retrieves the TaxOptions repository from AppDataSource for database operations.
 */
export const taxOptionsRepository = AppDataSource.getRepository(TaxOptions);

/**
 * Initializes repository for Cart entity.
 *
 * Workflow:
 * 1. Retrieves the Cart repository from AppDataSource for database operations.
 */
export const cartRepository = AppDataSource.getRepository(Cart);

/**
 * Initializes repository for CartItem entity.
 *
 * Workflow:
 * 1. Retrieves the CartItem repository from AppDataSource for database operations.
 */
export const cartItemRepository = AppDataSource.getRepository(CartItem);

/**
 * Initializes repository for Wishlist entity.
 *
 * Workflow:
 * 1. Retrieves the Wishlist repository from AppDataSource for database operations.
 */
export const wishlistRepository = AppDataSource.getRepository(Wishlist);

/**
 * Initializes repository for WishlistItem entity.
 *
 * Workflow:
 * 1. Retrieves the WishlistItem repository from AppDataSource for database operations.
 */
export const wishListItemRepository = AppDataSource.getRepository(WishlistItem);
