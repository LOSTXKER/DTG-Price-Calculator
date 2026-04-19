-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "costPerCc" DOUBLE PRECISION NOT NULL DEFAULT 13,
    "smallDesignFlatCost" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "maxInchForMinimum" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "pretreatmentOnePosition" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "pretreatmentMultiPosition" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "whiteGarmentDiscount" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "markup" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "minSellingSmall" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "minSellingLarge" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "largeSizeThreshold" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperSize" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "widthInch" DOUBLE PRECISION NOT NULL,
    "heightInch" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PaperSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolumeTier" (
    "id" SERIAL NOT NULL,
    "minQty" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "VolumeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaperSize_code_key" ON "PaperSize"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VolumeTier_minQty_key" ON "VolumeTier"("minQty");

-- CreateIndex
CREATE UNIQUE INDEX "Addon_code_key" ON "Addon"("code");
