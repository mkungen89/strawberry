-- CreateTable
CREATE TABLE "DiscordSetupOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "guildName" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordSetupOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordSetupOrder_orderId_key" ON "DiscordSetupOrder"("orderId");

-- CreateIndex
CREATE INDEX "DiscordSetupOrder_guildId_idx" ON "DiscordSetupOrder"("guildId");

-- CreateIndex
CREATE INDEX "DiscordSetupOrder_orderId_idx" ON "DiscordSetupOrder"("orderId");
