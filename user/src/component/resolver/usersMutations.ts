import {
  changePassword,
  deleteUser,
  forgetPassword,
  login,
  register,
  resetPassword,
  updateUser,
} from "../../controllers";

export const userMutationsResolver = {
  Mutation: {
    changePassword,
    deleteUser,
    forgetPassword,
    login,
    register,
    resetPassword,
    updateUser,
  },
};
