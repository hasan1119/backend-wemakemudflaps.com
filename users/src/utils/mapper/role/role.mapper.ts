import { getUserById } from "../../../controllers/services";
import { Role } from "../../../entities";
import { RoleSession } from "../../../types";
import { mapPermissions } from "../permission/permission.mapper";

/**
 * Converts a Role entity into a simplified response format.
 *
 * Workflow:
 * 1. Retrieves the createdBy user details for the role.
 * 2. Maps the role’s default permissions using mapPermissions.
 * 3. Formats the role data, including creator details and timestamps, into a RoleSession object.
 * 4. Returns the formatted role object suitable for API responses or session data.
 *
 * @param role - The Role entity from the database.
 * @returns A promise resolving to a RoleSession object.
 */
export const mapRoleToResponse = async (role: Role): Promise<RoleSession> => {
  const createdBy = (await role.createdBy)
    ? await getUserById((await role.createdBy).id)
    : null;

  return {
    id: role.id,
    name: role.name.toUpperCase(),
    description: role?.description,
    defaultPermissions: (await mapPermissions(
      role.defaultPermissions
    )) as RoleSession["defaultPermissions"],
    systemDeleteProtection: role.systemDeleteProtection,
    systemUpdateProtection: role.systemUpdateProtection,
    createdBy: createdBy
      ? {
          id: createdBy.id,
          name: createdBy.firstName + " " + createdBy.lastName,
          roles: createdBy.roles.map((role) => ({
            id: role.id,
            name: role.name,
            defaultPermissions: role.defaultPermissions,
          })),
        }
      : null,
    createdAt:
      typeof role.createdAt === "string"
        ? role.createdAt
        : role.createdAt.toISOString(),
    deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
  };
};
