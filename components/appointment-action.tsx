"use client";

import { AppointmentStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";


interface ActionProps {
  id: string | number;
  status: string;
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Appointment has been ${selected.toLowerCase()} on ${new Date()}`;

      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);

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
    <div className="bg-[#0e1833] rounded-xl p-4 border border-amber-500/30 shadow-lg relative overflow-hidden">
      {/* Golden corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/70 rounded-br-xl"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]"></div>
          <h2 className="font-bold text-amber-500 tracking-wider">Appointment Status</h2>
        </div>
        
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <Button
            variant="outline"
            disabled={status === "PENDING" || isLoading || status === "COMPLETED"}
            className={`border border-amber-500/50 text-stone-900 bg-[#e6bd66] hover:bg-[#edc976] transition-all duration-300 ${selected === "PENDING" ? "ring-2 ring-amber-500" : ""}`}
            onClick={() => setSelected("PENDING")}
          >
            Pending
          </Button>
          <Button
            variant="outline"
            disabled={status === "SCHEDULED" || isLoading || status === "COMPLETED"}
            className={`border border-amber-500/50 text-slate-900 bg-[#77a0c9] hover:bg-[#86afd8] transition-all duration-300 ${selected === "SCHEDULED" ? "ring-2 ring-amber-500" : ""}`}
            onClick={() => setSelected("SCHEDULED")}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            disabled={status === "COMPLETED" || isLoading || status === "COMPLETED"}
            className={`border border-amber-500/50 text-emerald-900 bg-[#80c187] hover:bg-[#90d197] transition-all duration-300 ${selected === "COMPLETED" ? "ring-2 ring-amber-500" : ""}`}
            onClick={() => setSelected("COMPLETED")}
          >
            Completed
          </Button>
          <Button
            variant="outline"
            disabled={status === "CANCELLED" || isLoading || status === "COMPLETED"}
            className={`border border-amber-500/50 text-red-900 bg-[#e59090] hover:bg-[#f09e9e] transition-all duration-300 ${selected === "CANCELLED" ? "ring-2 ring-amber-500" : ""}`}
            onClick={() => setSelected("CANCELLED")}
          >
            Cancel
          </Button>
        </div>
        
        {selected === "CANCELLED" && (
          <div className="mt-4 bg-[#14223e] p-1 rounded-lg border border-amber-500/30">
            <Textarea
              disabled={isLoading}
              className="bg-[#0e1833] border-amber-500/30 text-amber-400 placeholder:text-amber-400/50 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter reason...."
              onChange={(e) => setReason(e.target.value)}
            ></Textarea>
          </div>
        )}

        {selected && (
          <div className="flex items-center justify-between mt-6 bg-[#14223e] p-4 rounded-lg border border-amber-500/40 relative overflow-hidden">
            <p className="text-amber-400 font-medium">Are you sure you want to perform this action?</p>
            <Button 
              disabled={isLoading} 
              type="button" 
              onClick={handleAction}
              className="bg-amber-500 hover:bg-amber-600 text-[#0e1833] font-medium border-none shadow-md hover:shadow-lg transition-all duration-300"
            >
              Yes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
















{/*
  "use client";

import { AppointmentStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";


interface ActionProps {
  id: string | number;
  status: string;
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Appointment has ben ${selected.toLowerCase()} on ${new Date()}`;

      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);

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
    <div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          disabled={status === "PENDING" || isLoading || status === "COMPLETED"}
          className="bg-yellow-200 text-black"
          onClick={() => setSelected("PENDING")}
        >
          Pending
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "SCHEDULED" || isLoading || status === "COMPLETED"
          }
          className="bg-blue-200 text-black"
          onClick={() => setSelected("SCHEDULED")}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "COMPLETED" || isLoading || status === "COMPLETED"
          }
          className="bg-emerald-200 text-black"
          onClick={() => setSelected("COMPLETED")}
        >
          Completed
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "CANCELLED" || isLoading || status === "COMPLETED"
          }
          className="bg-red-200 text-black"
          onClick={() => setSelected("CANCELLED")}
        >
          Cancel
        </Button>
      </div>
      {selected === "CANCELLED" && (
        <>
          <Textarea
            disabled={isLoading}
            className="mt-4"
            placeholder="Enter reason...."
            onChange={(e) => setReason(e.target.value)}
          ></Textarea>
        </>
      )}

      {selected && (
        <div className="flex items-center justify-between mt-6 bg-red-100 p-4 rounded">
          <p className="">Are you sure you want to perform this action?</p>
          <Button disabled={isLoading} type="button" onClick={handleAction}>
            Yes
          </Button>
        </div>
      )}
    </div>
  );
};

*/}