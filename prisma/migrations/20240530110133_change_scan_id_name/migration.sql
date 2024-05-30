/*
  Warnings:

  - The primary key for the `ScanApi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ScanApi` table. All the data in the column will be lost.
  - Added the required column `scanApiId` to the `ScanApi` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domainId" INTEGER NOT NULL,
    "scanApiId" INTEGER NOT NULL,
    "results" TEXT NOT NULL,
    CONSTRAINT "Results_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Results_scanApiId_fkey" FOREIGN KEY ("scanApiId") REFERENCES "ScanApi" ("scanApiId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Results" ("domainId", "id", "results", "scanApiId") SELECT "domainId", "id", "results", "scanApiId" FROM "Results";
DROP TABLE "Results";
ALTER TABLE "new_Results" RENAME TO "Results";
CREATE TABLE "new_ScanApi" (
    "scanApiId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "api" TEXT NOT NULL,
    "lastRun" DATETIME
);
INSERT INTO "new_ScanApi" ("api", "lastRun") SELECT "api", "lastRun" FROM "ScanApi";
DROP TABLE "ScanApi";
ALTER TABLE "new_ScanApi" RENAME TO "ScanApi";
CREATE UNIQUE INDEX "ScanApi_api_key" ON "ScanApi"("api");
PRAGMA foreign_key_check("Results");
PRAGMA foreign_key_check("ScanApi");
PRAGMA foreign_keys=ON;
