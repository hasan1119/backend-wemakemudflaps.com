import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import {
  getUserInfoByUserIdFromRedis,
  setUserInfoByUserIdInRedis,
} from "../../../helper/redis";
import { GetProfileResponseOrError } from "../../../types";

/**
 * Retrieves the authenticated user's profile data, including their role name.
 * - Checks Redis cache for user data before querying the database.
 * - Fetches the user by ID, including their role relation.
 * - Caches user and role data in Redis for future requests.
 * - Returns the user profile with role name or an error response.
 *
 * @param _ - Unused GraphQL parent argument
 * @param __ - Unused GraphQL argument
 * @param context - Application context containing AppDataSource and user
 * @returns Promise<GetProfileResponseOrError> - User details with role name or error response
 */
export const getProfile = async (
  _: any,
  __: any,
  { AppDataSource, user }: Context
): Promise<GetProfileResponseOrError> => {
  try {
    if (!user || !user.id) {
      return {
        statusCode: 401,
        success: false,
        message: "You're not authenticated",
        __typename: "BaseResponse",
      };
    }

    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    let userExist: any = null;

    // Check Redis for cached user data
    userExist = await getUserInfoByUserIdFromRedis(user.id);

    // Check the user exists or not
    if (!userExist) {
      const dbUser = await userRepository.findOne({
        where: { id: user.id },
        relations: ["role"],
      });

      if (!dbUser) {
        return {
          statusCode: 404,
          success: false,
          message: "User not found",
          __typename: "BaseResponse",
        };
      }

      const userData = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        gender: dbUser.gender,
        role: dbUser.role?.name || null,
        isAccountActivated: dbUser.isAccountActivated,
        emailVerified: dbUser.emailVerified,
      };

      // Cache user in Redis
      await setUserInfoByUserIdInRedis(dbUser.id, userData);

      userExist = userData;
    }

    // Return the user profile with role name
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
