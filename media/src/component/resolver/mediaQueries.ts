import { getMediaById, getMediaByIds } from "../../controllers";

export const mediaQueriesResolver = {
  Query: {
    getMediaById,
    getMediaByIds,
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
