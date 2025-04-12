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
  { AppDataSource }: Context
): Promise<BaseResponse | ErrorResponse> => {
  // Destructure the input arguments
  const { firstName, lastName, email, password, gender } = args;

  try {
    // Initialize repositories for User, Role, and Permission entities
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

    // If validation fails, return detailed error messages with field names
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Converts the path array to a string
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

    // Check if a user with this email already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return {
        statusCode: 400,
        success: false,
        message: "Email already in use",
        __typename: "BaseResponse",
      };
    }

    // Hash the password for secure storage
    const hashedPassword = await HashInfo(password);

    // Count existing users to determine if this is the first user
    const userCount = await userRepository.count();

    // Check if a Super Admin role already exists
    const superAdminRole = await roleRepository.findOne({
      where: { name: "SUPER ADMIN" },
    });

    let role: Role;

    // If no Super Admin role exists or no users exist, create a Super Admin
    if (!superAdminRole || userCount === 0) {
      // Create the Super Admin role
      role = roleRepository.create({
        name: "SUPER ADMIN",
        description:
          "Has full control over all aspects of the eCommerce platform.",
        createdBy: null, // No creator for the first role
      });
      await roleRepository.save(role);

      // Create the Super Admin user with the newly created role
      const newUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role: role.id, // Assign the Super Admin role
      });
      const savedUser = await userRepository.save(newUser);

      // Create full permissions for the Super Admin
      const permissions = PermissionNames.map((name: PermissionName) =>
        permissionRepository.create({
          name,
          description: `Full access to manage ${name}`,
          user: savedUser, // Assign to the saved user (required field)
          createdBy: savedUser, // Super Admin creates their own permissions
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        })
      );
      await permissionRepository.save(permissions);

      // Return success response for Super Admin registration
      return {
        statusCode: 201,
        success: true,
        message: "Super Admin registered successfully",
        __typename: "BaseResponse",
      };
    } else {
      // Super Admin exists, so register a regular Customer user
      const defaultRole = await roleRepository.findOne({
        where: { name: "CUSTOMER" },
      });

      // If no Customer role exists, create one
      if (!defaultRole) {
        const newDefaultRole = roleRepository.create({
          name: "CUSTOMER",
          description:
            "Regular customers who can browse products, place orders, and view their purchase history.",
          createdBy: null, // No creator for initial Customer role
        });
        role = await roleRepository.save(newDefaultRole);
      } else {
        role = defaultRole;
      }

      // Create the Customer user with the Customer role
      const newUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role: role.id, // Assign the Customer role
      });
      const savedUser = await userRepository.save(newUser);

      // Return success response for Customer registration
      return {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        __typename: "BaseResponse",
      };
    }
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error registering user:", error);

    // Return a detailed error message if available, otherwise a generic one
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
