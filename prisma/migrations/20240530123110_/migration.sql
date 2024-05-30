/*
  Warnings:

  - A unique constraint covering the columns `[domainId,scanApiId]` on the table `Results` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Results_domainId_scanApiId_key" ON "Results"("domainId", "scanApiId");
