/**
 * Exports the resolver for handling media mutation operations.
 *
 * Workflow:
 * 1. Provides resolvers for creating, updating, and managing media data.
 * 2. Handles authentication-related mutations such as login and password changes.
 */
export { mediaMutationsResolver } from "./mediaMutations";

/**
 * Exports the resolver for handling media query operations.
 *
 * Workflow:
 * 1. Provides resolvers for fetching media profiles, roles, and permissions.
 * 2. Supports querying individual media details and lists of medias.
 * 3. Enables access to media-specific authentication.
 */
export { mediaQueriesResolver } from "./mediaQueries";
