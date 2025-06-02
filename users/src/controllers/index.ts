/**
 * Exports GraphQL mutations for authentication and user management.
 *
 * Workflow:
 * 1. Provides mutations for user login with valid credentials.
 * 2. Enables registration of new user accounts.
 * 3. Supports changing passwords for authenticated users.
 * 4. Handles forgotten passwords by sending reset instructions.
 * 5. Facilitates secure password resets through a validation process.
 * 6. Logs out authenticated users by clearing their session or authentication tokens.
 */
export { login } from "./mutations/auth/login-register/login";
export { register } from "./mutations/auth/login-register/register";
export { logout } from "./mutations/auth/logout/logout";
export { changePassword } from "./mutations/auth/password/change-password";
export { forgetPassword } from "./mutations/auth/password/forget-password";
export { resetPassword } from "./mutations/auth/password/reset-password";

/**
 * Exports GraphQL mutations for managing user roles.
 *
 * Workflow:
 * 1. Provides mutations for creating new roles with specific permissions.
 * 2. Enables deletion of roles that are no longer needed.
 * 3. Supports restoration of previously deleted roles.
 * 4. Allows updating role details and associated permissions.
 * 5. Facilitates modification of additional role-related information.
 */
export { createUserRole } from "./mutations/manage-role/create-user-role";
export { deleteUserRole } from "./mutations/manage-role/delete-user-role";
export { restoreUserRole } from "./mutations/manage-role/restore-user-role";
export { updateUserRole } from "./mutations/manage-role/update-user-role";
export { updateUserRoleInfo } from "./mutations/manage-role/update-user-role-info";

/**
 * Exports GraphQL mutations for updating permissions and user profiles.
 *
 * Workflow:
 * 1. Provides mutations for updating user permissions based on role assignments.
 * 2. Enables modification of user profile details such as name, email, or avatar.
 */
export { updateUserPermission } from "./mutations/permission/update-user-permission";
export { updateProfile } from "./mutations/profile/update-profile";

/**
 * Exports GraphQL mutations for account verification and activation.
 *
 * Workflow:
 * 1. Provides mutations for activating user accounts post-verification.
 * 2. Enables verification of user email addresses to enhance authentication security.
 */
export { accountActivation } from "./mutations/verification-and-activation/account-activation";
export { verifyEmail } from "./mutations/verification-and-activation/email-verification";

/**
 * Exports GraphQL queries for retrieving user and role data.
 *
 * Workflow:
 * 1. Provides queries for fetching details of a specific role by its ID.
 * 2. Enables retrieval of all roles in the system.
 * 3. Supports fetching the profile of the authenticated user.
 * 4. Allows querying a user by their unique ID.
 * 5. Facilitates listing all users in the system.
 */
export { getRoleById } from "./queries/role/get-role-by-id";
export { getAllRoles } from "./queries/role/get-roles";
export { getProfile } from "./queries/user/get-profile";
export { getUserById } from "./queries/user/get-user-by-id";
export { getAllUsers } from "./queries/user/get-users";

/**
 * Exports GraphQL queries for retrieving permission data.
 *
 * Workflow:
 * 1. Provides queries for fetching all permissions assigned to a user by their ID.
 * 2. Enables retrieval of the authenticated user's own permission set.
 */
export { getAllPermissionsByUserId } from "./queries/permission/get-all-permissions-by-user-id";
export { getOwnPersonalizedPermissions } from "./queries/permission/get-own-personalized-permissions";
