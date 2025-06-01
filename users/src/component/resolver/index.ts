/**
 * Exports the resolver for handling user mutation operations.
 *
 * Workflow:
 * 1. Provides resolvers for creating, updating, and managing user data.
 * 2. Handles authentication-related mutations such as login and password changes.
 * 3. Manages role and permission modifications for users.
 */
export { userMutationsResolver } from "./userMutations";

/**
 * Exports the resolver for handling user query operations.
 *
 * Workflow:
 * 1. Provides resolvers for fetching user profiles, roles, and permissions.
 * 2. Supports querying individual user details and lists of users.
 * 3. Enables access to user-specific authentication and role data.
 */
export { userQueriesResolver } from "./userQueries";
