-- CreateTable
CREATE TABLE "aac_categories" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "iconUrl" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aac_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aac_symbols" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "icon_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tts_text" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "category_id" INTEGER,
    "is_global_quick" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aac_symbols_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aac_symbols_category_id_idx" ON "aac_symbols"("category_id");

-- AddForeignKey
ALTER TABLE "aac_symbols" ADD CONSTRAINT "aac_symbols_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "aac_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
