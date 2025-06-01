import {
  accountActivation,
  changePassword,
  createUserRole,
  deleteUserRole,
  forgetPassword,
  login,
  register,
  resetPassword,
  restoreUserRole,
  updateProfile,
  updateUserPermission,
  updateUserRole,
  updateUserRoleInfo,
  verifyEmail,
} from "../../controllers";

/**
 * Defines GraphQL mutation resolvers for user-related operations.
 *
 * Workflow:
 * 1. Maps mutation fields to controller functions for user management.
 * 2. Handles authentication, account activation, and role/permission updates.
 * 3. Supports operations like password changes, email verification, and role management.
 */
export const userMutationsResolver = {
  Mutation: {
    /**
     * Updates a user's password after validating credentials.
     */
    changePassword,

    /**
     * Creates a new user role with specified permissions.
     */
    createUserRole,

    /**
     * Triggers the password reset process by sending a reset email.
     */
    forgetPassword,

    /**
     * Authenticates a user and generates authentication tokens.
     */
    login,

    /**
     * Registers a new user with validated input data.
     */
    register,

    /**
     * Resets a user's password using a valid reset token.
     */
    resetPassword,

    /**
     * Updates the authenticated user's profile information.
     */
    updateProfile,

    /**
     * Activates a user account after verification.
     */
    accountActivation,

    /**
     * Verifies a user's email address during or post-registration.
     */
    verifyEmail,

    /**
     * Deletes specified user roles from the system.
     */
    deleteUserRole,

    /**
     * Restores previously deleted user roles.
     */
    restoreUserRole,

    /**
     * Updates detailed information for a specific user role.
     */
    updateUserRoleInfo,

    /**
     * Modifies user permissions based on administrative input.
     */
    updateUserPermission,

    /**
     * Updates role assignments for a specific user.
     */
    updateUserRole,
  },
};
