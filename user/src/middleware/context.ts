import { AppDataSource, redis } from "../db";

const createContext = async ({ req, res }) => {
  return {
    AppDataSource,
    redis,
    req,
    res,
  };
};

export default createContext;
