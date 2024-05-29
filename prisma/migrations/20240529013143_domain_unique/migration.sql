/*
  Warnings:

  - You are about to drop the column `domain` on the `CronTask` table. All the data in the column will be lost.
  - Added the required column `url` to the `CronTask` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CronTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "cronString" TEXT NOT NULL,
    "lastRun" DATETIME
);
INSERT INTO "new_CronTask" ("cronString", "id", "lastRun") SELECT "cronString", "id", "lastRun" FROM "CronTask";
DROP TABLE "CronTask";
ALTER TABLE "new_CronTask" RENAME TO "CronTask";
CREATE UNIQUE INDEX "CronTask_url_key" ON "CronTask"("url");
PRAGMA foreign_key_check("CronTask");
PRAGMA foreign_keys=ON;
