-- CreateEnum
CREATE TYPE "NumberType" AS ENUM ('normal', 'priority');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_numbers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "queueNumber" TEXT NOT NULL,
    "type" "NumberType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_counters" (
    "id" UUID NOT NULL,
    "type" "NumberType" NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
