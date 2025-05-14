import { DeepPartial, Repository } from "typeorm";
import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import {
  Permission,
  PermissionName,
} from "../../../../entities/permission.entity";
import { Role } from "../../../../entities/user-role.entity";
import { User } from "../../../../entities/user.entity";
import {
  getRoleInfoByRoleNameFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserCountInDBFromRedis,
  getUserEmailFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setRoleNameExistInRedis,
  setTotalUserCountByRoleIdInRedis,
  setUserCountInDBInRedis,
  setUserEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
  setUserPermissionsByUserIdInRedis,
} from "../../../../helper/redis";
import {
  BaseResponseOrError,
  CachedRoleInputs,
  CachedUserPermissionsInputs,
  CachedUserSessionByEmailKeyInputs,
  MutationRegisterArgs,
  UserSession,
} from "../../../../types";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import { registerSchema } from "../../../../utils/data-validation";
import SendEmail from "../../../../utils/email/send-email";

// List of all possible permission names for the system
const PermissionNames: PermissionName[] = [
  "User",
  "Brand",
  "Category",
  "Permission",
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
 *
 * Steps:
 * - Validates input using Zod schema
 * - Checks Redis for user email, total user, count and user roles data to optimize performance via caching
 * - Registers the first user as a Super Admin if no users or Super Admin role exists
 * - Otherwise registers a user with a Customer role and sets default permissions
 * - Sends a account activation email
 * - Caches the necessary user's data, role, and permissions in Redis for future request
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Arguments for registration (firstName, lastName, email, password, gender)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const register = async (
  _: any,
  args: MutationRegisterArgs,
  { AppDataSource }: Context
): Promise<BaseResponseOrError> => {
  const { firstName, lastName, email, password, gender } = args;

  try {
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
        message: "Validation failed",
        errors: errorMessages,
        __typename: "ErrorResponse",
      };
    }

    // Initialize repositories
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached user's email
    let userEmail = await getUserEmailFromRedis(email);

    if (userEmail) {
      return {
        statusCode: 400,
        success: false,
        message: "Email already in use",
        __typename: "BaseResponse",
      };
    } else {
      // Cache miss: Fetch user from database
      const dbUser = await userRepository.findOne({ where: { email } });
      if (dbUser) {
        // Cache user email in Redis
        await setUserEmailInRedis(email, email);

        return {
          statusCode: 400,
          success: false,
          message: "Email already in use",
          __typename: "BaseResponse",
        };
      }
    }

    // Hash the password
    const hashedPassword = await HashInfo(password);

    // Check Redis for cached users count
    let userCount = await getUserCountInDBFromRedis();

    if (!userCount) {
      // Cache miss: Fetch users count from database
      userCount = await userRepository.count();
    }

    // Initiate the empty variable for the user role & super admin
    let role;

    if (userCount === 0) {
      // Check Redis for the super admin
      role = await getRoleInfoByRoleNameFromRedis("SUPER ADMIN");

      // Initiate the empty variable for the user count for super admin
      let userCountForRole;

      if (!role) {
        // Cache miss: Fetch role from database
        role = await roleRepository.findOne({
          where: { name: "SUPER ADMIN" },
        });

        if (!role) {
          // Create Super Admin role
          const savedRole = roleRepository.create({
            name: "SUPER ADMIN",
            description: "Has full control over all aspects of the platform.",
            createdBy: null,
          });
          role = await roleRepository.save(savedRole);
        }

        // Check Redis for the user count with this role
        userCountForRole = await getTotalUserCountByRoleIdFromRedis(role.id);

        if (!userCountForRole) {
          // Cache miss: Count users in database efficiently
          userCountForRole = await userRepository.count({
            where: { role: { id: role.id } },
          });

          // Cache user count with this role in Redis
          await setTotalUserCountByRoleIdInRedis(role.id, userCountForRole);
        }

        // Create a new session for user role
        const roleSession: CachedRoleInputs = {
          id: role.id,
          name: role.name,
          description: role.description,
          createdBy: role.createdBy,
          createdAt: role.createdAt.toIsoString(),
          deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
        };

        // Cache user role info in Redis
        await Promise.all([
          setRoleInfoByRoleNameInRedis(role.name, roleSession),
          setRoleInfoByRoleIdInRedis(role.id, roleSession),
          setRoleNameExistInRedis(role.name),
        ]);
      }

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
          description: `${name} permission for Super Admin`,
          user: savedUser, // Assign user to each permission
          createdBy: null, // Since no one created the first user
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        } as DeepPartial<Permission>)
      );

      const fullPermissions = await permissionRepository.save(permissions);

      // Create the account activation link with user id
      const activationLink = `${CONFIG.FRONTEND_URL}/active-account/?userId=${savedUser.id}`;

      // Prepare email contents
      const subject = "Account Activation Request";
      const text = `Please use the following link to active your account: ${activationLink}`;
      const html = `<p>Please use the following link to active your account: <a href="${activationLink}">${activationLink}</a></p>`;

      // Attempt to send the reset email
      const emailSent = await SendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // If email sending fails, return an error
      if (!emailSent) {
        // Delete the newly created user's permissions & user
        await Promise.all([
          permissionRepository.delete({ user: savedUser }),
          userRepository.delete({ id: savedUser.id }),
        ]);

        return {
          statusCode: 500,
          success: false,
          message:
            "Registration failed. Failed to send account activation email.",
          __typename: "BaseResponse",
        };
      }

      // Create a new session for the user
      const session: UserSession = {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role.name,
        gender: savedUser.gender,
        emailVerified: savedUser.emailVerified,
        isAccountActivated: savedUser.isAccountActivated,
      };

      const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role.name,
        gender: savedUser.gender,
        emailVerified: savedUser.emailVerified,
        isAccountActivated: savedUser.isAccountActivated,
        password: savedUser.password,
      };

      const userPermissions: CachedUserPermissionsInputs[] =
        fullPermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        }));

      // Cache newly register user, user email, user role & his/her permissions for curd, and update use count and role-based user counts in Redis
      await Promise.all([
        setUserInfoByUserIdInRedis(savedUser.id, session),
        setUserInfoByEmailInRedis(email, userSessionByEmail),
        setUserCountInDBInRedis(userCount + 1),
        setUserPermissionsByUserIdInRedis(savedUser.id, userPermissions),
        setTotalUserCountByRoleIdInRedis(role.id, userCountForRole + 1),
      ]);

      return {
        statusCode: 201,
        success: true,
        message:
          "Super Admin registered successfully. To active your account check your email.",
        __typename: "BaseResponse",
      };
    } else {
      // Check Redis for for the super admin
      role = await getRoleInfoByRoleNameFromRedis("CUSTOMER");

      // Initiate the empty variable for the user count for super admin
      let userCountForRole;

      if (!role) {
        // Cache miss: Fetch user from database
        role = await roleRepository.findOne({
          where: { name: "CUSTOMER" },
        });

        if (!role) {
          // Create customer role
          const savedRole = roleRepository.create({
            name: "CUSTOMER",
            description:
              "Regular customers who can browse products, place orders, view their purchase history and other related things.",
            createdBy: null,
          });
          role = await roleRepository.save(savedRole);
        }

        // Check Redis for the user count with this role
        userCountForRole = await getTotalUserCountByRoleIdFromRedis(role.id);

        if (!userCountForRole) {
          // Cache miss: Count users in database efficiently
          userCountForRole = await userRepository.count({
            where: { role: { id: role.id } },
          });

          // Cache user count with this role in Redis
          await setTotalUserCountByRoleIdInRedis(role.id, userCountForRole);
        }

        // Create a new session for user role
        const roleSession: CachedRoleInputs = {
          id: role.id,
          name: role.name,
          description: role.description,
          createdBy: role.createdBy,
          createdAt: role.createdAt.toIsoString(),
          deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
        };

        // Cache user role info in Redis
        await Promise.all([
          setRoleInfoByRoleNameInRedis(role.name, roleSession),
          setRoleInfoByRoleIdInRedis(role.id, roleSession),
          setRoleNameExistInRedis(role.name),
        ]);
      }

      // Create Customer user
      const newUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role,
      });

      const savedUser = await userRepository.save(newUser);

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
          if (name === "Permission") {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }
          if (name === "News Letter") {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          if (name === "Product Review") {
            canCreate = true;
            canRead = true;
            canUpdate = true;
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

          if (name === "Role") {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          if (name === "Media") {
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
          } as DeepPartial<Permission>);
        }
      );

      const fullPermissions = await permissionRepository.save(
        customerPermissions
      );

      // Create the account activation link with user id
      const activationLink = `${CONFIG.FRONTEND_URL}/active-account/?userId=${savedUser.id}`;

      // Prepare email contents
      const subject = "Account Activation Request";
      const text = `Please use the following link to active your account: ${activationLink}`;
      const html = `<p>Please use the following link to active your account: <a href="${activationLink}">${activationLink}</a></p>`;

      // Attempt to send the reset email
      const emailSent = await SendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // If email sending fails, return an error
      if (!emailSent) {
        // Delete the newly created user's permissions & user
        await Promise.all([
          await permissionRepository.delete({ user: savedUser }),
          await userRepository.delete({ id: savedUser.id }),
        ]);

        return {
          statusCode: 500,
          success: false,
          message:
            "Registration failed. Failed to send account activation email.",
          __typename: "BaseResponse",
        };
      }

      // Create a new session for the user
      const session: UserSession = {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role.name,
        gender: savedUser.gender,
        emailVerified: savedUser.emailVerified,
        isAccountActivated: savedUser.isAccountActivated,
      };

      const userSessionByEmail: CachedUserSessionByEmailKeyInputs = {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role.name,
        gender: savedUser.gender,
        emailVerified: savedUser.emailVerified,
        isAccountActivated: savedUser.isAccountActivated,
        password: savedUser.password,
      };

      const userPermissions: CachedUserPermissionsInputs[] =
        fullPermissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        }));

      // Cache newly register user, user email, user role & his/her permissions for curd, and update use count and role-based user counts in Redis
      await Promise.all([
        setUserInfoByUserIdInRedis(savedUser.id, session),
        setUserInfoByEmailInRedis(email, userSessionByEmail),
        setUserCountInDBInRedis(userCount + 1),
        setUserPermissionsByUserIdInRedis(savedUser.id, userPermissions),
        setTotalUserCountByRoleIdInRedis(role.id, userCountForRole + 1),
      ]);

      return {
        statusCode: 201,
        success: true,
        message:
          "Registration successful. To active your account check your email.",
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
