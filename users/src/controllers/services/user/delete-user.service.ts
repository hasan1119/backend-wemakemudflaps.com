import { userRepository } from "../repositories/repositories";

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
