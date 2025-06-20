import { In } from "typeorm";
import { loginRepository, userRepository } from "../repositories/repositories";

/**
 * Handles deletion of a user by their ID.
 *
 * Workflow:
 * 1. Deletes the user with the specified ID from the userRepository.
 * 2. Resolves the promise when the deletion is complete.
 *
 * @param id - The UUID of the user to delete.
 * @returns A promise resolving to void when the user is deleted.
 */
export const deleteUser = async (id: string): Promise<void> => {
  await userRepository.delete({ id });
};

/**
 * Handles deletion of a user login session by its ID.
 *
 * Workflow:
 * 1. Deletes the user login session with the specified ID from the loginRepository.
 * 2. Resolves the promise when the deletion is complete.
 *
 * @param sessionId - The session ID of the user login session to delete.
 * @returns A promise resolving to void when the user login session is deleted.
 */
export const deleteUserLoginInfoSessionById = async (
  sessionId: string
): Promise<void> => {
  await loginRepository.delete({ id: sessionId });
};

/**
 * Handles deletion of user login information by user ID.
 *
 * Workflow:
 * 1. Deletes the user login information associated with the specified user ID from the loginRepository.
 * 2. Resolves the promise when the deletion is complete.
 *
 * @param userId - The user ID of the user whose login information is to be deleted.
 * @returns A promise resolving to void when the user login information is deleted.
 */
export const deleteUserLoginInfoByUserId = async (
  userId: string
): Promise<void> => {
  await loginRepository.delete({
    user: { id: userId },
  });
};

/**
 * Handles deletion of user login information by multiple user IDs.
 *
 * Workflow:
 * 1. Deletes all login records from the loginRepository where the user ID matches any of the provided IDs.
 * 2. Uses TypeORM's In operator to perform bulk deletion efficiently.
 * 3. Useful when removing access for users after role changes, deactivation, or batch logout operations.
 *
 * @param userIds - An array of user IDs whose login records need to be removed.
 * @returns A promise resolving to void once all relevant records are deleted.
 */
export const deleteUserLoginInfoByUserIds = async (
  userIds: string[]
): Promise<void> => {
  await loginRepository.delete({
    user: { id: In(userIds) },
  });
};
