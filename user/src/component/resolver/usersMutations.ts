import {
  changePassword,
  createUserRole,
  deleteUserRole,
  forgetPassword,
  login,
  register,
  resetPassword,
  updateProfile,
  updateUserPermission,
  updateUserRole,
  updateUserRoleInfo,
} from "../../controllers";
export const userMutationsResolver = {
  Mutation: {
    changePassword,
    createUserRole,
    deleteUserRole,
    updateUserRoleInfo,
    forgetPassword,
    login,
    register,
    resetPassword,
    updateUserPermission,
    updateUserRole,
    updateProfile,
  },
};
