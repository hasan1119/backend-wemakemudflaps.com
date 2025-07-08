import {
  AddressBook,
  Permission,
  Role,
  RolePermission,
  TaxExemption,
  User,
  UserLogin,
} from "../../../entities";
import { AppDataSource } from "../../../helper";

/**
 * Initializes repository for Address Book entity.
 *
 * Workflow:
 * 1. Retrieves the Address book repository from AppDataSource for database operations.
 */
export const addressBookRepository = AppDataSource.getRepository(AddressBook);

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

/**
 * Initializes repository for Login entity.
 *
 * Workflow:
 * 1. Retrieves the Login repository from AppDataSource for storing user login metadata (IP, location, etc.).
 */
export const loginRepository = AppDataSource.getRepository(UserLogin);

/**
 * Initializes repository for Login entity.
 *
 * Workflow:
 * 1. Retrieves the Login repository from AppDataSource for storing user login metadata (IP, location, etc.).
 */
export const taxExemptionRepository = AppDataSource.getRepository(TaxExemption);
