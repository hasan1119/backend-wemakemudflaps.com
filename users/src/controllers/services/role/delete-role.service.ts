import { In } from "typeorm";
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

/**
 * Handles restoration of multiple soft-deleted roles by clearing their deletedAt timestamps.
 *
 * Workflow:
 * 1. Checks if the provided array of role IDs is non-empty.
 * 2. Updates the specified roles to clear their deletedAt timestamps.
 * 3. Retrieves the restored roles with their relations (defaultPermissions, createdBy, createdBy.roles, users).
 * 4. Returns the array of restored Role entities.
 *
 * @param ids - Array of role UUIDs to restore.
 * @returns A promise resolving to an array of restored Role entities.
 */
export const restoreRole = async (ids: string[]): Promise<Role[]> => {
  if (!ids.length) return [];

  // Clear deletedAt timestamps for specified roles
  await roleRepository.update({ id: In(ids) }, { deletedAt: null });

  // Retrieve restored roles with relations
  const restoredRoles = await roleRepository.find({
    where: { id: In(ids) },
    relations: ["defaultPermissions", "createdBy", "createdBy.roles", "users"],
  });

  return restoredRoles;
};
