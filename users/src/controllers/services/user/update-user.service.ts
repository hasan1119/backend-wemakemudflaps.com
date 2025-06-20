import { Not } from "typeorm";
import { Permission, User } from "../../../entities";
import { getUserEmailFromRedis } from "../../../helper/redis";
import HashInfo from "../../../utils/bcrypt/hash-info";
import { userRepository } from "../repositories/repositories";
import { getUserById } from "./get-user.service";

/**
 * Handles updating a user's permissions.
 *
 * Workflow:
 * 1. Upserts the user entity with the new permissions array using the userRepository.
 * 2. Uses the user ID as the unique key for the upsert operation.
 * 3. Retrieves and returns the updated User entity by ID.
 *
 * @param user - The User entity to update.
 * @param permissions - Array of Permission entities to assign.
 * @returns A promise resolving to the updated User entity.
 */
export const updateUserPermissions = async (
  user: User,
  permissions: Permission[]
): Promise<User> => {
  // Upsert user with new permissions
  await userRepository.upsert(
    {
      ...user,
      permissions,
    },
    ["id"]
  );

  // Retrieve and return updated user
  return await getUserById(user.id);
};

/**
 * Handles activation of a user's account and email verification.
 *
 * Workflow:
 * 1. Updates the user with the specified ID to set isAccountActivated and emailVerified to true.
 * 2. Retrieves and returns the updated User entity by ID.
 *
 * @param userId - The UUID of the user to activate.
 * @returns A promise resolving to the updated User entity.
 */
export const activateUserAccount = async (userId: string): Promise<User> => {
  // Update activation and verification status
  await userRepository.update(
    { id: userId },
    { isAccountActivated: true, emailVerified: true }
  );

  // Retrieve and return updated user
  await getUserById(userId);
};

/**
 * Handles updating a user's password.
 *
 * Workflow:
 * 1. Hashes the new password using HashInfo.
 * 2. Updates the user's password in the userRepository.
 * 3. Retrieves and returns the updated User entity by ID.
 *
 * @param userId - The UUID of the user.
 * @param newPassword - The new password to set.
 * @returns A promise resolving to the updated User entity.
 */
export const updateUserPassword = async ({
  userId,
  newPassword,
}: {
  userId: string;
  newPassword: string;
}): Promise<User> => {
  // Hash the new password
  const hashedPassword = await HashInfo(newPassword);

  // Update password in database
  await userRepository.update(userId, { password: hashedPassword });

  // Retrieve and return updated user
  return await getUserById(userId);
};

/**
 * Handles updating a user's reset password token and expiry.
 *
 * Workflow:
 * 1. Updates the user with the specified email to set the resetPasswordToken and resetPasswordTokenExpiry.
 * 2. Resolves the promise when the update is complete.
 *
 * @param email - The email of the user.
 * @param resetToken - The reset password token to set.
 * @param tokenExpiry - The expiry date for the token.
 * @returns A promise resolving to void when the update is complete.
 */
export const updateUserResetPasswordToken = async ({
  email,
  resetToken,
  tokenExpiry,
}: {
  email: string;
  resetToken: string;
  tokenExpiry: Date;
}): Promise<void> => {
  await userRepository.update(
    { email },
    {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: tokenExpiry,
    }
  );
};

/**
 * Handles clearing a user's reset password token and expiry.
 *
 * Workflow:
 * 1. Sets the user's resetPasswordToken and resetPasswordTokenExpiry to null.
 * 2. Saves the updated user entity using the userRepository.
 * 3. Returns the updated User entity.
 *
 * @param user - The User entity to update.
 * @returns A promise resolving to the updated User entity.
 */
export const clearResetToken = async (user: User): Promise<User> => {
  // Clear reset token fields
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiry = null;
  // Save and return updated user
  return await userRepository.save(user);
};

/**
 * Handles updating a user's password and clearing their reset token.
 *
 * Workflow:
 * 1. Hashes the new password using HashInfo.
 * 2. Updates the user's password and clears resetPasswordToken and resetPasswordTokenExpiry.
 * 3. Saves the updated user entity using the userRepository.
 * 4. Returns the updated User entity.
 *
 * @param user - The User entity to update.
 * @param newPassword - The new password to set (plain text).
 * @returns A promise resolving to the updated User entity.
 */
export const updateUserPasswordAndClearToken = async (
  user: User,
  newPassword: string
): Promise<User> => {
  // Hash the new password
  const hashedPassword = await HashInfo(newPassword);
  // Update password and clear reset token fields
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiry = null;
  // Save and return updated user
  return userRepository.save(user);
};

/**
 * Handles checking if an email is already in use by another user.
 *
 * Workflow:
 * 1. Checks Redis cache for the email to optimize performance.
 * 2. If not found in Redis, queries the userRepository for any non-deleted user (excluding the specified userId) with the email or tempUpdatedEmail.
 * 3. Returns true if the email is in use, false otherwise.
 *
 * @param email - The email address to check.
 * @param userId - The UUID of the user to exclude from the check.
 * @returns A promise resolving to a boolean indicating if the email is in use.
 */
export const isEmailInUse = async (
  email: string,
  userId: string
): Promise<boolean> => {
  // Check Redis cache for email
  if (await getUserEmailFromRedis(email)) {
    return true;
  }

  // Query database for email or temp email
  const existingUser = await userRepository.findOne({
    where: [
      { email, id: Not(userId), deletedAt: null },
      { tempUpdatedEmail: email, id: Not(userId), deletedAt: null },
    ],
  });

  return !!existingUser;
};

/**
 * Handles updating a user entity with provided fields.
 *
 * Workflow:
 * 1. Saves the updated user entity to the userRepository.
 * 2. Retrieves and returns the updated User entity by ID.
 *
 * @param user - The User entity to update.
 * @returns A promise resolving to the updated User entity.
 */
export const updateUser = async (user: User): Promise<User> => {
  // Save updated user
  await userRepository.save(user);

  // Retrieve and return updated user
  return await getUserById(user.id);
};
