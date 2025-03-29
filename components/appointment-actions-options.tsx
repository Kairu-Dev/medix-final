import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { EllipsisVertical, User } from "lucide-react";
import Link from "next/link";
import { AppointmentActionDialog } from "./appointment-action-dialog-box";
 /* eslint-disable */

//import { AppointmentActionDialog } from "./appointment-action-dialog";

interface ActionsProps {
  userId: string;
  status: string;
  patientId: string;
  doctorId: string;
  appointmentId: number;
}

export const AppointmentActionOptions = async ({
  userId,
  patientId,
  doctorId,
  status,
  appointmentId,
}: ActionsProps) => {
  const user = await auth();
  const isAdmin = await checkRole("ADMIN");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full p-1 border-emerald-500/50 bg-emerald-900/30 hover:bg-emerald-800/40 hover:border-emerald-400/70 transition-colors duration-200"
        >
          <EllipsisVertical size={16} className="text-emerald-300" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3 bg-gray-900/90 border border-emerald-500/40 backdrop-blur-sm shadow-[0_0_15px_rgba(52,211,153,0.3)] rounded-lg">
        <div className="space-y-3 flex flex-col items-start">
          <span className="text-emerald-400 text-xs font-mono tracking-wider uppercase">Perform Actions</span>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-emerald-200 hover:bg-emerald-900/50 hover:text-emerald-100 font-mono tracking-wide"
            asChild
          >
            <Link href={`appointments/${appointmentId}`}>
              <User size={16} className="mr-2 text-emerald-300" /> View Full Details
            </Link>
          </Button>

          {status !== "SCHEDULED" && (
            <AppointmentActionDialog
              type="approve"
              id={appointmentId}
              disabled={isAdmin || user.userId === doctorId}
            />
          )}
          <AppointmentActionDialog
            type="cancel"
            id={appointmentId}
            disabled={
              status === "PENDING" &&
              (isAdmin || user.userId === doctorId || user.userId === patientId)
            } 
          /> 
        </div>
      </PopoverContent>
    </Popover>
  );
};