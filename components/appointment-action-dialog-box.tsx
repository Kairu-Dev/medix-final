"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Ban, Check } from "lucide-react";

import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { appointmentAction } from "@/app/actions/appointment";

import {GiConfirmed} from "react-icons/gi";
import {MdCancel} from "react-icons/md";


interface ActionsProps {
  type: "approve" | "cancel";
  id: string | number;
  disabled: boolean;
}

export const AppointmentActionDialog = ({
  type,
  id,
  disabled,
}: ActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    if (type === "cancel" && !reason) {
      toast.error("Please provide a reason for cancellation (e.g., scheduling conflict, personal emergency, or change of plans).");
      return;
    }

    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Appointment has ben ${
          type === "approve" ? "scheduled" : "cancelled"
        } on ${new Date()}`;

      const resp = await appointmentAction(
        id,
        type === "approve" ? "SCHEDULED" : "CANCELLED",
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);
        setReason("");
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!disabled}>
        {type === "approve" ? (
          <Button size="sm" variant="ghost" className="w-full justify-start text-emerald-200 hover:bg-emerald-900/50 hover:text-emerald-100 font-mono tracking-wide">
            <Check size={16} className="mr-2 text-emerald-300" /> Approve
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full flex items-center justify-start gap-2 rounded-md text-red-400 disabled:cursor-not-allowed border-red-500/30 bg-red-900/20 hover:bg-red-900/40 hover:border-red-400/50 font-mono tracking-wide"
          >
            <Ban size={16} /> Cancel
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-gray-900/95 border border-emerald-500/40 shadow-lg backdrop-blur-md p-0 rounded-xl overflow-hidden">
        <div className="relative">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Glow effects */}
          <div className="absolute -top-10 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 left-10 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col items-center justify-center py-8 px-6 relative z-10">
            <DialogTitle>
              {type === "approve" ? (
                <div className="bg-emerald-900/70 border border-emerald-400/50 p-4 rounded-full mb-4 shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                  <GiConfirmed size={50} className="text-emerald-400" />
                </div>
              ) : (
                <div className="bg-red-900/70 border border-red-400/50 p-4 rounded-full mb-4 shadow-[0_0_15px_rgba(248,113,113,0.4)]">
                  <MdCancel size={50} className="text-red-400" />
                </div>
              )}
            </DialogTitle>

            <span className="text-xl text-emerald-100 font-mono tracking-wider uppercase">
              Appointment
              {type === "approve" ? " Confirmation" : " Cancellation"}
            </span>
            <p className="text-sm text-center text-emerald-300/80 mt-2 font-mono">
              {type === "approve"
                ? "You're about to confirm this appointment. Click Yes to approve, or No to cancel."
                : "Are you sure you want to cancel this appointment?"}
            </p>

            {type == "cancel" && (
              <Textarea
                disabled={isLoading}
                className="mt-6 bg-emerald-900/30 border border-emerald-500/40 text-emerald-100 placeholder:text-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-md w-full font-mono"
                placeholder="Cancellation reason...."
                onChange={(e) => setReason(e.target.value)}
              ></Textarea>
            )}

            <div className="flex justify-center mt-6 items-center gap-x-4">
              <Button
                disabled={isLoading}
                onClick={() => handleAction()}
                variant="outline"
                className={cn(
                  "px-4 py-2 text-sm font-medium font-mono tracking-wide border rounded-md transition-colors duration-200",
                  type === "approve"
                    ? "bg-emerald-700/80 hover:bg-emerald-600/80 text-emerald-100 border-emerald-500/50 hover:border-emerald-500/70"
                    : "bg-red-700/80 hover:bg-red-600/80 text-red-100 border-red-500/50 hover:border-red-500/70"
                )}
              >
                Yes, {type === "approve" ? "Approve" : "Delete"}
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-500/50 font-mono tracking-wide rounded-md"
                >
                  No
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};