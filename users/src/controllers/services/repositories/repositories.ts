import { Permission, Role, RolePermission, User } from "../../../entities";
import { AppDataSource } from "../../../helper";

/**
 * Initializes repository for User entity.
 *
 * Workflow:
 * 1. Retrieves the User repository from AppDataSource for database operations.
 */
export const userRepository = AppDataSource.getRepository(User);

/**
 * Initializes repository for Role entity.
 *
 * Workflow:
 * 1. Retrieves the Role repository from AppDataSource for database operations.
 */
export const roleRepository = AppDataSource.getRepository(Role);

/**
 * Initializes repository for Permission entity.
 *
 * Workflow:
 * 1. Retrieves the Permission repository from AppDataSource for database operations.
 */
export const permissionRepository = AppDataSource.getRepository(Permission);

/**
 * Initializes repository for RolePermission entity.
 *
 * Workflow:
 * 1. Retrieves the RolePermission repository from AppDataSource for database operations.
 */
export const rolePermissionRepository =
  AppDataSource.getRepository(RolePermission);
