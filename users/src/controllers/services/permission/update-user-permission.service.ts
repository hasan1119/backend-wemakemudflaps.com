import { Permission, User } from "../../../entities";
import { permissionRepository } from "../repositories/repositories";
import { getUserById } from "../user/get-user.service";

/**
 * Handles updating or creating multiple user-specific permissions in the database.
 *
 * Workflow:
 * 1. Iterates through the provided permissions array.
 * 2. Inserts each permission as a new record in the permissionRepository, ensuring user relation is set.
 * 3. Sets permission attributes like name, description, and CRUD flags, with defaults for optional fields.
 * 4. Retrieves and returns the updated user by ID after permissions are processed.
 *
 * @param user - The User entity to associate with the permissions.
 * @param permissions - Array of Permission objects to create.
 * @returns A promise resolving to the updated User entity.
 */
export const updateUserSpecificPermission = async (
  user: User,
  permissions: Permission[]
): Promise<User> => {
  if (permissions.length > 0) {
    await Promise.all(
      permissions.map(async (permission) => {
        // Insert new permission with user relation
        await permissionRepository.insert({
          name: permission.name,
          description: permission.description ?? null,
          canCreate: permission.canCreate,
          canRead: permission.canRead,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
          user: user as any, // assign user relation by id
          createdBy: permission.createdBy ?? null,
          createdAt: permission.createdAt ?? new Date(),
          deletedAt: permission.deletedAt ?? null,
        });
      })
    );
  }

  // Retrieve and return the updated user
  return await getUserById(user.id);
};
