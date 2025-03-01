import { DataSource } from "typeorm";
import * as entities from "../../../entities/index"; // Importing all entities from the existing structure
import config from "../config/config";

export const AppDataSource = new DataSource({
  type: config.DB_TYPE as any,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: false, // Set false for production, use migrations instead
  migrationsRun: true, // Ensures migrations are executed on startup
  entities: Object.values(entities), // Automatically map all entities
  migrations: ["src/migrations/**/*.ts"], // Adjust as per project structure
  subscribers: [], // Add subscribers if needed
  cli: {
    migrationsDir: "src/migrations",
  },
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established.");

    // Run pending migrations
    await AppDataSource.runMigrations();
    console.log("✅ Migrations executed successfully.");
  } catch (error) {
    console.error("❌ Error during Data Source initialization:", error);
  }
};
