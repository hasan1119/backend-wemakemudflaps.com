import { getUser, getUsers } from "../../controllers";

export const userQueriesResolver = {
  Query: {
    getUsers,
    getUser,
  },
};
