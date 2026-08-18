-- CreateEnum
CREATE TYPE "NumberStatus" AS ENUM ('AVAILABLE', 'PENDING', 'SOLD');

CREATE TABLE "Raffle" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "raffleDate" TIMESTAMP(3) NOT NULL,
    "backgroundImage" TEXT,
    "personImage" TEXT,
    "contactWhatsApp" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RaffleNumber" (
    "id" SERIAL NOT NULL,
    "raffleId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "NumberStatus" NOT NULL DEFAULT 'AVAILABLE',
    "customerName" TEXT,
    "customerPhone" TEXT,
    "selectedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaffleNumber_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prize" (
    "id" SERIAL NOT NULL,
    "raffleId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);


CREATE INDEX "RaffleNumber_raffleId_idx" ON "RaffleNumber"("raffleId");

CREATE UNIQUE INDEX "RaffleNumber_raffleId_number_key" ON "RaffleNumber"("raffleId", "number");

CREATE INDEX "Prize_raffleId_idx" ON "Prize"("raffleId");

CREATE UNIQUE INDEX "Prize_raffleId_position_key" ON "Prize"("raffleId", "position");

CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

ALTER TABLE "RaffleNumber" ADD CONSTRAINT "RaffleNumber_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Prize" ADD CONSTRAINT "Prize_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
