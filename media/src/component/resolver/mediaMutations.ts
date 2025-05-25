import {
  deleteMediaFiles,
  updateMediaFileInfo,
  uploadMediaFiles,
} from "../../controllers";

export const mediaMutationsResolver = {
  Mutation: {
    uploadMediaFiles,
    deleteMediaFiles,
    updateMediaFileInfo,
  },
};
