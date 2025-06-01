import {
  permissionRepository,
  rolePermissionRepository,
} from "./../repositories/repositories";

/**
 * Handles deletion of all permissions associated with a specific user role.
 *
 * Workflow:
 * 1. Deletes all role permissions linked to the specified role ID from the rolePermissionRepository.
 * 2. Resolves the promise once the deletion is complete.
 *
 * @param roleID - The ID of the role whose permissions should be deleted.
 * @returns A promise that resolves to void when the permissions are successfully deleted.
 */
export const deleteDefaultPermissionOfRole = async (
  roleID: string
): Promise<void> => {
  await rolePermissionRepository.delete({ role: { id: roleID } });
};

/**
 * Handles deletion of all permissions associated with a specific user.
 *
 * Workflow:
 * 1. Deletes all user-specific permissions linked to the specified user ID from the permissionRepository.
 * 2. Resolves the promise once the deletion is complete.
 *
 * @param userId - The ID of the user whose permissions should be deleted.
 * @returns A promise that resolves to void when the permissions are successfully deleted.
 */
export const deleteUserSpecificPermission = async (
  userId: string
): Promise<void> => {
  await permissionRepository.delete({ user: { id: userId } });
};
