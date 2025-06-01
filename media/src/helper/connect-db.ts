import { DataSource } from "typeorm";
import config from "../config/config";

/**
 * Provides database connection configuration and initialization utilities.
 *
 * Workflow:
 * 1. Configures the TypeORM DataSource with database connection details from config.
 * 2. Defines entities and migrations paths for the application.
 * 3. Exports the AppDataSource instance and connectDB function for database connectivity.
 */
export const AppDataSource = new DataSource({
  type: config.DB_TYPE as any,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: config.DB_SYNCHRONIZE,
  entities: [__dirname + "/../entities/**/*.entity.{ts,js}"],
  migrations: [__dirname + "/../migrations/**/*.{ts,js}"],
  // Default empty subscribers array
  subscribers: [],
});

/**
 * Handles initialization and connection to the database.
 *
 * Workflow:
 * 1. Initializes the AppDataSource instance.
 * 2. Logs success message if the connection is established.
 * 3. Catches and logs any errors during initialization.
 */
export const connectDB = async () => {
  try {
    const db = await AppDataSource.initialize();
    if (db.isInitialized) {
      console.log("Database connection established.");
    }
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
  }
};
