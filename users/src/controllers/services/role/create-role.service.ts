import { Role } from "../../../entities";
import { roleRepository } from "../repositories/repositories";

/**
 * Handles creation and saving of a new role in the database.
 *
 * Workflow:
 * 1. Creates a new role entity using the provided data, normalizing the role name to uppercase.
 * 2. Sets optional fields like description, createdBy, and permissions with defaults if not provided.
 * 3. Applies system protection flags with defaults to false if not specified.
 * 4. Saves the role to the database using the roleRepository.
 * 5. Retrieves and returns the newly created role by its ID.
 *
 * @param data - Partial Role data for creating the new role.
 * @param userId - Optional user ID of the creator.
 * @returns A promise resolving to the newly created Role entity.
 */
export const createRole = async (
  data: Partial<Role>,
  userId?: string
): Promise<Role> => {
  // Create new role entity with provided data
  const role = roleRepository.create({
    name: data.name?.toUpperCase(),
    description: data.description ?? null,
    createdBy: userId ? ({ id: userId } as any) : null,
    defaultPermissions: data.defaultPermissions ?? [],
    systemDeleteProtection: data.systemDeleteProtection ?? false,
    systemUpdateProtection: data.systemUpdateProtection ?? false,
    systemPermanentDeleteProtection:
      data.systemPermanentDeleteProtection ?? false,
    systemPermanentUpdateProtection:
      data.systemPermanentUpdateProtection ?? false,
  });

  // Save role to database
  return await roleRepository.save(role);
};
