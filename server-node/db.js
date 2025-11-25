// server-node/db.js
require("dotenv").config();
const { Pool } = require("pg");

// Create a new connection pool using the variables loaded from .env
const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1", // Use this fixed host
  database: "health_tracker", // The fixed database name
  password: "mysecretpassword", // Your actual password
  port: 5432,
  connectionTimeoutMillis: 5000,
});

// Event listener to confirm connection (for logging/debugging)
pool.on("connect", () => {
  console.log(" Connected to PostgreSQL Database");
});

// Event listener for connection errors
pool.on("error", (err, client) => {
  console.error(" Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
  // Export a simple method to run queries using the pool
  query: (text, params) => pool.query(text, params),
};
