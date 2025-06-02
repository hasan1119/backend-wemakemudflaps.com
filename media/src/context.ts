import { IncomingMessage, ServerResponse } from "http";
import { DataSource } from "typeorm";
import { UserSession } from "./types";

/**
 * Defines the GraphQL context type for the application.
 *
 * Workflow:
 * 1. Specifies the structure of the context object used in GraphQL resolvers.
 * 2. Includes database connection, user session, client details, Redis session utilities, and HTTP request/response objects.
 */
export type Context = {
  // TypeORM data source for database operations
  AppDataSource: DataSource;
  // Authenticated user session or null if unauthenticated
  user: UserSession | null;
  // Client's IP address
  ip: string;
  // Value of the Accept-Language header
  acceptLanguage: string;
  // Parsed list of accepted languages
  languages: [];
  // Redis session management utilities
  redis: {
    // Retrieves a session by ID
    getSession: <T>(sessionId: string) => Promise<T | null>;
    // Sets a session by ID with optional TTL
    setSession: (
      id: string,
      sessionData: object | string,
      ttl?: number
    ) => Promise<void>;
    // Deletes a session by ID
    deleteSession: (id: string) => Promise<void>;
  };
  // Raw HTTP request object
  req: IncomingMessage;
  // Raw HTTP response object
  res: ServerResponse;
};
