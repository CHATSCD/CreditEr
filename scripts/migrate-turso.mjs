import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const [baseUrl, authTokenParam] = url.split("?authToken=");
const client = createClient({ url: baseUrl, authToken: authTokenParam });

const sql = `
CREATE TABLE IF NOT EXISTS "CreditItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditorName" TEXT NOT NULL,
    "accountNumber" TEXT,
    "itemType" TEXT NOT NULL,
    "amount" REAL,
    "dateReported" DATETIME,
    "dateOpened" DATETIME,
    "bureaus" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditItemId" TEXT NOT NULL,
    "bureau" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "strategySource" TEXT NOT NULL DEFAULT 'rules',
    "lawCitation" TEXT,
    "letterContent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentAt" DATETIME,
    "responseAt" DATETIME,
    "resolvedAt" DATETIME,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Dispute_creditItemId_fkey" FOREIGN KEY ("creditItemId") REFERENCES "CreditItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
`;

for (const statement of sql.split(";").map(s => s.trim()).filter(Boolean)) {
  await client.execute(statement);
}

console.log("Migrations applied successfully.");
