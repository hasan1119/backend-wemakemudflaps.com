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
 * GraphQL query resolvers for user-related operations.
 *
 * Handles queries for fetching users, roles, permissions,
 * and profile data.
 */
export const userQueriesResolver = {
  Query: {
    /**
     * Retrieves a paginated list of all users.
     */
    getAllUsers,

    /**
     * Retrieves detailed information of a user by their unique ID.
     */
    getUserById,

    /**
     * Fetches the authenticated user's own profile information.
     */
    getProfile,

    /**
     * Retrieves role details by role ID.
     */
    getRoleById,

    /**
     * Fetches a paginated list of all roles in the system.
     */
    getAllRoles,

    /**
     * Retrieves all permissions assigned to a specified user by user ID.
     */
    getAllPermissionsByUserId,

    /**
     * Retrieves the authenticated user's own permissions.
     */
    getOwnPersonalizedPermissions,
  },
};
