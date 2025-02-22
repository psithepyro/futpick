const { Pool } = require("pg");
require("dotenv").config();

//create a new connection pool to the postgresql database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, sslmode: "require" },
});

pool
  .connect()
  .then(() => console.log("✅ Connected to Tembo PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = pool;
