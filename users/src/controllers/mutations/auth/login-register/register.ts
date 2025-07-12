import CONFIG from "../../../../config/config";
import { Context } from "../../../../context";
import { Role, User } from "../../../../entities";
import {
  clearAllUserCountCache,
  clearAllUserSearchCache,
  getRoleInfoByRoleNameFromRedis,
  getTotalUserCountByRoleIdFromRedis,
  getUserCountInDBFromRedis,
  getUserEmailFromRedis,
  setPermissionAgainstRoleInRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
  setRoleNameExistInRedis,
  setTotalUserCountByRoleIdInRedis,
  setUserCountInDBInRedis,
  setUserEmailInRedis,
  setUserInfoByEmailInRedis,
  setUserInfoByUserIdInRedis,
} from "../../../../helper/redis";
import {
  BaseResponseOrError,
  MutationRegisterArgs,
  PermissionAgainstRoleInput,
  RoleSession,
} from "../../../../types";
import HashInfo from "../../../../utils/bcrypt/hash-info";
import type { PermissionName } from "../../../../utils/data-validation";
import { PERMISSIONS, registerSchema } from "../../../../utils/data-validation";
import SendEmail from "../../../../utils/email/send-email";
import { mapRoleToResponse } from "../../../../utils/mapper";
import {
  countUsersWithRole,
  createRole,
  createUser,
  deleteUser,
  findRoleByName,
  getUserCount,
  getUserEmailOnly,
  isUsernameAvailable,
} from "../../../services";

/**
 * Handles user registration functionality.
 *
 * Workflow:
 * 1. Validates the registration input (firstName, lastName, email, password, gender, username and company name) using Zod schema.
 * 2. Checks Redis for cached user email to prevent duplicate registrations.
 * 3. Hashes the password using bcrypt for secure storage.
 * 4. Retrieves total user count from Redis or database to determine if this is the first user.
 * 5. Assigns Super Admin role with full permissions for the first user, or Customer role with limited permissions for others.
 * 6. Creates and caches the appropriate role (Super Admin or Customer) in Redis if it doesn't exist.
 * 7. Creates the user with the assigned role and caches user data in Redis.
 * 8. Generates and sends an account activation email with a unique link.
 * 9. Updates user count and role-based user counts in Redis.
 * 10. Returns a success response or deletes the user and returns an error if email sending fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing firstName, lastName, email, password, and gender.
 * @param __ - GraphQL context (unused here).
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const register = async (
  _: any,
  args: MutationRegisterArgs,
  __: Context
): Promise<BaseResponseOrError> => {
  try {
    // Validate input data with Zod schema
    const validationResult = await registerSchema.safeParseAsync(args);

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join("."), // Join path array to string for field identification
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

    const { firstName, lastName, email, username, password, gender, company } =
      validationResult.data;

    // Attempt to retrieve cached user email from Redis
    let userEmail;

    userEmail = await getUserEmailFromRedis(email);

    if (userEmail) {
      return {
        statusCode: 400,
        success: false,
        message: "Email already in use",
        __typename: "BaseResponse",
      };
    } else {
      // On cache miss, query user email from database
      const dbUser = await getUserEmailOnly(email);

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

    // Check if username is available
    const isAvailable = await isUsernameAvailable(username);

    if (!isAvailable) {
      return {
        statusCode: 400,
        success: false,
        message: "Username already in use",
        __typename: "BaseResponse",
      };
    }

    // Hash the password using bcrypt
    const hashedPassword = await HashInfo(password);

    // Attempt to retrieve cached user count from Redis
    let userCount;

    userCount = await getUserCountInDBFromRedis();

    if (!userCount) {
      // On cache miss, fetch user count from database
      userCount = await getUserCount();
    }

    // Initialize role variable
    let role;

    if (userCount === 0) {
      // Attempt to retrieve Super Admin role from Redis
      role = await getRoleInfoByRoleNameFromRedis("SUPER ADMIN");

      // Initialize user count for Super Admin role
      let userCountForRole;

      if (!role) {
        // On cache miss, fetch Super Admin role from database
        role = await findRoleByName("SUPER ADMIN");

        if (!role) {
          // Define full permissions for Super Admin
          const superAdminPermissions = PERMISSIONS.map((name) => ({
            name: name as PermissionName,
            description: `${name} permission for Super Admin`,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          }));

          // Create Super Admin role with full permissions
          const savedRole = await createRole({
            name: "SUPER ADMIN",
            description: "Has full control over all aspects of the platform.",
            defaultPermissions: superAdminPermissions,
            systemDeleteProtection: true,
            systemUpdateProtection: true,
          } as Role);

          role = savedRole;

          // Cache role permissions in Redis
          await setPermissionAgainstRoleInRedis(
            role.id,
            role.defaultPermissions
          );
        }

        // Cache Super Admin role data in Redis
        await Promise.all([
          setRoleInfoByRoleNameInRedis(role.name, role),
          setRoleInfoByRoleIdInRedis(role.id, role),
          setRoleNameExistInRedis(role.name),
        ]);
      }

      // Retrieve user count for Super Admin role from Redis
      userCountForRole = await getTotalUserCountByRoleIdFromRedis(role.id);

      if (userCountForRole === 0) {
        // On cache miss, count users with Super Admin role in database
        userCountForRole = await countUsersWithRole(role.id);

        // Cache user count for Super Admin role in Redis
        await setTotalUserCountByRoleIdInRedis(role.id, userCountForRole);
      }

      // Create Super Admin user
      const savedUser = (await createUser({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        gender: gender || null,
        roles: [role], // expects an array of Role entities
        canUpdatePermissions: false,
        canUpdateRole: false,
        company: company,
      })) as User;

      // Generate account activation link
      const activationLink = `${CONFIG.FRONTEND_URL}/active-account/?userId=${savedUser.id}&email=${email}`;

      // Prepare email content for activation
      const subject = "Account Activation Request";
      const text = `Please use the following link to active your account: ${activationLink}`;
      const html = `<p>Please use the following link to active your account: <a href="${activationLink}">${activationLink}</a></p>`;

      // Attempt to send account activation email
      const emailSent = await SendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // If email sending fails, delete the user and return error
      if (!emailSent) {
        await Promise.all([deleteUser(savedUser.id)]);

        return {
          statusCode: 500,
          success: false,
          message: "Registration failed. Failed to register account.",
          __typename: "BaseResponse",
        };
      }

      // Cache user data, email, and update counts in Redis
      await Promise.all([
        setUserEmailInRedis(email, email),
        setUserInfoByUserIdInRedis(savedUser.id, savedUser),
        setUserInfoByEmailInRedis(email, savedUser),
        setUserCountInDBInRedis(userCount + 1),
        setTotalUserCountByRoleIdInRedis(role.id, userCountForRole + 1),
        clearAllUserSearchCache(),
        clearAllUserCountCache(),
      ]);

      return {
        statusCode: 201,
        success: true,
        message:
          "Super Admin registered successfully. To active your account check your email.",
        __typename: "BaseResponse",
      };
    } else {
      // Attempt to retrieve Customer role from Redis
      role = await getRoleInfoByRoleNameFromRedis("CUSTOMER");

      // Initialize user count for Customer role
      let userCountForRole;

      if (!role) {
        // On cache miss, fetch Customer role from database
        role = await findRoleByName("CUSTOMER");

        const permissionAgainstRole: PermissionAgainstRoleInput[] =
          PERMISSIONS.map((name: string) => {
            let canCreate = false;
            let canRead = false;
            let canUpdate = false;
            let canDelete = false;

            switch (name) {
              case "Order":
                canCreate = true;
                canRead = true;
                canDelete = true;
                canUpdate = true;
                break;
              default:
                break;
            }

            return {
              name: name as PermissionName,
              description: `${name} permission for Customer`,
              canCreate,
              canRead,
              canUpdate,
              canDelete,
            };
          });

        if (!role) {
          // Create Customer role with default permissions
          const savedRole = await createRole({
            name: "CUSTOMER",
            description:
              "Regular customers who can browse products, place orders, view their purchase history and other related things.",
            defaultPermissions: permissionAgainstRole,
            systemDeleteProtection: true,
            systemUpdateProtection: true,
          } as Role);

          role = savedRole;

          // Cache Customer role permissions in Redis
          await setPermissionAgainstRoleInRedis(
            role.id,
            role.defaultPermissions
          );
        }

        // Create a new session for Customer role
        const roleSession: RoleSession = await mapRoleToResponse(role);

        role = roleSession;

        // Cache Customer role data in Redis
        await Promise.all([
          setRoleInfoByRoleNameInRedis(role.name, role),
          setRoleInfoByRoleIdInRedis(role.id, role),
          setRoleNameExistInRedis(role.name),
        ]);
      }

      // Retrieve user count for Customer role from Redis
      userCountForRole = await getTotalUserCountByRoleIdFromRedis(role.id);

      if (userCountForRole === 0) {
        // On cache miss, count users with Customer role in database
        userCountForRole = await countUsersWithRole(role.id);

        // Cache user count for Customer role in Redis
        await setTotalUserCountByRoleIdInRedis(role.id, userCountForRole);
      }

      // Create Customer user
      const savedUser = (await createUser({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        gender: gender || null,
        roles: [role], // expects an array of Role entities
        canUpdatePermissions: true,
        canUpdateRole: true,
        company: company,
      })) as User;

      // Generate account activation link
      const activationLink = `${CONFIG.FRONTEND_URL}/active-account/?userId=${savedUser.id}&email=${email}`;

      // Prepare email content for activation
      const subject = "Account Activation Request";
      const text = `Please use the following link to active your account: ${activationLink}`;
      const html = `<p>Please use the following link to active your account: <a href="${activationLink}">${activationLink}</a></p>`;

      // Attempt to send account activation email
      const emailSent = await SendEmail({
        to: email,
        subject,
        text,
        html,
      });

      // If email sending fails, delete the user and return error
      if (!emailSent) {
        await Promise.all([deleteUser(savedUser.id)]);

        return {
          statusCode: 500,
          success: false,
          message:
            "Registration failed. Failed to send account activation email.",
          __typename: "BaseResponse",
        };
      }

      // Cache user data, email, and update counts in Redis
      await Promise.all([
        setUserEmailInRedis(email, email),
        setUserInfoByUserIdInRedis(savedUser.id, savedUser),
        setUserInfoByEmailInRedis(email, savedUser),
        setUserCountInDBInRedis(userCount + 1),
        setTotalUserCountByRoleIdInRedis(role.id, userCountForRole + 1),
        clearAllUserSearchCache(),
        clearAllUserCountCache(),
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
      message: `${
        CONFIG.NODE_ENV === "production"
          ? "Something went wrong, please try again."
          : error.message || "Internal server error"
      }`,
      __typename: "BaseResponse",
    };
  }
};
