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
 * GraphQL mutation resolvers for user-related operations.
 *
 * Handles authentication, account management,
 * role creation, updates, and permission modifications.
 */
export const userMutationsResolver = {
  Mutation: {
    /**
     * Change a user's password with proper authentication and validation.
     */
    changePassword,

    /**
     * Create a new user role with specific permissions.
     */
    createUserRole,

    /**
     * Initiate forgotten password flow by sending a reset email.
     */
    forgetPassword,

    /**
     * Authenticate user credentials and generate auth tokens.
     */
    login,

    /**
     * Register a new user after validating input data.
     */
    register,

    /**
     * Reset a password using a valid reset token.
     */
    resetPassword,

    /**
     * Update personal profile details of the authenticated user.
     */
    updateProfile,

    /**
     * Activate a user account post-verification.
     */
    accountActivation,

    /**
     * Verify user's email address during or after registration.
     */
    verifyEmail,

    /**
     * Delete existing user roles.
     */
    deleteUserRole,

    /**
     * Restore previously deleted user roles.
     */
    restoreUserRole,

    /**
     * Update detailed information about a specific user role.
     */
    updateUserRoleInfo,

    /**
     * Modify user permissions as per administrative controls.
     */
    updateUserPermission,

    /**
     * Update role assignments for users.
     */
    updateUserRole,
  },
};
