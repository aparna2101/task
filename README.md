# Order Management System with Automated Status progression

A full-stack application demonstrating database design, background scheduled operations, API endpoint protection, and a real-time reactive dashboard.

---

## Technical Stack
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas or Local MongoDB
- **Background Scheduler**: Internal cron runner (`node-cron`) + Protected REST API trigger
- **Frontend Dashboard**: React.js (Vite), Styled with customized premium Vanilla CSS (Dark Space Theme)

---

## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/order_management`) OR an active MongoDB Atlas Connection URI.

### Setup Instructions

1. **Clone & Configure Environment**:
   - Create your environment file inside the `/backend` folder:
     ```bash
     cd backend
     cp .env.example .env
     ```
   - Customize `MONGODB_URI` or `PORT` in `backend/.env` if necessary.

2. **Install & Start Backend**:
   - From the workspace root:
     ```bash
     cd backend
     npm install
     npm run dev
     ```
     This starts the Express server on `http://localhost:5000` and configures the background scheduler to run automatically every 5 minutes.

3. **Install & Start Frontend**:
   - Open a separate terminal from the workspace root:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
     This launches the React development server on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173` to see the dashboard.

---

## System Design & Architecture Q&A

### 1. Which Database was used and why?
I chose **MongoDB** (with Mongoose ODM) for this system because:
- **Flexible Schema Structure**: Orders are dynamic document entities that include a nested status progression log (`statusHistory`). Storing this log in-line inside the Order document is highly efficient compared to performing table joins in traditional SQL databases.
- **Horizontal Scaling & Document Model**: MongoDB's document architecture scales horizontally via sharding. This fits high-velocity order ingestion pipelines.
- **Atomic Operations**: Mongoose supports rich document validation and atomic state operations (`$push`, `$set`), reducing transactional overhead.

### 2. Collections Created
I created two primary collections:
1. **`orders`**: Stores order details (customer info, product name, amount, current state, payment info) and embeds an array of status timeline transitions.
2. **`schedulerlogs`**: Stores background cron executions (execution time, status, updated counts, details, and errors).

### 3. How Order Status History is stored
Order status history is stored as an array of nested sub-documents directly inside the `Order` schema:
```json
{
  "orderStatus": "PROCESSING",
  "statusHistory": [
    { "status": "PLACED", "updatedAt": "2026-07-18T15:00:00.000Z" },
    { "status": "PROCESSING", "updatedAt": "2026-07-18T15:10:00.000Z" }
  ]
}
```
This design is clean and performant, requiring only a single query to retrieve an order alongside its entire lifecycle history. I added a pre-save mongoose hook to ensure that any new order automatically initializes its `statusHistory` timeline with the default state on creation.

### 4. How Scheduler Logs are stored
Every scheduler trigger creates a new log entry in the `schedulerlogs` collection. The model structure tracks:
- `timestamp`: Date/time of execution.
- `status`: `SUCCESS` or `FAILED`.
- `ordersProcessed`: Count of orders transitioned.
- `details`: JSON summary details containing transitioned Order IDs and their status states.
- `errorMessage`: Captured stacktrace message in case of failure.

This enables immediate audit visibility on the **Scheduler Logs** tab in the dashboard.

### 5. How Duplicate Orders are prevented
Duplicate orders are prevented using a combination of two layers:
1. **Database Schema Enforcements**: The Mongoose `OrderSchema` designates `orderId` as a `unique` field and creates a database-level unique index on it. Any duplicate insertions fail immediately at the database level.
2. **API Controller Validations**: The `createOrder` controller actively performs a read query `Order.findOne({ orderId })` before insertion. If an entry is found, it returns an explicit `409 Conflict` response to the user with a descriptive error message.

### 6. How Race Conditions are handled
Race conditions occur when the automated scheduler and a manual operator attempt to update the same order status simultaneously. I solved this through:
- **State-Dependent Mongoose Validations**: Before saving changes, Mongoose applies standard document versioning (`__v` field). If a manual PATCH query updates the document in the database while the scheduler is holding a stale version in memory, the save operation fails due to version conflict rather than overwriting manual changes.
- **Strict Query Conditions**: The scheduler fetches only orders matching explicit candidates (`PLACED` or `PROCESSING`). In the database operation, we perform conditional status matching to ensure updates are only committed if the status hasn't changed.

### 7. How the System can Scale
To handle high order volumes:
1. **Indexes**: Added database indexes on `orderId` (unique) and `orderStatus` to ensure querying and filtering is $O(1)$.
2. **Horizontal Sharding**: Shard the database on a composite key like `{ orderStatus: 1, createdAt: 1 }` or `{ customerId: 1, createdAt: 1 }` to evenly spread writes across multiple shards.
3. **Queue Processing**: Transition from a polling-based model to a Message Queue (like RabbitMQ or BullMQ). Instead of running a cron query across the entire collection, the system pushes orders to a delayed queue on creation. After 10 minutes, the consumer consumes the message and performs the state transition. This removes query overhead entirely.

### 8. Which Scheduler Service was used and why?
- **Local Testing**: I used `node-cron` integrated directly within the Express server process. This makes the system self-contained and run out-of-the-box for local testing without external service dependencies.
- **Production Routing**: I created a secure REST API route (`POST /api/scheduler/run`) protected by a header key (`x-scheduler-key`). This allows the system to disable the internal cron in production and let robust external cloud schedulers (like **Render Cron Jobs**, **Google Cloud Scheduler**, or **Cron-Job.org**) trigger the process via Webhooks safely and reliably.

---

## Seeding & Verification

To make verification easy, I have added test routines:
1. **Interactive UI Seeding**: Click **🧬 Seed Test Orders** in the toolbar. It will create:
   - `ORD-TEST-1` (Created 15m ago, Status: `PLACED` -> Should progress to `PROCESSING`)
   - `ORD-TEST-2` (Created 50m ago, Status: `PROCESSING` for 25m -> Should progress to `READY_TO_SHIP`)
   - `ORD-TEST-3` (Created 1m ago, Status: `PLACED` -> Should stay as `PLACED`)
2. **Interactive UI Scheduler Trigger**: Click **⚙️ Cron Control** on the dashboard. Enter the scheduler key (default: `super_secret_scheduler_key_123`) and click **Execute Cron API** to watch the status updates occur in real-time.
3. **Terminal Scripts**: You can also run these scripts inside `/backend` folder:
   - `node scratch/seed_orders.js`
   - `node scratch/trigger_scheduler.js`
4. **Postman API Collection**: I have included the `OrderProg_Postman_Collection.json` file in the project root directory. You can import this file directly into Postman to test all endpoints (GET orders, POST seed, POST create, PATCH status, and POST manual cron trigger) with pre-configured endpoints and payloads.
