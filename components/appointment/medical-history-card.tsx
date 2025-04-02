import { Diagnosis, Doctor } from "@prisma/client";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { User, Calendar, FileText, Activity, Stethoscope } from "lucide-react";

interface ExtendedMedicalRecord extends Diagnosis {
  doctor: Doctor;
}

export const MedicalHistoryCard = ({
  record,
  index,
}: {
  record: ExtendedMedicalRecord;
  index: number;
}) => {
  return (
    <Card className="relative bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
      
      {/* Ambient glow effects */}
      <div className="absolute -top-10 right-10 w-28 h-28 bg-emerald-300/15 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-5 left-20 w-24 h-24 bg-emerald-200/10 rounded-full blur-3xl"></div>
      
      <div className="space-y-6 pt-4 px-6 pb-6 relative z-10">
        <div className="flex gap-x-6 justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-400/70" />
            <div>
              <span className="text-sm text-emerald-300/80 font-mono uppercase tracking-wider">Appointment ID</span>
              <p className="text-xl font-mono text-emerald-100"># {record.id}</p>
            </div>
          </div>
          
          {index === 0 && (
            <div className="px-4 py-1 text-center bg-emerald-900/60 border border-emerald-400/50 rounded-full font-mono text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)] uppercase text-xs tracking-wider">
              <span>Recent</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400/70" />
            <div>
              <span className="text-sm text-emerald-300/80 font-mono uppercase tracking-wider">Date</span>
              <p className="text-xl font-mono text-emerald-100">
                {record.created_at.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-emerald-500/30" />

        <div className="flex items-start gap-2">
          <FileText size={18} className="text-emerald-400/70 mt-1" />
          <div>
            <span className="text-sm text-emerald-300/80 font-mono uppercase tracking-wider">Diagnosis</span>
            <p className="text-lg text-emerald-100/90">{record.diagnosis}</p>
          </div>
        </div>

        <Separator className="bg-emerald-500/30" />

        <div className="flex items-start gap-2">
          <Activity size={18} className="text-emerald-400/70 mt-1" />
          <div>
            <span className="text-sm text-emerald-300/80 font-mono uppercase tracking-wider">Symptoms</span>
            <p className="text-lg text-emerald-100/90">{record.symptoms}</p>
          </div>
        </div>

        <Separator className="bg-emerald-500/30" />

        <div className="flex items-start gap-2">
          <FileText size={18} className="text-emerald-400/70 mt-1" />
          <div>
            <span className="text-sm text-emerald-300/80 font-mono uppercase tracking-wider">Additional Note</span>
            <p className="text-lg text-emerald-100/90">{record.notes || "No additional notes"}</p>
          </div>
        </div>

        <Separator className="bg-emerald-500/30" />

        <div className="flex items-start gap-2">
          <User size={18} className="text-emerald-400/70 mt-1" />
          <div>
            <span className="text-sm text-emerald-300/80 font-mono uppercase tracking-wider">Doctor</span>
            <div>
              <p className="text-lg text-emerald-100/90">
                {record.doctor.name}
              </p>
              <span className="text-emerald-300/70 font-mono text-sm">{record.doctor.specialization}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};