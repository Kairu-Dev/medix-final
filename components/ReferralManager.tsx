// IMPROVEMENTS WOULD BE TO ALLOW THE REFERRED DOCTOR TO BE ABLE TO PROVIDE FEED BACK RESPONSE BACK TO THE REFERRING DOCTOR
// AND TO ALLOW THE REFERRING DOCTOR TO BE ABLE TO VIEW THE FEEDBACK RESPONSE (LATER UPDATE IN A NEW PATCH IF WE HAVE TIME)


"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getDoctorReferrals as getDoctorReferralsAction,
  updateReferralStatus  
} from "@/utils/services/referral-utils";
    /* eslint-disable */
// Shadcn components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileImage } from "@/components/profile-image";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Icons
import { 
  Search, 
  FileHeart, 
  ChevronDown, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRightCircle,
  RefreshCw,
  LucideIcon,
  FileUp,
  FileDown,
  FilePlus
} from "lucide-react";

// Types
import { ReferralStatus, ReferralUrgency } from "@prisma/client";

// Define type for referral data
// Update the interface definitions to accept null values
interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    img?: string | null;      // Changed to accept null
    colorCode?: string | null; // Changed to accept null
  }
  
  interface Doctor {
    id: string;
    name: string;
    img?: string | null;      // Changed to accept null
    colorCode?: string | null; // Changed to accept null
    specialization?: string;
  }
  
  interface Referral {
    follow_up_date: React.JSX.Element;
    authorization_number: React.JSX.Element;
    external_contact: React.JSX.Element;
    diagnosis: React.JSX.Element;
    symptoms: React.JSX.Element;
    clinical_notes: React.JSX.Element;
    medical_history: React.JSX.Element;
    current_medications: React.JSX.Element;
    allergies: React.JSX.Element;
    test_results: React.JSX.Element;
    insurance_details: React.JSX.Element;
    special_instructions: React.JSX.Element;
    follow_up_instructions: React.JSX.Element;
    id: number;
    referral_number: string;
    patient_id: string;
    patient: Patient;
    referring_doctor_id: string;
    referring_doctor: Doctor;
    referred_to_doctor_id?: string | null;
    referred_to_doctor?: Doctor | null; // Added null possibility
    external_doctor_name?: string;
    external_facility?: string;
    referral_date: string;
    referred_department: string;
    referral_type: string;
    reason_for_referral: string;
    status: ReferralStatus;
    urgency: ReferralUrgency;
    created_at: string;
    updated_at: string;
  }

// Define types for configuration objects
type StatusConfigType = {
  [key in ReferralStatus]: {
    color: string;
    icon: LucideIcon;
    label: string;
  }
};

type UrgencyConfigType = {
  [key in ReferralUrgency]: {
    color: string;
    label: string;
  }
};

const STATUS_CONFIG: StatusConfigType = {
  PENDING: { 
    color: "text-amber-200 bg-amber-900/40 border-amber-500/30", 
    icon: HelpCircle,
    label: "Pending" 
  },
  ACCEPTED: { 
    color: "text-emerald-200 bg-emerald-900/40 border-emerald-500/30", 
    icon: CheckCircle2,
    label: "Accepted" 
  },
  REJECTED: { 
    color: "text-rose-200 bg-rose-900/40 border-rose-500/30", 
    icon: XCircle,
    label: "Rejected" 
  },
  COMPLETED: { 
    color: "text-sky-200 bg-sky-900/40 border-sky-500/30", 
    icon: CheckCircle2, 
    label: "Completed"
  },
  CANCELLED: { 
    color: "text-slate-200 bg-slate-900/40 border-slate-500/30", 
    icon: XCircle,
    label: "Cancelled" 
  }
};

const URGENCY_CONFIG: UrgencyConfigType = {
  ROUTINE: { 
    color: "text-teal-200 bg-teal-900 border-teal-600/30", 
    label: "Routine" 
  },
  URGENT: { 
    color: "text-amber-200 bg-amber-900/60 border-amber-600/40", 
    label: "Urgent" 
  },
  EMERGENCY: { 
    color: "text-rose-200 bg-rose-900/70 border-rose-600/50", 
    label: "Emergency" 
  }
};

// ReferralManager component
// ReferralManager component
export const ReferralManager = ({ doctorId }: { doctorId: string }) => {
  console.log('🚀 ReferralManager initializing with doctorId:', doctorId);
  
  const [activeTab, setActiveTab] = useState("sent");
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load referrals when component mounts or doctorId changes
  useEffect(() => {
    const fetchReferrals = async () => {
      console.log("🔄 Fetching referrals for doctor:", doctorId);
      setLoading(true);
      
      try {
        if (!doctorId) {
          console.error("❌ No doctor ID provided");
          toast.error("Unable to load referrals: Missing doctor ID");
          return;
        }

        const result = await getDoctorReferralsAction(doctorId);
        console.log("📊 Raw API response:", result);
        
        if (result.success && result.data) {
          console.log(`✅ Successfully fetched ${result.data.length} referrals`);
          
          // Log the structure of the first referral if available
          if (result.data.length > 0) {
            console.log("📋 First referral data structure:", JSON.stringify(result.data[0], null, 2));
            
            // Specifically log external doctor information for all referrals
            const externalDoctorReferrals = result.data.filter((ref: any) => 
              ref.external_doctor_name || ref.external_facility
            );
            
            if (externalDoctorReferrals.length > 0) {
              console.log(`🏥 Found ${externalDoctorReferrals.length} referrals with external doctor information:`);
              externalDoctorReferrals.forEach((ref: any, index: number) => {
                console.log(`External Doctor #${index + 1}:`, {
                  referral_id: ref.id,
                  referral_number: ref.referral_number,
                  external_doctor_name: ref.external_doctor_name,
                  external_facility: ref.external_facility,
                  has_referred_to_doctor: !!ref.referred_to_doctor,
                  complete_data: {
                    external_doctor_name: ref.external_doctor_name,
                    external_facility: ref.external_facility,
                    referred_department: ref.referred_department,
                    referral_type: ref.referral_type,
                    status: ref.status,
                    urgency: ref.urgency
                  }
                });
              });
            } else {
              console.log("ℹ️ No referrals with external doctor information found");
            }
          }
          
          // Check for missing/null values in key fields
          const referralsWithIssues = result.data.filter((ref: any) => {
            return !ref.patient || !ref.patient.first_name || !ref.patient.last_name || 
                   !ref.referring_doctor || !ref.status || !ref.urgency;
          });
          
          if (referralsWithIssues.length > 0) {
            console.warn(`⚠️ Found ${referralsWithIssues.length} referrals with missing critical data:`, 
              referralsWithIssues);
          }
          
          const mappedReferrals = result.data.map((referral: any) => ({
            ...referral,
            external_doctor_name: referral.external_doctor_name ?? undefined,
          }));
          
          console.log("🔄 Mapped referrals:", mappedReferrals);
          setReferrals(mappedReferrals);
        } else {
          console.error("❌ Failed to fetch referrals:", result.message);
          toast.error(`Failed to load referrals: ${result.message}`);
        }
      } catch (error) {
        console.error("❌ Error fetching referrals:", error);
        toast.error("An error occurred while loading referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [doctorId]);

  // Filter referrals based on active tab, search term, and filters
  useEffect(() => {
    console.log("🔍 Filtering referrals with:", { 
      activeTab, 
      searchTerm, 
      statusFilter, 
      urgencyFilter 
    });
    
    if (!referrals.length) {
      console.log("ℹ️ No referrals to filter");
      setFilteredReferrals([]);
      return;
    }

    console.log(`📊 Starting with ${referrals.length} total referrals`);

    // Filter by tab (sent or received)
    let filtered = referrals.filter(referral => 
      activeTab === "sent" 
        ? referral.referring_doctor_id === doctorId 
        : referral.referred_to_doctor_id === doctorId
    );

    console.log(`📊 After tab filter: ${filtered.length} referrals`);
    
    // Log the first few filtered referrals
    console.log(`📋 First few ${activeTab} referrals:`, 
      filtered.slice(0, 2).map(r => ({
        id: r.id,
        referring_doctor_id: r.referring_doctor_id,
        referred_to_doctor_id: r.referred_to_doctor_id,
        patient_name: r.patient ? `${r.patient.first_name} ${r.patient.last_name}` : 'Missing patient data',
        status: r.status,
        urgency: r.urgency
      }))
    );

  // Check for missing doctor data or external doctor info
    const missingDoctorData = filtered.filter(r => 
      (activeTab === "sent" && (!r.referred_to_doctor && !r.external_doctor_name)) || 
      (activeTab === "received" && !r.referring_doctor)
    );

    if (missingDoctorData.length > 0) {
      console.warn(`⚠️ Found ${missingDoctorData.length} referrals with missing doctor data in ${activeTab} tab`);
    }
    
    // Analyze external doctor data specifically
    const externalDoctorReferrals = filtered.filter(r => r.external_doctor_name || r.external_facility);
    if (externalDoctorReferrals.length > 0) {
      console.log(`🏥 ${activeTab} tab contains ${externalDoctorReferrals.length} referrals with external doctor info`);
      
      // Log any potential issues with external doctor data
      const incompleteExternalData = externalDoctorReferrals.filter(r => 
        !r.external_doctor_name || (r.referred_to_doctor && r.external_doctor_name)
      );
      
      if (incompleteExternalData.length > 0) {
        console.warn(`⚠️ Found ${incompleteExternalData.length} referrals with problematic external doctor data:`, 
          incompleteExternalData.map(r => ({
            id: r.id,
            external_doctor_name: r.external_doctor_name || 'MISSING',
            has_referred_to_doctor: !!r.referred_to_doctor,
            external_facility: r.external_facility || 'MISSING'
          }))
        );
      }
    }

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(referral => 
        referral.referral_number?.toLowerCase().includes(searchLower) ||
        referral.patient?.first_name?.toLowerCase().includes(searchLower) ||
        referral.patient?.last_name?.toLowerCase().includes(searchLower) ||
        `${referral.patient?.first_name} ${referral.patient?.last_name}`.toLowerCase().includes(searchLower) ||
        referral.referred_department?.toLowerCase().includes(searchLower) ||
        (activeTab === "sent" && referral.referred_to_doctor?.name?.toLowerCase().includes(searchLower)) ||
        (activeTab === "received" && referral.referring_doctor?.name?.toLowerCase().includes(searchLower))
      );
      console.log(`📊 After search filter: ${filtered.length} referrals`);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(referral => referral.status === statusFilter);
      console.log(`📊 After status filter (${statusFilter}): ${filtered.length} referrals`);
    }

    // Urgency filter
    if (urgencyFilter !== "all") {
      filtered = filtered.filter(referral => referral.urgency === urgencyFilter);
      console.log(`📊 After urgency filter (${urgencyFilter}): ${filtered.length} referrals`);
    }

    console.log(`📊 Final filtered result: ${filtered.length} referrals`);
    setFilteredReferrals(filtered);
  }, [referrals, activeTab, searchTerm, statusFilter, urgencyFilter, doctorId]);

  // Handle refresh button click
  const handleRefresh = async () => {
    console.log("🔄 Refreshing referrals data");
    setLoading(true);
    try {
      const result = await getDoctorReferralsAction(doctorId);
      console.log("📊 Refresh API response:", result);
      
      if (result.success && result.data) {
        console.log(`✅ Refreshed: Fetched ${result.data.length} referrals`);
        
        const mappedReferrals = result.data.map((referral: any) => ({
          ...referral,
          external_doctor_name: referral.external_doctor_name ?? undefined,
        }));
        
        setReferrals(mappedReferrals);
        toast.success("Referrals refreshed successfully");
      } else {
        console.error("❌ Failed to refresh referrals:", result.message);
        toast.error(`Failed to refresh referrals: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error refreshing referrals:", error);
      toast.error("An error occurred while refreshing referrals");
    } finally {
      setLoading(false);
    }
  };

  // View referral details
  const viewReferralDetails = (referralId: number) => {
    console.log("👁️ Viewing referral details:", referralId);
    // Find the referral by ID
    const referral = referrals.find(r => r.id === referralId);
    if (referral) {
      setSelectedReferral(referral);
      setDialogOpen(true);
    } else {
      console.error(`❌ Could not find referral with ID: ${referralId}`);
      toast.error("Could not find referral details");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) {
      console.warn("⚠️ Attempted to format undefined/null date");
      return "N/A";
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Helper function to safely get status config
  const getStatusConfig = (status: ReferralStatus) => {
    // Ensure the status is a valid key in STATUS_CONFIG
    if (Object.keys(STATUS_CONFIG).includes(status)) {
      return STATUS_CONFIG[status];
    }
    // Fallback if status is not found
    console.warn(`⚠️ Unknown status value: ${status}`);
    return {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: HelpCircle,
      label: status
    };
  };

  // Helper function to safely get urgency config
  const getUrgencyConfig = (urgency: ReferralUrgency) => {
    // Ensure the urgency is a valid key in URGENCY_CONFIG
    if (Object.keys(URGENCY_CONFIG).includes(urgency)) {
      return URGENCY_CONFIG[urgency];
    }
    // Fallback if urgency is not found
    console.warn(`⚠️ Unknown urgency value: ${urgency}`);
    return {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      label: urgency
    };
  };

  // Log re-renders for performance monitoring
  console.log(`🔄 ReferralManager re-rendering with ${filteredReferrals.length} filtered referrals`);

  const handleAcceptReferral = async (referralId: number) => {
    console.log("✅ Accepting referral:", referralId);
    
    try {
      setLoading(true);
      const result = await updateReferralStatus(referralId.toString(), "ACCEPTED");
      
      if (result.success) {
        toast.success("Referral accepted successfully");
        
        // Update the referral in the local state
        const updatedReferrals = referrals.map(ref => 
          ref.id === referralId ? { ...ref, status: "ACCEPTED" as ReferralStatus } : ref
        );
        setReferrals(updatedReferrals);
        
        // Close the dialog
        setDialogOpen(false);
      } else {
        console.error("❌ Failed to accept referral:", result.message);
        toast.error(`Failed to accept referral: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error accepting referral:", error);
      toast.error("An error occurred while accepting the referral");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReferral = async (referralId: number) => {
    console.log("❌ Rejecting referral:", referralId);
    
    try {
      setLoading(true);
      const result = await updateReferralStatus(referralId.toString(), "REJECTED");
      
      if (result.success) {
        toast.success("Referral rejected successfully");
        
        // Update the referral in the local state
        const updatedReferrals = referrals.map(ref => 
          ref.id === referralId ? { ...ref, status: "REJECTED" as ReferralStatus } : ref
        );
        setReferrals(updatedReferrals);
        
        // Close the dialog
        setDialogOpen(false);
      } else {
        console.error("❌ Failed to reject referral:", result.message);
        toast.error(`Failed to reject referral: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error rejecting referral:", error);
      toast.error("An error occurred while rejecting the referral");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="py-6 px-3 2xl:px-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm">
      {/* Minecraft-style decorative elements */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
      
      {/* Enhanced emerald glow effects */}
      <div className="absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
      
      <div className="flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
            <FileHeart className="text-emerald-400" size={24} />
            <h1 className="text-xl font-bold text-emerald-100 font-mono tracking-wide">
              Referral Management
            </h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <Tabs 
          defaultValue="sent" 
          value={activeTab}
          onValueChange={(value) => {
            console.log(`🔄 Changing tab to: ${value}`);
            setActiveTab(value);
          }}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="bg-emerald-950/50 p-1 border border-emerald-500/30 rounded-lg shadow-sm">
              <TabsTrigger 
                value="sent"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md px-6 py-2 transition-all duration-200 text-emerald-200"
              >
                <FileUp size={16} className="mr-2" />
                Referrals Sent
              </TabsTrigger>
              <TabsTrigger 
                value="received"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md px-6 py-2 transition-all duration-200 text-emerald-200"
              >
                <FileDown size={16} className="mr-2" />
                Referrals Received
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-1 gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                <Input
                  placeholder="Search by patient name, referral number..."
                  className="pl-10 bg-emerald-950/40 border-emerald-500/30 focus-visible:ring-emerald-500 rounded-lg text-emerald-100 placeholder:text-emerald-400/70"
                  value={searchTerm}
                  onChange={(e) => {
                    console.log(`🔍 Search term changed: "${e.target.value}"`);
                    setSearchTerm(e.target.value);
                  }}
                />
              </div>

              {/* Status filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  console.log(`🔍 Status filter changed to: ${value}`);
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="w-[180px] border-emerald-500/30 bg-emerald-950/40 rounded-lg shadow-sm text-emerald-100">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-emerald-400" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-emerald-500/30 rounded-lg text-emerald-100">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Urgency filter */}
              <Select
                value={urgencyFilter}
                onValueChange={(value) => {
                  console.log(`🔍 Urgency filter changed to: ${value}`);
                  setUrgencyFilter(value);
                }}
              >
                <SelectTrigger className="w-[180px] border-emerald-500/30 bg-emerald-950/40 rounded-lg shadow-sm text-emerald-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-emerald-400" />
                    <SelectValue placeholder="Urgency" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-emerald-500/30 rounded-lg text-emerald-100">
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs content */}
          <TabsContent value="sent" className="mt-0">
            <div className="bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
              <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
              <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Sent Referrals</h2>
              {renderReferralsList("sent")}
            </div>
          </TabsContent>

          <TabsContent value="received" className="mt-0">
            <div className="bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
              <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
              <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Received Referrals</h2>
              {renderReferralsList("received")}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Helper function to render referrals list based on active tab
  function renderReferralsList(tabType: "sent" | "received") {
    console.log(`🎯 Rendering ${tabType} referrals list`);
    
    if (loading) {
      console.log('⏳ Showing loading skeletons');
      return (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-full bg-emerald-800/40" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-48 bg-emerald-800/40" />
                    <Skeleton className="h-4 w-32 bg-emerald-800/40" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-6 w-24 rounded-full bg-emerald-800/40" />
                      <Skeleton className="h-6 w-24 rounded-full bg-emerald-800/40" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const displayReferrals = filteredReferrals.filter(referral => 
      tabType === "sent" 
        ? referral.referring_doctor_id === doctorId 
        : referral.referred_to_doctor_id === doctorId
    );

    console.log(`📊 ${tabType} tab: Found ${displayReferrals.length} referrals to display`);
    
    // Log the tab's referrals data structure
    if (displayReferrals.length > 0) {
      console.log(`📋 First referral in ${tabType} tab:`, {
        id: displayReferrals[0].id,
        referral_number: displayReferrals[0].referral_number,
        patient: displayReferrals[0].patient ? 
          `${displayReferrals[0].patient.first_name} ${displayReferrals[0].patient.last_name}` : 
          'Missing patient data',
        referring_doctor: displayReferrals[0].referring_doctor?.name || 'Missing',
        referred_to_doctor: displayReferrals[0].referred_to_doctor?.name || 
                           displayReferrals[0].external_doctor_name || 
                           'Missing',
        status: displayReferrals[0].status,
        urgency: displayReferrals[0].urgency,
      });
      
      // Log external doctor information specifically for this tab
      const externalDoctorReferrals = displayReferrals.filter(ref => 
        ref.external_doctor_name || ref.external_facility
      );
      
      if (externalDoctorReferrals.length > 0) {
        console.log(`🏥 Found ${externalDoctorReferrals.length} referrals with external doctors in ${tabType} tab:`);
        externalDoctorReferrals.forEach((ref, index) => {
          console.log(`Tab ${tabType} - External Doctor #${index + 1}:`, {
            referral_id: ref.id,
            referral_number: ref.referral_number,
            patient: ref.patient ? `${ref.patient.first_name} ${ref.patient.last_name}` : 'Missing patient data',
            external_doctor_name: ref.external_doctor_name,
            external_facility: ref.external_facility,
            referred_department: ref.referred_department,
            status: ref.status,
            display_doctor: tabType === "sent" ? ref.external_doctor_name : ref.referring_doctor?.name
          });
        });
      }
    }

    if (displayReferrals.length === 0) {
      console.log(`ℹ️ No ${tabType} referrals to display`);
      return (
        <div className="text-center py-16 bg-gradient-to-b from-emerald-900/20 to-emerald-950/40 rounded-lg border border-emerald-500/30 shadow-sm">
          <div className="bg-emerald-900/50 p-4 rounded-full inline-block mb-4 border border-emerald-500/30">
            <FileHeart className="h-12 w-12 text-emerald-400" />
          </div>
          <h3 className="text-xl font-medium text-emerald-100 mb-2">No {tabType} referrals found</h3>
          <p className="text-sm text-emerald-300 max-w-sm mx-auto">
            {tabType === "sent" 
              ? "You haven't sent any referrals yet. When you do, they'll appear here." 
              : "You haven't received any referrals yet. When doctors refer patients to you, they'll appear here."}
          </p>
          {tabType === "sent" && (
            <Button 
              className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-400/30"
            >
              <FilePlus size={16} className="mr-2" />
              Create New Referral
            </Button>
          )}
        </div>
      );
    }

// SECOND PART OF THE CODE WITH IMPROVED DESIGN

return (
  <div className="grid grid-cols-1 gap-4">
    {displayReferrals.map((referral) => {
      // Log individual referral rendering for debugging
      console.log(`🔍 Rendering referral ${referral.referral_number}:`, {
        id: referral.id,
        patientName: referral.patient ? 
          `${referral.patient.first_name} ${referral.patient.last_name}` : 
          'Missing patient data',
        status: referral.status,
        urgency: referral.urgency,
        otherDoctor: tabType === "sent" 
          ? (referral.referred_to_doctor?.name || referral.external_doctor_name || 'Not specified')
          : (referral.referring_doctor?.name || 'Not specified'),
        hasExternalDoctor: !!referral.external_doctor_name,
        externalDoctorDetails: referral.external_doctor_name ? {
          name: referral.external_doctor_name,
          facility: referral.external_facility
        } : null
      });
      
      const statusConfig = getStatusConfig(referral.status);
      const StatusIcon = statusConfig.icon;
      const urgencyConfig = getUrgencyConfig(referral.urgency);
      
      // Determine which doctor to display based on the tab
      const otherDoctor = tabType === "sent" 
        ? referral.referred_to_doctor 
        : referral.referring_doctor;
      
      return (
        <Card 
          key={referral.id}
          className="border border-emerald-500/30 bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-emerald-400/50 transition-all duration-200 cursor-pointer overflow-hidden"
          onClick={() => viewReferralDetails(referral.id)}
        >
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Patient & Basic Info */}
              <div className="flex items-center gap-4">
                <ProfileImage
                  name={`${referral.patient?.first_name} ${referral.patient?.last_name}`}
                  bgColor={referral.patient?.colorCode || "#10b981"}
                  className="size-14 border-2 border-emerald-300/50 shadow-sm"
                />
                
                <div>
                  <h3 className="font-medium text-emerald-100 text-lg">
                    {referral.patient?.first_name} {referral.patient?.last_name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-emerald-300 mt-1">
                    <span className="flex items-center gap-1 bg-emerald-900/50 px-2 py-1 rounded-full border border-emerald-500/30">
                      <FileHeart size={12} className="text-emerald-400" />
                      {referral.referral_number}
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-900/50 px-2 py-1 rounded-full border border-emerald-500/30">
                      <Calendar size={12} className="text-emerald-400" />
                      {formatDate(referral.referral_date)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Department, Type & Urgency */}
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline" className="bg-emerald-950/70 text-emerald-300 border-emerald-500/50">
                  {referral.referred_department}
                </Badge>
                <Badge variant="outline" className="bg-emerald-950/70 text-emerald-300 border-emerald-500/50">
                  {referral.referral_type}
                </Badge>
                <Badge variant="outline" className={`bg-emerald-950/70 border-emerald-500/50 ${urgencyConfig.color}`}>
                  {urgencyConfig.label}
                </Badge>
              </div>
            </div>
            
            {/* Details Row */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {/* Doctor */}
              <div className="flex items-center gap-2">
              {otherDoctor ? (
                  <>
                  <ProfileImage
                      name={otherDoctor?.name}
                      bgColor={otherDoctor?.colorCode!}
                      className="size-8 border border-emerald-500/30"
                  />
                  <div>
                      <p className="text-xs text-emerald-400/70">{tabType === "sent" ? "Referred To" : "Referred By"}</p>
                      <p className="font-medium text-emerald-100">{otherDoctor?.name || "N/A"}</p>
                  </div>
                  </>
              ) : referral.external_doctor_name ? (
                  <div>
                  <p className="text-xs text-emerald-400/70">External Doctor</p>
                  <p className="font-medium text-emerald-100">{referral.external_doctor_name}</p>
                  {referral.external_facility && (
                      <p className="text-xs text-emerald-400/70">{referral.external_facility}</p>
                  )}
                  {/* Log when rendering external doctor info */}
                  {(() => {
                      console.log("🏥 Rendering external doctor UI:", {
                      referral_id: referral.id,
                      external_doctor_name: referral.external_doctor_name,
                      external_facility: referral.external_facility || 'No facility specified'
                      });
                      return null;
                  })()}
                  </div>
              ) : (
                  <div>
                  <p className="text-xs text-emerald-400/70">{tabType === "sent" ? "Referred To" : "Referred By"}</p>
                  <p className="font-medium text-emerald-400/50">Not specified</p>
                  </div>
              )}
              </div>
                          
              {/* Reason summary */}
              <div className="sm:col-span-1">
                <p className="text-xs text-emerald-400/70">Reason</p>
                <p className="truncate font-medium text-emerald-100">
                  {referral.reason_for_referral?.substring(0, 50) || "N/A"}
                  {referral.reason_for_referral?.length > 50 ? "..." : ""}
                </p>
              </div>
              
              {/* Status */}
              <div className="flex justify-start sm:justify-end">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 ${statusConfig.color}`}>
                  <StatusIcon size={14} className="text-emerald-400" />
                  <span className="text-emerald-100">
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action hint */}
            <div className="mt-4 pt-2 border-t border-emerald-500/20 flex justify-end items-center gap-1 text-xs text-emerald-400">
              <span>View Details</span>
              <ArrowRightCircle size={14} />
            </div>
          </CardContent>
        </Card>
      );
    })}
    {/* Referral Details Dialog */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto remove-scrollbar bg-gray-900/90 border border-emerald-500/40 backdrop-blur-sm text-emerald-100">
        {selectedReferral && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-emerald-100">
                <FileHeart className="text-emerald-400" />
                Referral Details
              </DialogTitle>
              <DialogDescription className="text-emerald-300">
                Referral #{selectedReferral.referral_number}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-6">
              {/* Patient Information */}
              <div className="bg-emerald-950/70 p-4 rounded-lg border border-emerald-500/30">
                <h3 className="font-semibold text-emerald-200 mb-2">Patient Information</h3>
                <div className="flex items-center gap-3">
                  <ProfileImage
                    name={`${selectedReferral.patient?.first_name} ${selectedReferral.patient?.last_name}`}
                    bgColor={selectedReferral.patient?.colorCode || "#10b981"}
                    className="size-16 border border-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-medium text-emerald-100 text-lg">
                      {selectedReferral.patient?.first_name} {selectedReferral.patient?.last_name}
                    </h4>
                    <p className="text-emerald-300">
                      Patient ID: {selectedReferral.patient_id}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Referral Details */}
              <div>
                <h3 className="font-semibold text-emerald-200 mb-2">Referral Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-emerald-400/70">Referral Date</p>
                      <p className="font-medium text-emerald-100">{formatDate(selectedReferral.referral_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-400/70">Department</p>
                      <p className="font-medium text-emerald-100">{selectedReferral.referred_department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-400/70">Type</p>
                      <p className="font-medium text-emerald-100">{selectedReferral.referral_type}</p>
                    </div>
                    {selectedReferral.follow_up_date && (
                      <div>
                        <p className="text-sm text-emerald-400/70">Follow-up Date</p>
                        <p className="font-medium text-emerald-100">{formatDate(selectedReferral.follow_up_date?.toString() || "")}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-emerald-400/70">Status</p>
                      <div>
                        {(() => {
                          const statusConfig = getStatusConfig(selectedReferral.status);
                          const StatusIcon = statusConfig.icon;
                          return (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30">
                              <StatusIcon size={14} className="text-emerald-400" />
                              <span className="text-emerald-100">{statusConfig.label}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-400/70">Urgency</p>
                      <div>
                        {(() => {
                          const urgencyConfig = getUrgencyConfig(selectedReferral.urgency);
                          return (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30">
                              <AlertTriangle size={14} className="text-emerald-400" />
                              <span className="text-emerald-100">{urgencyConfig.label}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-400/70">Created</p>
                      <p className="font-medium text-emerald-100">{formatDate(selectedReferral.created_at)}</p>
                    </div>
                    {selectedReferral.authorization_number && (
                      <div>
                        <p className="text-sm text-emerald-400/70">Authorization Number</p>
                        <p className="font-medium text-emerald-100">{selectedReferral.authorization_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Doctor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-950/60 p-4 rounded-lg border border-emerald-500/30">
                {/* Referring Doctor */}
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Referring Doctor</h3>
                  {selectedReferral.referring_doctor ? (
                    <div className="flex items-center gap-3">
                      <ProfileImage
                        name={selectedReferral.referring_doctor.name}
                        bgColor={selectedReferral.referring_doctor.colorCode || "#3b82f6"}
                        className="size-12 border border-emerald-500/40"
                      />
                      <div>
                        <p className="font-medium text-emerald-100">{selectedReferral.referring_doctor.name}</p>
                        <p className="text-sm text-emerald-300">
                          {selectedReferral.referring_doctor.specialization || "No specialization provided"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-emerald-400/70">Information not available</p>
                  )}
                </div>
                
                {/* Referred To Doctor */}
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Referred To</h3>
                  {selectedReferral.referred_to_doctor ? (
                    <div className="flex items-center gap-3">
                      <ProfileImage
                        name={selectedReferral.referred_to_doctor.name}
                        bgColor={selectedReferral.referred_to_doctor.colorCode || "#8b5cf6"}
                        className="size-12 border border-emerald-500/40"
                      />
                      <div>
                        <p className="font-medium text-emerald-100">{selectedReferral.referred_to_doctor.name}</p>
                        <p className="text-sm text-emerald-300">
                          {selectedReferral.referred_to_doctor.specialization || "No specialization provided"}
                        </p>
                      </div>
                    </div>
                  ) : selectedReferral.external_doctor_name ? (
                    <div>
                      <p className="font-medium text-emerald-100">{selectedReferral.external_doctor_name}</p>
                      {selectedReferral.external_facility && (
                        <p className="text-sm text-emerald-300">{selectedReferral.external_facility}</p>
                      )}
                      {selectedReferral.external_contact && (
                        <p className="text-sm text-emerald-300">
                          <span className="font-medium">Contact:</span> {selectedReferral.external_contact}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-emerald-400/70">Not specified</p>
                  )}
                </div>
              </div>
              
              {/* Clinical Information */}
              <div className="bg-emerald-950/60 p-4 rounded-lg border border-emerald-500/30">
                <h3 className="font-semibold text-emerald-200 mb-3">Clinical Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    {/* Diagnosis */}
                    {selectedReferral.diagnosis && (
                      <div>
                        <h4 className="font-medium text-emerald-200">Diagnosis</h4>
                        <p className="mt-1 text-emerald-100 bg-emerald-900/50 p-3 rounded border border-emerald-500/30 whitespace-pre-wrap">
                          {selectedReferral.diagnosis}
                        </p>
                      </div>
                    )}
                    
                    {/* Symptoms */}
                    {selectedReferral.symptoms && (
                      <div>
                        <h4 className="font-medium text-emerald-200">Symptoms</h4>
                        <p className="mt-1 text-emerald-100 bg-emerald-900/50 p-3 rounded border border-emerald-500/30 whitespace-pre-wrap">
                          {selectedReferral.symptoms}
                        </p>
                      </div>
                    )}
                    
                    {/* Clinical Notes */}
                    {selectedReferral.clinical_notes && (
                      <div>
                        <h4 className="font-medium text-emerald-200">Clinical Notes</h4>
                        <p className="mt-1 text-emerald-100 bg-emerald-900/50 p-3 rounded border border-emerald-500/30 whitespace-pre-wrap">
                          {selectedReferral.clinical_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Right column */}
                  <div className="space-y-4">
                    {/* Medical History */}
                    {selectedReferral.medical_history && (
                      <div>
                        <h4 className="font-medium text-emerald-200">Medical History</h4>
                        <p className="mt-1 text-emerald-100 bg-emerald-900/50 p-3 rounded border border-emerald-500/30 whitespace-pre-wrap">
                          {selectedReferral.medical_history}
                        </p>
                      </div>
                    )}
                    
                    {/* Current Medications */}
                    {selectedReferral.current_medications && (
                      <div>
                        <h4 className="font-medium text-emerald-200">Current Medications</h4>
                        <p className="mt-1 text-emerald-100 bg-emerald-900/50 p-3 rounded border border-emerald-500/30 whitespace-pre-wrap">
                          {selectedReferral.current_medications}
                        </p>
                      </div>
                    )}
                    
                    {/* Allergies */}
                    {selectedReferral.allergies && (
                      <div>
                        <h4 className="font-medium text-emerald-200">Allergies</h4>
                        <p className="mt-1 text-emerald-100 bg-emerald-900/50 p-3 rounded border border-emerald-500/30 whitespace-pre-wrap">
                          {selectedReferral.allergies}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Test Results */}
              {selectedReferral.test_results && (
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Test Results</h3>
                  <div className="p-4 bg-emerald-900/50 rounded-lg border border-emerald-500/30 whitespace-pre-wrap text-emerald-100">
                    {selectedReferral.test_results}
                  </div>
                </div>
              )}
              
              {/* Reason for Referral */}
              <div>
                <h3 className="font-semibold text-emerald-200 mb-2">Reason for Referral</h3>
                <div className="p-4 bg-emerald-950/60 rounded-lg border border-emerald-500/30 whitespace-pre-wrap text-emerald-100">
                  {selectedReferral.reason_for_referral || "No reason provided"}
                </div>
              </div>
              
              {/* Follow-up Instructions */}
              {selectedReferral.follow_up_instructions && (
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Follow-up Instructions</h3>
                  <div className="p-4 bg-emerald-950/60 rounded-lg border border-emerald-500/30 whitespace-pre-wrap text-emerald-100">
                    {selectedReferral.follow_up_instructions}
                  </div>
                </div>
              )}
              
              {/* Insurance Information */}
              {selectedReferral.insurance_details && (
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Insurance Information</h3>
                  <div className="p-4 bg-emerald-950/60 rounded-lg border border-emerald-500/30 text-emerald-100">
                    <p className="whitespace-pre-wrap">{selectedReferral.insurance_details}</p>
                  </div>
                </div>
              )}
              
              {/* Special Instructions */}
              {selectedReferral.special_instructions && (
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">Special Instructions</h3>
                  <div className="p-4 bg-emerald-950/60 rounded-lg border border-emerald-500/30 whitespace-pre-wrap text-emerald-100">
                    {selectedReferral.special_instructions}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="border-emerald-500/30 bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/50 hover:text-emerald-100"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
              
              {activeTab === "received" && selectedReferral.status === "PENDING" && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-500/30 bg-red-900/50 text-red-300 hover:bg-red-800/50 hover:text-red-200"
                    onClick={() => handleRejectReferral(selectedReferral.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                    ) : (
                      <XCircle size={16} className="mr-2" />
                    )}
                    Reject
                  </Button>
                  
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-400/30"
                    onClick={() => handleAcceptReferral(selectedReferral.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} className="mr-2" />
                    )}
                    Accept
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  </div>
);
}
};

export default ReferralManager;

{/* 
    
    CODE WITHOUT CONSOLE LOGS USE THIS IN FINAL VERSION
    "use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getDoctorReferrals as getDoctorReferralsAction 
} from "@/utils/services/referral-utils";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileImage } from "@/components/profile-image";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Icons
import { 
  Search, 
  FileHeart, 
  ChevronDown, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRightCircle,
  RefreshCw,
  LucideIcon
} from "lucide-react";

// Types
import { ReferralStatus, ReferralUrgency } from "@prisma/client";

// Define type for referral data
// Update the interface definitions to accept null values
interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    img?: string | null;      // Changed to accept null
    colorCode?: string | null; // Changed to accept null
  }
  
  interface Doctor {
    id: string;
    name: string;
    img?: string | null;      // Changed to accept null
    colorCode?: string | null; // Changed to accept null
    specialization?: string;
  }
  
  interface Referral {
    id: number;
    referral_number: string;
    patient_id: string;
    patient: Patient;
    referring_doctor_id: string;
    referring_doctor: Doctor;
    referred_to_doctor_id?: string | null;
    referred_to_doctor?: Doctor | null; // Added null possibility
    external_doctor_name?: string;
    external_facility?: string;
    referral_date: string;
    referred_department: string;
    referral_type: string;
    reason_for_referral: string;
    status: ReferralStatus;
    urgency: ReferralUrgency;
    created_at: string;
    updated_at: string;
  }

// Define types for configuration objects
type StatusConfigType = {
  [key in ReferralStatus]: {
    color: string;
    icon: LucideIcon;
    label: string;
  }
};

type UrgencyConfigType = {
  [key in ReferralUrgency]: {
    color: string;
    label: string;
  }
};

// Define status colors and icons for referrals
const STATUS_CONFIG: StatusConfigType = {
  PENDING: { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300", 
    icon: HelpCircle,
    label: "Pending" 
  },
  ACCEPTED: { 
    color: "bg-green-100 text-green-800 border-green-300", 
    icon: CheckCircle2,
    label: "Accepted" 
  },
  REJECTED: { 
    color: "bg-red-100 text-red-800 border-red-300", 
    icon: XCircle,
    label: "Rejected" 
  },
  COMPLETED: { 
    color: "bg-blue-100 text-blue-800 border-blue-300", 
    icon: CheckCircle2, 
    label: "Completed"
  },
  CANCELLED: { 
    color: "bg-gray-100 text-gray-800 border-gray-300", 
    icon: XCircle,
    label: "Cancelled" 
  }
};

const URGENCY_CONFIG: UrgencyConfigType = {
  ROUTINE: { 
    color: "bg-green-100 text-green-800 border-green-300", 
    label: "Routine" 
  },
  URGENT: { 
    color: "bg-orange-100 text-orange-800 border-orange-300", 
    label: "Urgent" 
  },
  EMERGENCY: { 
    color: "bg-red-100 text-red-800 border-red-300", 
    label: "Emergency" 
  }
};

// ReferralManager component
export const ReferralManager = ({ doctorId }: { doctorId: string }) => {
  const [activeTab, setActiveTab] = useState("sent");
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load referrals when component mounts or doctorId changes
  useEffect(() => {
    const fetchReferrals = async () => {
      console.log("Fetching referrals for doctor:", doctorId);
      setLoading(true);
      
      try {
        if (!doctorId) {
          console.error("No doctor ID provided");
          toast.error("Unable to load referrals: Missing doctor ID");
          return;
        }

        const result = await getDoctorReferralsAction(doctorId);
        
        if (result.success && result.data) {
          console.log(`Successfully fetched ${result.data.length} referrals`);
          setReferrals(
            result.data.map((referral: any) => ({
              ...referral,
              external_doctor_name: referral.external_doctor_name ?? undefined,
            }))
          );
        } else {
          console.error("Failed to fetch referrals:", result.message);
          toast.error(`Failed to load referrals: ${result.message}`);
        }
      } catch (error) {
        console.error("Error fetching referrals:", error);
        toast.error("An error occurred while loading referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [doctorId]);

  // Filter referrals based on active tab, search term, and filters
  useEffect(() => {
    console.log("Filtering referrals with:", { 
      activeTab, 
      searchTerm, 
      statusFilter, 
      urgencyFilter 
    });
    
    if (!referrals.length) {
      setFilteredReferrals([]);
      return;
    }

    // Filter by tab (sent or received)
    let filtered = referrals.filter(referral => 
      activeTab === "sent" 
        ? referral.referring_doctor_id === doctorId 
        : referral.referred_to_doctor_id === doctorId
    );

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(referral => 
        referral.referral_number?.toLowerCase().includes(searchLower) ||
        referral.patient?.first_name?.toLowerCase().includes(searchLower) ||
        referral.patient?.last_name?.toLowerCase().includes(searchLower) ||
        `${referral.patient?.first_name} ${referral.patient?.last_name}`.toLowerCase().includes(searchLower) ||
        referral.referred_department?.toLowerCase().includes(searchLower) ||
        (activeTab === "sent" && referral.referred_to_doctor?.name?.toLowerCase().includes(searchLower)) ||
        (activeTab === "received" && referral.referring_doctor?.name?.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(referral => referral.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== "all") {
      filtered = filtered.filter(referral => referral.urgency === urgencyFilter);
    }

    console.log(`Filtered to ${filtered.length} referrals`);
    setFilteredReferrals(filtered);
  }, [referrals, activeTab, searchTerm, statusFilter, urgencyFilter, doctorId]);

  // Handle refresh button click
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await getDoctorReferralsAction(doctorId);
      
      if (result.success && result.data) {
        console.log(`Refreshed: Fetched ${result.data.length} referrals`);
        setReferrals(
          result.data.map((referral: any) => ({
            ...referral,
            external_doctor_name: referral.external_doctor_name ?? undefined,
          }))
        );
        toast.success("Referrals refreshed successfully");
      } else {
        console.error("Failed to refresh referrals:", result.message);
        toast.error(`Failed to refresh referrals: ${result.message}`);
      }
    } catch (error) {
      console.error("Error refreshing referrals:", error);
      toast.error("An error occurred while refreshing referrals");
    } finally {
      setLoading(false);
    }
  };

  // View referral details
  const viewReferralDetails = (referralId: number) => {
    console.log("Viewing referral details:", referralId);
    // Navigate to referral details page - you'll need to implement this page separately
    router.push(`/referrals/${referralId}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Helper function to safely get status config
  const getStatusConfig = (status: ReferralStatus) => {
    // Ensure the status is a valid key in STATUS_CONFIG
    if (Object.keys(STATUS_CONFIG).includes(status)) {
      return STATUS_CONFIG[status];
    }
    // Fallback if status is not found
    return {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: HelpCircle,
      label: status
    };
  };

  // Helper function to safely get urgency config
  const getUrgencyConfig = (urgency: ReferralUrgency) => {
    // Ensure the urgency is a valid key in URGENCY_CONFIG
    if (Object.keys(URGENCY_CONFIG).includes(urgency)) {
      return URGENCY_CONFIG[urgency];
    }
    // Fallback if urgency is not found
    return {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      label: urgency
    };
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <FileHeart className="text-emerald-600" />
            Referral Management
          </h1>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs 
          defaultValue="sent" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList className="bg-emerald-50">
              <TabsTrigger 
                value="sent"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
              >
                Referrals Sent
              </TabsTrigger>
              <TabsTrigger 
                value="received"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
              >
                Referrals Received
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-1 gap-2">
              {/* Search input 
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by patient name, referral number..."
                  className="pl-9 bg-white border-emerald-200 focus-visible:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status filter 
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[150px] border-emerald-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-emerald-600" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Urgency filter 
              <Select
                value={urgencyFilter}
                onValueChange={setUrgencyFilter}
              >
                <SelectTrigger className="w-[150px] border-emerald-200 bg-white">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-emerald-600" />
                    <SelectValue placeholder="Urgency" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs content 
          <TabsContent value="sent" className="mt-0">
            {renderReferralsList("sent")}
          </TabsContent>

          <TabsContent value="received" className="mt-0">
            {renderReferralsList("received")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Helper function to render referrals list based on active tab
  function renderReferralsList(tabType: "sent" | "received") {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const displayReferrals = filteredReferrals.filter(referral => 
      tabType === "sent" 
        ? referral.referring_doctor_id === doctorId 
        : referral.referred_to_doctor_id === doctorId
    );

    if (displayReferrals.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <FileHeart className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No {tabType} referrals found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            {tabType === "sent" 
              ? "You haven't sent any referrals yet." 
              : "You haven't received any referrals yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {displayReferrals.map((referral) => {
          const statusConfig = getStatusConfig(referral.status);
          const StatusIcon = statusConfig.icon;
          const urgencyConfig = getUrgencyConfig(referral.urgency);
          
          // Determine which doctor to display based on the tab
          const otherDoctor = tabType === "sent" 
            ? referral.referred_to_doctor 
            : referral.referring_doctor;
          
          return (
            <Card 
              key={referral.id}
              className="border border-emerald-100 hover:border-emerald-300 transition-colors duration-200 cursor-pointer"
              onClick={() => viewReferralDetails(referral.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Patient & Basic Info 
                  <div className="flex items-center gap-3">
                    <ProfileImage
                      name={`${referral.patient?.first_name} ${referral.patient?.last_name}`}
                      bgColor={referral.patient?.colorCode!}
                      className="size-12 border border-emerald-200"
                    />
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {referral.patient?.first_name} {referral.patient?.last_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FileHeart size={12} />
                          {referral.referral_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(referral.referral_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Department, Type & Urgency 
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {referral.referred_department}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {referral.referral_type}
                    </Badge>
                    <Badge variant="outline" className={urgencyConfig.color}>
                      {urgencyConfig.label}
                    </Badge>
                  </div>
                </div>
                
                {/* Details Row 
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {/* Doctor 
                  <div className="flex items-center gap-2">
                    {otherDoctor ? (
                      <>
                        <ProfileImage
                          name={otherDoctor?.name}
                          bgColor={otherDoctor?.colorCode!}
                          className="size-8 border border-emerald-200"
                        />
                        <div>
                          <p className="text-xs text-gray-500">{tabType === "sent" ? "Referred To" : "Referred By"}</p>
                          <p className="font-medium">{otherDoctor?.name || "N/A"}</p>
                        </div>
                      </>
                    ) : referral.external_doctor_name ? (
                      <div>
                        <p className="text-xs text-gray-500">External Doctor</p>
                        <p className="font-medium">{referral.external_doctor_name}</p>
                        {referral.external_facility && (
                          <p className="text-xs text-gray-500">{referral.external_facility}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500">{tabType === "sent" ? "Referred To" : "Referred By"}</p>
                        <p className="font-medium text-gray-400">Not specified</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Reason summary 
                  <div className="sm:col-span-1">
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="truncate font-medium">
                      {referral.reason_for_referral?.substring(0, 50) || "N/A"}
                      {referral.reason_for_referral?.length > 50 ? "..." : ""}
                    </p>
                  </div>
                  
                  {/* Status 
                  <div className="flex justify-start sm:justify-end">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig.color}`}>
                      <StatusIcon size={14} />
                      <span>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action hint 
                <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end items-center gap-1 text-xs text-emerald-600">
                  <span>View Details</span>
                  <ArrowRightCircle size={14} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default ReferralManager;
    
    */}