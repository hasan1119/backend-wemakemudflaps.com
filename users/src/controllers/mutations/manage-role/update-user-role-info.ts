import CONFIG from "../../../config/config";
import { Context } from "../../../context";
import {
  getRoleInfoByRoleIdFromRedis,
  getUserInfoByEmailFromRedis,
  removeUserInfoByEmailFromRedis,
  removeUserInfoByUserIdInRedis,
  removeUserTokenInfoByUserSessionIdFromRedis,
  setRoleInfoByRoleIdInRedis,
  setRoleInfoByRoleNameInRedis,
} from "../../../helper/redis";
import {
  BaseResponseOrError,
  MutationUpdateUserRoleInfoArgs,
} from "../../../types";
import CompareInfo from "../../../utils/bcrypt/compare-info";
import { userRoleInfoUpdateSchema } from "../../../utils/data-validation";
import {
  checkUserAuth,
  checkUserPermission,
  deleteUserLoginInfoByUserIds,
  getRoleById,
  getUsersLoginInfoByUserIds,
  updateRoleInfo,
} from "../../services";

/**
 * Handles updating an existing user role's information with validation and permission checks.
 *
 * Workflow:
 * 1. Verifies user authentication and retrieves user data from Redis.
 * 2. Checks user permission to update roles.
 * 3. Validates input (role ID, name, description, permissions, protection flags, password) using Zod schema.
 * 4. For non-Super Admin users, verifies provided password.
 * 5. Retrieves role data from Redis or database and ensures it exists and is not soft-deleted.
 * 6. Prevents updates to system-protected roles (e.g., SUPER ADMIN, CUSTOMER) or permanently protected roles.
 * 7. Validates changes to system protection flags based on user role.
 * 8. Updates role information in the database with audit details.
 * 9. Clears cache for users associated with the updated role to enforce re-login.
 * 10. Updates Redis cache with the modified role data.
 * 11. Returns a success response or error if validation, permission, or update fails.
 *
 * @param _ - Unused parent parameter for GraphQL resolver.
 * @param args - Input arguments containing role ID, name, description, permissions, protection flags, and optional password.
 * @param context - GraphQL context containing authenticated user information.
 * @returns A promise resolving to a BaseResponseOrError object containing status, message, and errors if applicable.
 */
export const updateUserRoleInfo = async (
  _: any,
  args: MutationUpdateUserRoleInfoArgs,
  { user }: Context
): Promise<BaseResponseOrError> => {
  try {
    // Verify user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByEmailFromRedis(user.email);

    // Check if user has permission to update roles
    const canUpdate = await checkUserPermission({
      action: "canUpdate",
      entity: "role",
      user,
    });

    if (!canUpdate) {
      return {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update any user role info",
        __typename: "BaseResponse",
      };
    }

    // Validate input data with Zod schema
    const validationResult = await userRoleInfoUpdateSchema.safeParseAsync(
      args
    );

    // Return detailed validation errors if input is invalid
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join("."), // Join path array to string for field identification
        message: e.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: "Validation failed",
        errors,
        __typename: "ErrorResponse",
      };
    }

    const {
      id,
      name,
      description,
      defaultPermissions,
      systemDeleteProtection,
      systemUpdateProtection,
      systemPermanentDeleteProtection,
      systemPermanentUpdateProtection,
      password,
    } = validationResult.data;

    const isNotSuperAdmin = !user.roles.includes("SUPER ADMIN");

    // Validate password for non-Super Admin users
    if (isNotSuperAdmin) {
      if (!password) {
        return {
          statusCode: 400,
          success: false,
          message: "Password is required for non-SUPER ADMIN users",
          __typename: "BaseResponse",
        };
      }

      // Verify provided password
      const isPasswordValid = await CompareInfo(password, userData.password);
      if (!isPasswordValid) {
        return {
          statusCode: 403,
          success: false,
          message: "Invalid password",
          __typename: "BaseResponse",
        };
      }
    }

    // Attempt to retrieve cached role data from Redis
    let roleData;

    roleData = await getRoleInfoByRoleIdFromRedis(id);

    if (!roleData) {
      // On cache miss, fetch role data from database
      roleData = await getRoleById(id);

      if (!roleData) {
        return {
          statusCode: 404,
          success: false,
          message: `Role with ID ${id} not found`,
          __typename: "BaseResponse",
        };
      }

      // Cache role data in Redis
      await setRoleInfoByRoleIdInRedis(roleData.id, roleData);
    }

    // Prevent updates to permanently protected roles
    if (roleData.systemPermanentUpdateProtection) {
      return {
        statusCode: 403,
        success: false,
        message: `The role "${roleData.name}" is permanently protected and cannot be updated.`,
        __typename: "BaseResponse",
      };
    }

    // Prevent removal of permanent update protection
    if (
      roleData.systemPermanentUpdateProtection !==
        systemPermanentUpdateProtection &&
      roleData.systemPermanentUpdateProtection
    ) {
      return {
        statusCode: 403,
        success: false,
        message: `You cannot remove 'systemPermanentUpdateProtection' for the role: ${roleData.name}.`,
        __typename: "BaseResponse",
      };
    }

    // Prevent removal of permanent delete protection
    if (
      roleData.systemPermanentDeleteProtection !==
        systemPermanentDeleteProtection &&
      roleData.systemPermanentDeleteProtection
    ) {
      return {
        statusCode: 403,
        success: false,
        message: `You cannot remove 'systemPermanentDeleteProtection' for the role: ${roleData.name}.`,
        __typename: "BaseResponse",
      };
    }

    // Restrict system protection flag changes for non-Super Admin users
    if (
      isNotSuperAdmin &&
      (roleData.systemUpdateProtection !== systemUpdateProtection ||
        roleData.systemDeleteProtection !== systemDeleteProtection)
    ) {
      return {
        statusCode: 403,
        success: false,
        message: `You cannot modify system protection flags for the role: ${roleData.name}. Only a Super Admin can change them.`,
        __typename: "BaseResponse",
      };
    }

    // Prevent updates to soft-deleted roles
    if (roleData.deletedAt) {
      return {
        statusCode: 400,
        success: false,
        message: `Role with ID ${id} is in the trash and cannot be updated`,
        __typename: "BaseResponse",
      };
    }

    delete roleData.users;
    delete roleData.createdBy;

    // Update role information in the database
    const updatedRole = await updateRoleInfo({
      roleData,
      name,
      description,
      defaultPermissions,
      updatedByUserId: userData.id,
      systemDeleteProtection,
      systemUpdateProtection,
      systemPermanentDeleteProtection,
      systemPermanentUpdateProtection,
    });

    // Retrieve all users associated with the updated role
    const allUsersAssociateWithUpdateRole = await getRoleById(updatedRole.id);

    const associateUserIds = allUsersAssociateWithUpdateRole.users.map(
      (user) => user.id
    );

    const usersLoginInfo = await getUsersLoginInfoByUserIds(associateUserIds);

    // Delete the users login info from database
    await deleteUserLoginInfoByUserIds(associateUserIds);

    // Clear cache for all users associated with the updated role
    await Promise.all(
      allUsersAssociateWithUpdateRole.users.map(async (user) => {
        return Promise.all([
          removeUserInfoByEmailFromRedis(user.email),
          removeUserInfoByUserIdInRedis(user.id),
          ...usersLoginInfo.map((login) =>
            removeUserTokenInfoByUserSessionIdFromRedis(login.session)
          ),
        ]);
      })
    );

    // Cache updated role data in Redis
    await Promise.all([
      setRoleInfoByRoleNameInRedis(updatedRole.id, updatedRole),
      setRoleInfoByRoleIdInRedis(updatedRole.id, updatedRole),
    ]);

    return {
      statusCode: 200,
      success: true,
      message:
        "User role updated successfully. To see the changes associated user must have to login again.",
      __typename: "BaseResponse",
    };
  } catch (error: any) {
    console.error("Error updating user role info:", error);

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
