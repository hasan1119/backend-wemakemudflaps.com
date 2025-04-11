import { Repository } from "typeorm";
import { Context } from "../../../context";
import { User } from "../../../entities/user.entity";
import { BaseResponse, UserResponse } from "../../../types";

/**
 * Retrieves own profile data.
 * - Fetches the user from the database.
 * - Returns appropriate response based on whether user is found.
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Unused GraphQL argument
 * @param context - Application context containing AppDataSource
 * @returns Promise<UserResponse | BaseResponse> - User details or error response
 */
export const getProfile = async (
  _: any,
  __: any,
  context: Context
): Promise<UserResponse | BaseResponse> => {
  const { AppDataSource, user } = context;

  try {
    // Get the User repository
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Attempt to find the user by ID and email
    const userExist = await userRepository.findOne({
      where: { email: user.email },
      relations: ["role"],
    });

    // If user not found, return a 404 response
    if (!userExist) {
      return {
        statusCode: 404,
        success: false,
        message: "User not found.",
        __typename: "BaseResponse",
      };
    }

    // Return the found user
    return {
      statusCode: 200,
      success: true,
      message: "User fetched successfully.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
      },
      __typename: "UserResponse",
    };
  } catch (error: Error | any) {
    console.error("Error fetching user by ID:", error);

    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch user.",
      __typename: "BaseResponse",
    };
  }
};
