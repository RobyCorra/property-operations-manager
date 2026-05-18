-- CreateTable
CREATE TABLE "ManagerChatSession" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManagerChatSession_date_key" ON "ManagerChatSession"("date");

-- CreateIndex
CREATE INDEX "ManagerChatMessage_sessionId_idx" ON "ManagerChatMessage"("sessionId");

-- AddForeignKey
ALTER TABLE "ManagerChatMessage" ADD CONSTRAINT "ManagerChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ManagerChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
