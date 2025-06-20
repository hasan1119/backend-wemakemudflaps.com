import { ILike, In } from "typeorm";
import { Permission, User, UserLogin } from "../../../entities";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import { mapUserToResponseById } from "../../../utils/mapper";
import {
  loginRepository,
  permissionRepository,
  userRepository,
} from "../repositories/repositories";

/**
 * Handles retrieval of a user's email field by their email address.
 *
 * Workflow:
 * 1. Queries the userRepository to find a user with the specified email.
 * 2. Selects only the email field for efficiency.
 * 3. Returns the email field as an object or null if not found.
 *
 * @param email - The email address to search for.
 * @returns A promise resolving to an object with the user's email or null if not found.
 */
export const getUserEmailOnly = async (
  email: string
): Promise<Pick<User, "email"> | null> => {
  return await userRepository.findOne({
    where: { email },
    select: { email: true },
  });
};

/**
 * Handles retrieval of a user by their email address with full details.
 *
 * Workflow:
 * 1. Queries the userRepository to find a non-deleted user with the specified email.
 * 2. Includes relations for roles and permissions.
 * 3. Returns the User entity or null if not found.
 *
 * @param email - The email address to search for.
 * @returns A promise resolving to the User entity or null if not found.
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await userRepository.findOne({
    where: { email, deletedAt: null },
    relations: ["roles", "permissions"],
  });
};

/**
 * Handles retrieval of a user by their ID with full details.
 *
 * Workflow:
 * 1. Queries the userRepository to find a non-deleted user with the specified ID.
 * 2. Includes relations for roles and permissions.
 * 3. Returns the User entity or null if not found.
 *
 * @param id - The UUID of the user.
 * @returns A promise resolving to the User entity or null if not found.
 */
export const getUserById = async (id: string): Promise<User | null> => {
  return await userRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["roles", "permissions"],
  });
};

/**
 * Resolves the CreatedBy entity reference from another subgraph.
 *
 * This function is called by Apollo Federation when a subgraph returns a CreatedBy reference.
 * It fetches full user details (id, name, roles) for the provided ID.
 *
 * Workflow:
 * 1. Attempts to fetch user details from Redis cache for performance.
 * 2. If not present in Redis (cache miss), fetches the user from the database.
 * 3. Maps the database user to a response object and caches it for future use.
 * 4. Returns an object with the user's `id`, full `name`, and assigned `roles`.
 * 5. Returns `null` if the user doesn't exist.
 *
 * @param id - The ID of the user being resolved.
 * @returns An object containing id, name, and roles, or null if the user is not found.
 */
export const CreatedBy = {
  __resolveReference: async ({ id }) => {
    // Attempt to retrieve cached user data from Redis
    let userData;

    userData = await getUserInfoByUserIdFromRedis(id);

    if (!userData) {
      // On cache miss, fetch user from database
      const dbUser = await getUserById(id);

      if (!dbUser) return null;

      userData = await mapUserToResponseById(dbUser);

      // Cache user data in Redis id
      await setUserInfoByUserIdInRedis(id, userData);
    }

    return {
      id: userData.name,
      name: `${userData.firstName} ${userData.lastName}`,
      roles: userData.roles,
    };
  },
};

/**
 * Handles counting the total number of users.
 *
 * Workflow:
 * 1. Queries the userRepository to count all users.
 * 2. Returns the total count as a number.
 *
 * @returns A promise resolving to the total number of users.
 */
export const getUserCount = async (): Promise<number> => {
  return await userRepository.count();
};

/**
 * Handles retrieval of a user's permissions by their ID.
 *
 * Workflow:
 * 1. Queries the permissionRepository to find all permissions linked to the specified user ID.
 * 2. Returns an array of Permission entities.
 *
 * @param id - The UUID of the user.
 * @returns A promise resolving to an array of Permission entities.
 */
export const getUserPersonalizedPermission = async (
  id: string
): Promise<Permission[]> => {
  return await permissionRepository.find({
    where: { user: { id } },
  });
};

/**
 * Handles retrieval of a user by their reset password token.
 *
 * Workflow:
 * 1. Queries the userRepository to find a non-deleted user with the specified reset password token.
 * 2. Includes relations for roles and permissions.
 * 3. Returns the User entity or null if not found.
 *
 * @param token - The reset password token to search for.
 * @returns A promise resolving to the User entity or null if not found.
 */
export const getUserByPasswordResetToken = async (
  token: string
): Promise<User | null> => {
  return await userRepository.findOne({
    where: { resetPasswordToken: token, deletedAt: null },
    relations: ["roles", "permissions"],
  });
};

/**
 * Handles fetching paginated users with optional search and sorting.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted users and apply search conditions if provided.
 * 3. Sets sorting order for roles or other fields.
 * 4. Queries the userRepository to fetch users with pagination, sorting, and relations (roles, permissions).
 * 5. Selects specific fields for efficiency.
 * 6. Returns an object with the paginated users and total count.
 *
 * @param input - Input parameters including page, limit, search, sortBy, and sortOrder.
 * @returns A promise resolving to an object containing the paginated users and total count.
 */

interface GetPaginatedUsersInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

export const getPaginatedUsers = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedUsersInput): Promise<{ users: User[]; queryTotal: number }> => {
  // Calculate records to skip for pagination
  const skip = (page - 1) * limit;
  const where: any[] = [{ deletedAt: null }];

  // Add search conditions if provided
  if (search) {
    const searchTerm = `%${search.trim()}%`;
    where.push(
      { firstName: ILike(searchTerm), deletedAt: null },
      { lastName: ILike(searchTerm), deletedAt: null },
      { email: ILike(searchTerm), deletedAt: null },
      { roles: { name: ILike(searchTerm) }, deletedAt: null }
    );
  }

  // Configure sorting order
  const order: any = {};
  if (sortBy === "roles") {
    order["roles"] = { name: sortOrder.toUpperCase() };
  } else {
    order[sortBy] = sortOrder.toUpperCase();
  }

  // Fetch paginated users with relations
  const [users, queryTotal] = await userRepository.findAndCount({
    where,
    relations: ["roles", "permissions"],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      gender: true,
      roles: { name: true },
      isAccountActivated: true,
      permissions: {
        id: true,
        name: true,
        description: true,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
      },
      canUpdatePermissions: true,
      canUpdateRole: true,
      createdAt: true,
      deletedAt: true,
    },
    order,
    skip,
    take: limit,
  });

  return { users, queryTotal };
};

/**
 * Handles fetching user login information by user ID.
 *
 * Workflow:
 * 1. Queries the loginRepository to find a UserLogin entity linked to the specified user ID.
 * 2. Includes the user relation for the login entry.
 * 3. Returns the UserLogin entities or null if not found.
 *
 * @param userId - The UUID of the user to search for.
 * @returns A promise resolving to the UserLogin entities or null if not found.
 */
export const getUserLoginInfoByUserId = async (
  userId: string
): Promise<UserLogin[] | null> => {
  return await loginRepository.find({
    where: { user: { id: userId } },
    relations: ["user"],
  });
};

/**
 * Handles fetching user login information by user IDs.
 *
 * Workflow:
 * 1. Queries the loginRepository to find all UserLogin entities linked to the specified user IDs.
 * 2. Includes the user relation for each login entry.
 * 3. Returns an array of UserLogin entities.
 *
 * @param userIds - An array of user IDs to search for.
 * @returns A promise resolving to an array of UserLogin entities.
 */
export const getUsersLoginInfoByUserIds = async (
  userIds: string[]
): Promise<UserLogin[]> => {
  return await loginRepository.find({
    where: { user: { id: In(userIds) } },
    relations: ["user"],
  });
};
