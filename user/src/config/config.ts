import dotenv from "dotenv";

dotenv.config();

interface Config {
  /* Application port*/
  PORT: number;

  /* Sub Graph name */
  SUB_GRAPH_NAME: string;

  /* Database configurations */
  DB_TYPE: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SYNCHRONIZE: boolean;
  DB_ENTITIES: string;
  DB_MIGRATIONS: string;

  /* Bcrypt configurations */
  SALT_ROUNDS: number;

  /* JWT configurations */
  SECRET_KEY: string;
  EXPIRE: string;

  /* Nodemailer configurations */
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;

  /* Redis configurations */
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_SESSION_TTL: number;
}

const CONFIG: Config = {
  /* Application port*/
  PORT: parseInt(process.env.PORT as string, 10),

  /* Sub Graph name */
  SUB_GRAPH_NAME: process.env.SUB_GRAPH_NAME as string,

  /* Database configurations */
  DB_TYPE: process.env.DB_TYPE as string,
  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: parseInt(process.env.DB_PORT as string, 10),
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_SYNCHRONIZE:
    (process.env.DB_SYNCHRONIZE as string) === "true" ? true : false,
  DB_ENTITIES: process.env.DB_ENTITIES as string,
  DB_MIGRATIONS: process.env.DB_MIGRATIONS as string,

  /* Bcrypt configurations */
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS as string, 10),

  /* JWT configurations */
  SECRET_KEY: process.env.SECRET_KEY as string,
  EXPIRE: process.env.EXPIRE as string,

  /* Nodemailer configurations */
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT as string, 10),
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  EMAIL_FROM: process.env.EMAIL_FROM as string,

  /* Redis configurations */
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: parseInt(process.env.REDIS_PORT as string, 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  REDIS_SESSION_TTL: parseInt(process.env.REDIS_SESSION_TTL as string, 10),
};

export default CONFIG;
