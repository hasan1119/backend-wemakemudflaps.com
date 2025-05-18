import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import { GetProfileResponseOrError, UserSession } from "../../../types";
import { checkUserAuth } from "../../../utils/session-check/session-check";

/**
 * Retrieves the authenticated user's profile data, including their role name.
 * - Checks Redis cache for user data before querying the database.
 * - Fetches the user by ID, including their role relation.
 * - Caches user and role data in Redis for future requests.
 * - Returns the user profile with role name or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param __ - Unused GraphQL argument
 * @param context - GraphQL context with AppDataSource and user info
 * @returns Promise<GetProfileResponseOrError> - User details with role name or error response
 */
export const getProfile = async (
  _: any,
  __: any,
  { AppDataSource, user }: Context
): Promise<GetProfileResponseOrError> => {
  try {
    // Check user authentication
    const authResponse = checkUserAuth(user);
    if (authResponse) return authResponse;

    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Check Redis for cached user data
    let userExist;

    userExist = await getUserInfoByUserIdFromRedis(user.id);

    // Check the user exists or not
    if (!userExist) {
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["role"],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          role: {
            name: true,
          },
          emailVerified: true,
          isAccountActivated: true,
        },
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "BaseResponse",
        };
      }

      const userData: UserSession = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        gender: dbUser.gender,
        role: dbUser.role.name,
        emailVerified: dbUser.emailVerified,
        isAccountActivated: dbUser.isAccountActivated,
      };

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(dbUser.id, userData);

      userExist = userData;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      user: userExist,
      __typename: "UserResponse",
    };
  } catch (error: any) {
    console.error("Error to get profile:", error);

    return {
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      __typename: "BaseResponse",
    };
  }
};
