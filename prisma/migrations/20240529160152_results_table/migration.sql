/*
  Warnings:

  - You are about to drop the column `results` on the `Domain` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanApiId" INTEGER NOT NULL,
    "domainId" INTEGER NOT NULL,
    "results" TEXT NOT NULL,
    CONSTRAINT "Results_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Results_scanApiId_fkey" FOREIGN KEY ("scanApiId") REFERENCES "ScanApi" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "interval" INTEGER
);
INSERT INTO "new_Domain" ("id", "interval", "url") SELECT "id", "interval", "url" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
CREATE UNIQUE INDEX "Domain_url_key" ON "Domain"("url");
CREATE TABLE "new_CronTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "cronString" TEXT NOT NULL,
    "lastRun" DATETIME,
    CONSTRAINT "CronTask_url_fkey" FOREIGN KEY ("url") REFERENCES "Domain" ("url") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CronTask" ("cronString", "id", "lastRun", "url") SELECT "cronString", "id", "lastRun", "url" FROM "CronTask";
DROP TABLE "CronTask";
ALTER TABLE "new_CronTask" RENAME TO "CronTask";
CREATE UNIQUE INDEX "CronTask_url_key" ON "CronTask"("url");
PRAGMA foreign_key_check("Domain");
PRAGMA foreign_key_check("CronTask");
PRAGMA foreign_keys=ON;
