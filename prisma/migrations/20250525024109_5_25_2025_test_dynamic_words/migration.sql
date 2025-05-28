-- CreateTable
CREATE TABLE "keyword_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'NORMAL',
    "baseScore" INTEGER NOT NULL DEFAULT 50,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyword_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isPartialMatch" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "keyword_groups_name_key" ON "keyword_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_text_groupId_key" ON "keywords"("text", "groupId");

-- AddForeignKey
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "keyword_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
