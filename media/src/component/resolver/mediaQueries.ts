import { getAllMedias, getMediaById } from "../../controllers";

export const mediaQueriesResolver = {
  Query: {
    getMediaById,
    getAllMedias,
  },

  // BaseResponseOrError: {
  //   __resolveType(obj: BaseResponseOrError) {
  //     if (obj.success) {
  //       return "BaseResponse";
  //     } else {
  //       return "ErrorResponse";
  //     }
  //   },
  // },
};
