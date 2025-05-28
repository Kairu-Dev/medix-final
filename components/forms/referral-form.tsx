"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ReferralStatus, ReferralUrgency } from "@prisma/client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
    /* eslint-disable */
import { Button } from "@/components/ui/button";
import { UserPlus, AlertCircle, FileHeart } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProfileImage } from "@/components/profile-image";
import { CustomInput } from "@/components/custom-input";
import { toast } from "sonner";

// Import the server actions for client-side use
import { 
  createReferral as createReferralAction, 
  getPatientById as getPatientByIdAction, 
  getDoctorById as getDoctorByIdAction, 
  getAllDoctors as getAllDoctorsAction,
  sendReferralNotification 
} from "@/utils/services/referral-utils";
import { SPECIALIZATION } from '@/utils/setting';

// Referral Types
const REFERRAL_TYPES = [
  { label: "Consultation", value: "consultation" },
  { label: "Procedure", value: "procedure" },
  { label: "Imaging", value: "imaging" },
  { label: "Laboratory Test", value: "laboratory" },
  { label: "Therapy", value: "therapy" },
  { label: "Specialist Opinion", value: "specialist_opinion" },
];

// Urgency Types
const URGENCY_TYPES = [
  { label: "Routine", value: "ROUTINE" },
  { label: "Urgent", value: "URGENT" },
  { label: "Emergency", value: "EMERGENCY" },
];

// Default departments in case the server fetch fails
const DEFAULT_DEPARTMENTS = [
  { label: "Cardiology", value: "cardiology" },
  { label: "Pulmonology", value: "pulmonology" },
  { label: "Orthopedics", value: "orthopedics" },
  { label: "Pediatrics", value: "pediatrics" },
  { label: "Radiology", value: "radiology" },
  { label: "Oncology", value: "oncology" },
  { label: "Dermatology", value: "dermatology" },
  { label: "General Surgery", value: "general_surgery" },
  // ADDED - Missing from original DEFAULT_DEPARTMENTS
  { label: "Emergency", value: "emergency" },
  { label: "Urgent Care", value: "urgent_care" },
  { label: "Neurology", value: "neurology" },
  { label: "Gastroenterology", value: "gastroenterology" },
  { label: "ENT", value: "ent" },
  { label: "Endocrinology", value: "endocrinology" },
  { label: "General Practice", value: "general_practice" },
  { label: "Psychiatry", value: "psychiatry" },
  { label: "Ophthalmology", value: "ophthalmology" },
  { label: "Urology", value: "urology" },
  { label: "Gynecology", value: "gynecology" },
];


export const ReferralForm = ({
  patientId,
  doctorId
}: {
  patientId: string;
  doctorId: string;
}) => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [externalReferral, setExternalReferral] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  

  // Debug the props
  useEffect(() => {
    console.log("ReferralForm received patientId:", patientId);
    console.log("ReferralForm received doctorId:", doctorId);
  }, [patientId, doctorId]);

  

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Validate inputs before making API calls
        if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
          throw new Error("Invalid patient ID provided");
        }
        
        if (!doctorId || typeof doctorId !== 'string' || doctorId.trim() === '') {
          throw new Error("Invalid doctor ID provided");
        }
      
        // Use the server actions to fetch data - REMOVED departmentsResponse
        const [patientResponse, doctorResponse, doctorsResponse] = await Promise.all([
          getPatientByIdAction(patientId.trim()),
          getDoctorByIdAction(doctorId.trim()),
          getAllDoctorsAction()
        ]);
      
        if (patientResponse.success) {
          setPatient(patientResponse.data);
        } else {
          console.error("Failed to load patient data:", patientResponse.message);
          toast.error(`Failed to load patient data: ${patientResponse.message}`);
          setError(`Patient error: ${patientResponse.message}`);
        }
        
        if (doctorResponse.success) {
          setCurrentDoctor(doctorResponse.data);
        } else {
          console.error("Failed to load doctor data:", doctorResponse.message);
          toast.error(`Failed to load doctor data: ${doctorResponse.message}`);
          setError((prev) => `${prev ? prev + '; ' : ''}Doctor error: ${doctorResponse.message}`);
        }
        
        if (doctorsResponse.success && doctorsResponse.data) {
          setDoctors(doctorsResponse.data);
        } else {
          console.error("Failed to load doctors list:", doctorsResponse.message);
          toast.error(`Failed to load doctors list: ${doctorsResponse.message}`);
          setDoctors([]);
        }
        
        // Set departments directly from SPECIALIZATION array
        const uniqueDepartments = [...new Set(SPECIALIZATION.map(spec => spec.department))];
        const departmentOptions = uniqueDepartments.map(department => ({
          label: department,
          value: department.toLowerCase().replace(/\s+/g, '_')
        }));
        setDepartments(departmentOptions);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error loading data:", errorMessage);
        toast.error(`Failed to load required data: ${errorMessage}`);
        setError(errorMessage);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [patientId, doctorId]);
  
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...';
  
    const form = useForm({
      defaultValues: {
        referring_doctor_id: doctorId,
        referred_department: "",
        referral_type: "",
        reason_for_referral: "",
        status: ReferralStatus.PENDING,
        urgency: ReferralUrgency.ROUTINE,
        // Add all additional fields you're using in the form
        referred_to_doctor_id: undefined as string | undefined,
        external_doctor_name: undefined as string | undefined,
        external_facility: undefined as string | undefined,
        external_contact: undefined as string | undefined,
        diagnosis: undefined as string | undefined,
        symptoms: undefined as string | undefined,
        clinical_notes: undefined as string | undefined,
        medical_history: undefined as string | undefined,
        current_medications: undefined as string | undefined, 
        allergies: undefined as string | undefined,
        test_results: undefined as string | undefined,
        follow_up_instructions: undefined as string | undefined,
        follow_up_date: undefined as string | undefined,
        insurance_details: undefined as string | undefined,
        authorization_number: undefined as string | undefined,
        special_instructions: undefined as string | undefined
      }
    });
  
 // Modified onSubmit function to generate a new referral number before submission
 const onSubmit: SubmitHandler<any> = async (values) => {
  try {
    setIsSubmitting(true);
    
    // Validate patientId before submitting
    if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
      throw new Error("Valid patient ID is required");
    }
    
    // Generate a new unique referral number at submission time
    const uniqueReferralNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`;
    
    // Add patient_id and new referral number to the form data
    const referralData = {
      ...values,
      referral_number: uniqueReferralNumber,
      patient_id: patientId.trim()
    };
    
    // Use the createReferral utility function
    const result = await createReferralAction(referralData);
    
    if (result.success) {
      // Send referral email to patient
      if (patient?.email) {
        const referredDoctor = externalReferral 
          ? values.external_doctor_name 
          : doctors.find(doc => doc.id === values.referred_to_doctor_id)?.name || 'Specialist';
        
        const emailNotificationData = {
          patientEmail: patient.email,
          patientName: `${patient.first_name} ${patient.last_name}`,
          referringDoctorName: currentDoctor?.name || 'Your Doctor',
          referredDoctorName: referredDoctor,
          referredDepartment: departments.find(dept => dept.value === values.referred_department)?.label || values.referred_department,
          referralType: REFERRAL_TYPES.find(type => type.value === values.referral_type)?.label || values.referral_type,
          urgency: URGENCY_TYPES.find(urgency => urgency.value === values.urgency)?.label || values.urgency,
          reasonForReferral: values.reason_for_referral,
          referralNumber: uniqueReferralNumber,
          appointmentInstructions: externalReferral 
            ? `Please contact ${values.external_facility || 'the external facility'} at ${values.external_contact || 'the provided contact information'} to schedule your appointment.`
            : undefined
        };

        try {
          await sendReferralNotification(emailNotificationData);
          toast.success("Referral created and notification email sent successfully!");
        } catch (emailError) {
          console.error("Failed to send referral email:", emailError);
          toast.success("Referral created successfully, but email notification failed to send.");
        }
      } else {
        toast.success("Referral created successfully!");
      }
      
      form.reset();
      router.refresh();
    } else {
      toast.error(result.message || "Failed to create referral");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    console.error(errorMessage);
    toast.error(`Error: ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};

    const toggleExternalReferral = () => {
      setExternalReferral(!externalReferral);
      // Clear the related fields when toggling
      if (!externalReferral) {
        form.setValue("referred_to_doctor_id", undefined);
      } else {
        form.setValue("external_doctor_name", undefined);
        form.setValue("external_facility", undefined);
        form.setValue("external_contact", undefined);
      }
    };
    //dOESNT HAVE DESIGN YET
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-800 to-emerald-900 text-emerald-100 border border-emerald-500/50 hover:bg-emerald-800 transition-colors duration-200 shadow-md hover:shadow-emerald-500/30 relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-emerald-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            <UserPlus className="mr-2" size={16} /> Create Referral
          </Button>
        </DialogTrigger>
    
        <DialogContent className="max-h-[90vh] overflow-hidden bg-gray-900 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 rounded-xl backdrop-blur-sm">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Glow effects */}
          <div className="absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
    
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="size-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
                <span className="text-emerald-300">Loading patient and doctor data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <AlertCircle className="text-red-400 mb-4" size={48} />
              <h3 className="text-lg font-bold text-red-400 mb-2">Error Loading Data</h3>
              <p className="text-gray-300 text-center">{error}</p>
              <div className="mt-4 p-3 bg-gray-800/50 rounded-md w-full border border-red-500/30">
                <p className="text-sm font-medium mb-2 text-emerald-400">Debug Information:</p>
                <p className="text-xs font-mono mb-1 text-emerald-300">Patient ID: {patientId || "undefined"}</p>
                <p className="text-xs font-mono text-emerald-300">Doctor ID: {doctorId || "undefined"}</p>
              </div>
            </div>
          ) : (
            <div className="h-full remove-scrollbar overflow-y-auto p-4 max-h-[85vh] relative">
              <DialogHeader className="dialog-header border-b pb-2 mb-2 border-emerald-500/40">
                <DialogTitle className="text-emerald-300 flex items-center gap-2">
                  <FileHeart size={20} className="text-emerald-400" />
                  <span className="font-semibold tracking-wide">Create Patient Referral</span>
                </DialogTitle>
              </DialogHeader>
    
              {patient && currentDoctor ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 mt-4"
                  >
                    {/* Patient Info Section */}
                    <div className="w-full rounded-md border border-emerald-500/30 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 px-3 py-2 flex items-center gap-4 shadow-md">
                      <ProfileImage
                        url={patient?.img}
                        name={patientName}
                        bgColor={patient?.colorCode}
                        className="size-16 border border-emerald-500/50 shadow-md shadow-emerald-500/20"
                      />
    
                      <div>
                        <p className="font-semibold text-lg text-emerald-100">{patientName}</p>
                        <div className="flex gap-4 text-sm text-emerald-300">
                          <span className="capitalize">{patient?.gender}</span>
                          <span>DOB: {new Date(patient?.date_of_birth).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
    
                    {/* Referring Doctor Info */}
                    <div className="w-full rounded-md border border-emerald-500/30 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 px-3 py-2 shadow-md relative overflow-hidden">
                      <div className="absolute -right-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                      <h3 className="text-sm font-medium text-emerald-400 mb-2">Referring Physician</h3>
                      <div className="flex items-center gap-3">
                        <ProfileImage
                          url={currentDoctor?.img}
                          name={currentDoctor?.name}
                          bgColor={currentDoctor?.colorCode}
                          className="size-10 border border-emerald-500/50 shadow-md shadow-emerald-500/20"
                        />
                        <div>
                          <p className="font-medium text-emerald-100">{currentDoctor?.name}</p>
                          <p className="text-xs text-emerald-300">{currentDoctor?.specialization}</p>
                        </div>
                      </div>
                    </div>
    
                    {/* Basic Referral Information */}
                    <div className="space-y-4 border rounded-md p-3 border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 shadow-md backdrop-blur-sm relative">
                      <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                      <h3 className="text-sm font-medium text-emerald-400 font-mono tracking-wide uppercase">Referral Information</h3>
                      
                      <div className="flex gap-2">
                        <CustomInput
                          type="select"
                          selectList={REFERRAL_TYPES}
                          control={form.control}
                          name="referral_type"
                          label="Referral Type"
                          placeholder="Select referral type"
                        />
                        
                        <CustomInput
                          type="select"
                          selectList={URGENCY_TYPES}
                          control={form.control}
                          name="urgency"
                          label="Urgency Level"
                          placeholder="Select urgency"
                        />
                      </div>
    
                      <CustomInput
                        type="select"
                        selectList={departments}
                        control={form.control}
                        name="referred_department"
                        label="Department"
                        placeholder="Select department"
                      />
    
                      {/* Toggle between internal and external referral */}
                      <div className="flex items-center">
                        <Button 
                          type="button"
                          variant={externalReferral ? "outline" : "default"}
                          size="sm"
                          className={`rounded-r-none ${!externalReferral ? 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-500/70 shadow-md shadow-emerald-500/20' : 'border-emerald-500 text-emerald-400'}`}
                          onClick={() => externalReferral && toggleExternalReferral()}
                        >
                          Internal Referral
                        </Button>
                        <Button 
                          type="button"
                          variant={!externalReferral ? "outline" : "default"}
                          size="sm"
                          className={`rounded-l-none ${externalReferral ? 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-500/70 shadow-md shadow-emerald-500/20' : 'border-emerald-500 text-emerald-400'}`}
                          onClick={() => !externalReferral && toggleExternalReferral()}
                        >
                          External Referral
                        </Button>
                      </div>
    
                      {/* Conditional rendering based on referral type */}
                      {externalReferral ? (
                        <div className="space-y-3">
                          <CustomInput
                            type="input"
                            control={form.control}
                            name="external_doctor_name"
                            label="External Doctor Name"
                            placeholder="Enter doctor's name"
                          />
                          <CustomInput
                            type="input"
                            control={form.control}
                            name="external_facility"
                            label="External Facility/Hospital"
                            placeholder="Enter facility name"
                          />
                          <CustomInput
                            type="input"
                            control={form.control}
                            name="external_contact"
                            label="Contact Information"
                            placeholder="Enter contact details"
                          />
                        </div>
                      ) : (
                        <FormField
                          control={form.control}
                          name="referred_to_doctor_id"
                          render={({ field }) => {
                            // Create state to track department changes
                            const [selectedDept, setSelectedDept] = useState(form.getValues("referred_department"));
                            
                            // Watch the department value only
                            const watchedDepartment = form.watch("referred_department");
                            
                            // Effect runs when the watched department changes
                            useEffect(() => {
                              if (watchedDepartment !== selectedDept) {
                                // Update our local state
                                setSelectedDept(watchedDepartment);
                                
                                // If we have a doctor selected, clear it
                                if (field.value) {
                                  // Use setTimeout to break the call stack cycle
                                  setTimeout(() => {
                                    form.setValue('referred_to_doctor_id', undefined);
                                  }, 0);
                                }
                              }
                            }, [watchedDepartment, selectedDept, field.value]);
                            
                            // Filter doctors based on current department
                            const filteredDoctors = doctors
                              .filter(doc => doc.id !== currentDoctor.id)
                              .filter(doc => {
                                // If no department selected, show all doctors
                                if (!selectedDept) return true;
                                
                                // Find the department label from the selected value
                                const selectedDeptObj = departments.find(dept => dept.value === selectedDept);
                                const selectedDeptName = selectedDeptObj?.label || "";
                                
                                // Convert doctor's specialization to lowercase for comparison
                                const doctorSpecLower = doc.specialization?.toLowerCase();
                                
                                // Find matching specialization entry
                                const doctorSpecObj = SPECIALIZATION.find(spec => 
                                  spec.value === doctorSpecLower
                                );
                                
                                // Check if doctor's specialization belongs to selected department
                                return doctorSpecObj?.department === selectedDeptName;
                              });
                            
                            return (
                              <FormItem>
                                <FormLabel className="text-emerald-300">
                                  Referred To Doctor
                                </FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto remove-scrollbar border rounded-md border-emerald-500/40 p-2 bg-gray-900/60 backdrop-blur-sm">
                                  {selectedDept && filteredDoctors.length === 0 ? (
                                    <div className="col-span-2 py-8 text-center text-emerald-300">
                                      No doctors available in this department
                                    </div>
                                  ) : (
                                    filteredDoctors.map((doctor) => (
                                      <div 
                                        key={doctor.id}
                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                          field.value === doctor.id 
                                            ? 'bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 border border-emerald-500/50 shadow-md shadow-emerald-500/20' 
                                            : 'border border-emerald-500/30 hover:bg-emerald-900/40'
                                        }`}
                                        onClick={() => form.setValue('referred_to_doctor_id', doctor.id)}
                                      >
                                        <ProfileImage
                                          url={doctor?.img}
                                          name={doctor?.name}
                                          bgColor={doctor?.colorCode}
                                          className="size-8 border border-emerald-500/30"
                                        />
                                        <div className="overflow-hidden">
                                          <p className="font-medium text-sm text-emerald-100 truncate">{doctor.name}</p>
                                          <p className="text-xs text-emerald-300 truncate">{doctor.specialization}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            );
                          }}
                        />
                      )}
                    </div>
    
                    {/* Clinical Information */}
                    <div className="space-y-4 border rounded-md p-3 border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 shadow-md backdrop-blur-sm relative">
                      <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                      <h3 className="text-sm font-medium text-emerald-400 font-mono tracking-wide uppercase">Clinical Information</h3>
                      
                      <CustomInput
                        type="textarea"
                        control={form.control}
                        name="reason_for_referral"
                        label="Reason for Referral"
                        placeholder="Describe the primary reason for this referral"
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomInput
                          type="input"
                          control={form.control}
                          name="diagnosis"
                          label="Diagnosis (if known)"
                          placeholder="Enter current diagnosis"
                        />
                        
                        <CustomInput
                          type="textarea"
                          control={form.control}
                          name="symptoms"
                          label="Current Symptoms"
                          placeholder="Describe current symptoms"
                        />
                      </div>
                      
                      <CustomInput
                        type="textarea"
                        control={form.control}
                        name="clinical_notes"
                        label="Clinical Notes"
                        placeholder="Enter relevant clinical notes"
                      />
                    </div>
    
                    {/* Additional Information */}
                    <div className="space-y-4 border rounded-md p-3 border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 shadow-md backdrop-blur-sm relative">
                      <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                      <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-1 font-mono tracking-wide uppercase">
                        <AlertCircle size={16} className="text-emerald-400" />
                        Additional Information
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomInput
                          type="textarea"
                          control={form.control}
                          name="medical_history"
                          label="Relevant Medical History"
                          placeholder="Enter relevant history"
                        />
                        
                        <CustomInput
                          type="textarea"
                          control={form.control}
                          name="current_medications"
                          label="Current Medications"
                          placeholder="List current medications"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomInput
                          type="textarea"
                          control={form.control}
                          name="allergies"
                          label="Allergies"
                          placeholder="List known allergies"
                        />
                        
                        <CustomInput
                          type="textarea"
                          control={form.control}
                          name="test_results"
                          label="Relevant Test Results"
                          placeholder="Enter test results"
                        />
                      </div>
                    </div>
    
                    {/* Follow-up Information */}
                    <div className="space-y-4 border rounded-md p-3 border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 shadow-md backdrop-blur-sm relative">
                      <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                      <h3 className="text-sm font-medium text-emerald-400 font-mono tracking-wide uppercase">Follow-up & Administrative Details</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomInput
                          type="textarea"
                          control={form.control}
                          name="follow_up_instructions"
                          label="Follow-up Instructions"
                          placeholder="Enter any follow-up instructions"
                        />
                        
                        <CustomInput
                          type="input"
                          control={form.control}
                          name="follow_up_date"
                          label="Follow-up Date (if applicable)"
                          inputType="date"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomInput
                          type="input"
                          control={form.control}
                          name="insurance_details"
                          label="Insurance Details"
                          placeholder="Enter insurance information"
                        />
                        
                        <CustomInput
                          type="input"
                          control={form.control}
                          name="authorization_number"
                          label="Authorization Number"
                          placeholder="Enter authorization number"
                        />
                      </div>
                      
                      <CustomInput
                        type="textarea"
                        control={form.control}
                        name="special_instructions"
                        label="Special Instructions"
                        placeholder="Enter any special instructions"
                      />
                    </div>
    
                    {/* Submit Button */}
                    <Button
                      disabled={isSubmitting || !form.formState.isValid}
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-medium py-2 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="absolute inset-0 w-full h-full bg-emerald-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            Creating Referral...
                          </>
                        ) : (
                          <>Submit Referral</>
                        )}
                      </span>
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-red-400">Could not load required data. Please try again later.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
};
export default ReferralForm;