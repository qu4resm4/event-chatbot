-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "assistant_id" TEXT NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "wa_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("wa_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_assistant_id_key" ON "Assistant"("assistant_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_thread_id_key" ON "User"("thread_id");
