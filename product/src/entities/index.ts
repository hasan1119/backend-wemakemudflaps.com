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
 * Exports the cart entity for managing user-specific shopping carts.
 *
 * Workflow:
 * 1. Provides the cart entity to define and store personalized shopping cart information for individual users.
 */
export { Cart } from "./cart.entity";

/**
 * Exports the cart item entity for managing user-specific cart items.
 *
 * Workflow:
 * 1. Provides the cart item entity to define and store personalized cart item information for individual users.
 */
export { CartItem } from "./cart-item.entity";

/**
 * Exports the wish list entity for handling user-specific wish lists.
 *
 * Workflow:
 * 1. Provides the wish list entity to define and store personalized wish list information for individual users.
 */
export { Wishlist } from "./wish-list.entity";

/**
 * Exports the wish list item entity for handling items in user-specific wish lists.
 *
 * Workflow:
 * 1. Provides the wish list item entity to define and store personalized wish list item information for individual users.
 */
export { WishlistItem } from "./wish-list-item.entity";

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
 * Exports the ProductVariationAttributeValue entity for managing attribute values in product variations.
 *
 * Workflow:
 * 1. Links attribute values to specific product variations (e.g., "Large" for size in a variation).
 */
export { ProductVariationAttributeValue } from "./product-variations-attribute-value.entity";

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
 * Exports the ProductBranchStock entity for managing stock information at the branch level.
 *
 * Workflow:
 * 1. Allows tracking of product stock levels across different branches.
 */
export { ProductBranchStock } from "./product-branch-stock.entity";

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

/**
 * Exports the ShippingZone entity for managing shipping zones.
 *
 * Workflow:
 * 1. Defines geographical areas for shipping methods.
 */
export { ShippingZone } from "./shipping-zone.entity";

/**
 * Exports the FlatRateCost entity for managing costs associated with flat rate shipping.
 *
 * Workflow:
 * 1. Defines costs for different shipping classes under flat rate shipping.
 */
export { FlatRateCost } from "./flat-rate-cost.entity";

/**
 * Exports the TaxOptions entity for managing tax settings.
 *
 * Workflow:
 * 1. Configures tax calculation methods, display options, and rounding rules.
 */
export { TaxOptions } from "./tax-options.entity";
