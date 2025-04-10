// Graphql mutations for the auth and user data
export { changePassword } from "./mutations/auth/change-password";
export { deleteUser } from "./mutations/auth/delete-user";
export { forgetPassword } from "./mutations/auth/forget-password";
export { login } from "./mutations/auth/login";
export { register } from "./mutations/auth/register";
export { resetPassword } from "./mutations/auth/reset-password";
export { updateUser } from "./mutations/auth/update-user";

// Graphql queries for the auth and user data
export { getUser } from "./queries/user/get-user";
export { getUsers } from "./queries/user/get-users";
