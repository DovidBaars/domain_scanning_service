/*
  Warnings:

  - You are about to drop the column `domain` on the `AccessLogs` table. All the data in the column will be lost.
  - You are about to drop the column `interval` on the `ScanApi` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ScanApi` table. All the data in the column will be lost.
  - Added the required column `url` to the `AccessLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api` to the `ScanApi` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessLogs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "userAgent" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "interval" INTEGER
);
INSERT INTO "new_AccessLogs" ("id", "interval", "method", "timestamp", "userAgent") SELECT "id", "interval", "method", "timestamp", "userAgent" FROM "AccessLogs";
DROP TABLE "AccessLogs";
ALTER TABLE "new_AccessLogs" RENAME TO "AccessLogs";
CREATE TABLE "new_ScanApi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "api" TEXT NOT NULL,
    "lastRun" DATETIME
);
INSERT INTO "new_ScanApi" ("id", "lastRun") SELECT "id", "lastRun" FROM "ScanApi";
DROP TABLE "ScanApi";
ALTER TABLE "new_ScanApi" RENAME TO "ScanApi";
CREATE UNIQUE INDEX "ScanApi_api_key" ON "ScanApi"("api");
PRAGMA foreign_key_check("AccessLogs");
PRAGMA foreign_key_check("ScanApi");
PRAGMA foreign_keys=ON;
