import { getAllMedias, getMediaById } from "../../controllers";

export const mediaQueriesResolver = {
  Query: {
    getMediaById,
    getAllMedias,
  },

  Media: {
    createdBy: ({ createdBy }) => {
      return {
        __typename: "CreatedBy",
        id: createdBy, // just reference the ID
      };
    },
  },
};
