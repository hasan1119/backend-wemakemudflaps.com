import { Role, User, UserLogin } from "../../../entities";
import { loginRepository, userRepository } from "../repositories/repositories";

/**
 * Handles creation and saving of a new user in the database.
 *
 * Workflow:
 * 1. Creates a new user entity with the provided data, including firstName, lastName, email, password, and optional fields.
 * 2. Assigns roles, permissions, and other attributes with defaults if not provided.
 * 3. Saves the user entity to the database using the userRepository.
 * 4. Returns the newly created User entity.
 *
 * @param data - User creation data including required and optional fields.
 * @returns A promise resolving to the newly created User entity.
 */
export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  gender?: string | null;
  roles: Role[];
  canUpdatePermissions?: boolean;
  permissions?: User["permissions"];
  canUpdateRole?: boolean;
}): Promise<User> => {
  // Create new user entity
  const newUser = userRepository.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    username: data.username,
    password: data.password,
    gender: data.gender ?? null,
    roles: data.roles,
    canUpdatePermissions: data.canUpdatePermissions ?? false,
    permissions: data.permissions ?? null,
    canUpdateRole: data.canUpdateRole ?? false,
  });

  // Save and return the user
  return await userRepository.save(newUser);
};

/**
 * Handles creation and saving of a new user login info in the database.
 *
 * Workflow:
 * 1. Creates a new UserLogin entity with the provided data.
 * 2. Saves the UserLogin entity to the database using the loginRepository.
 * 3. Returns the newly created UserLogin entity.
 *
 * @param data - User login data including required fields.
 * @returns A promise resolving to the newly created UserLogin entity.
 */
export const createUserLoginInfo = async (
  data: UserLogin
): Promise<UserLogin> => {
  // Create new user login entity
  const newUserLogin = loginRepository.create(data);

  // Save and return the user login info
  return await loginRepository.save(newUserLogin);
};
