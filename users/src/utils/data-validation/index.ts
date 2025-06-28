/**
 * Exports authentication-related schemas for user operations.
 *
 * Workflow:
 * 1. Provides schemas for validating user registration, login, password reset, and profile updates.
 */
export {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./auth/auth";

/**
 * Exports common schemas and types for general use.
 *
 * Workflow:
 * 1. Provides schemas for UUID validation, pagination, sorting, and permission enums.
 * 2. Exports permission names and types for use in permission-related operations.
 */
export {
  idSchema,
  idsSchema,
  paginationSchema,
  PermissionEnum,
  PERMISSIONS,
  rolesSortingSchema,
  sessionStringSchema,
  skipTrashSchema,
  SortOrderTypeEnum,
  usersSortingSchema,
} from "./common/common";
export type { PermissionName } from "./common/common";

/**
 * Exports role-related schemas for user role management.
 *
 * Workflow:
 * 1. Provides schemas for creating, updating, and assigning user roles.
 */
export {
  userRoleInfoUpdateSchema,
  userRoleSchema,
  userRoleUpdateSchema,
} from "./role/role";

/**
 * Exports permission-related schemas for user permission management.
 *
 * Workflow:
 * 1. Provides schemas for updating user permissions and permission enums.
 */
export { updateUserPermissionSchema } from "./permission/permission";
