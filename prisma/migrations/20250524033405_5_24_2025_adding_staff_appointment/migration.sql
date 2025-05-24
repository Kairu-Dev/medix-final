-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "booked_by" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_booked_by_idx" ON "Appointment"("booked_by");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_booked_by_fkey" FOREIGN KEY ("booked_by") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
