// import { Repository } from "typeorm";
// import { Context } from "../../../context";
// import {
//   Permission,
//   PermissionName,
// } from "../../../entities/permission.entity";
// import { User } from "../../../entities/user.entity";
// import {
//   getSingleUserCacheKey,
//   getSingleUserPermissionCacheKey,
// } from "../../../helper/redis/session-keys";
// import {
//   BaseResponseOrError,
//   MutationUpdateUserPermissionArgs,
// } from "../../../types";
// import { updateUserPermissionSchema } from "../../../utils/data-validation";

// /**
//  * Helper to check if a user is allowed to modify a target user
//  */
// const isForbiddenTarget = (
//   targetUser: { id: string; role: string },
//   currentUser: { id: string; role: string }
// ): string | null => {
//   if (targetUser.role === "SUPER ADMIN") {
//     return "You cannot change permission for super admin";
//   }
//   if (targetUser.id === currentUser.id) {
//     return "You cannot change your own permission";
//   }
//   if (targetUser.role === "ADMIN" && currentUser.role === "ADMIN") {
//     return "Admins are not allowed to change other admins permissions";
//   }
//   return null;
// };

// /**
//  * Defines allowed permissions for each role
//  */
// const ROLE_PERMISSIONS: {
//   [key: string]: {
//     read: PermissionName[];
//     create: PermissionName[];
//     update: PermissionName[];
//     delete: PermissionName[];
//   };
// } = {
//   CUSTOMER: {
//     read: [
//       "Brand",
//       "Category",
//       "Product",
//       "Product Review",
//       "Shipping Class",
//       "Sub Category",
//       "Tax Class",
//       "Tax Status",
//       "FAQ",
//       "Pop Up Banner",
//       "Privacy & Policy",
//       "Terms & Conditions",
//       "Order",
//       "Notification",
//     ],
//     create: ["Order", "Notification"],
//     update: ["Product Review", "Notification"],
//     delete: ["Order", "Product Review", "Notification"],
//   },
//   "INVENTORY MANAGER": {
//     read: [
//       "Brand",
//       "Category",
//       "Product",
//       "Product Review",
//       "Shipping Class",
//       "Sub Category",
//       "Tax Class",
//       "Tax Status",
//     ],
//     create: [
//       "Brand",
//       "Category",
//       "Sub Category",
//       "Product",
//       "Tax Class",
//       "Tax Status",
//     ],
//     update: [
//       "Brand",
//       "Category",
//       "Sub Category",
//       "Product",
//       "Tax Class",
//       "Tax Status",
//     ],
//     delete: [
//       "Brand",
//       "Category",
//       "Sub Category",
//       "Product",
//       "Tax Class",
//       "Tax Status",
//     ],
//   },
//   ADMIN: {
//     read: [
//       "Brand",
//       "Category",
//       "Product",
//       "Product Review",
//       "Shipping Class",
//       "Sub Category",
//       "Tax Class",
//       "Tax Status",
//       "FAQ",
//       "Pop Up Banner",
//       "Privacy & Policy",
//       "Terms & Conditions",
//       "Order",
//       "Notification",
//       "User",
//       "Permission",
//       "Role",
//     ],
//     create: [
//       "Brand",
//       "Category",
//       "Sub Category",
//       "Product",
//       "Tax Class",
//       "Tax Status",
//       "FAQ",
//       "Pop Up Banner",
//       "Privacy & Policy",
//       "Terms & Conditions",
//       "Order",
//       "Notification",
//       "User",
//       "Permission",
//       "Role",
//     ],
//     update: [
//       "Brand",
//       "Category",
//       "Sub Category",
//       "Product",
//       "Tax Class",
//       "Tax Status",
//       "FAQ",
//       "Pop Up Banner",
//       "Privacy & Policy",
//       "Terms & Conditions",
//       "Order",
//       "Notification",
//       "User",
//       "Permission",
//       "Role",
//     ],
//     delete: [
//       "Brand",
//       "Category",
//       "Sub Category",
//       "Product",
//       "Tax Class",
//       "Tax Status",
//       "FAQ",
//       "Pop Up Banner",
//       "Privacy & Policy",
//       "Terms & Conditions",
//       "Order",
//       "Notification",
//       "User",
//       "Permission",
//       "Role",
//     ],
//   },
// };

// /**
//  * Validates permissions for a given role
//  * @param role - The role of the target user (e.g., CUSTOMER, INVENTORY MANAGER, ADMIN)
//  * @param permissions - The permissions to validate
//  * @returns An object with invalid permissions and an error message, or null if valid
//  */
// const validatePermissionsForRole = (
//   role: string,
//   permissions: MutationUpdateUserPermissionArgs["input"]["permissions"]
// ): { invalidPermissions: any[]; message: string } | null => {
//   const allowedPermissions = ROLE_PERMISSIONS[role];
//   if (!allowedPermissions) {
//     return null; // No specific restrictions for this role
//   }

//   const invalidPermissions = permissions.filter((perm) => {
//     return (
//       (perm.canRead &&
//         !allowedPermissions.read.includes(perm.name as PermissionName)) ||
//       (perm.canCreate &&
//         !allowedPermissions.create.includes(perm.name as PermissionName)) ||
//       (perm.canUpdate &&
//         !allowedPermissions.update.includes(perm.name as PermissionName)) ||
//       (perm.canDelete &&
//         !allowedPermissions.delete.includes(perm.name as PermissionName))
//     );
//   });

//   if (invalidPermissions.length > 0) {
//     return {
//       invalidPermissions,
//       message: `${role.replace(
//         "_",
//         " "
//       )} cannot be granted the following permission(s): ${invalidPermissions
//         .map((p) => p.name)
//         .join(", ")}`,
//     };
//   }

//   return null;
// };

// /**
//  * Allows an authenticated user to change other users permission for crud.
//  *
//  * Steps:
//  * - Validates input using Zod schema
//  * - Ensures the user is authenticated
//  * - Checks if the user has permission to update other users
//  * - Updates the permission of the specified user in the database
//  *
//  * @param _ - Unused GraphQL parent argument
//  * @param args - Arguments for update permission for crud (accessAll, deniedAll, userId, permissions)
//  * @param context - GraphQL context with AppDataSource, Redis, and user info
//  * @returns Promise<BaseResponseOrError> - Response status and message
//  */
// export const updateUserPermission = async (
//   _,
//   args: MutationUpdateUserPermissionArgs,
//   { AppDataSource, redis, user }: Context
// ): Promise<BaseResponseOrError> => {
//   const { userId, accessAll, deniedAll, permissions } = args.input;
//   const { getSession, setSession, deleteSession } = redis;

//   try {
//     // Check if user is authenticated
//     if (!user) {
//       return {
//         statusCode: 401,
//         success: false,
//         message: "You're not authenticated",
//         __typename: "BaseResponse",
//       };
//     }

//     // Initialize repositories for Permission and User entities
//     const permissionRepository: Repository<Permission> =
//       AppDataSource.getRepository(Permission);
//     const userRepository: Repository<User> = AppDataSource.getRepository(User);

//     // Check Redis for cached user's data
//     let userData;

//     userData = await getSession(getSingleUserCacheKey(user.id));

//     if (!userData) {
//       // Cache miss: Fetch user from database
//       userData = await userRepository.findOne({
//         where: { id: user.id },
//       });

//       if (!userData) {
//         return {
//           statusCode: 404,
//           success: false,
//           message: "Authenticated user not found in database",
//           __typename: "BaseResponse",
//         };
//       }
//     }

//     // Check Redis for cached user permissions
//     let userPermissions;

//     userPermissions = await getSession(
//       getSingleUserPermissionCacheKey(userData.id)
//     );

//     if (!userPermissions) {
//       // Cache miss: Fetch permissions from database, selecting only necessary fields
//       userPermissions = await permissionRepository.find({
//         where: { user: { id: user.id } },
//       });

//       // Cache permissions in Redis
//       await setSession(
//         getSingleUserPermissionCacheKey(userData.id),
//         userPermissions
//       );
//     }

//     // Check if the user has the "canUpdate" permission for users
//     const canUpdatePermission = userPermissions.some(
//       (permission) => permission.name === "Permission" && permission.canUpdate
//     );

//     if (!canUpdatePermission) {
//       return {
//         statusCode: 403,
//         success: false,
//         message: "You do not have permission to update user permissions",
//         __typename: "BaseResponse",
//       };
//     }

//     // Validate input data using Zod schema
//     const validationResult = await updateUserPermissionSchema.safeParseAsync({
//       userId,
//       accessAll,
//       deniedAll,
//       permissions,
//     });

//     // If validation fails, return detailed error messages
//     if (!validationResult.success) {
//       const errorMessages = validationResult.error.errors.map((error) => ({
//         field: error.path.join("."),
//         message: error.message,
//       }));

//       return {
//         statusCode: 400,
//         success: false,
//         message: "Validation failed",
//         errors: errorMessages,
//         __typename: "ErrorResponse",
//       };
//     }

//     // Get target user
//     let targetUser;
//     targetUser = await getSession(getSingleUserCacheKey(userId));

//     if (!targetUser) {
//       // Cache miss: Fetch user from database
//       const fetchedUser = await userRepository.findOne({
//         where: { id: userId },
//         relations: ["role"],
//         select: ["id", "firstName", "lastName", "email", "role"],
//       });

//       if (!fetchedUser) {
//         return {
//           statusCode: 404,
//           success: false,
//           message: "Target user not found",
//           __typename: "BaseResponse",
//         };
//       }

//       targetUser = {
//         id: fetchedUser.id,
//         firstName: fetchedUser.firstName,
//         lastName: fetchedUser.lastName,
//         email: fetchedUser.email,
//         role: fetchedUser.role?.name,
//       };

//       // Cache target user data in Redis
//       await setSession(getSingleUserCacheKey(userId), targetUser);
//     }

//     // Check the permission is block for the target user or not
//     const restrictionReason = isForbiddenTarget(targetUser, user);
//     if (restrictionReason) {
//       return {
//         statusCode: 403,
//         success: false,
//         message: restrictionReason,
//         __typename: "BaseResponse",
//       };
//     }

//     // If the accessAll or deniedAll flag is true, then update the user permission for all permission true
//     if (accessAll || deniedAll) {
//       const flag = !deniedAll;

//       // Restrict accessAll/deniedAll for CUSTOMER, INVENTORY MANAGER, and CUSTOMER SUPPORT
//       if (
//         ["CUSTOMER", "INVENTORY MANAGER", "CUSTOMER SUPPORT"].includes(
//           targetUser.role
//         )
//       ) {
//         return {
//           statusCode: 403,
//           success: false,
//           message: `You can't ${
//             flag ? "grant" : "deny"
//           } all permissions for a ${targetUser.role}`,
//           __typename: "BaseResponse",
//         };
//       }

//       await permissionRepository.update(
//         { user: { id: userId } },
//         {
//           description: flag
//             ? "All permissions granted"
//             : "All permissions denied",
//           canRead: flag,
//           canCreate: flag,
//           canUpdate: flag,
//           canDelete: flag,
//         }
//       );

//       // Re-fetch the updated permissions for caching
//       const reFetchedPermissions = await permissionRepository.find({
//         where: { user: { id: userId } },
//       });

//       // Cache updated permissions in Redis
//       await setSession(
//         getSingleUserPermissionCacheKey(userId),
//         reFetchedPermissions
//       );

//       return {
//         statusCode: 200,
//         success: true,
//         message: "User permissions updated successfully",
//         __typename: "BaseResponse",
//       };
//     } else {
//       // Get target user's permissions
//       let targetUserPermissions;

//       targetUserPermissions = await getSession(
//         getSingleUserPermissionCacheKey(userId)
//       );

//       if (!targetUserPermissions) {
//         // Cache miss: Fetch permission from database
//         targetUserPermissions = await permissionRepository.find({
//           where: { user: { id: userId } },
//         });

//         if (!targetUserPermissions) {
//           return {
//             statusCode: 404,
//             success: false,
//             message: "Target user permissions not found",
//             __typename: "BaseResponse",
//           };
//         }
//       }

//       // Validate permissions for CUSTOMER, INVENTORY MANAGER, or ADMIN
//       const validationError = validatePermissionsForRole(
//         targetUser.role,
//         permissions
//       );
//       if (validationError) {
//         return {
//           statusCode: 403,
//           success: false,
//           message: validationError.message,
//           __typename: "BaseResponse",
//         };
//       }
//       // Update user permissions based on provided permissions
//       await Promise.all(
//         permissions.map(async (permission) => {
//           // Find existing permission for this user and name
//           const existingPermission = targetUserPermissions.find(
//             (userPermission) => userPermission.name === permission.name
//           );

//           // Prepare the updated values, keeping the existing values where fields are not provided
//           const updatedPermission = {
//             description:
//               permission.description ?? existingPermission?.description,
//             canRead: permission.canRead ?? existingPermission?.canRead,
//             canCreate: permission.canCreate ?? existingPermission?.canCreate,
//             canUpdate: permission.canUpdate ?? existingPermission?.canUpdate,
//             canDelete: permission.canDelete ?? existingPermission?.canDelete,
//           };

//           await permissionRepository.update(
//             {
//               user: { id: userId },
//               name: permission.name as PermissionName,
//             },
//             updatedPermission
//           );
//         })
//       );

//       // Re-fetch the updated permissions for caching
//       const reFetchedPermissions = await permissionRepository.find({
//         where: { user: { id: userId } },
//       });

//       // Cache updated permissions in Redis
//       await setSession(
//         getSingleUserPermissionCacheKey(userId),
//         reFetchedPermissions
//       );

//       return {
//         statusCode: 200,
//         success: true,
//         message: "User permissions updated successfully",
//         __typename: "BaseResponse",
//       };
//     }
//   } catch (error: any) {
//     console.error("Update user permissions error:", error);
//     return {
//       statusCode: 500,
//       success: false,
//       message: "Failed to update user permissions",
//       __typename: "BaseResponse",
//     };
//   }
// };
export const updateUserPermission = () => {};
