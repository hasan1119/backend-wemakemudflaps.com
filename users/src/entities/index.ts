/**
 * Exports the Permission entity for managing user-specific permissions.
 *
 * Workflow:
 * 1. Provides the Permission entity to define and store personalized permissions for individual users.
 */
export { Permission } from "./permission.entity";

/**
 * Exports the Address entity for managing user-specific addresses.
 *
 * Workflow:
 * 1. Provides the Address entity to define and store personalized addresses for individual users.
 */
export { AddressBook } from "./address-book.entity";

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

/**
 * Exports the Login entity for storing user login session metadata.
 *
 * Workflow:
 * 1. Provides the Login entity to log each successful login with IP, fingerprint, and location-related metadata.
 */
export { UserLogin } from "./user-login.entity";

/**
 * Exports the Login entity for storing user login session metadata.
 *
 * Workflow:
 * 1. Provides the Login entity to log each successful login with IP, fingerprint, and location-related metadata.
 */
export { TaxExemption } from "./tax-exemption.entity";
