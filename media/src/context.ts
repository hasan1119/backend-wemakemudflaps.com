import { IncomingMessage, ServerResponse } from "http";
import { DataSource } from "typeorm";
import { UserSession } from "./types";

/**
 * GraphQL context type for the application.
 *
 * @property {DataSource} AppDataSource - The TypeORM data source instance.
 * @property {UserSession | null} user - The authenticated user session or null if unauthenticated.
 * @property {string} ip - The client's IP address.
 * @property {string} acceptLanguage - The value of the Accept-Language header from the request.
 * @property {string[]} languages - The parsed list of accepted languages.
 * @property {Object} redis - Redis session management utilities.
 * @property {function} redis.getSession - Retrieves a session by ID.
 * @property {function} redis.setSession - Sets a session by ID with optional TTL.
 * @property {function} redis.deleteSession - Deletes a session by ID.
 * @property {IncomingMessage} req - The raw HTTP request object.
 * @property {ServerResponse} res - The raw HTTP response object.
 */
export type Context = {
  AppDataSource: DataSource;
  user: UserSession | null;
  ip: string;
  acceptLanguage: string;
  languages: [];
  redis: {
    getSession: <T>(sessionId: string) => Promise<T | null>;
    setSession: (
      id: string,
      sessionData: object | string,
      ttl?: number
    ) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
  };
  req: IncomingMessage;
  res: ServerResponse;
};
