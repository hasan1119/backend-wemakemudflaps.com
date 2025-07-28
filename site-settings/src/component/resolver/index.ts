/**
 * Exports the resolver for handling site settings mutation operations.
 *
 * Workflow:
 * 1. Provides resolvers for creating, updating, and managing site settings data.
 * 2. Handles authentication-related mutations such as login and password changes.
 */
export { siteSettingsMutationsResolver } from "./siteSettingsMutations";

/**
 * Exports the resolver for handling site settings query operations.
 *
 * Workflow:
 * 1. Provides resolvers for fetching site settings profiles, roles, and permissions.
 * 2. Supports querying individual site settings details and lists of site settings.
 * 3. Enables access to site settings-specific authentication.
 */
export { siteSettingsQueriesResolver } from "./siteSettingsQueries";
