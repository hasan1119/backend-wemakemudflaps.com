import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import { BaseResponse, UserResponse } from "../../../types";

/**
 * Retrieves the authenticated user's profile data, including their role name.
 * - Checks Redis cache for user data before querying the database.
 * - Fetches the user by ID, including their role relation.
 * - Caches user and role data in Redis for future requests.
 * - Returns the user profile with role name or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param __ - Unused GraphQL argument
 * @param context - Application context containing AppDataSource, user, and redis
 * @returns Promise<UserResponse | BaseResponse> - User details with role name or error response
 */
export const getProfile = async (
  _: any,
  __: any,
  { AppDataSource, user, redis }: Context
): Promise<UserResponse | BaseResponse> => {
  const { getSession, setSession } = redis;

  try {
    if (!user || !user.id) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated.",
        __typename: "BaseResponse",
      };
    }

    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const userCacheKey = `user-${user.id}`;
    let userExist: any = null;

    // Check Redis for cached user data
    userExist = await getSession(userCacheKey);

    // Check the user exists or not
    if (!userExist) {
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["role"],
        select: ["id", "firstName", "lastName", "email", "gender", "role"],
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found.",
          __typename: "BaseResponse",
        };
      }

      const userData = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        role: dbUser.role?.name || null,
      };

      await setSession(userCacheKey, userData); // TTL : default 30 days of redis session because of the env

      userExist = userData;
    }

    // Validate role existence
    if (!userExist.role) {
      return {
        statusCode: 500,
        success: false,
        message: "User role is missing or invalid.",
        __typename: "BaseResponse",
      };
    }

    // Return the user profile with role name
    return {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully.",
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
