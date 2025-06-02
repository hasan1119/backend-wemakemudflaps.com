/**
 * Exports database and Redis utilities for application-wide use.
 *
 * Workflow:
 * 1. Exports the TypeORM data source instance for database operations.
 * 2. Exports the database connection function.
 * 3. Exports the Redis client instance for session and caching management.
 */
export { AppDataSource, connectDB } from "./connect-db";
export { redis } from "./redis/redis";
