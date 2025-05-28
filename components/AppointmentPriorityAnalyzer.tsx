// AppointmentPriorityAnalyzer.tsx    --- Ver 3.1 
// POSSIBLE IMPROVEMENTS:
// IMPROVE LOAD FACTOR HANDLING: Add load factor to doctor selection logic WHEREIN DOCTOR WITH THE LOWEST PENDING APPOINTMENTS IS SELECTED FIRST
// ADD SYMPTOM KEYWORD EXPANSION: Add synonyms or related terms for keywords to improve matching accuracy
// ADD SYMPTOM COMBINATION LOGIC: Add logic to handle combinations of symptoms for better matching
// ADD AN OPTION TO PROVIDE A SETTINGS OF THIS COMPONENT TO ALLOW THE ADMIN TO ADD MORE KEYWORDS SIMILAR TO TAGS IN MANGADEX (EX. MAGIC, FANTASY, HAREM GANON GANON BUT IN MEDICAL TERMS OF COURSE)
// Create an Interface to customize values for each departments and use tags to add words to the list.
// The Override tag is kinda buggy fix it  in a later patch



"use client";
    /* eslint-disable */
import { AdvancedSettings, DEFAULT_SETTINGS } from './AdvancedSettings';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AlertTriangle, Activity, HeartPulse, RefreshCcw, Settings } from 'lucide-react';
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
import { getKeywordGroups } from '@/lib/keyword-actions';


//NEW CODE
interface AppointmentPriorityAnalyzerProps {
  patientId: string;
  appointmentNote: string;
  defaultDoctorId?: string;
  settings?: AdvancedSettings; // ADD THIS LINE
  onPriorityAssigned?: (
    priority: PriorityLevel, 
    score: number, 
    suggestedDepartment: string, 
    suggestedDoctorId: string,
    isOverride?: boolean
  ) => void;
  doctors?: any[];
  className?: string;
}

// Enhanced types for dynamic keyword system
interface KeywordGroup {
  id: string;
  name: string;
  department: string;
  priority: PriorityLevel;
  baseScore: number;
  description?: string;
  isActive: boolean;
  keywords: Keyword[];
  createdAt: Date;
  updatedAt: Date;
}

interface Keyword {
  id: string;
  text: string;
  weight: number;
  isPartialMatch: boolean;
  isActive: boolean;
  groupId: string;
}

interface ConditionNode {
  id: string;
  groupId: string;
  name: string;
  keywords: Keyword[];
  department: string;
  priority: PriorityLevel;
  score: number;
  primaryPhysicians: string[];
}

interface Edge {
  from: number;
  to: number;
  weight: number;  // Lower weight means stronger connection
}

// Custom priority queue implementation for Dijkstra's algorithm
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];
  
  enqueue(element: T, priority: number): void {
    const item = { element, priority };
    let added = false;
    
    // Insert in the correct position to maintain order
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(item);
    }
  }
  
  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  changePriority(element: T, newPriority: number): void {
    // Remove old entry
    this.items = this.items.filter(item => item.element !== element);
    // Add with new priority
    this.enqueue(element, newPriority);
  }
}

//STATIC CONDITIONS (HARD CODEDE NOT DYNAMIC)
// Define expanded keywords for conditions with their associated departments and priority levels
const fetchKeywordGroups = async (): Promise<KeywordGroup[]> => {
  try {
    console.log("Fetching keyword groups...");
    const groups = await getKeywordGroups();
    console.log(`Fetched ${groups.length} keyword groups`);
    
    const activeGroups = groups
      .filter(group => group.isActive)
      .map(group => {
        const activeKeywords = group.keywords.filter(k => k.isActive);
        console.log(`Group "${group.name}": ${activeKeywords.length} active keywords`);
        
        return {
          ...group,
          description: group.description ?? undefined,
          keywords: activeKeywords
        };
      });
      
    console.log(`Returning ${activeGroups.length} active groups`);
    return activeGroups;
  } catch (error) {
    console.error('Failed to fetch keyword groups:', error);
    return [];
  }
};
// Define common symptom connections across departments
// This represents the actual graph structure where symptoms can connect to multiple departments


// Priority severity indicators
const PRIORITY_INDICATORS = {
  [PriorityLevel.EMERGENCY]: {
    color: "bg-red-500", 
    textColor: "text-red-500",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-500/40"
  },
  [PriorityLevel.URGENT]: {
    color: "bg-amber-500", 
    textColor: "text-amber-500",
    bgColor: "bg-amber-900/20",
    borderColor: "border-amber-500/40"
  },
  [PriorityLevel.NORMAL]: {
    color: "bg-emerald-500", 
    textColor: "text-emerald-500",
    bgColor: "bg-emerald-900/20",
    borderColor: "border-emerald-500/40"
  },
};



const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const getEditDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

const AppointmentPriorityAnalyzer: React.FC<AppointmentPriorityAnalyzerProps> = ({
  patientId,
  appointmentNote,
  defaultDoctorId,
  settings = DEFAULT_SETTINGS, // ADD THIS LINE
  onPriorityAssigned,
  doctors = [],
  className,
}) => {
  const [note, setNote] = useState(appointmentNote || '');
  const [analyzingPriority, setAnalyzingPriority] = useState(false);
  const [priorityResult, setPriorityResult] = useState<{
    level: PriorityLevel;
    score: number;
    suggestedDepartment: string;
    suggestedPrimaryPhysician: string;
    matchedKeywords: string[];
    pathTrace?: string[];
  } | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctorId || '');
  const [suggestedDoctors, setSuggestedDoctors] = useState<any[]>([]);
  const [manualDepartment, setManualDepartment] = useState<string>("");
  const [isManualSelection, setIsManualSelection] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<string>(''); // To prevent duplicate toasts

  // Available departments for manual selection
  const availableDepartments = [
    "Emergency", "Urgent Care", "Cardiology", "Neurology", "Orthopedics",
    "Dermatology", "Gastroenterology", "ENT", "Pulmonology", "Endocrinology",
    "General Practice", "Psychiatry", "Ophthalmology", "Urology", "Oncology",
    "Gynecology", "Pediatrics",
    // ADDED - Missing from original availableDepartments
    "Radiology", "General Surgery"
  ];

  // Helper function to normalize text
  const normalizeText = (text: string): string => {
    // Improved normalization - keep more characters for better matching
    const normalized = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')        // Replace punctuation with spaces (keep letters, numbers, spaces)
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .trim();                        // Remove leading/trailing spaces
    return normalized;
  };

  // Handle manual department change
  const handleManualDepartmentChange = (department: string) => {
    if (!department) return;
    
    setManualDepartment(department);
    setIsManualSelection(true);
    
    // When manually selecting a department, create a custom priority result
    const manualResult = {
      level: department === "Emergency" ? PriorityLevel.EMERGENCY : 
              department === "Urgent Care" ? PriorityLevel.URGENT : 
              PriorityLevel.NORMAL,
      score: department === "Emergency" ? 95 : 
              department === "Urgent Care" ? 75 : 
              40,
      suggestedDepartment: department,
      suggestedPrimaryPhysician: department,
      matchedKeywords: ["manual selection"],
      pathTrace: ["Manual department selection"]
    };
    
    setPriorityResult(manualResult);
    
    // Filter doctors based on the manually selected department
    if (doctors.length > 0) {
      const relevantDoctors = doctors.filter(doctor => 
        doctor.department === department || 
        doctor.specialization === department ||
        doctor.specialization?.includes(department) ||
        (department === "General Practice" && 
          (doctor.specialization === "Internal Medicine" || 
            doctor.specialization === "Family Medicine")
        )
      );
      
      // Sort by load factor and specialization match
      const sortedDoctors = [...relevantDoctors].sort((a, b) => {
        const aLoad = a.loadFactor !== undefined ? a.loadFactor : 999;
        const bLoad = b.loadFactor !== undefined ? b.loadFactor : 999;
        return aLoad - bLoad;
      });
      
      setSuggestedDoctors(sortedDoctors.length > 0 ? sortedDoctors : doctors);
      
      if (sortedDoctors.length > 0) {
        setSelectedDoctorId(sortedDoctors[0].id);
      }
    }
  };

  // Enhanced Dijkstra's algorithm implementation with a proper priority queue
  // (Remove this duplicate declaration entirely)

  // Convert KeywordGroups to ConditionNodes for the algorithm
  const convertToConditionNodes = useCallback((groups: KeywordGroup[]): ConditionNode[] => {
    return groups.map(group => ({
      id: group.id,
      groupId: group.id,
      name: group.name,
      keywords: group.keywords.filter(k => k.isActive),
      department: group.department,
      priority: group.priority,
      score: group.baseScore,
      primaryPhysicians: [group.department] // Can be enhanced based on your needs
    }));
  }, []);

  const findOptimalPathWithDijkstra = useCallback((inputText: string): any => {
    // Early return if no keyword groups loaded
    if (keywordGroups.length === 0) {
      console.log("No keyword groups available");
      return {
        level: PriorityLevel.NORMAL,
        score: 30,
        suggestedDepartment: "General Practice",
        suggestedPrimaryPhysician: "General Practice",
        matchedKeywords: [],
        pathTrace: ["No keyword groups available"]
      };
    }
  
    // Sanitize and normalize input
    const sanitizedInput = inputText.replace(/<[^>]*>?/gm, '').trim();
    const normalizedText = normalizeText(sanitizedInput);
    
    console.log("Analyzing text:", normalizedText);
    
    if (normalizedText.length < 1) {
      return {
        level: PriorityLevel.NORMAL,
        score: 0, // Changed from 25 to 0
        suggestedDepartment: "General Practice",
        suggestedPrimaryPhysician: "General Practice",
        matchedKeywords: [],
        pathTrace: ["Please enter symptoms to analyze"]
      };
    }
  
    // Convert keyword groups to nodes
    const nodes = convertToConditionNodes(keywordGroups);
    const inputWords = normalizedText.split(/\s+/).filter(w => w.length >= 1); // Allow single character words
    
    console.log("Input words:", inputWords);
    console.log("Available nodes:", nodes.length);
  
    // Create adjacency matrix for true Dijkstra's algorithm
    const nodeCount = nodes.length;
    const distances: number[][] = Array(nodeCount).fill(null).map(() => Array(nodeCount).fill(Infinity));
    const nodeScores: number[] = Array(nodeCount).fill(0);
    
    // Initialize distances (self-distance = 0)
    for (let i = 0; i < nodeCount; i++) {
      distances[i][i] = 0;
    }
  
    // Create edges based on department relationships and symptom overlaps
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        let edgeWeight = 10; // Default high weight (low connection)
        
        // Same department = stronger connection
        if (nodeA.department === nodeB.department) {
          edgeWeight = 2;
        }
        
        // Similar priority = moderate connection
        if (nodeA.priority === nodeB.priority) {
          edgeWeight = Math.min(edgeWeight, 5);
        }
        
        // Shared keywords = very strong connection
        const sharedKeywords = nodeA.keywords.filter(kA => 
          nodeB.keywords.some(kB => 
            normalizeText(kA.text) === normalizeText(kB.text)
          )
        );
        
        if (sharedKeywords.length > 0) {
          edgeWeight = Math.max(1, edgeWeight - sharedKeywords.length);
        }
        
        distances[i][j] = edgeWeight;
        distances[j][i] = edgeWeight;
      }
    }
  
    // Calculate keyword match scores for each node
    nodes.forEach((node, nodeIndex) => {
      let totalScore = 0;
      const matches: string[] = [];
      
      node.keywords.forEach((keyword) => {
        if (!keyword.isActive) return;
        
        const normalizedKeyword = normalizeText(keyword.text);
        let matchScore = 0;
        
        // Exact phrase match (highest priority)
        if (normalizedText.includes(normalizedKeyword)) {
          matchScore = keyword.weight * 3.0;
          matches.push(keyword.text);
          console.log(`Exact match found: "${keyword.text}" in node "${node.name}"`);
        }
        // Word-by-word matching
        else {
          const keywordWords = normalizedKeyword.split(/\s+/).filter(w => w.length >= 1); // Allow single letters too
          let wordMatches = 0;
          
          keywordWords.forEach(keywordWord => {
            inputWords.forEach(inputWord => {
              // Exact word match
              if (inputWord === keywordWord) {
                wordMatches++;
                matchScore += keyword.weight * 2.0;
              }
              
              // Partial match (if enabled)
// Enhanced partial matching for better single-word detection
else if (settings.showPartialMatches && keyword.isPartialMatch) {
  // Substring match (both directions) - reduced minimum length requirement
  if (inputWord.includes(keywordWord) && keywordWord.length >= 1) {
    wordMatches++;
    matchScore += keyword.weight * 1.5;
  }
  else if (keywordWord.includes(inputWord) && inputWord.length >= 1) {
    wordMatches++;
    matchScore += keyword.weight * 1.2;
  }
  // Fuzzy matching for similar words - reduced minimum length
  else if (Math.abs(inputWord.length - keywordWord.length) <= 1 && inputWord.length >= 2) {
    const similarity = calculateSimilarity(inputWord, keywordWord);
    if (similarity > 0.7) {
      wordMatches++;
      matchScore += keyword.weight * 0.8;
    }
  }
}


            });
          });
          
          if (wordMatches > 0) {
            matches.push(`~${keyword.text}`);
            console.log(`Partial match found: "${keyword.text}" (${wordMatches} words) in node "${node.name}"`);
          }
        }
        
        totalScore += matchScore * (settings.sensitivityLevel / 100);
      });
      
      // Combination bonus
      if (settings.enableSymptomCombinations && matches.length > 1) {
        totalScore *= 1.4;
      }
      
      nodeScores[nodeIndex] = Math.min(totalScore, 15); // Cap scores
      
      if (totalScore > 0) {
        console.log(`Node "${node.name}" scored: ${totalScore.toFixed(2)}, matches: [${matches.join(', ')}]`);
      }
    });
  
    // Find the best starting node (highest score)
    let bestNodeIndex = -1;
    let bestScore = 0;
    
    nodeScores.forEach((score, index) => {
      if (score > bestScore) {
        bestScore = score;
        bestNodeIndex = index;
      }
    });
  
    if (bestNodeIndex === -1) {
      console.log("No keyword matches found");
      return {
        level: PriorityLevel.NORMAL,
        score: 0, // Changed from 25 to 0 for no matches
        suggestedDepartment: "General Practice",
        suggestedPrimaryPhysician: "General Practice",
        matchedKeywords: [],
        pathTrace: [`No symptom matches found for "${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}" - defaulting to General Practice`]
      };
    }
  
    // Run Dijkstra's algorithm from the best node
// Run optimized Dijkstra's algorithm from the best node
const dijkstraDistances: number[] = Array(nodeCount).fill(Infinity);
const visited: boolean[] = Array(nodeCount).fill(false);
const pq = new PriorityQueue<number>();

dijkstraDistances[bestNodeIndex] = 0;
pq.enqueue(bestNodeIndex, 0);

while (!pq.isEmpty()) {
  const currentNode = pq.dequeue()!;
  
  if (visited[currentNode]) continue;
  visited[currentNode] = true;
  
  // Early termination if we've processed enough nodes
  const visitedCount = visited.filter(v => v).length;
  if (visitedCount > Math.min(nodeCount * 0.7, 50)) break;
  
  for (let neighbor = 0; neighbor < nodeCount; neighbor++) {
    if (!visited[neighbor] && distances[currentNode][neighbor] !== Infinity) {
      const newDistance = dijkstraDistances[currentNode] + distances[currentNode][neighbor];
      
      if (newDistance < dijkstraDistances[neighbor]) {
        dijkstraDistances[neighbor] = newDistance;
        pq.enqueue(neighbor, newDistance);
      }
    }
  }
}
  
    // Find the optimal path considering both node scores and path distances
    let optimalNodeIndex = bestNodeIndex;
    let optimalScore = (nodeScores[bestNodeIndex] * 8) + (nodes[bestNodeIndex].score * 0.4);
    
    // Consider other high-scoring nodes that are well-connected
    for (let i = 0; i < nodeCount; i++) {
      if (nodeScores[i] > 0) {
        const pathWeight = dijkstraDistances[i] === Infinity ? 100 : dijkstraDistances[i];
        const combinedScore = (nodeScores[i] * 8) + (nodes[i].score * 0.4) - (pathWeight * 0.5);
        
        if (combinedScore > optimalScore) {
          optimalScore = combinedScore;
          optimalNodeIndex = i;
        }
      }
    }
  
    const selectedNode = nodes[optimalNodeIndex];
    let finalScore = Math.min(100, Math.max(25, optimalScore));
    let finalPriority = selectedNode.priority;
    
    // Apply threshold-based priority adjustment
    if (finalScore >= settings.emergencyThreshold) {
      finalPriority = PriorityLevel.EMERGENCY;
    } else if (finalScore >= settings.urgentThreshold) {
      finalPriority = PriorityLevel.URGENT;
    }
    
    // Collect matched keywords from the selected node
    const matchedKeywords: string[] = [];
    selectedNode.keywords.forEach((keyword) => {
      if (!keyword.isActive) return;
      
      const normalizedKeyword = normalizeText(keyword.text);
      
      if (normalizedText.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword.text);
      } else if (settings.showPartialMatches && keyword.isPartialMatch) {
        const keywordWords = normalizedKeyword.split(/\s+/);
        const hasPartialMatch = keywordWords.some(kw => 
          inputWords.some(iw => iw.includes(kw) || kw.includes(iw))
        );
        if (hasPartialMatch) {
          matchedKeywords.push(keyword.text);
        }
        
      }

      

      
    });
    
    console.log(`Final result: ${finalPriority} (${finalScore.toFixed(1)}/100) - ${selectedNode.department}`);
    
    return {
      level: finalPriority,
      score: Math.round(finalScore),
      suggestedDepartment: selectedNode.department,
      suggestedPrimaryPhysician: selectedNode.primaryPhysicians.join(', '),
      matchedKeywords,
      pathTrace: [
        `Analyzed ${nodes.length} symptom groups`,
        `Best scoring node: ${selectedNode.name} (score: ${nodeScores[optimalNodeIndex].toFixed(1)})`,
        `Dijkstra path weight: ${dijkstraDistances[optimalNodeIndex]}`,
        `Final score: ${finalScore.toFixed(1)}/100`,
        `Applied priority: ${finalPriority}`
      ]
    };
  }, [keywordGroups, convertToConditionNodes, settings]);

  const analyzeAppointmentPriority = useCallback((text: string) => {
    // Reset priority result when text is empty or too short
    if (!text || text.trim().length === 0) {
      setPriorityResult(null);
      setLastAnalysisResult('');
      if (onPriorityAssigned) {
        onPriorityAssigned(PriorityLevel.NORMAL, 0, "General Practice", selectedDoctorId || defaultDoctorId || '');
      }
      return;
    }
    
    if (text.length < 2 || loadingKeywords) return; // Reduced from 3 to 2 characters
    
    setAnalyzingPriority(true);
    
    // Cancel previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Create new timeout for analysis
    const newTimeout = setTimeout(() => {
      try {
        const result = findOptimalPathWithDijkstra(text);
        setPriorityResult(result);
        
        // Create a unique result signature to prevent duplicate toasts
        const resultSignature = `${result.level}-${result.score}-${result.suggestedDepartment}`;
        
        // Only show toast if result actually changed
        if (resultSignature !== lastAnalysisResult) {
          setLastAnalysisResult(resultSignature);
          toast.success(
            `Priority Analysis Complete: ${result.level} (${result.score}/100) - ${result.suggestedDepartment}`,
            { duration: 300}
          );
        }
        
        // Notify parent component
        if (onPriorityAssigned) {
          onPriorityAssigned(
            result.level, 
            result.score, 
            result.suggestedDepartment, 
            selectedDoctorId || defaultDoctorId || ''
          );
        }
        
        // Filter relevant doctors
        if (doctors.length > 0) {
          const relevantDoctors = doctors.filter(doctor => 
            doctor.department === result.suggestedDepartment || 
            doctor.specialization === result.suggestedDepartment ||
            doctor.specialization?.includes(result.suggestedDepartment) ||
            (result.suggestedDepartment === "General Practice" && 
              (doctor.specialization === "Internal Medicine" || 
                doctor.specialization === "Family Medicine")
            )
          );
          
          const sortedDoctors = [...relevantDoctors].sort((a, b) => {
            const aLoad = a.loadFactor !== undefined ? a.loadFactor : 999;
            const bLoad = b.loadFactor !== undefined ? b.loadFactor : 999;
            return aLoad - bLoad;
          });
          
          setSuggestedDoctors(sortedDoctors.length > 0 ? sortedDoctors : doctors);
          
          if (sortedDoctors.length > 0 && !selectedDoctorId) {
            setSelectedDoctorId(sortedDoctors[0].id);
          }
        }
      } catch (error) {
        console.error("Error analyzing appointment priority:", error);
        toast.error("Error analyzing symptoms. Please try again.");
      } finally {
        setAnalyzingPriority(false);
      }
    }, 300); // Further reduced debounce time for better responsiveness
    
    setDebounceTimeout(newTimeout);
  }, [
    findOptimalPathWithDijkstra, 
    onPriorityAssigned, 
    doctors, 
    selectedDoctorId, 
    defaultDoctorId, 
    loadingKeywords,
    lastAnalysisResult
  ]);

// Effect to analyze symptoms when note changes
useEffect(() => {
  // Always call analyze function, even for empty text (to reset state)
  analyzeAppointmentPriority(note || '');
}, [note]);  // Remove analyzeAppointmentPriority from dependencies

// Update note when appointmentNote prop changes
useEffect(() => {
  if (appointmentNote !== undefined && appointmentNote !== note) {
    setNote(appointmentNote);
  }
}, [appointmentNote]); // Remove note from dependencies



  // Load keyword groups on component mount
  useEffect(() => {
    const loadKeywords = async () => {
      setLoadingKeywords(true);
      try {
        const groups = await fetchKeywordGroups();
        setKeywordGroups(groups);
      } catch (error) {
        console.error('Failed to load keyword groups:', error);
        toast.error('Failed to load symptom database');
      } finally {
        setLoadingKeywords(false);
      }
    };

    loadKeywords();
  }, []);




  // Handle doctor selection
  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    
    if (priorityResult && onPriorityAssigned) {
      onPriorityAssigned(
        priorityResult.level,
        priorityResult.score,
        priorityResult.suggestedDepartment,
        doctorId
      );
    }
  };



// NEW CODE TO REPLACE WITH:
// Handle manual override of priority
const handlePriorityOverride = (priority: PriorityLevel) => {
  if (!priorityResult) return;

  const isPriorityChanging = priorityResult.level !== priority;
  
  if (!isPriorityChanging) return; // Don't do anything if priority isn't changing
  
  const updatedResult = {
    ...priorityResult,
    level: priority,
    score: priority === PriorityLevel.EMERGENCY ? 95 : 
           priority === PriorityLevel.URGENT ? 75 : 35,
    pathTrace: [...(priorityResult.pathTrace || []), "Manual priority override applied"]
  };
  
  setPriorityResult(updatedResult);
  
  // Update the last analysis result to prevent duplicate toasts
  const newResultSignature = `${priority}-${updatedResult.score}-${updatedResult.suggestedDepartment}`;
  setLastAnalysisResult(newResultSignature);
  
  if (onPriorityAssigned) {
    onPriorityAssigned(
      priority,
      updatedResult.score,
      updatedResult.suggestedDepartment,
      selectedDoctorId,
      true
    );
  }
  
  // Single toast for manual override
  toast.success(`Priority manually overridden to ${priority} (${updatedResult.score}/100)`);
};

  return (
    <Card className={`p-4 bg-background/60 backdrop-blur-sm shadow-md rounded-lg border border-border/50 ${className}`}>
          <div className="space-y-4"></div>
      {/* Loading state for keywords */}
      {loadingKeywords && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Loading symptom database...
        </div>
      )}
      <div className="space-y-4">
        {/* Empty state message */}
        {!priorityResult && !loadingKeywords && note && note.trim().length > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-pulse rounded-full h-2 w-2 bg-primary"></div>
              Analyzing symptoms...
            </div>
          </div>
        )}
        
        {/* No symptoms detected state */}
        {!priorityResult && !loadingKeywords && (!note || note.trim().length === 0) && (
          <div className="p-3 rounded-lg bg-muted/20 border border-dashed">
            <div className="text-sm text-muted-foreground text-center">
              Enter symptoms above to begin priority analysis
            </div>
          </div>
        )}
        
        {/* Results Display */}
        {priorityResult && (
          <div className={`p-3 rounded-lg ${PRIORITY_INDICATORS[priorityResult.level].bgColor} ${PRIORITY_INDICATORS[priorityResult.level].borderColor} border`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {priorityResult.level === PriorityLevel.EMERGENCY && (
                  <AlertTriangle className={`h-5 w-5 ${PRIORITY_INDICATORS[priorityResult.level].textColor}`} />
                )}
                {priorityResult.level === PriorityLevel.URGENT && (
                  <Activity className={`h-5 w-5 ${PRIORITY_INDICATORS[priorityResult.level].textColor}`} />
                )}
                {priorityResult.level === PriorityLevel.NORMAL && (
                  <HeartPulse className={`h-5 w-5 ${PRIORITY_INDICATORS[priorityResult.level].textColor}`} />
                )}
                <h3 className={`font-semibold ${PRIORITY_INDICATORS[priorityResult.level].textColor}`}>
                  {priorityResult.level} Priority
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {analyzingPriority && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary mr-1"></div>
                )}
<span className={`font-medium ${PRIORITY_INDICATORS[priorityResult.level].textColor}`}>
  {priorityResult.score}/100
</span>

              </div>
            </div>
            
            <div className="text-sm">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-muted-foreground">Department:</span>
                {isManualSelection ? (
                  <Select value={manualDepartment || priorityResult.suggestedDepartment} onValueChange={handleManualDepartmentChange}>
                    <SelectTrigger className="h-6 py-0 px-2 text-xs w-auto min-w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black-800">
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <>
                    <span className="font-medium">{priorityResult.suggestedDepartment}</span>
                    <button 
                      className="text-xs text-blue-500 hover:underline" 
                      onClick={() => {
                        setManualDepartment(priorityResult.suggestedDepartment);
                        setIsManualSelection(true);
                      }}
                    >
                      (Change)
                    </button>
                  </>
                )}
              </div>
              
              {priorityResult.matchedKeywords.length > 0 && (
                <div className="text-sm mb-2">
                  <span className="text-muted-foreground">Detected symptoms: </span>
                  <span>{priorityResult.matchedKeywords.join(', ')}</span>
                </div>
              )}
              
              {/* Priority override buttons */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Override priority:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePriorityOverride(PriorityLevel.EMERGENCY)}
                    className={`px-2 py-1 text-xs rounded 
                      ${priorityResult.level === PriorityLevel.EMERGENCY 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                  >
                    Emergency
                  </button>
                  <button
                    onClick={() => handlePriorityOverride(PriorityLevel.URGENT)}
                    className={`px-2 py-1 text-xs rounded 
                      ${priorityResult.level === PriorityLevel.URGENT 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'}`}
                  >
                    Urgent
                  </button>
                  <button
                    onClick={() => handlePriorityOverride(PriorityLevel.NORMAL)}
                    className={`px-2 py-1 text-xs rounded 
                      ${priorityResult.level === PriorityLevel.NORMAL 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
                  >
                    Normal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Doctor Selection */}
        {priorityResult && doctors.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">Assign to Doctor:</label>
            <Select value={selectedDoctorId} onValueChange={handleDoctorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent className="bg-black-800">
                {(suggestedDoctors.length > 0 ? suggestedDoctors : doctors).map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization || doctor.department || 'General'})
                    {doctor.loadFactor !== undefined && ` - Load: ${doctor.loadFactor}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AppointmentPriorityAnalyzer;