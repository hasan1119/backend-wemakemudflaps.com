import { Brackets, ILike, In, Not } from "typeorm";
import { Role } from "../../../entities";
import { roleRepository, userRepository } from "../repositories/repositories";

/**
 * Handles counting the number of users assigned to a specific role.
 *
 * Workflow:
 * 1. Queries the userRepository to count users with the specified role ID.
 * 2. Filters for non-deleted users and roles.
 * 3. Returns the total count of matching users.
 *
 * @param roleId - The UUID of the role.
 * @returns A promise resolving to the number of users with the specified role.
 */
export const countUsersWithRole = async (roleId: string): Promise<number> => {
  return await userRepository.count({
    where: {
      roles: { id: roleId, deletedAt: null },
      deletedAt: null,
    },
  });
};

/**
 * Handles retrieval of a role by its name.
 *
 * Workflow:
 * 1. Queries the roleRepository to find a role with the specified name (case-insensitive).
 * 2. Includes relations for defaultPermissions, createdBy, and createdBy.roles.
 * 3. Returns the Role entity or null if not found.
 *
 * @param roleName - The name of the role (e.g., "SUPER ADMIN").
 * @returns A promise resolving to the Role entity or null if not found.
 */
export const findRoleByName = async (
  roleName: string
): Promise<Role | null> => {
  return await roleRepository.findOne({
    where: { name: ILike(roleName) },
    relations: ["defaultPermissions", "createdBy", "createdBy.roles"],
  });
};

/**
 * Handles retrieval of a role by its name to update role info.
 *
 * Workflow:
 * 1. Queries the roleRepository to find a role with the specified name (case-insensitive).
 * 2. Includes relations for defaultPermissions, createdBy, and createdBy.roles.
 * 3. Returns the Role entity or null if not found.
 *
 * @param roleId - The UUID of the role.
 * @param roleName - The name of the role (e.g., "SUPER ADMIN").
 * @returns A promise resolving to the Role entity or null if not found.
 */
export const findRoleByNameToUpdate = async (
  roleId: string,
  roleName: string
): Promise<Role | null> => {
  return await roleRepository.findOne({
    where: { id: Not(roleId), name: ILike(roleName) },
    relations: ["defaultPermissions", "createdBy", "createdBy.roles"],
  });
};

/**
 * Handles retrieval of multiple roles by their names.
 *
 * Workflow:
 * 1. Queries the roleRepository to find roles matching the provided names (case-insensitive).
 * 2. Includes relations for defaultPermissions, createdBy, and createdBy.roles.
 * 3. Returns an array of Role entities.
 *
 * @param roleNames - Array of role names (e.g., ["SUPER ADMIN", "CUSTOMER"]).
 * @returns A promise resolving to an array of Role entities.
 */
export const findRolesByNames = async (
  roleNames: string[]
): Promise<Role[]> => {
  return await roleRepository.find({
    where: roleNames.map((name) => ({ name: ILike(name) })),
    relations: ["defaultPermissions", "createdBy", "createdBy.roles"],
  });
};

/**
 * Handles retrieval of a role by its ID with related entities.
 *
 * Workflow:
 * 1. Queries the roleRepository to find a role with the specified ID.
 * 2. Includes relations for defaultPermissions, createdBy, createdBy.roles, and users.
 * 3. Returns the Role entity or null if not found.
 *
 * @param roleId - The UUID of the role.
 * @returns A promise resolving to the Role entity or null if not found.
 */
export const getRoleById = async (roleId: string): Promise<Role | null> => {
  return roleRepository.findOne({
    where: { id: roleId },
    relations: ["defaultPermissions", "createdBy", "createdBy.roles", "users"],
  });
};

/**
 * Handles retrieval of multiple roles by their IDs with related entities.
 *
 * Workflow:
 * 1. Queries the roleRepository to find roles with the specified IDs.
 * 2. Includes relations for defaultPermissions, createdBy, createdBy.roles, and users.
 * 3. Returns an array of Role entities.
 *
 * @param ids - Array of role UUIDs.
 * @returns A promise resolving to an array of Role entities.
 */
export const getRolesByIds = async (ids: string[]): Promise<Role[]> => {
  return roleRepository.find({
    where: { id: In(ids) },
    relations: ["defaultPermissions", "createdBy", "createdBy.roles", "users"],
  });
};

interface GetPaginatedRolesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

/**
 * Handles pagination of roles based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a query to filter non-deleted roles and apply search conditions if provided.
 * 3. Queries the roleRepository to fetch roles with pagination, sorting, and filtering.
 * 4. Includes relations for defaultPermissions, createdBy, and createdBy.roles.
 * 5. Returns an object with the list of roles and the total count of matching roles.
 *
 * @param page - The current page number (1-based index).
 * @param limit - The number of roles to retrieve per page.
 * @param search - Optional search query to filter roles by name or description (case-insensitive).
 * @param sortBy - The field to sort roles by (e.g., "name", "createdAt").
 * @param sortOrder - The sort direction ("asc" or "desc").
 * @returns A promise resolving to an object containing the paginated roles and total count.
 */
export const paginateRoles = async ({
  page,
  limit,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetPaginatedRolesInput) => {
  const skip = (page - 1) * limit;

  // Create query builder for roles
  const query = roleRepository
    .createQueryBuilder("role")
    .leftJoinAndSelect("role.defaultPermissions", "defaultPermissions")
    .leftJoinAndSelect("role.createdBy", "createdBy")
    .leftJoinAndSelect("createdBy.roles", "creatorRoles")
    .where("role.deletedAt IS NULL"); // Only non-deleted roles

  // Apply search filter if provided
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;
    query.andWhere(
      new Brackets((qb) => {
        qb.where("role.name ILIKE :searchTerm", { searchTerm }).orWhere(
          "role.description ILIKE :searchTerm",
          { searchTerm }
        );
      })
    );
  }

  // Apply sorting
  query.orderBy(`role.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  // Apply pagination
  query.skip(skip).take(limit);

  const [roles, total] = await query.getManyAndCount();

  return { roles, total };
};

/**
 * Handles counting roles matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a query to filter non-deleted roles and apply search conditions if provided.
 * 2. Queries the roleRepository to count roles matching the criteria.
 * 3. Returns the total number of matching roles.
 *
 * @param search - Optional search term to filter by name or description (case-insensitive).
 * @returns A promise resolving to the total number of matching roles.
 */
export const countRolesWithSearch = async (
  search?: string
): Promise<number> => {
  const query = roleRepository
    .createQueryBuilder("role")
    .where("role.deletedAt IS NULL");

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;
    query.andWhere(
      new Brackets((qb) => {
        qb.where("role.name ILIKE :searchTerm", { searchTerm }).orWhere(
          "role.description ILIKE :searchTerm",
          { searchTerm }
        );
      })
    );
  }

  return await query.getCount();
};
