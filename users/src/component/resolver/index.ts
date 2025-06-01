/**
 * Exports the resolver for user mutations.
 *
 * This resolver handles mutation-based GraphQL operations, including:
 * - Creating new users.
 * - Updating user details such as profiles and permissions.
 * - Managing authentication-related mutations like login and password changes.
 */
export { userMutationsResolver } from "./userMutations";

/**
 * Exports the resolver for user queries.
 *
 * This resolver manages query-based GraphQL operations, including:
 * - Fetching user profiles and individual user details.
 * - Retrieving lists of users.
 * - Accessing user-specific data related to authentication and role management.
 */
export { userQueriesResolver } from "./userQueries";
