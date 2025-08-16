/**
 * Exports the FAQ entity for managing frequently asked questions.
 *
 * Workflow:
 * 1. Provides the FAQ entity to define and store frequently asked questions and their answers.
 */
export { FAQ } from "./faq.entity";

/**
 * Exports the SiteSetting entity for managing site-wide settings.
 *
 * Workflow:
 * 1. Provides the SiteSettings entity to define and store configuration settings for the site.
 */
export { SiteSettings } from "./site-settings.entity";

/**
 * Exports the Newsletter entity for managing newsletter subscriptions.
 *
 * Workflow:
 * 1. Provides the Newsletter entity to handle user subscriptions to newsletters and related communications.
 */
export { Newsletter } from "./news-letter.entity";

/**
 * Exports the ShopAddress entity for managing physical shop or branch addresses.
 *
 * Workflow:
 * 1. Provides the ShopAddress entity to define and store detailed shop or branch location information.
 * 2. Supports metadata such as emails, phones, opening hours, weekly off days, and default tax address flags.
 */
export { ShopAddress } from "./shop-address.entity";
