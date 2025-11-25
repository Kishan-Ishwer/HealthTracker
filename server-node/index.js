// server-node/index.js
const express = require("express");
const db = require("./db"); // Our database connection pool
const app = express();
const PORT = process.env.NODE_PORT || 3000;

// --- Middleware ---
app.use(express.json());

// --- API Endpoint: Data Ingestion ---
app.post("/api/v1/ingest/health-data", async (req, res) => {
  const { userId, records } = req.body;

  if (!userId || !Array.isArray(records) || records.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid data format or missing data." });
  }

  try {
    await db.query("BEGIN");

    for (const record of records) {
      const recordType = record.data.type;

      const queryText = `
        INSERT INTO raw_health_data (user_id, timestamp, data, record_type)
        VALUES ($1, $2, $3::jsonb, $4)
        ON CONFLICT (user_id, timestamp) DO NOTHING;
      `;
      const queryParams = [
        userId,
        new Date(record.timestamp),
        record.data,
        recordType,
      ];
      await db.query(queryText, queryParams);
    }

    await db.query("COMMIT");

    res
      .status(201)
      .json({ message: `Successfully ingested ${records.length} records.` });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Ingestion Error:", err);
    res.status(500).json({ error: "Internal server error during ingestion." });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`📡 Node.js Ingestion Service running on port ${PORT}`);
});
