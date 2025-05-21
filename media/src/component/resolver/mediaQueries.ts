export const mediaQueriesResolver = {
  Query: {
    getMedia: async (_: any, args: any, context: any) => {
      return {
        id: "1",
        mediaType: "image",
        url: "https://example.com/image.jpg",
        useCase: "Profile",
      };
    },
  },
};
