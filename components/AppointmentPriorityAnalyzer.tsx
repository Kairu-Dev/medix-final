"use client";
/* eslint-disable */
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertTriangle, Activity, HeartPulse, RefreshCcw, Settings, Building, ChevronDown, FileText, Info, UserIcon, User } from 'lucide-react';
import { PriorityLevel } from '@prisma/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AdvancedSettings, DEFAULT_SETTINGS } from './AdvancedSettings';
import { useAnalysisStore } from '@/hooks/useAnalysisStore';

// Enhanced types for dynamic keyword system
interface AppointmentPriorityAnalyzerProps {
  isNurse?: boolean;
  isAdmin?: boolean;
  isDoctor?: boolean;
  userId?: string;
  patientId: string;
  appointmentNote: string;
  defaultDoctorId?: string;
  settings?: AdvancedSettings;
  onPriorityAssigned?: (
    priority: PriorityLevel,
    score: number,
    suggestedDepartment: string,
    suggestedDoctorId: string,
    isOverride?: boolean
  ) => void;
  doctors?: any[];
  className?: string;
  doctorLoadFactors?: Record<string, number>;
}

export const AppointmentPriorityAnalyzer = ({
  isNurse = false,
  isAdmin = false,
  isDoctor = false,
  userId,
  patientId,
  appointmentNote,
  defaultDoctorId,
  settings = DEFAULT_SETTINGS,
  onPriorityAssigned,
  doctors = [],
  className = "",
  doctorLoadFactors = {}
}: AppointmentPriorityAnalyzerProps) => {

  // Connect to Zustand Store
  const {
    // State
    result,
    multiGroupResult,
    isAnalyzing,
    toastMessage,
    isCustomOverride,

    // Actions
    setNote,
    setPatientId,
    setSettings,
    setDoctors,
    setDoctorLoadFactors,
    setIsCustomOverride,
    loadKeywordGroups,
    dismissToast,
    reset
  } = useAnalysisStore();

  // Track previous result to prevent redundant updates
  const prevResult = React.useRef<{
    priority: PriorityLevel;
    score: number;
    department: string;
    doctor: string;
  } | null>(null);

  // Initialize Store Data
  useEffect(() => {
    setPatientId(patientId);
    setDoctors(doctors);
    setDoctorLoadFactors(doctorLoadFactors);
    setSettings(settings); // This will also trigger analysis if note is present
  }, [patientId, doctors, doctorLoadFactors, settings]);

  // Handle Input Changes
  useEffect(() => {
    // Debounce the analysis trigger to prevent toast spam while typing
    const timer = setTimeout(() => {
      setNote(appointmentNote);
    }, 500);

    return () => clearTimeout(timer);
  }, [appointmentNote]);

  // Initial Data Load
  useEffect(() => {
    loadKeywordGroups();
    return () => reset(); // Cleanup on unmount
  }, []);

  // Handle Notifications
  useEffect(() => {
    if (toastMessage) {
      toast[toastMessage.type](toastMessage.title, {
        description: toastMessage.description,
      });
      dismissToast();
    }
  }, [toastMessage]);

  // Handle Priority Assignment Callback
  useEffect(() => {
    if (result && onPriorityAssigned) {
      // Check if the result has meaningfully changed
      const hasChanged = !prevResult.current ||
        prevResult.current.priority !== result.priority ||
        prevResult.current.score !== result.score ||
        prevResult.current.department !== result.department ||
        prevResult.current.doctor !== result.doctor;

      if (hasChanged) {
        // Update previous result ref
        prevResult.current = {
          priority: result.priority,
          score: result.score,
          department: result.department,
          doctor: result.doctor
        };

        onPriorityAssigned(
          result.priority,
          result.score,
          result.department,
          result.doctor,
          result.override
        );
      }
    }
  }, [result]);

  const handleManualOverride = (priority: PriorityLevel) => {
    setIsCustomOverride(true);
    // Manually update the result in store (or create a dedicated action for override)
    useAnalysisStore.setState(state => ({
      result: state.result ? { ...state.result, priority, override: true } : null
    }));

    if (onPriorityAssigned && result) {
      onPriorityAssigned(priority, result.score, result.department, result.doctor, true);
    }
  };

  // --- Render Helpers (simplified from original) ---

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.EMERGENCY: return 'bg-red-500 text-white border-red-600';
      case PriorityLevel.URGENT: return 'bg-amber-500 text-white border-amber-600';
      case PriorityLevel.NORMAL: return 'bg-emerald-500 text-white border-emerald-600';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDepartmentIcon = (dept: string) => {
    const d = dept?.toLowerCase() || '';
    if (d.includes('cardio')) return <HeartPulse className="h-4 w-4" />;
    if (d.includes('neuro')) return <Activity className="h-4 w-4" />;
    if (d.includes('ortho')) return <UserIcon className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
  };

  // If no analysis result yet and not analyzing, show idle state
  if (!result && !isAnalyzing && !appointmentNote) {
    return (
      <div className={`p-6 border border-dashed border-slate-700 rounded-xl bg-slate-900/50 text-slate-500 text-sm text-center font-mono ${className}`}>
        <div className="flex justify-center mb-2">
          <Activity className="w-6 h-6 text-slate-600" />
        </div>
        Awaiting clinical data for automated prioritization...
      </div>
    );
  }

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Loading Indicator */}
      {isAnalyzing && (
        <div className="flex items-center gap-2 p-2 text-sm text-emerald-500 animate-pulse bg-emerald-500/5 rounded-md border border-emerald-500/10">
          <RefreshCcw className="w-4 h-4 animate-spin" />
          <span className="font-mono">ANALYZING SYSTEM DATA...</span>
        </div>
      )}

      {/* Main Result Card */}
      {result && (
        <Card className="bg-[#0f172a] border-slate-800 shadow-xl overflow-hidden text-slate-200">

          {/* Header Section */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <HeartPulse className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  Medical Priority Assessment
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Automated symptom analysis and department routing
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">

            {/* Priority Status Box */}
            <div className={`p-5 rounded-xl border ${result.priority === 'EMERGENCY' ? 'bg-red-500/10 border-red-500/20' :
              result.priority === 'URGENT' ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-emerald-500/5 border-emerald-500/10'
              }`}>
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-2 rounded-full ${result.priority === 'EMERGENCY' ? 'bg-red-500/20 text-red-400' :
                  result.priority === 'URGENT' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-black tracking-tight ${result.priority === 'EMERGENCY' ? 'text-red-400' :
                      result.priority === 'URGENT' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                      {result.priority} PRIORITY
                    </span>
                    <Badge variant="outline" className="bg-slate-900/50 border-slate-700 text-slate-400 font-mono">
                      {result.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {result.priority === 'EMERGENCY' ? 'Immediate medical attention required' :
                      result.priority === 'URGENT' ? 'Urgent care recommended within 24 hours' :
                        'Standard appointment scheduling appropriate'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Department */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recommended Department
              </h4>
              <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                <div className="p-2 bg-blue-500/10 rounded-md text-blue-400">
                  {getDepartmentIcon(result.department)}
                </div>
                <span className="font-semibold text-slate-200">
                  {result.department}
                </span>
                {result.override && (
                  <Badge variant="outline" className="ml-auto border-amber-500/30 text-amber-400 text-[10px] uppercase">
                    Manual Override
                  </Badge>
                )}
              </div>
            </div>

            {/* Detected Symptoms */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Detected Medical Symptoms
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.length > 0 ? (
                  result.keywords.map((k, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-sm bg-slate-800 text-slate-500 border border-slate-700 italic">
                    No specific keywords detected
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Assignment Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5" />
                  Doctor Assignment
                </h4>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-800/30 border border-slate-700/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-200 font-medium">
                      {doctors.find(d => d.id === result.doctor)?.name || "Available Specialist"}
                    </span>
                    {(isAdmin || isDoctor || isNurse) && result.doctor && doctorLoadFactors[result.doctor] !== undefined && (
                      <Badge variant="outline" className={`text-[10px] h-5 ${doctorLoadFactors[result.doctor] >= 80 ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                        doctorLoadFactors[result.doctor] >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                          'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        }`}>
                        {doctorLoadFactors[result.doctor]}% Load
                      </Badge>
                    )}
                  </div>
                  {(isAdmin || isDoctor || isNurse) ? (
                    <Select
                      defaultValue={result.priority}
                      onValueChange={(val) => handleManualOverride(val as PriorityLevel)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-900 border-slate-700 text-slate-300">
                        <SelectValue placeholder="Override Priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-slate-300">
                        <SelectItem value={PriorityLevel.NORMAL}>Normal</SelectItem>
                        <SelectItem value={PriorityLevel.URGENT}>Urgent</SelectItem>
                        <SelectItem value={PriorityLevel.EMERGENCY}>Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                      System Assigned
                    </Badge>
                  )}
                </div>

                <Alert className="bg-blue-500/5 border-blue-500/10 text-blue-400">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs ml-2">
                    Doctors are automatically sorted by availability and specialty match to ensure optimal care assignment.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

          </div>
        </Card>
      )}
    </div>
  );
};

export default AppointmentPriorityAnalyzer;
