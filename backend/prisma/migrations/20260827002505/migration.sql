/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `queue_counters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "queue_counters_type_key" ON "queue_counters"("type");
