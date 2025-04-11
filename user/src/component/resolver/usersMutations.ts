import {
  changePassword,
  forgetPassword,
  login,
  register,
  resetPassword,
  updateProfile,
  updateUserPermission,
  updateUserRole,
} from "../../controllers";
export const userMutationsResolver = {
  Mutation: {
    changePassword,
    forgetPassword,
    login,
    register,
    resetPassword,
    updateUserPermission,
    updateUserRole,
    updateProfile,
  },
};
