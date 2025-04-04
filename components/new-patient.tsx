"use client"

import { useUser } from '@clerk/nextjs';
import { Patient } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form } from './ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from '@/lib/validation';
import { z } from 'zod';

import { GENDER, MARITAL_STATUS, RELATION } from '@/lib/constants';
import { Button } from './ui/button';
import { createNewPatient, updatePatient } from '@/app/actions/patient-action';
import { toast } from 'sonner';
import { CustomInput } from './custom-input';
 /* eslint-disable */

interface DataProps {
    data?: Patient;
    type: "create" | "update";
}

export const NewPatient = ({ data, type }: DataProps) => {

    const { user } = useUser()

    const [loading, setLoading] = useState(false)

    const [imgURL, setImgURL] = useState<any>();
    
    const router = useRouter()

    const userData = {
        first_name: user?.firstName || "",
        last_name: user?.lastName || "",
        email: user?.emailAddresses[0].emailAddress || "",
        phone: user?.phoneNumbers?.toString() || "",
      };

    const userId = user?.id;
    


  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
        ...userData,
        address: "",
        date_of_birth: new Date(),
        gender: "MALE",
        marital_status: "single",
        emergency_contact_name: "",
        emergency_contact_number: "",
        relation: "mother",
        blood_group: "",
        allergies: "",
        medical_conditions: "",
        insurance_number: "",
        insurance_provider: "",
        medical_history: "",
    }
  });  

  const onSubmit: SubmitHandler<z.infer<typeof PatientFormSchema>> = async(values) => {
    setLoading(true);


    const res = type === "create" ? await createNewPatient(values, userId!) : await updatePatient(values, userId!);
    setLoading(false);

    if(res?.success) {
        toast.success(res.msg);
        form.reset();
        router.push("/");

    } else {
        console.log(res);
        toast.error("Failed to create patient");
    }
  };

  useEffect(() => {
    if (type === "create") {
      userData && form.reset({ ...userData });
    } else if (type === "update") {
      data &&
        form.reset({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          date_of_birth: new Date(data.date_of_birth),
          gender: data.gender,
          marital_status: data.marital_status as
            | "married"
            | "single"
            | "divorced"
            | "widowed"
            | "separated",
          address: data.address,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_number: data.emergency_contact_number,
          relation: data.relation as
            | "mother"
            | "father"
            | "husband"
            | "wife"
            | "other",
          blood_group: data?.blood_group!,
          allergies: data?.allergies! || "",
          medical_conditions: data?.medical_conditions! || "",
          medical_history: data?.medical_history! || "",
          insurance_number: data.insurance_number! || "",
          insurance_provider: data.insurance_provider! || "",
          medical_consent: data.medical_consent,
          privacy_consent: data.privacy_consent,
          service_consent: data.service_consent,
        });
    }
  }, [user]);
  
  return (
    
    <Card className="max-w-6xl w-full p-4">
        <CardHeader>
            <CardTitle className="header">
                <h1>Patient Registration🌿</h1></CardTitle>
            <CardDescription>
                <p className="text-dark-700">Let us know more about yourself. Please provide all the required information to help us understand you better.</p>
            </CardDescription>
        </CardHeader>

        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4"> {/* space-y-8 mt-5 */}
              
                    <h2 className="sub-header"> Personal Information  </h2> {/* Fix design later */}
              
                
                        <>
                            {/* <ImagePicker />*/}

                            <div className="flex rounded-md flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
                                
                                <CustomInput 
                                
                                type="input"
                                control={form.control}
                                name="first_name"
                                placeholder="Jose"
                                label="First Name"
                                
                                
                                />

                                <CustomInput 
                                
                                type="input"
                                control={form.control}
                                name="last_name"
                                placeholder="Rizal"
                                label="Last Name"
                                
                                
                                />

                            </div>

                     
   
        

                            <div className="flex rounded-md flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">


                            <CustomInput 
                                
                                type="input"
                                control={form.control}
                                name="email"
                                placeholder="jose.rizal@gmail.com"
                                label="Email Address"
                                
                                
                                />

                            <CustomInput 
                                
                                type="input"
                                control={form.control}
                                name="phone"
                                placeholder="09458762312"
                                label="Contact Number"
                                
                                
                                />

                            </div>


                            <div className="flex rounded-md flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">

                            <CustomInput 
                                
                                type="input"
                                control={form.control}
                                name="date_of_birth"
                                placeholder="1-01-1980"
                                label="Date of Birth"
                                inputType="date"
                                
                                
                                />

                               <CustomInput 
                                
                                type="select"
                                control={form.control}
                                name="gender"
                                placeholder="Select Gender"
                                label="Gender"
                                selectList={GENDER}
                                
                                
                                />

                            </div>

                            <div className="flex rounded-md flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">

                            <CustomInput 
                                
                                type="select"
                                control={form.control}
                                name="marital_status"
                                placeholder="Select marital status"
                                label="Marital Status"
                                selectList={MARITAL_STATUS!}
                                
                                
                                />

                            <CustomInput 
                                
                                type="input"
                                control={form.control}
                                name="address"
                                placeholder="123 Street, ABC City, Philippines"
                                label="Address"
                                
                                
                                />

                            </div>

                            </>

                            <section className="space-y-6">
                            <div className="mb-9 space-y-1">
                            <h2 className="sub-header">Family Information</h2>
                           
                            <CustomInput
                            type="input"
                            control={form.control}
                            name="emergency_contact_name"
                            placeholder="Anne Smith"
                            label="Emergency contact name"
                                />
                        <CustomInput
                            type="input"
                            control={form.control}
                            name="emergency_contact_number"
                            placeholder="675444467"
                            label="Emergency contact"
                                />
                        <CustomInput
                            type="select"
                            control={form.control}
                            name="relation"
                            placeholder="Select relation with contact person"
                            label="Relation"
                            selectList={RELATION}
                                />

                            </div>    
                            </section>
                            

                            

                            <section className="space-y-6">
                            <div className="mb-9 space-y-1">
                            <h2 className="sub-header">Medical Information</h2>


                            <CustomInput
                                type="input"
                                control={form.control}
                                name="blood_group"
                                placeholder="A+"
                                label="Blood group"
                                />

                            <CustomInput
                            type="input"
                            control={form.control}
                            name="allergies"
                            placeholder="Milk"
                            label="Allergies"
                                />
                        <CustomInput
                            type="input"
                            control={form.control}
                            name="medical_conditions"
                            placeholder="Medical conditions"
                            label="Medical conditions"
                                />
                        <CustomInput
                            type="input"
                            control={form.control}
                            name="medical_history"
                            placeholder="Medical history"
                            label="Medical history"
                                />
                                        
                        </div>
                        </section>

                        <div className="mb-9 flex rounded-md flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
                     

                        <CustomInput
                            type="input"
                            control={form.control}
                            name="insurance_provider"
                            placeholder="Insurance provider"
                            label="Insurance provider"
                            />{" "}

                            <CustomInput
                            type="input"
                            control={form.control}
                            name="insurance_number"
                            placeholder="Insurance number"
                            label="Insurance number"
                            />

                            </div>
                        
    
                            {type !== "update" && (
                            <section className="space-y-8"> {/* Increased overall section spacing */}
                                <div className="mb-6"> {/* Reduced from mb-9 to mb-6 for better balance */}
                                <h2 className="sub-header mb-4">Privacy & Consent</h2> {/* Added margin after header */}
                                
                                <div className="space-y-6"> {/* Added container with consistent spacing between checkboxes */}
                                    <CustomInput
                                    name="privacy_consent"
                                    label="Privacy Policy Agreement"
                                    placeholder="I consent to the collection, storage, and use of my personal and health information as outlined in the Privacy Policy. I understand how my data will be used, who it may be shared with, and my rights regarding access, correction, and deletion of my data."
                                    type="checkbox"
                                    control={form.control}
                                    />

                                    <CustomInput
                                    control={form.control}
                                    type="checkbox"
                                    name="service_consent"
                                    label="Terms of Service Agreement"
                                    placeholder="I agree to the Terms of Service, including my responsibilities as a user of this healthcare management system, the limitations of liability, and the dispute resolution process. I understand that continued use of this service is contingent upon my adherence to these terms."
                                    />

                                    <CustomInput
                                    control={form.control}
                                    type="checkbox"
                                    name="medical_consent"
                                    label="Informed Consent for Medical Treatment"
                                    placeholder="I provide informed consent to receive medical treatment and services through this healthcare management system. I acknowledge that I have been informed of the nature, risks, benefits, and alternatives to the proposed treatments and that I have the right to ask questions and receive further information before proceeding."
                                    />
                                </div>
                                </div>
                            </section>
                            )}
            
        
                                    <Button
                                    disabled={loading}
                                    type="submit"
                                    className="shad-primary-btn w-full"
                                    >
                                    {type === "create" ? "Submit" : "Update"}
                                    </Button>
                                        

                        
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}

export default NewPatient