-- CreateTable
CREATE TABLE "EmailThread" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "originalEmail" TEXT NOT NULL,
    "aiResponse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "messageId" TEXT,
    "inReplyTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailDraft" (
    "id" TEXT NOT NULL,
    "emailThreadId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailThread_messageId_key" ON "EmailThread"("messageId");

-- CreateIndex
CREATE INDEX "EmailThread_status_idx" ON "EmailThread"("status");

-- CreateIndex
CREATE INDEX "EmailThread_receivedAt_idx" ON "EmailThread"("receivedAt");

-- CreateIndex
CREATE INDEX "EmailThread_from_idx" ON "EmailThread"("from");

-- CreateIndex
CREATE UNIQUE INDEX "EmailDraft_emailThreadId_key" ON "EmailDraft"("emailThreadId");

-- CreateIndex
CREATE INDEX "EmailDraft_approved_idx" ON "EmailDraft"("approved");
