"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "../ui/button";
import { CardDescription, CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";

import { CustomInput } from "../custom-input";
import { ServicesSchema } from "@/lib/validation";
import { addNewService } from "@/app/actions/admin-action";

export const AddService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof ServicesSchema>>({
    resolver: zodResolver(ServicesSchema),
    defaultValues: {
      service_name: undefined,
      price: undefined,
      description: undefined,
    },
  });

  const handleOnSubmit = async (values: z.infer<typeof ServicesSchema>) => {
    try {
      setIsLoading(true);
      const resp = await addNewService(values);

      if (resp.success) {
        toast.success("Service added successfully!");
        router.refresh();
        form.reset();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            className="text-emerald-200 bg-gray-900/60 border border-emerald-500/40 rounded-lg hover:bg-emerald-900/20 transition-colors duration-200 font-mono tracking-wide text-sm"
          >
            <Plus size={22} className="text-emerald-500 mr-2" /> Add New Service
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
          {/* Ambient glow effects */}
          <div className="absolute -top-5 right-10 w-36 h-36 bg-emerald-300/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-5 left-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
          
          {/* Minecraft-style decorative elements */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          <CardHeader className="px-0 relative z-10">
            <DialogTitle className="font-mono uppercase tracking-wider text-xl text-emerald-200">Add New Service</DialogTitle>
            <CardDescription className="text-emerald-300/80 font-mono text-sm">
              Ensure accurate readings are performed as this may affect the
              diagnosis and other medical processes.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-6 relative z-10"
            >
              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 rounded-lg border border-emerald-500/30 p-4 shadow-md backdrop-blur-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="service_name"
                  label="Service Name"
                  placeholder=""
                />
              </div>

              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 rounded-lg border border-emerald-500/30 p-4 shadow-md backdrop-blur-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="price"
                  placeholder=""
                  label="Service Price"
                />
              </div>

              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 rounded-lg border border-emerald-500/30 p-4 shadow-md backdrop-blur-sm">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="description"
                  placeholder=""
                  label="Service Description"
          
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gray-900/60 border border-emerald-500/40 hover:bg-emerald-900/30 text-emerald-200 w-full font-mono tracking-wide transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Submit</span>
                <span className="absolute inset-0 w-full h-full bg-emerald-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};