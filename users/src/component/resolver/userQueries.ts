import {
  getAllPermissionsByUserId,
  getAllRoles,
  getAllUsers,
  getProfile,
  getRoleById,
  getUserById,
} from "../../controllers";

export const userQueriesResolver = {
  Query: {
    getAllUsers,
    getUserById,
    getProfile,
    getRoleById,
    getAllRoles,
    getAllPermissionsByUserId,
  },
};
