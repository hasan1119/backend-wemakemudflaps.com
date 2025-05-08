// Graphql mutations for the auth and user data
export { login } from './mutations/auth/login-register/login';
export { register } from './mutations/auth/login-register/register';
export { changePassword } from './mutations/auth/password/change-password';
export { forgetPassword } from './mutations/auth/password/forget-password';
export { resetPassword } from './mutations/auth/password/reset-password';
export { createUserRole } from './mutations/manage-role/create-user-role';
export { deleteUserRole } from './mutations/manage-role/delete-user-role';
export { updateUserRole } from './mutations/manage-role/update-user-role';
export { updateUserRoleInfo } from './mutations/manage-role/update-user-role-info';
export { updateUserPermission } from './mutations/permission/update-user-permission';
export { updateProfile } from './mutations/profile/update-profile';
export { accountActivation } from './mutations/verification-and-activation/account-activation';
export { verifyEmail } from './mutations/verification-and-activation/email-verification';

// Graphql queries for the auth and user data
export { getRoleById } from './queries/role/get-role-by-id';
export { getRoles } from './queries/role/get-roles';
export { getProfile } from './queries/user/get-profile';
export { getUserById } from './queries/user/get-user-by-id';
export { getUsers } from './queries/user/get-users';
