import Redis from "ioredis";
import { Pool } from "pg";

// PostgreSQL configuration
const pgConfig = {
  user: "postgres",
  host: "techanalyzen.com",
  password: "password",
  port: 5432,
  database: "steven", // Connect directly to the steven database
};

// Redis configuration
const redisConfig = {
  host: "techanalyzen.com",
  port: 6379,
  password: "password",
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
      // Drop each table with CASCADE
      console.log(`Dropping ${tables.length} table(s)...`);
      for (const table of tables) {
        await pgClient.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`Dropped table ${table}`);
      }
      console.log("All tables dropped successfully.");
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
