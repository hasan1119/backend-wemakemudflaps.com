import {
  accountActivation,
  changePassword,
  createAddressBookEntry,
  createTaxExemptionEntry,
  createUserRole,
  deleteAddressBookEntry,
  deleteLoginSession,
  deleteUserRole,
  forgetPassword,
  login,
  logout,
  register,
  resetPassword,
  restoreUserRole,
  updateAddressBookEntry,
  updateProfile,
  updateTaxExemptionEntry,
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

    /**
     * Logs out authenticated users by clearing their session or authentication tokens.
     */
    logout,

    /**
     * Deletes a user's login session, effectively logging them out.
     */
    deleteLoginSession,

    /**
     * Creates a new address book log for a specific user.
     */
    createAddressBookEntry,

    /**
     * Deletes address book log of a specific user.
     */
    deleteAddressBookEntry,

    /**
     * Updates address book log for a specific user.
     */
    updateAddressBookEntry,

    /**
     * Creates a new tax exemption entry for a specific user.
     */
    createTaxExemptionEntry,

    /**
     * Updates an existing tax exemption entry for a specific user.
     */
    updateTaxExemptionEntry,
  },
};
