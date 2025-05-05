import { DataSource } from "typeorm";
import config from "../config/config";

export const AppDataSource = new DataSource({
  type: config.DB_TYPE as any,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: config.DB_SYNCHRONIZE,
  entities: [`${__dirname}/../entities/**/*.entity.{ts,js}`],
  migrations: [`${__dirname}/../migrations/**/*.{ts,js}`],
  subscribers: [],
});

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
