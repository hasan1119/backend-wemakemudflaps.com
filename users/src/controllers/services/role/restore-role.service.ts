import { In } from "typeorm";
import { Role } from "../../../entities";
import { roleRepository } from "../repositories/repositories";

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
