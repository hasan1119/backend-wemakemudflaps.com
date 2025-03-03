// import type { UserSession } from '../middleware/context'

import { IncomingMessage, ServerResponse } from "http";
import { DataSource } from "typeorm";
import { UserSession } from "./middleware/context";

export type Context = {
  AppDataSource: DataSource;
  user: UserSession;
  ip: string;
  acceptLanguage: string;
  languages: [];
  redis: {
    getSession: <T>(sessionId: string) => Promise<T | null>;
    setSession: (
      id: string,
      sessionData: object,
      ttl?: number
    ) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
  };
  req: IncomingMessage;
  res: ServerResponse;
};
