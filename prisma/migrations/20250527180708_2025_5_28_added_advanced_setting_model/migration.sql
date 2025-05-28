-- CreateTable
CREATE TABLE "advanced_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "sensitivityLevel" INTEGER NOT NULL DEFAULT 70,
    "showPartialMatches" BOOLEAN NOT NULL DEFAULT true,
    "enableSymptomCombinations" BOOLEAN NOT NULL DEFAULT true,
    "urgentThreshold" INTEGER NOT NULL DEFAULT 65,
    "emergencyThreshold" INTEGER NOT NULL DEFAULT 85,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advanced_settings_pkey" PRIMARY KEY ("id")
);
