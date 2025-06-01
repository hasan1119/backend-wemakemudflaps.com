import { Permission, RolePermission } from "../../../entities";
import { PermissionSession, RolePermissionSession } from "../../../types";

/**
 * Transforms an array of permissions into a simplified response format.
 *
 * Workflow:
 * 1. Checks if the permissions array is empty or undefined and returns an empty array if so.
 * 2. Maps each permission to a RolePermissionSession or PermissionSession object with essential fields.
 * 3. Returns the array of formatted permissions.
 *
 * @param permissions - Array of Permission or RolePermission entities.
 * @returns A promise resolving to an array of RolePermissionSession or PermissionSession objects.
 */
export const mapPermissions = async (
  permissions: Permission[] | RolePermission[] | null | undefined
): Promise<RolePermissionSession[] | PermissionSession[]> => {
  if (!permissions || permissions.length === 0) return [];

  const formattedPermissions = permissions.map((permission) => {
    return {
      id: permission.id,
      name: permission.name as PermissionName,
      description: permission.description,
      canCreate: permission.canCreate,
      canRead: permission.canRead,
      canUpdate: permission.canUpdate,
      canDelete: permission.canDelete,
    };
  });

  return formattedPermissions;
};
