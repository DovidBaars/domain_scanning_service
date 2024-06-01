-- CreateTable
CREATE TABLE "Domain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "interval" INTEGER
);

-- CreateTable
CREATE TABLE "Results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domainId" INTEGER NOT NULL,
    "scanApiId" INTEGER NOT NULL,
    "results" TEXT NOT NULL,
    CONSTRAINT "Results_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Results_scanApiId_fkey" FOREIGN KEY ("scanApiId") REFERENCES "ScanApi" ("scanApiId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CronTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "cronString" TEXT NOT NULL,
    "lastRun" DATETIME,
    CONSTRAINT "CronTask_url_fkey" FOREIGN KEY ("url") REFERENCES "Domain" ("url") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScanApi" (
    "scanApiId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "api" TEXT NOT NULL,
    "lastRun" DATETIME
);

-- CreateTable
CREATE TABLE "AccessLogs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "userAgent" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "interval" INTEGER
);

-- CreateTable
CREATE TABLE "ServiceEntryLogs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "service" TEXT NOT NULL,
    "routingKey" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_url_key" ON "Domain"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Results_domainId_scanApiId_key" ON "Results"("domainId", "scanApiId");

-- CreateIndex
CREATE UNIQUE INDEX "CronTask_url_key" ON "CronTask"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ScanApi_api_key" ON "ScanApi"("api");
