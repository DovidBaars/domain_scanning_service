/*
  Warnings:

  - Added the required column `timestamp` to the `ServiceEntryLogs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceEntryLogs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "service" TEXT NOT NULL,
    "routingKey" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL
);
INSERT INTO "new_ServiceEntryLogs" ("id", "routingKey", "service") SELECT "id", "routingKey", "service" FROM "ServiceEntryLogs";
DROP TABLE "ServiceEntryLogs";
ALTER TABLE "new_ServiceEntryLogs" RENAME TO "ServiceEntryLogs";
PRAGMA foreign_key_check("ServiceEntryLogs");
PRAGMA foreign_keys=ON;
