-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReferralUrgency" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "referral_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "referring_doctor_id" TEXT NOT NULL,
    "referred_to_doctor_id" TEXT,
    "external_doctor_name" TEXT,
    "external_facility" TEXT,
    "external_contact" TEXT,
    "referred_department" TEXT NOT NULL,
    "referral_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointment_id" INTEGER,
    "referral_type" TEXT NOT NULL,
    "reason_for_referral" TEXT NOT NULL,
    "diagnosis" TEXT,
    "symptoms" TEXT,
    "clinical_notes" TEXT,
    "medical_history" TEXT,
    "current_medications" TEXT,
    "allergies" TEXT,
    "test_results" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "urgency" "ReferralUrgency" NOT NULL DEFAULT 'ROUTINE',
    "priority_level" INTEGER,
    "follow_up_instructions" TEXT,
    "follow_up_date" TIMESTAMP(3),
    "insurance_details" TEXT,
    "authorization_number" TEXT,
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "receiving_doctor_feedback" TEXT,
    "feedback_date" TIMESTAMP(3),
    "outcome_notes" TEXT,
    "related_medical_record_id" INTEGER,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referral_number_key" ON "Referral"("referral_number");

-- CreateIndex
CREATE INDEX "Referral_patient_id_idx" ON "Referral"("patient_id");

-- CreateIndex
CREATE INDEX "Referral_referring_doctor_id_idx" ON "Referral"("referring_doctor_id");

-- CreateIndex
CREATE INDEX "Referral_referred_to_doctor_id_idx" ON "Referral"("referred_to_doctor_id");

-- CreateIndex
CREATE INDEX "Referral_appointment_id_idx" ON "Referral"("appointment_id");

-- CreateIndex
CREATE INDEX "Referral_referral_number_idx" ON "Referral"("referral_number");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referring_doctor_id_fkey" FOREIGN KEY ("referring_doctor_id") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referred_to_doctor_id_fkey" FOREIGN KEY ("referred_to_doctor_id") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_related_medical_record_id_fkey" FOREIGN KEY ("related_medical_record_id") REFERENCES "MedicalRecords"("id") ON DELETE SET NULL ON UPDATE CASCADE;
