import {
  getUserPermissionsByUserIdFromRedis,
  getUserRolesInfoFromRedis,
} from "../../../helper/redis";
import { RolePermissionSession, UserRoleObject } from "../../../types";
import { mapPermissions } from "../../../utils/mapper";

/**
 * Handles checking if a user has a specific permission for an entity.
 *
 * Workflow:
 * 1. Retrieves personalized permissions from Redis, falling back to the database if not cached.
 * 2. Checks personalized permissions for the specified entity and action (case-insensitive).
 * 3. Returns true if the action is allowed in personalized permissions, false if explicitly denied.
 * 4. If no personalized permissions apply, fetches role-based permissions from Redis for each user role.
 * 5. Maps and flattens role permissions into RolePermissionSession format.
 * 6. Merges permissions by name using OR logic to combine permissions across roles.
 * 7. Checks merged role permissions for the specified entity and action.
 * 8. Returns true if the action is allowed in role permissions, false otherwise.
 *
 * @param params.user - User session object containing `id` and `roles`.
 * @param params.entity - Name of the entity (e.g., "role", "user") to check permissions for.
 * @param params.action - Permission action to verify ("canCreate", "canRead", "canUpdate", "canDelete").
 * @returns A promise resolving to a boolean indicating whether the permission is granted.
 */
export async function checkUserPermission({
  action,
  entity,
  user,
}: {
  action: "canCreate" | "canRead" | "canUpdate" | "canDelete";
  entity: string;
  user: { id: string; roles: UserRoleObject[] };
}): Promise<boolean> {
  // Retrieve personalized permissions from Redis
  let personalizedPermissions = await getUserPermissionsByUserIdFromRedis(
    user.id
  );

  // Check personalized permissions for the entity (case-insensitive)
  const personalizedMatch = personalizedPermissions.find(
    (perm) => perm.name.toLowerCase() === entity.toLowerCase()
  );

  if (personalizedPermissions.length && personalizedMatch?.[action]) {
    return true;
  } else if (personalizedPermissions.length && !personalizedMatch?.[action]) {
    return false;
  }

  // Retrieve user permissions against role from Redis
  let userRolesInfo = await getUserRolesInfoFromRedis(user.id);

  // Map role permissions to RolePermissionSession format
  const permissionsArrays = await Promise.all(
    userRolesInfo.map((role) =>
      mapPermissions(role?.defaultPermissions as any[])
    )
  );

  // Flatten permissions arrays
  let flattened = permissionsArrays.flat();

  // Filter valid RolePermissionSession entries
  const rolePermissionsOnly: RolePermissionSession[] = flattened.filter(
    (perm): perm is RolePermissionSession =>
      typeof perm.id === "string" &&
      typeof perm.name === "string" &&
      ["canCreate", "canRead", "canUpdate", "canDelete"].some(
        (key) => key in perm
      )
  );

  // Merge permissions by name with OR logic
  const permissionMap = new Map<string, RolePermissionSession>();

  for (const perm of rolePermissionsOnly) {
    const existing = permissionMap.get(perm.name);

    if (!existing) {
      permissionMap.set(perm.name, { ...perm });
    } else {
      permissionMap.set(perm.name, {
        id: existing.id,
        name: perm.name,
        description: existing.description || perm.description,
        canCreate: existing.canCreate || perm.canCreate,
        canRead: existing.canRead || perm.canRead,
        canUpdate: existing.canUpdate || perm.canUpdate,
        canDelete: existing.canDelete || perm.canDelete,
      });
    }
  }

  const mergedPermissions = Array.from(permissionMap.values());

  // Check merged role permissions for the entity
  const roleMatch = mergedPermissions.find(
    (perm) => perm.name.toLowerCase() === entity.toLowerCase()
  );

  return !!roleMatch?.[action];
}
