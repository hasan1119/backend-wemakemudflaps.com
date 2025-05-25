import { BaseResponseOrError } from "../../types";

export const mediaQueriesResolver = {
  Query: {
    getMedia: async (
      _: any,
      args: any,
      context: any
    ): Promise<BaseResponseOrError> => {
      // if (!args.id) {
      //   return {
      //     statusCode: 400,
      //     success: false,
      //     message: "Media ID is required",
      //     errors: [
      //       {
      //         field: "id",
      //         message: "Media ID is required",
      //       },
      //     ],
      //     __typename: "ErrorResponse",
      //   };
      // }

      return {
        statusCode: 200,
        success: true,
        message: "Media changed successfully",
        __typename: "BaseResponse",
      };
    },
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
