-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "RoutineCheckStatus" AS ENUM ('DONE', 'SKIPPED', 'PARTIAL');

-- CreateTable
CREATE TABLE "child_routines" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_routine_items" (
    "id" SERIAL NOT NULL,
    "routine_id" INTEGER NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "activity_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_routine_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_checkins" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "RoutineCheckStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "child_routines_child_id_idx" ON "child_routines"("child_id");

-- CreateIndex
CREATE INDEX "child_routines_parent_id_idx" ON "child_routines"("parent_id");

-- CreateIndex
CREATE INDEX "child_routine_items_routine_id_day_of_week_idx" ON "child_routine_items"("routine_id", "day_of_week");

-- CreateIndex
CREATE INDEX "child_routine_items_activity_id_idx" ON "child_routine_items"("activity_id");

-- CreateIndex
CREATE INDEX "routine_checkins_child_id_date_idx" ON "routine_checkins"("child_id", "date");

-- CreateIndex
CREATE INDEX "routine_checkins_item_id_idx" ON "routine_checkins"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "routine_checkins_child_id_item_id_date_key" ON "routine_checkins"("child_id", "item_id", "date");

-- AddForeignKey
ALTER TABLE "child_routines" ADD CONSTRAINT "child_routines_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_routines" ADD CONSTRAINT "child_routines_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_routine_items" ADD CONSTRAINT "child_routine_items_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "child_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_routine_items" ADD CONSTRAINT "child_routine_items_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_checkins" ADD CONSTRAINT "routine_checkins_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_checkins" ADD CONSTRAINT "routine_checkins_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "child_routine_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
