// Graphql mutations for the auth and user data
export { changePassword } from "./mutations/auth/change-password";
export { forgetPassword } from "./mutations/auth/forget-password";
export { login } from "./mutations/auth/login";
export { register } from "./mutations/auth/register";
export { resetPassword } from "./mutations/auth/reset-password";
export { updateProfile } from "./mutations/auth/update-profile";
export { updateUserPermission } from "./mutations/auth/update-user-permission";
export { updateUserRole } from "./mutations/auth/update-user-role";

// Graphql queries for the auth and user data
export { getProfile } from "./queries/user/get-profile";
export { getUsers } from "./queries/user/get-users";
