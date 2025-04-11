import { getProfile, getUsers } from "../../controllers";

export const userQueriesResolver = {
  Query: {
    getUsers,
    getProfile,
  },
};
