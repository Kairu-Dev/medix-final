-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('NORMAL', 'URGENT', 'EMERGENCY');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "priority_level" "PriorityLevel" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "priority_override" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority_score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PriorityAssessment" (
    "id" SERIAL NOT NULL,
    "condition" TEXT NOT NULL,
    "appointment_type" TEXT NOT NULL,
    "priority_score" INTEGER NOT NULL,
    "priority_level" "PriorityLevel" NOT NULL,
    "notes" TEXT,
    "manual_override" BOOLEAN NOT NULL DEFAULT false,
    "appointment_id" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriorityAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriorityAssessment_appointment_id_key" ON "PriorityAssessment"("appointment_id");

-- CreateIndex
CREATE INDEX "PriorityAssessment_patient_id_idx" ON "PriorityAssessment"("patient_id");

-- CreateIndex
CREATE INDEX "Appointment_patient_id_idx" ON "Appointment"("patient_id");

-- CreateIndex
CREATE INDEX "Appointment_doctor_id_idx" ON "Appointment"("doctor_id");

-- AddForeignKey
ALTER TABLE "PriorityAssessment" ADD CONSTRAINT "PriorityAssessment_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityAssessment" ADD CONSTRAINT "PriorityAssessment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
