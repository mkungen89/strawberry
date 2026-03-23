-- Brief locking
ALTER TABLE "Order" ADD COLUMN "briefLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "briefLockedAt" TIMESTAMP(3);

-- Concept/prototype system
CREATE TABLE "OrderConcept" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderConcept_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderConcept_orderId_idx" ON "OrderConcept"("orderId");
ALTER TABLE "OrderConcept" ADD CONSTRAINT "OrderConcept_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
