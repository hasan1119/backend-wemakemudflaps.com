import dotenv from "dotenv";

dotenv.config();

/**
 * Configuration interface defining environment-based settings.
 *
 * This structure holds critical application configurations,
 * including server settings, database connection details,
 * authentication secrets and caching configurations.
 */
interface Config {
  /* Application server port */
  PORT: number;

  /* Node environment */
  NODE_ENV: string;

  /* Frontend application URL */
  FRONTEND_URL: string;

  /* GraphQL Sub Graph identifier */
  SUB_GRAPH_NAME: string;

  // ===================== Database Configurations =====================

  /* Type of database (e.g., PostgreSQL, MySQL) */
  DB_TYPE: string;

  /* Database host address */
  DB_HOST: string;

  /* Database port number */
  DB_PORT: number;

  /* Database username for authentication */
  DB_USERNAME: string;

  /* Database password for authentication */
  DB_PASSWORD: string;

  /* Name of the database */
  DB_NAME: string;

  /* Whether database synchronization is enabled */
  DB_SYNCHRONIZE: boolean;

  // ===================== JWT Configurations =====================

  /* Secret key used for generating JWT tokens */
  SECRET_KEY: string;

  // ===================== Redis Configurations =====================

  /* Redis host for caching and session management */
  REDIS_HOST: string;

  /* Redis port for communication */
  REDIS_PORT: number;

  /* Redis password for authentication (if required) */
  REDIS_PASSWORD: string;
}

/**
 * Application configuration object sourced from environment variables.
 *
 * This object centralizes configurations for easier access across the application.
 */
const CONFIG: Config = {
  // ===================== Server Configurations =====================
  PORT: parseInt(process.env.PORT as string, 10),
  NODE_ENV: process.env.NODE_ENV.toLowerCase() as string || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  SUB_GRAPH_NAME: process.env.SUB_GRAPH_NAME as string,

  // ===================== Database Configurations =====================
  DB_TYPE: process.env.DB_TYPE as string,
  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: parseInt(process.env.DB_PORT as string, 10),
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_SYNCHRONIZE: (process.env.DB_SYNCHRONIZE as string) === "true",

  // ===================== JWT Configurations =====================
  SECRET_KEY: process.env.SECRET_KEY as string,

  // ===================== Redis Configurations =====================
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: parseInt(process.env.REDIS_PORT as string, 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
};

export default CONFIG;
