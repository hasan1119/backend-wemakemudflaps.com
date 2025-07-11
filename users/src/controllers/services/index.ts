/**
 * Exports services for managing address book operations.
 *
 * Workflow:
 * 1. Provides functions for creating, update, getting and deleting address book.
 * 2. Enables operations for address book management tasks.
 */
export { createAddressBookEntry } from "./address-book/create-address-book.service";
export { deleteAddressBook } from "./address-book/delete-address-book.service";
export {
  getAddressBookById,
  getAddressBooks,
} from "./address-book/get-address-book.service";
export { updateAddressBookEntry } from "./address-book/update-address-book.service";

/**
 * Exports services for managing user-related operations.
 *
 * Workflow:
 * 1. Provides functions for creating and deleting users.
 * 2. Enables operations for user management tasks.
 */
export { createUser, createUserLoginInfo } from "./user/create-user.service";
export {
  deleteUser,
  deleteUserLoginInfoByUserId,
  deleteUserLoginInfoByUserIds,
  deleteUserLoginInfoSessionsByIds,
} from "./user/delete-user.service";

/**
 * Exports services for retrieving user data.
 *
 * Workflow:
 * 1. Provides functions to fetch user details by email, ID, or password reset token.
 * 2. Enables retrieval of user count, personalized permissions, and email-only data.
 * 3. Supports paginated user queries for efficient data access.
 * 4. Resolve user entity references (e.g., for Apollo Federation via `CreatedBy`).
 */
export {
  CreatedBy,
  getPaginatedUsers,
  getUserByEmail,
  getUserById,
  getUserByPasswordResetToken,
  getUserCount,
  getUserEmailOnly,
  getUserLoginInfoByUserId,
  getUserPersonalizedPermission,
  getUsersLoginInfoByUserIds,
  isUsernameAvailable,
} from "./user/get-user.service";

/**
 * Exports services for managing user account status and updates.
 *
 * Workflow:
 * 1. Provides functions for activating user accounts and verifying emails.
 * 2. Enables updating user details, passwords, permissions, and reset tokens.
 * 3. Supports checking email uniqueness and clearing reset tokens after use.
 */
export {
  activateUserAccount,
  clearResetToken,
  isEmailInUse,
  updateUser,
  updateUserPassword,
  updateUserPasswordAndClearToken,
  updateUserPermissions,
  updateUserResetPasswordToken,
} from "./user/update-user.service";

/**
 * Exports service for verifying user authentication status.
 *
 * Workflow:
 * 1. Provides a function to check if a user is authenticated.
 */
export { checkUserAuth } from "./session-check/session-check";

/**
 * Exports services for managing user roles.
 *
 * Workflow:
 * 1. Provides functions for creating, updating, and deleting roles.
 * 2. Enables role retrieval by ID, name, or pagination with search and sorting.
 * 3. Supports counting users assigned to roles and restoring soft-deleted roles.
 */
export { createRole } from "./role/create-role.service";
export { hardDeleteRole, softDeleteRole } from "./role/delete-role.service";
export {
  countRolesWithSearch,
  countUsersWithRole,
  findRoleByName,
  findRoleByNameToUpdate,
  findRolesByNames,
  getRoleById,
  getRolesByIds,
  paginateRoles,
} from "./role/get-role.service";
export { restoreRole } from "./role/restore-role.service";
export { updateRoleInfo } from "./role/update-role.service";

/**
 * Exports services for managing permissions at user and role levels.
 *
 * Workflow:
 * 1. Provides functions for checking, retrieving, and updating user-specific permissions.
 * 2. Enables deletion of permissions for users and roles.
 * 3. Supports assigning default permissions to roles and individual permissions to users.
 */
export {
  deleteDefaultPermissionOfRole,
  deleteUserSpecificPermission,
} from "./permission/delete-permission.service";
export {
  checkUserPermission,
  getPermissionsByUserId,
} from "./permission/get-user-permission.service";
export { updateUserSpecificPermission } from "./permission/update-user-permission.service";

/**
 * Exports services for managing tax exemption operations.
 *
 * Workflow:
 * 1. Provides functions for creating, update and getting tax exemption.
 * 2. Enables operations for tax exemption management tasks.
 */
export { createTaxExemption } from "./tax-exemption/create-tax-exemption.service";
export {
  getTaxExemptionById,
  getTaxExemptionByUserId,
} from "./tax-exemption/get-tax-exemption.service";
export { updateTaxExemption } from "./tax-exemption/update-tax-exemption.service";
