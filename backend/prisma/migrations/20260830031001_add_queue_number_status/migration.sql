-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'CALLED');

-- AlterTable
ALTER TABLE "queue_numbers" ADD COLUMN     "calledAt" TIMESTAMP(3),
ADD COLUMN     "status" "QueueStatus" NOT NULL DEFAULT 'WAITING';
