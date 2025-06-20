import { User } from "../../../entities";
import {
  PermissionSession,
  UserSession,
  UserSessionByEmail,
  UserSessionById,
} from "../../../types";
import { mapPermissions } from "../permission/permission.mapper";

/**
 * Transforms a User entity into a detailed response format when fetched by email.
 *
 * Workflow:
 * 1. Maps the user’s permissions using mapPermissions.
 * 2. Formats the user data, including sensitive fields like password, into a UserSessionByEmail object.
 * 3. Returns the formatted object suitable for internal or admin operations requiring full user details.
 *
 * @param user - The User entity from the database.
 * @returns A promise resolving to a UserSessionByEmail object.
 */
export const mapUserToResponseByEmail = async (
  user: User
): Promise<UserSessionByEmail> => {
  return {
    id: user.id,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    gender: user.gender,
    roles: user.roles.map((role) => role.name.toUpperCase()),
    permissions: (await mapPermissions(
      user.permissions
    )) as PermissionSession[],
    canUpdatePermissions: user.canUpdatePermissions,
    canUpdateRole: user.canUpdateRole,
    password: user.password, // included intentionally for secure internal usage only
    isAccountActivated: user.isAccountActivated,
    tempUpdatedEmail: user.tempUpdatedEmail,
    tempEmailVerified: user.tempEmailVerified,
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : user.createdAt.toISOString(),
    deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
  };
};

/**
 * Transforms a User entity into a detailed response format when fetched by ID.
 *
 * Workflow:
 * 1. Maps the user’s permissions using mapPermissions.
 * 2. Formats the user data, excluding sensitive fields like password, into a UserSessionById object.
 * 3. Returns the formatted object suitable for API responses or admin dashboards.
 *
 * @param user - The User entity from the database.
 * @returns A promise resolving to a UserSessionById object.
 */
export const mapUserToResponseById = async (
  user: User
): Promise<UserSessionById> => {
  return {
    id: user.id,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    gender: user.gender,
    roles: user.roles.map((role) => role.name.toUpperCase()),
    permissions: (await mapPermissions(
      user.permissions
    )) as PermissionSession[],
    canUpdatePermissions: user.canUpdatePermissions,
    canUpdateRole: user.canUpdateRole,
    isAccountActivated: user.isAccountActivated,
    tempUpdatedEmail: user.tempUpdatedEmail,
    tempEmailVerified: user.tempEmailVerified,
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : user.createdAt.toISOString(),
    deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
  };
};

/**
 * Transforms a UserSession into a minimal, session-safe format.
 *
 * Workflow:
 * 1. Formats the user session data into a minimal UserSession object, excluding sensitive fields.
 * 2. Returns the formatted object suitable for JWT payloads or session storage.
 *
 * @param user - The UserSession object.
 * @returns A promise resolving to a minimal UserSession object.
 */
export const mapUserToTokenData = async (
  user: UserSession
): Promise<UserSession> => {
  return {
    id: user.id,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    gender: user.gender,
    roles: user.roles.map((role) => role.toUpperCase()),
    isAccountActivated: user.isAccountActivated,
    sessionId: user.sessionId,
  };
};
