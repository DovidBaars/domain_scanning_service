-- CreateTable
CREATE TABLE "CronTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "cronString" INTEGER NOT NULL,
    "lastRun" DATETIME
);

-- CreateTable
CREATE TABLE "AccessLogs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "userAgent" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "interval" INTEGER
);
