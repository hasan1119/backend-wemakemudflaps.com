import {
  getAllPermissionsByUserId,
  getAllRoles,
  getAllUsers,
  getOwnPersonalizedPermissions,
  getProfile,
  getRoleById,
  getUserById,
} from "../../controllers";

/**
 * Defines GraphQL query resolvers for user-related operations.
 *
 * Workflow:
 * 1. Maps query fields to controller functions for fetching user data.
 * 2. Supports retrieval of user profiles, roles, permissions, and lists.
 * 3. Enables access to both individual and aggregated user-related data.
 */
export const userQueriesResolver = {
  Query: {
    /**
     * Fetches a paginated list of all users in the system.
     */
    getAllUsers,

    /**
     * Retrieves detailed information for a user by their unique ID.
     */
    getUserById,

    /**
     * Fetches the profile information of the authenticated user.
     */
    getProfile,

    /**
     * Retrieves details for a specific role by its ID.
     */
    getRoleById,

    /**
     * Fetches a paginated list of all roles in the system.
     */
    getAllRoles,

    /**
     * Retrieves all permissions assigned to a user by their ID.
     */
    getAllPermissionsByUserId,

    /**
     * Fetches the authenticated user's personalized permissions.
     */
    getOwnPersonalizedPermissions,
  },
};
