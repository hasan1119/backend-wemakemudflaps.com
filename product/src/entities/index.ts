/**
 * Exports the Brand entity for managing product brands.
 *
 * Workflow:
 * 1. Provides brand information such as name and logo.
 */
export { Brand } from "./brand.entity";

/**
 * Exports the Category entity for managing product categories.
 *
 * Workflow:
 * 1. Organizes products under broad classifications.
 */
export { Category } from "./category.entity";

/**
 * Exports the Coupon entity for managing discount codes.
 *
 * Workflow:
 * 1. Provides discount logic and coupon validation.
 */
export { Coupon } from "./coupon.entity";

/**
 * Exports the ProductAttributeValue entity for storing attribute values.
 *
 * Workflow:
 * 1. Links values to product attributes (e.g., "Red" for color).
 */
export { ProductAttributeValue } from "./product-attribute-value.entity";

/**
 * Exports the ProductAttribute entity for defining attributes.
 *
 * Workflow:
 * 1. Describes product features like size, color, etc.
 */
export { ProductAttribute } from "./product-attribute.entity";

/**
 * Exports the ProductPrice entity for managing product pricing.
 *
 * Workflow:
 * 1. Stores base prices, discounts, or special pricing logic.
 */
export { ProductPrice } from "./product-price.entity";

/**
 * Exports the ProductRequest entity for managing product inquiries or requests.
 *
 * Workflow:
 * 1. Handles customer product request or demand data.
 */
export { ProductRequest } from "./product-request.entity";

/**
 * Exports the ProductReview entity for storing customer reviews.
 *
 * Workflow:
 * 1. Enables customers to review and rate products.
 */
export { ProductReview } from "./product-review.entity";

/**
 * Exports the ProductTieredPrice entity for volume-based pricing.
 *
 * Workflow:
 * 1. Manages pricing tiers based on quantity.
 */
export { ProductTieredPrice } from "./product-tiered-pricing.entity";

/**
 * Exports the ProductVariationAttributeValue entity for variation attribute values.
 *
 * Workflow:
 * 1. Stores variation-specific values like "XL" for size.
 */
export { ProductVariationAttributeValue } from "./product-variation-attribute-value.entity";

/**
 * Exports the ProductVariationAttribute entity for defining variation attributes.
 *
 * Workflow:
 * 1. Helps create product variations by defining variation types.
 */
export { ProductVariationAttribute } from "./product-variation-attribute.entity";

/**
 * Exports the ProductVariation entity for managing different versions of a product.
 *
 * Workflow:
 * 1. Allows handling of variations like size, color, etc.
 */
export { ProductVariation } from "./product-variation.entity";

/**
 * Exports the Product entity for managing product information.
 *
 * Workflow:
 * 1. Provides the Product entity to manage product details, including name, description, price, and stock.
 */
export { Product } from "./product.entity";

/**
 * Exports the ShippingClass entity for configuring shipping rules.
 *
 * Workflow:
 * 1. Sets different shipping rates or methods based on classes.
 */
export { ShippingClass } from "./shipping-class.entity";

/**
 * Exports the Tag entity for defining different tag groups.
 *
 * Workflow:
 * 1. Manages tags and assignments to products.
 */
export { Tag } from "./tag.entity";

/**
 * Exports the TaxClass entity for defining different tax groups.
 *
 * Workflow:
 * 1. Manages tax rates and assignments to products or orders.
 */

export { TaxClass } from "./tax-class.entity";
/**
 * Exports the TaxRate entity for defining different tax groups.
 *
 * Workflow:
 * 1. Manages tax rates and assignments to products or orders.
 */
export { TaxRate } from "./tax-rate.entity";

/**
 * Exports the FlatRate entity for flat rate shipping configuration.
 *
 * Workflow:
 * 1. Provides a flat rate shipping option with configurable parameters.
 */
export { FlatRate } from "./flat-rate.entity";

/**
 * Exports the FreeShipping entity for free shipping configuration.
 *
 * Workflow:
 * 1. Provides a free shipping option with configurable parameters.
 */
export { FreeShipping } from "./free-shipping.entity";

/**
 * Exports the LocalPickUp entity for local pickup shipping configuration.
 *
 * Workflow:
 * 1. Provides a local pickup option with configurable parameters.
 */
export { LocalPickUp } from "./local-pick-up.entity";

/**
 * Exports the Ups entity for UPS shipping configuration.
 *
 * Workflow:
 * 1. Provides a UPS shipping option with configurable parameters.
 */
export { Ups } from "./ups.entity";
/**
 * Exports the ShippingMethod entity for configuring shipping methods.
 *
 * Workflow:
 * 1. Sets different shipping methods and their configuration.
 */
export { ShippingMethod } from "./shipping-method.entity";
