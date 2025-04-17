// Graphql mutations for the auth and user data
export { login } from "./mutations/auth/login-register/login";
export { register } from "./mutations/auth/login-register/register";
export { createUserRole } from "./mutations/auth/manage-role/create-user-role";
export { deleteUserRole } from "./mutations/auth/manage-role/delete-user-role";
export { updateUserRole } from "./mutations/auth/manage-role/update-user-role";
export { updateUserRoleInfo } from "./mutations/auth/manage-role/update-user-role-info";
export { changePassword } from "./mutations/auth/password/change-password";
export { forgetPassword } from "./mutations/auth/password/forget-password";
export { resetPassword } from "./mutations/auth/password/reset-password";
export { updateUserPermission } from "./mutations/auth/permission/update-user-permission";
export { updateProfile } from "./mutations/auth/profile/update-profile";

// Graphql queries for the auth and user data
export { getRoleById } from "./queries/role/get-role-by-id";
export { getRoles } from "./queries/role/get-roles";
export { getProfile } from "./queries/user/get-profile";
export { getUserById } from "./queries/user/get-user-by-id";
export { getUsers } from "./queries/user/get-users";
