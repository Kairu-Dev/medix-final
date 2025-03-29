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
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
 /* eslint-disable */

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

    const handleSubmit = async (values: ReviewFormValues) => {}

    return (
        <>

        <Dialog>
            <DialogTrigger asChild>

                <Button 
                size={"sm"} 
                className="px-4 py-2 rounded-lg bg-dark-500/10 text-black hover:bg-emerald-400 font-light"
                >
                    <Plus />Add New Review
                </Button>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>
                        Add New Review
                    </DialogTitle>
                    <DialogDescription>
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
                            <FormLabel>Rating</FormLabel>
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
                            <FormDescription>Please rate the staff based on your experience.</FormDescription>
                            <FormMessage />

                            
                        </FormItem>
                    )}
                    />

                    <FormField 
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comment</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Write your review here..."
                              
                                {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Please write a detailed review of your experience.
                            </FormDescription>
                        </FormItem>
                    )}
                    />

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Submitting...." : "Submit" }
                    </Button>
                        
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        </>
    )
};