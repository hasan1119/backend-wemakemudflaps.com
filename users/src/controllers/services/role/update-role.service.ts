import { Role } from "../../../entities";
import { deleteDefaultPermissionOfRole } from "../permission/delete-permission.service";
import {
  rolePermissionRepository,
  roleRepository,
} from "../repositories/repositories";
import { getUserById } from "../user/get-user.service";
import type { PermissionName } from "./../../../utils/data-validation";

export interface UpdateRoleInfoInput {
  roleData: any;
  name?: string;
  description?: string;
  updatedByUserId: string;
  defaultPermissions?: Array<any>;
  systemDeleteProtection?: boolean;
  systemUpdateProtection?: boolean;
}

/**
 * Handles updating an existing role's properties and its associated permissions.
 *
 * Workflow:
 * 1. Extracts the role ID from the input role data.
 * 2. Builds a map of existing default permissions for the role.
 * 3. Merges or adds new permissions from the input, creating updated permission entities.
 * 4. Deletes existing role permissions to ensure a clean update.
 * 5. Updates role fields such as name (normalized to uppercase), description, and system protection flags.
 * 6. Assigns the updatedBy user by fetching their details.
 * 7. Saves the updated role entity with new permissions and relations.
 * 8. Retrieves and returns the updated role by its ID.
 *
 * @param input - Input object containing role data and optional fields to update (name, description, permissions, etc.).
 * @returns A promise resolving to the updated Role entity.
 */
export const updateRoleInfo = async ({
  roleData,
  name,
  description,
  updatedByUserId,
  defaultPermissions = [],
  systemDeleteProtection,
  systemUpdateProtection,
}: UpdateRoleInfoInput): Promise<Role> => {
  const roleId = roleData.id;

  // Create a map of existing permissions
  const existingMap = new Map(
    (roleData.defaultPermissions || []).map((perm) => [perm.name, perm])
  );

  // Process and merge incoming permissions
  for (const perm of defaultPermissions) {
    const updatedPerm = rolePermissionRepository.create({
      name: perm.name as PermissionName,
      description:
        perm.description ||
        `${perm.name} permission for ${name || roleData.name}`,
      canCreate: perm.canCreate,
      canRead: perm.canRead,
      canUpdate: perm.canUpdate,
      canDelete: perm.canDelete,
      role: roleData, // Use the relation property instead of roleId
    });
    existingMap.set(perm.name, updatedPerm);
  }

  const mergedPermissions = Array.from(existingMap.values());

  // Remove existing role permissions
  await deleteDefaultPermissionOfRole(roleId);

  // Update role properties
  roleData.name = name.toUpperCase() || roleData.name;
  roleData.description = description || roleData.description;
  roleData.defaultPermissions = mergedPermissions || [];
  roleData.systemDeleteProtection =
    systemDeleteProtection ?? roleData.systemDeleteProtection;
  roleData.systemUpdateProtection =
    systemUpdateProtection ?? roleData.systemUpdateProtection;
  roleData.createdBy = await getUserById(updatedByUserId);

  // Save updated role with relations
  return await roleRepository.save(roleData);
};
