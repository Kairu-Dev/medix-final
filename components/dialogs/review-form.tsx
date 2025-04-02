"use client";

import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

import { Textarea } from "../ui/textarea";
import { createReview } from "@/app/actions/general";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
 /* eslint-disable */

// Custom Primogem component to match the RatingList aesthetic
const GenshinPrimogem = (props: { filled: boolean }) => {
  const { filled } = props;
  return (
    <svg 
      width="30" 
      height="30" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path 
        d="M12 2L15.5 8.5L22 9.5L17 14.5L18.5 21L12 18L5.5 21L7 14.5L2 9.5L8.5 8.5L12 2Z" 
        fill={filled ? "#00c2b8" : "transparent"} 
        stroke={filled ? "#00c2b8" : "#6b7280"} 
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const reviewSchema = z.object({
    patient_id: z.string(),
    staff_id: z.string(),
    rating: z.number().min(1).max(5),
    comment: z
      .string()
      .min(1, "Review must be at least 10 characters long")
      .max(500, "Review must not exceed 500 characters"),
  });

export type ReviewFormValues = z.infer<typeof reviewSchema>

export const ReviewForm = ({ staffId }: {staffId: string }) => {

    const router = useRouter()
    const user = useAuth()
    const [loading, setLoading] = useState(false)
    

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues:{
            patient_id: user?.userId as string,
            staff_id: staffId,
            rating: 1,
            comment: "",
        },
    });

    const handleSubmit = async (values: ReviewFormValues) => {
        try {
          setLoading(true);
          const response = await createReview(values);
    
          if (response.success) {
            toast.success(response.message);
            router.refresh();
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to create review");
        } finally {
          setLoading(false);
        }
      };

    return (
        <>

        <Dialog>
            <DialogTrigger asChild>

                <Button 
                size={"sm"} 
                className="px-4 py-2 rounded-lg bg-black-800 text-white hover:bg-emerald-400 hover:text-black transition-all duration-200 font-light border border-gray-800"
                >
                    <Plus className="mr-1" />Add New Review
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black-800 border border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Add New Review
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Please fill in the form below to add a new review.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"

                    
                    >
                    <FormField 
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Rating</FormLabel>
                            <FormControl>
                                 <div className="flex items-center space-x-3">
                                     {[1, 2, 3, 4, 5].map((sparkle) => (
                                         <button
                                         key={sparkle}
 
 
                                         onClick={() => field.onChange(sparkle)}
 
                                         >
 
                                         <Sparkles
                                         size={30}
                                         className={cn(
                                             sparkle <= field.value ? "text-gray-500 fill-teal-500" : "text-gray-400"
                                         )} 
                                         />
 
                                         </button>
                                     ))}
                                </div>
                            </FormControl>
                            <FormDescription className="text-gray-400">Please rate the staff based on your experience.</FormDescription>
                            <FormMessage className="text-teal-400" />

                            
                        </FormItem>
                    )}
                    />

                    <FormField 
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Comment</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Write your review here..."
                                className="bg-black-800 border border-gray-800 text-white placeholder:text-gray-500 focus:border-teal-400 hover:border-gray-700 transition-colors duration-200"
                                {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                                Please write a detailed review of your experience.
                            </FormDescription>
                            <FormMessage className="text-teal-400" />
                        </FormItem>
                    )}
                    />

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-teal-400 hover:bg-teal-500 text-black transition-all duration-200"
                    >
                        {loading ? "Submitting...." : "Submit" }
                    </Button>
                        
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        </>
    )
};