import Redis from "ioredis";
import { Pool } from "pg";

// PostgreSQL configuration
// const pgConfig = {
//   user: "postgres",
//   host: "techanalyzen.com",
//   password: "password",
//   port: 5432,
//   database: "steven",
// };
const pgConfig = {
  user: "postgres",
  host: "127.0.0.1",
  password: "Joy112233",
  port: 5432,
  database: "postgres",
};

// Redis configuration
// const redisConfig = {
//   host: "techanalyzen.com",
//   port: 6379,
//   password: "password",
// };

const redisConfig = {
  host: "127.0.0.1",
  port: 6379,
  password: "",
};

async function resetTablesAndRedis() {
  let pgClient;
  try {
    // Initialize PostgreSQL client
    pgClient = new Pool(pgConfig);

    // Get all user-defined tables in the public schema
    console.log("Retrieving list of tables in steven database...");
    const result = await pgClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const tables = result.rows.map((row) => row.table_name);

    if (tables.length === 0) {
      console.log("No tables found in steven database.");
    } else {
      // Define the specific order
      const ordered = [
        "permission",
        "user_roles",
        "role_permission",
        "role",
        "user_login",
        "user",
        "product_categories",
        "product",
        "product_brands",
        "category",
      ];
      const orderedTables = ordered.filter((t) => tables.includes(t));
      const otherTables = tables.filter((t) => !ordered.includes(t));
      const deletionOrder = [...orderedTables, ...otherTables];

      // Delete all rows from each table in the specified order
      console.log(`Deleting all rows from ${deletionOrder.length} table(s)...`);
      for (const table of deletionOrder) {
        await pgClient.query(`DELETE FROM "${table}";`);
        console.log(`Deleted all rows from table ${table}`);
      }
      console.log("All table rows deleted successfully.");
    }

    // Initialize Redis client
    const redis = new Redis(redisConfig);

    // Flush all Redis keys
    console.log("Flushing Redis...");
    await redis.flushall();
    console.log("Redis flushed successfully.");

    // Close Redis connection
    redis.disconnect();
  } catch (error) {
    console.error("Error during reset:", (error as Error).message);
  } finally {
    // Close PostgreSQL connection
    if (pgClient) {
      await pgClient.end();
      console.log("PostgreSQL connection closed.");
    }
  }
}

// Execute the reset function
resetTablesAndRedis()
  .then(() => {
    console.log("Reset completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Reset failed:", (err as Error).message);
    process.exit(1);
  });
