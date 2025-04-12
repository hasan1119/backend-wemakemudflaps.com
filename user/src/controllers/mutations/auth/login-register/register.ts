import { Repository } from "typeorm";
import { Context } from "../../../../context";
import {
  Permission,
  PermissionName,
} from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import {
  BaseResponse,
  ErrorResponse,
  MutationRegisterArgs,
} from "../../../../types";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import { registerSchema } from "../../../../utils/data-validation/auth/auth";

// List of all possible permission names for the system
const PermissionNames: PermissionName[] = [
  "User",
  "Brand",
  "Category",
  "Product",
  "Product Review",
  "Shipping Class",
  "Sub Category",
  "Tax Class",
  "Tax Status",
  "FAQ",
  "News Letter",
  "Pop Up Banner",
  "Privacy & Policy",
  "Terms & Conditions",
  "Role",
  "Order",
  "Notification",
  "Media",
];

/**
 * Registers a new user in the system.
 * - Creates a Super Admin if no users exist or no Super Admin role exists.
 * - Otherwise, registers a regular Customer user.
 * @param _ - Unused GraphQL parent argument
 * @param args - Registration arguments (firstName, lastName, email, password, gender)
 * @param context - Application context containing AppDataSource
 * @returns Promise<BaseResponse | ErrorResponse> - Registration result with status and message
 */
export const register = async (
  _: any,
  args: MutationRegisterArgs,
  { AppDataSource, redis }: Context
): Promise<BaseResponse | ErrorResponse> => {
  const { firstName, lastName, email, password, gender } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Initialize repositories
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Validate input data using Zod schema
    const validationResult = await registerSchema.safeParseAsync({
      firstName,
      lastName,
      email,
      password,
      gender,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed.",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Check for existing user with the same email
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return {
        statusCode: 400,
        success: false,
        message: "Email already in use",
        __typename: "BaseResponse",
      };
    }

    // Hash the password
    const hashedPassword = await HashInfo(password);

    // Check if this is the first user or if Super Admin role is missing
    const userCount = await userRepository.count();
    const superAdminRole = await roleRepository.findOne({
      where: { name: "SUPER ADMIN" },
    });

    let role: Role;

    if (!superAdminRole || userCount === 0) {
      // Create Super Admin role
      role = roleRepository.create({
        name: "SUPER ADMIN",
        description:
          "Has full control over all aspects of the eCommerce platform.",
        createdBy: null,
      });
      await roleRepository.save(role);

      // Create Super Admin user
      const newUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role, // Assign the Role entity object
      });

      const savedUser = await userRepository.save(newUser);

      // Create permissions for Super Admin
      const permissions = PermissionNames.map((name: PermissionName) =>
        permissionRepository.create({
          name,
          description: `Full access to manage ${name}`,
          user: savedUser,
          createdBy: savedUser,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        })
      );

      await permissionRepository.save(permissions);

      // Fetch all persisted permissions
      const fullPermissions = await permissionRepository.find({
        where: { user: { id: savedUser.id } },
      });

      const TTL = 2592000; // 30 days in seconds
      const permissionCacheKey = `user-permissions-${savedUser.id}`;
      await setSession(permissionCacheKey, fullPermissions, TTL);

      return {
        statusCode: 201,
        success: true,
        message: "Super Admin registered successfully",
        __typename: "BaseResponse",
      };
    } else {
      // Register a Customer user
      let defaultRole = await roleRepository.findOne({
        where: { name: "CUSTOMER" },
      });

      if (!defaultRole) {
        defaultRole = roleRepository.create({
          name: "CUSTOMER",
          description:
            "Regular customers who can browse products, place orders, and view their purchase history.",
          createdBy: null,
        });
        role = await roleRepository.save(defaultRole);
      } else {
        role = defaultRole;
      }

      // Create Customer user
      const savedUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role, // Assign the Role entity object
      });
      await userRepository.save(savedUser);

      // Assign CUSTOMER permissions
      const customerPermissions = PermissionNames.map(
        (name: PermissionName) => {
          let canCreate = false;
          let canRead = true;
          let canUpdate = false;
          let canDelete = false;

          if (name === "Order") {
            canCreate = true;
            canRead = true;
            canUpdate = false;
            canDelete = true;
          }

          if (name === "Notification") {
            canCreate = false;
            canRead = true;
            canUpdate = true;
            canDelete = true;
          }

          if (name === "User") {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          return permissionRepository.create({
            name,
            description: `Access to ${name} features`,
            user: savedUser,
            createdBy: null,
            canCreate,
            canRead,
            canUpdate,
            canDelete,
          });
        }
      );

      await permissionRepository.save(customerPermissions);

      // Fetch all persisted permissions
      const fullCustomerPermissions = await permissionRepository.find({
        where: { user: { id: savedUser.id } },
      });

      const TTL = 2592000; // 30 days in seconds
      const permissionCacheKey = `user-permissions-${savedUser.id}`;
      await setSession(permissionCacheKey, fullCustomerPermissions, TTL);

      return {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        __typename: "BaseResponse",
      };
    }
  } catch (error: any) {
    console.error("Error registering user:", error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
