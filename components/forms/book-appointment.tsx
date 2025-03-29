"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AppointmentSchema } from "@/lib/validation";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { Button } from "../ui/button";
import { UserPen } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
 /* eslint-disable */

// Dummy Types
const TYPES = [
  { label: "General Consultation", value: "General Consultation " },
  { label: "General Check up", value: "General Check Up " },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Lab test", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

// Custom DraggableDialog component
const DraggableDialogContent = ({
    children,
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof DialogContent>) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const animationRef = useRef<number | undefined>(undefined);
    const lastPosition = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
  
    // Initialize dialog position to center of screen on mount
    useEffect(() => {
      if (dialogRef.current && typeof window !== "undefined") {
        const rect = dialogRef.current.getBoundingClientRect();
        const newPosition = {
          x: (window.innerWidth - rect.width) / 2,
          y: (window.innerHeight - rect.height) / 4,
        };
        setPosition(newPosition);
        lastPosition.current = newPosition;
      }
    }, []);
  
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only prevent dragging if clicking on interactive elements
      if (
        !(e.target as HTMLElement).closest('input, select, button, textarea, .form-item, .non-draggable')
      ) {
        setIsDragging(true);
        const rect = dialogRef.current?.getBoundingClientRect();
        if (rect) {
          setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
        // Cancel any ongoing animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    };
  
    const updatePosition = (clientX: number, clientY: number) => {
      const newPosition = {
        x: clientX - offset.x,
        y: clientY - offset.y,
      };
      
      // Calculate velocity for momentum
      velocity.current = {
        x: newPosition.x - lastPosition.current.x,
        y: newPosition.y - lastPosition.current.y,
      };
      
      // Update position
      setPosition(newPosition);
      lastPosition.current = newPosition;
    };
  
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Use requestAnimationFrame for smoother updates
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(() => {
        updatePosition(e.clientX, e.clientY);
      });
    };
  
    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Optional: Add momentum effect when releasing
      const applyMomentum = () => {
        // Reduce velocity gradually
        velocity.current.x *= 0.95;
        velocity.current.y *= 0.95;
        
        // Apply velocity to position
        const newPosition = {
          x: lastPosition.current.x + velocity.current.x,
          y: lastPosition.current.y + velocity.current.y,
        };
        
        setPosition(newPosition);
        lastPosition.current = newPosition;
        
        // Continue animation until velocity becomes very small
        if (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.y) > 0.1) {
          animationRef.current = requestAnimationFrame(applyMomentum);
        }
      };
      
      // Uncomment the next line if you want the momentum effect
      animationRef.current = requestAnimationFrame(applyMomentum);
    };
  
    useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseup", handleMouseUp);
        
        // Prevent text selection during drag
        document.body.style.userSelect = "none";
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        
        // Re-enable text selection
        document.body.style.userSelect = "";
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isDragging]);
  
    return (
      <DialogContent
        ref={dialogRef}
        className={`bg-black-800 rounded-xl rounded-r-2xl md:h-p-[95%] lg:h-p-[90%] w-full absolute shadow-lg ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${className || ""}`}
        style={{
          position: "fixed",
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: "none",
          maxWidth: "90vw",
          width: "500px",
          margin: 0,
          transition: isDragging ? "none" : "transform 0.05s ease-out",
        }}
        onMouseDown={handleMouseDown}
        {...props}
      >
        {children}
      </DialogContent>
    );
  };

export const BookAppointment = ({
  data,
  doctors,
}: {
  data: Patient;
  doctors: Doctor[];
}) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [physicians, setPhysicians] = useState<Doctor[] | undefined>(doctors);

  const appointmentTimes = generateTimes(8, 17, 30);

  const patientName = `${data?.first_name} ${data?.last_name}`;

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      const newData = { ...values, patient_id: data?.id! };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        router.refresh();
        toast.success("Appointment created successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white"
        >
          <UserPen size={16} /> Book Appointment
        </Button>
      </DialogTrigger>

      <DraggableDialogContent className="shad-dialog">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span>Loading...</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 remove-scrollbar">
            <DialogHeader className="dialog-header border-b pb-2 mb-2">
              <DialogTitle>Book Appointments</DialogTitle>
              <div className="text-xs text-gray-500">Drag anywhere on the background to move</div>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 mt-5 xl:mt-10 non-draggable"
              >
                <div className="w-full rounded-md border border-input bg-background px-3 py-1 flex items-center gap-4">
                  <ProfileImage
                    url={data?.img!}
                    name={patientName}
                    bgColor={data?.colorCode!}
                    className="size-16 border border-input"
                  />

                  <div>
                    <p className="font-semibold text-lg">{patientName}</p>
                    <span className="text-sm text-gray-500 capitalize">
                      {data?.gender}
                    </span>
                  </div>
                </div>

                <CustomInput
                  type="select"
                  selectList={TYPES}
                  control={form.control}
                  name="type"
                  label="Appointment Type"
                  placeholder="Select a appointment type"
                />
                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem className="form-item">
                      <FormLabel className="text-gray-400">Physician</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a physician"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark-400">
                          {physicians?.map((i, id) => (
                            <SelectItem key={id} value={i.id} className="p-2">
                              <div className="flex flex-row gap-2 p-2">
                                <ProfileImage
                                  url={i?.img!}
                                  name={i?.name}
                                  bgColor={i?.colorCode!}
                                  textClassName="text-black"
                                />
                                <div>
                                  <p className="font-medium text-start ">
                                    {i.name}
                                  </p>
                                  <span className="text-sm text-gray-600">
                                    {i?.specialization}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="appointment_date"
                    placeholder=""
                    label="Date"
                    inputType="date"
                  />
                  <CustomInput
                    type="select"
                    control={form.control}
                    name="time"
                    placeholder="Select time"
                    label="Time"
                    selectList={appointmentTimes}
                  />
                </div>

                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="note"
                  placeholder="Additional note"
                  label="Additional Note"
                  
                />

                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-blue-600 w-full"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DraggableDialogContent>
    </Dialog>
  );
};

export default BookAppointment;