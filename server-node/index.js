// server-node/index.js
const express = require("express");
const amqp = require("amqplib");
const db = require("./db");
const app = express();
const PORT = process.env.NODE_PORT || 3000;

// --- Message Queue Config ---
const MQ_URL = "amqp://localhost";
const QUEUE_NAME = "health_data_ingested";
let channel = null;

const connectMQ = async () => {
  try {
    const connection = await amqp.connect(MQ_URL);

    connection.on("error", (err) => {
      console.error("MQ Connection Error:", err.message);
    });
    connection.on("close", () => {
      console.error("MQ Connection Closed. Attempting to reconnect...");
      setTimeout(connectMQ, 5000); // Simple auto-reconnect logic
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Message Queue connected and queue '${QUEUE_NAME}' asserted.`);
  } catch (error) {
    console.error("Failed to connect to Message Queue:", error.message);
  }
};

const publishProcessingEvent = async (userId, recordCount) => {
  if (!channel) {
    console.error(
      "Cannot publish: MQ channel not initialized. Check MQ connection."
    );
    return;
  }

  const eventPayload = {
    userId: userId,
    recordCount: recordCount,
    timestamp: new Date().toISOString(),
  };

  const msg = JSON.stringify(eventPayload);

  channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), { presistent: true });
  console.log(
    ` Published event for user ${userId} (${recordCount} records) to ${QUEUE_NAME}`
  );
};

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
    const recordCount = records.length;

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

    publishProcessingEvent(userId, recordCount);

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
const startServer = async () => {
  await connectMQ();

  app.listen(PORT, () => {
    console.log(`📡 Node.js Ingestion Service running on port ${PORT}`);
  });
};

startServer();
