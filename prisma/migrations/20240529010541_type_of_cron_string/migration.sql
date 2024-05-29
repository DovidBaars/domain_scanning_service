-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CronTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "cronString" TEXT NOT NULL,
    "lastRun" DATETIME
);
INSERT INTO "new_CronTask" ("cronString", "domain", "id", "lastRun") SELECT "cronString", "domain", "id", "lastRun" FROM "CronTask";
DROP TABLE "CronTask";
ALTER TABLE "new_CronTask" RENAME TO "CronTask";
PRAGMA foreign_key_check("CronTask");
PRAGMA foreign_keys=ON;
