/**
 * Exports the resolver for handling product mutation operations.
 *
 * Workflow:
 * 1. Provides resolvers for creating, updating, and managing product data.
 * 2. Handles authentication-related mutations such as login and password changes.
 */
export { productMutationsResolver } from "./productMutations";

/**
 * Exports the resolver for handling product query operations.
 *
 * Workflow:
 * 1. Provides resolvers for fetching product profiles, roles, and permissions.
 * 2. Supports querying individual product details and lists of products.
 * 3. Enables access to product-specific authentication.
 */
export { productQueriesResolver } from "./productQueries";
