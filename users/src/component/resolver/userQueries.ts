import {
  getProfile,
  getRoleById,
  getRoles,
  getUserById,
  getUsers,
} from "../../controllers";

export const userQueriesResolver = {
  Query: {
    getUsers,
    getUserById,
    getProfile,
    getRoleById,
    getRoles,
  },
};
