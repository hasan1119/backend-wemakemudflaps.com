import {
  getAllRoles,
  getProfile,
  getRoleById,
  getUserById,
  getUsers,
} from "../../controllers";

export const userQueriesResolver = {
  Query: {
    getUsers,
    getUserById,
    getProfile,
    getRoleById,
    getAllRoles,
  },
};
