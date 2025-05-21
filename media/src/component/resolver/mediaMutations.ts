export const mediaMutationsResolver = {
  Mutation: {
    changeMedia: async (_: any, args: any, context: any) => {
      return {
        id: args.id,
        mediaType: args.mediaType,
        url: args.url,
        useCase: args.useCase,
      };
    },
  },
};
