/**
 * Exports the Permission entity for managing user-specific permissions.
 *
 * Workflow:
 * 1. Provides the Permission entity to define and store personalized permissions for individual users.
 */
export { Permission } from "./permission.entity";

/**
 * Exports the RolePermission entity for handling role-permission relationships.
 *
 * Workflow:
 * 1. Provides the RolePermission entity to manage the association between roles and their default permissions.
 */
export { RolePermission } from "./role-permission.entity";

/**
 * Exports the Role entity for managing user roles.
 *
 * Workflow:
 * 1. Provides the Role entity to define and manage user roles within the system.
 */
export { Role } from "./user-role.entity";

/**
 * Exports the User entity for managing user data and authentication.
 *
 * Workflow:
 * 1. Provides the User entity to handle user-related data and authentication processes.
 */
export { User } from "./user.entity";
