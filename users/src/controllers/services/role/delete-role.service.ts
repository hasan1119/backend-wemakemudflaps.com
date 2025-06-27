import { Role } from "../../../entities";
import {
  rolePermissionRepository,
  roleRepository,
} from "../repositories/repositories";
import { getRoleById } from "./get-role.service";

/**
 * Handles soft deletion of a role by setting its deletedAt timestamp.
 *
 * Workflow:
 * 1. Updates the role with the specified ID to set its deletedAt timestamp to the current date.
 * 2. Retrieves and returns the soft-deleted role using its ID.
 *
 * @param roleId - The UUID of the role to soft delete.
 * @returns A promise resolving to the soft-deleted Role entity.
 */
export const softDeleteRole = async (roleId: string): Promise<Role> => {
  // Set deletedAt timestamp for the role
  await roleRepository.update({ id: roleId }, { deletedAt: new Date() });
  // Retrieve and return the soft-deleted role
  const softDeletedRole = await getRoleById(roleId);
  return softDeletedRole;
};

/**
 * Handles permanent deletion of a role and its associated permissions.
 *
 * Workflow:
 * 1. Deletes all role permissions linked to the specified role ID from the rolePermissionRepository.
 * 2. Permanently deletes the role from the roleRepository.
 *
 * @param roleId - The UUID of the role to permanently delete.
 * @returns A promise that resolves to void when the role and its permissions are deleted.
 */
export const hardDeleteRole = async (roleId: string): Promise<void> => {
  // Delete associated role permissions
  await rolePermissionRepository.delete({ role: { id: roleId } });
  // Permanently delete the role
  await roleRepository.delete({ id: roleId });
};
