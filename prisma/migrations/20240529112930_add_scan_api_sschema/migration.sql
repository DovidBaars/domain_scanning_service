-- CreateTable
CREATE TABLE "ScanApi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "interval" INTEGER,
    "lastRun" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "ScanApi_url_key" ON "ScanApi"("url");
