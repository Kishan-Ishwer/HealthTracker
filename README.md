HealthSync Ecosystem: Health Data Synchronization and Visualization

Overview
HealthSync is a full-stack, end-to-end system that uses a dual-backend architecture to process health data. The system securely transfers raw health data from an Android device (via Health Connect) to a dedicated Node.js Ingestion Server and then exposes summarized, processed data via a C# WebApp Server for visualization on a standard React frontend.
Data Flow Architecture
The data flow is segmented into two phases: Ingestion (Mobile Client to Node.js) and Consumption (React Frontend to C#).
Permission & Extraction: The Mobile Client fetches raw health records from the Android Health Connect API.
Raw Data Ingestion: The Mobile Client sends the raw record payload via a POST request to the Node.js Ingestion Server.
Persistence: The Node.js Server validates the data and saves the raw records to the central database.
Processing/API Layer: The C# WebApp Server is responsible for reading the raw data from the database, performing complex calculations and summarization, and exposing these aggregated results.
Visualization: The Normal React Frontend makes GET requests to the C# WebApp Server's read/summary APIs to retrieve the processed data and render the dashboard.


Component Roles

1. Mobile Client (React Native)
Source Code: src/screens/MainMenuScreen.tsx
Technology: React Native (JavaScript/TypeScript).
Responsibility: Data source communication and raw data transmission.
Key Functions:
  Initiating the native permission request dialog.
  Fetching raw health records (e.g., Steps, Distance, SleepSession) using readRecords.
  Transmitting the raw payload to the Node.js Ingestion Server.

2. Ingestion Server (Node.js)
Technology: Node.js (e.g., Express.js, NestJS).
Responsibility: Handling high-volume, asynchronous raw data intake and immediate storage.
Key Functions:
  Exposing the ingestion endpoint (POST /api/v1/ingest/health-data).
  Handling the rapid storage of all raw, time-series health data to the core database.

4. Processing and API Server (C# WebApp Server)
Technology: C# (e.g., ASP.NET Core).
Responsibility: Business logic, data aggregation, and serving summarized metrics.
Key Functions:
  Executing all processing APIs (e.g., calculating daily averages, identifying trends).
  Exposing the GET Summary APIs that the React frontend consumes.
  Managing complex read/query operations against the database.

4. Web Viewer (Normal React Frontend)
Technology: React.js (Web).
Responsibility: Data consumption and presentation.
Key Functions:
  Communicating exclusively with the C# WebApp Server for processed data.
  Rendering charts and dashboards based on the summarized metrics received.
