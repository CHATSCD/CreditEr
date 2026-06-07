-- CreateTable
CREATE TABLE "CreditItem" (
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

-- CreateTable
CREATE TABLE "Dispute" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dispute_creditItemId_fkey" FOREIGN KEY ("creditItemId") REFERENCES "CreditItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
