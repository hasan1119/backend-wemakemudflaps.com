// import { Repository } from "typeorm";
// import { Context } from "../../../context";
// import {
//   Permission,
//   PermissionName,
// } from "../../../entities/permission.entity";
// import { Role } from "../../../entities/user-role.entity";
// import { User } from "../../../entities/user.entity";
// import {
//   getSingleUserCacheKey,
//   getSingleUserPermissionCacheKey,
//   getSingleUserRoleCacheKey,
// } from "../../../helper/redis/session-keys";
// import {
//   BaseResponseOrError,
//   MutationUpdateUserRoleArgs,
// } from "../../../types";
// import { userRoleUpdateSchema } from "../../../utils/data-validation";

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
//  * Allows an admin to update another user's role.
//  *
//  * Steps:
//  * - Validates the input using a Zod schema
//  * - Verifies if the requesting user is authenticated and has admin privileges
//  * - Checks whether the role exists and is not already assigned to the target user
//  * - Updates the target user's role in the database
//  * - Invalidates user list caches to keep data fresh and update with the data
//  *
//  * @param _ - Unused GraphQL parent argument
//  * @param args - Contains userId and newRoleId to be assigned
//  * @param context - GraphQL context with AppDataSource, Redis, and user info
//  * @returns Promise<BaseResponseOrError> - Response status and message
//  */
// export const updateUserRole = async (
//   _: any,
//   args: MutationUpdateUserRoleArgs,
//   { AppDataSource, user, redis }: Context
// ): Promise<BaseResponseOrError> => {
//   const { roleId, userId } = args;
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

//     // Initialize repositories for Role, Permission, and User entities
//     const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
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

//       // Cache permissions in Redis (default 30 days of redis session because of the env)
//       await setSession(
//         getSingleUserPermissionCacheKey(userData.id),
//         userPermissions
//       );
//     }

//     // Check if the user has the "canUpdate" permission for roles
//     const canUpdateUser = userPermissions.some(
//       (permission) => permission.name === "User" && permission.canUpdate
//     );

//     if (!canUpdateUser) {
//       return {
//         statusCode: 403,
//         success: false,
//         message: "You do not have permission to update specific user's role",
//         __typename: "BaseResponse",
//       };
//     }

//     // Validate input data using Zod schema
//     const validationResult = await userRoleUpdateSchema.safeParseAsync({
//       userId,
//       roleId,
//     });

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

//     // Get new role
//     let newRole;
//     newRole = await getSession(getSingleUserRoleCacheKey(roleId));

//     if (!newRole) {
//       // Cache miss: Fetch role from database
//       const fetchedRole = await roleRepository.findOne({
//         where: { id: roleId },
//       });
//       if (!fetchedRole) {
//         return {
//           statusCode: 404,
//           success: false,
//           message: `${newRole} does not exist`,
//           __typename: "BaseResponse",
//         };
//       }

//       newRole = {
//         id: fetchedRole.id,
//         name: fetchedRole.name,
//         description: fetchedRole.description,
//         createdAt: fetchedRole.createdAt,
//         deletedAt: fetchedRole.deletedAt || null,
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
//     }

//     // Compare role names
//     if (targetUser.role === newRole.name) {
//       return {
//         statusCode: 400,
//         success: false,
//         message: "User already has the specified role",
//         __typename: "BaseResponse",
//       };
//     }

//     // Update role in DB
//     await userRepository.update({ id: userId }, { role: newRole });

//     // Update caches in Redis (default 30 days of redis session because of the env)
//     await setSession(getSingleUserCacheKey(userId), {
//       id: targetUser.id,
//       firstName: targetUser.firstName,
//       lastName: targetUser.lastName,
//       email: targetUser.email,
//       role: newRole.name,
//     });

//     if (["ADMIN", "CUSTOMER", "INVENTORY MANAGER"].includes(newRole.name)) {
//       // Check Redis for cached targeted user permissions
//       let targetUserPermissions;

//       targetUserPermissions = await getSession(
//         getSingleUserPermissionCacheKey(userId)
//       );

//       if (!targetUserPermissions) {
//         // Cache miss: Fetch permissions from database, selecting only necessary fields
//         targetUserPermissions = await permissionRepository.find({
//           where: { user: { id: userId } },
//         });

//         // Cache permissions in Redis (default 30 days of redis session because of the env)
//         await setSession(
//           getSingleUserPermissionCacheKey(userId),
//           targetUserPermissions
//         );
//       }

//       // Get allowed permissions for the new role
//       const allowed = ROLE_PERMISSIONS[newRole.name];

//       // Create a map of allowed permissions for quick lookup
//       const allowedPermissionMap = new Map<
//         string,
//         {
//           canRead: boolean;
//           canCreate: boolean;
//           canUpdate: boolean;
//           canDelete: boolean;
//         }
//       >();
//       Object.keys(allowed).forEach((action) => {
//         allowed[action as keyof typeof allowed].forEach((name) => {
//           if (!allowedPermissionMap.has(name)) {
//             allowedPermissionMap.set(name, {
//               canRead: false,
//               canCreate: false,
//               canUpdate: false,
//               canDelete: false,
//             });
//           }
//           const perm = allowedPermissionMap.get(name)!;
//           if (action === "read") perm.canRead = true;
//           if (action === "create") perm.canCreate = true;
//           if (action === "update") perm.canUpdate = true;
//           if (action === "delete") perm.canDelete = true;
//         });
//       });

//       // Prepare permission entities for update or creation
//       const permissionEntities: Permission[] = [];
//       const allowedNames = Array.from(allowedPermissionMap.keys());

//       // Update or create permissions
//       for (const [name, perm] of allowedPermissionMap) {
//         const existingPerm = targetUserPermissions.find(
//           (p: Permission) => p.name === name
//         );
//         if (existingPerm) {
//           // Update existing permission
//           existingPerm.canRead = perm.canRead;
//           existingPerm.canCreate = perm.canCreate;
//           existingPerm.canUpdate = perm.canUpdate;
//           existingPerm.canDelete = perm.canDelete;

//           permissionEntities.push(existingPerm);
//         } else {
//           // Create new permission
//           const newPermission = new Permission();
//           newPermission.name = name as PermissionName;
//           newPermission.user = Promise.resolve(
//             userRepository.create({ id: userId })
//           );
//           newPermission.canRead = perm.canRead;
//           newPermission.canCreate = perm.canCreate;
//           newPermission.canUpdate = perm.canUpdate;
//           newPermission.canDelete = perm.canDelete;
//           permissionEntities.push(newPermission);
//         }
//       }

//       // Update permissions that are not allowed (set flags to false)
//       const nonAllowedPermissions = targetUserPermissions.filter(
//         (p: Permission) => !allowedNames.includes(p.name)
//       );
//       if (nonAllowedPermissions.length > 0) {
//         await permissionRepository
//           .createQueryBuilder()
//           .update(Permission)
//           .set({
//             canRead: false,
//             canCreate: false,
//             canUpdate: false,
//             canDelete: false,
//           })
//           .where("id IN (:...ids)", {
//             ids: nonAllowedPermissions.map((p: Permission) => p.id),
//           })
//           .execute();
//         permissionEntities.push(
//           ...nonAllowedPermissions.map((p: Permission) => ({
//             ...p,
//             canRead: false,
//             canCreate: false,
//             canUpdate: false,
//             canDelete: false,
//             description: `No access to ${p.name} for ${newRole.name} role`,
//           }))
//         );
//       }

//       // Save updated and new permissions
//       await AppDataSource.transaction(async (transactionalEntityManager) => {
//         await transactionalEntityManager.save(Permission, permissionEntities);
//       });

//       // Cache permissions in Redis (default 30 days of redis session because of the env)
//       await setSession(
//         getSingleUserPermissionCacheKey(userId),
//         permissionEntities
//       );

//       return {
//         statusCode: 200,
//         success: true,
//         message:
//           "User role updated successfully with co-responding permissions",
//         __typename: "BaseResponse",
//       };
//     }

//     return {
//       statusCode: 200,
//       success: true,
//       message: "User role updated successfully",
//       __typename: "BaseResponse",
//     };
//   } catch (error: any) {
//     console.error("Error updating role:", error);
//     return {
//       statusCode: 500,
//       success: false,
//       message: error.message || "Internal Server Error",
//       __typename: "BaseResponse",
//     };
//   }
// };

export const updateUserRole = () => {};
