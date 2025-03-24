"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { FaQuestion } from "react-icons/fa6";
import { toast } from "sonner";
import { deleteDataById } from "@/app/actions/general";

interface ActionDialogProps {
  type: "doctor" | "staff" | "delete";
  id: string;
  data?: any;
  deleteType?: "doctor" | "staff" | "patient";
}
export const ActionDialog = ({
  id,
  data,
  type,
  deleteType,
}: ActionDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (type === "delete") {
    const handleDelete = async () => {
      try {
        setLoading(true);

        const res = await deleteDataById(id, deleteType!);

        if (res.success) {
          toast.success("Record deleted successfully");
          router.refresh();
        } else {
          toast.error("Failed to delete record");
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className="flex items-center justify-center rounded-lg border border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-1.5 transition-colors duration-200 shadow-sm"
          >
            <Trash2 size={16} className="text-red-500" />
            {deleteType === "patient" && <span className="ml-1 text-xs font-medium">Delete</span>}
          </Button>
        </DialogTrigger>

        <DialogContent className="py-6 px-3 bg-gray-900/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm">
          {/* Minecraft-style decorative elements */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Enhanced emerald glow effects */}
          <div className="absolute -top-4 right-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 left-16 w-24 h-24 bg-emerald-200/15 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col items-center justify-center z-10 relative">
            <DialogTitle>
              <div className="bg-red-900/40 p-4 rounded-full mb-3 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-sm">
                <FaQuestion size={50} className="text-red-400" />
              </div>
            </DialogTitle>

            <span className="text-xl font-semibold text-emerald-100 tracking-wide mb-2 font-mono uppercase">Delete Confirmation</span>
            <p className="text-sm text-emerald-200/80 max-w-xs text-center font-medium">
              Are you sure you want to delete the selected record?
            </p>

            <div className="flex justify-center mt-6 items-center gap-x-4">
              <DialogClose asChild>
                <Button 
                  variant={"outline"} 
                  className="px-4 py-2 bg-emerald-950/50 text-emerald-200 border border-emerald-600/30 hover:bg-emerald-800/40 transition-colors font-medium tracking-wide backdrop-blur-sm"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                disabled={loading}
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-red-900/60 text-red-200 hover:bg-red-800/70 border border-red-500/40 shadow-sm transition-all disabled:bg-gray-700/60 disabled:border-gray-500/40 disabled:text-gray-400 backdrop-blur-sm tracking-wide"
                onClick={handleDelete}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return null;
}

export default ActionDialog





{/*
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { FaQuestion } from "react-icons/fa6";
import { toast } from "sonner";
import { deleteDataById } from "@/app/actions/general";



interface ActionDialogProps {
  type: "doctor" | "staff" | "delete";
  id: string;
  data?: any;
  deleteType?: "doctor" | "staff" | "patient";
}
export const ActionDialog = ({
  id,
  data,
  type,
  deleteType,
}: ActionDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (type === "delete") {
    const handleDelete = async () => {
      try {
        setLoading(true);

        const res = await deleteDataById(id, deleteType!);

        if (res.success) {
          toast.success("Record deleted successfully");
          router.refresh();
        } else {
          toast.error("Failed to delete record");
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className="flex items-center justify-center rounded-full text-red-500"
          >
            <Trash2 size={16} className="text-red-500" />
            {deleteType === "patient" && "Delete"}
          </Button>
        </DialogTrigger>

        <DialogContent className="shad-dialog">
          <div className="flex flex-col items-center justify-center py-6">
            <DialogTitle>
              <div className="bg-red-200 p-4 rounded-full mb-2">
                <FaQuestion size={50} className="text-red-500" />
              </div>
            </DialogTitle>

            <span className="text-xl text-black">Delete Confirmation</span>
            <p className="text-sm">
              Are you sure you want to delete the selected record?
            </p>

            <div className="flex justify-center mt-6 items-center gap-x-3">
              <DialogClose asChild>
                <Button variant={"outline"} className="px-4 py-2 bg-amber-500 hover:bg-amber-800">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                disabled={loading}
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 hover:text-white"
                onClick={handleDelete}
              >
                Yes. Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return null;
}

export default ActionDialog
*/}