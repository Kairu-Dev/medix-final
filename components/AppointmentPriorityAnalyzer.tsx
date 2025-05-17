// AppointmentPriorityAnalyzer.tsx    --- Ver 3.1 
// POSSIBLE IMPROVEMENTS:
// IMPROVE LOAD FACTOR HANDLING: Add load factor to doctor selection logic WHEREIN DOCTOR WITH THE LOWEST PENDING APPOINTMENTS IS SELECTED FIRST
// ADD SYMPTOM KEYWORD EXPANSION: Add synonyms or related terms for keywords to improve matching accuracy
// ADD SYMPTOM COMBINATION LOGIC: Add logic to handle combinations of symptoms for better matching
// ADD AN OPTION TO PROVIDE A SETTINGS OF THIS COMPONENT TO ALLOW THE ADMIN TO ADD MORE KEYWORDS SIMILAR TO TAGS IN MANGADEX (EX. MAGIC, FANTASY, HAREM GANON GANON BUT IN MEDICAL TERMS OF COURSE)
// Create an Interface to customize values for each departments and use tags to add words to the list.
// The Override tag is kinda buggy fix it  in a later patch



"use client";

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
    /* eslint-disable */
interface AppointmentPriorityAnalyzerProps {
  patientId: string;
  appointmentNote: string;
  defaultDoctorId?: string;
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

// Enhanced types for graph-based algorithm
interface ConditionNode {
  id: number;
  keywords: string[];
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
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }
  
  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  contains(element: T): boolean {
    return this.items.some(item => item.element === element);
  }
  
  changePriority(element: T, newPriority: number): void {
    const index = this.items.findIndex(item => item.element === element);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.enqueue(element, newPriority);
    }
  }
}

// Define expanded keywords for conditions with their associated departments and priority levels
const CONDITION_MAPPINGS: ConditionNode[] = [
  // Emergencies (highest priority)
  { 
    id: 0,
    keywords: [
      "chest pain", "heart attack", "cardiac arrest", "difficulty breathing", 
      "severe bleeding", "unconscious", "stroke", "seizure", "anaphylaxis",
      "severe injury", "trauma", "head injury", "can't breathe", "collapse",
      "unresponsive", "not breathing", "hemorrhage", "convulsion", "choking"
    ],
    department: "Emergency",
    priority: PriorityLevel.EMERGENCY,
    score: 95,
    primaryPhysicians: ["Emergency Medicine", "Trauma", "Critical Care"]
  },
  // Urgent conditions
  {
    id: 1,
    keywords: [
      "fever", "infection", "severe pain", "broken bone", "fracture", 
      "shortness of breath", "deep cut", "laceration", "migraine",
      "severe headache", "allergic reaction", "asthma attack", "vomiting blood",
      "high blood pressure", "hypertension", "dizziness", "fainting",
      "concussion", "burn", "animal bite", "food poisoning"
    ],
    department: "Urgent Care",
    priority: PriorityLevel.URGENT,
    score: 75,
    primaryPhysicians: ["Urgent Care", "General Medicine", "Emergency Medicine"]
  },
  // Cardiology specific
  {
    id: 2,
    keywords: [
      "heart", "chest", "palpitation", "arrhythmia", "cardiovascular",
      "hypertension", "blood pressure", "murmur", "angina", "coronary",
      "cardiac", "heartbeat", "cholesterol", "valve", "stent", "pacemaker"
    ],
    department: "Cardiology",
    priority: PriorityLevel.NORMAL,
    score: 50,
    primaryPhysicians: ["Cardiology", "Cardiovascular Medicine", "Cardiothoracic"]
  },
  // Neurology specific
  {
    id: 3,
    keywords: [
      "headache", "migraine", "nerve", "numbness", "tingling", "brain",
      "memory loss", "tremor", "dizziness", "balance", "seizure", "epilepsy",
      "multiple sclerosis", "parkinson", "alzheimer", "stroke", "dementia",
      "neuralgia", "neuropathy", "concussion", "head trauma"
    ],
    department: "Neurology",
    priority: PriorityLevel.NORMAL,
    score: 45,
    primaryPhysicians: ["Neurology", "Neuropsychiatry", "Neurosurgery"]
  },
  // Orthopedics specific
  {
    id: 4,
    keywords: [
      "bone", "joint", "fracture", "sprain", "arthritis", "knee", "shoulder",
      "hip", "back pain", "neck pain", "muscle", "tendon", "ligament",
      "osteoporosis", "disc", "spine", "scoliosis", "herniated", "sports injury",
      "carpal tunnel", "physical therapy", "mobility issues"
    ],
    department: "Orthopedics",
    priority: PriorityLevel.NORMAL,
    score: 40,
    primaryPhysicians: ["Orthopedics", "Sports Medicine", "Physical Therapy"]
  },
  // Dermatology specific
  {
    id: 5,
    keywords: [
      "skin", "rash", "acne", "dermatitis", "eczema", "psoriasis", "mole",
      "itching", "lesion", "wart", "melanoma", "hair loss", "hives",
      "dermal", "cellulitis", "sunburn", "blister", "skin infection", "skin tag"
    ],
    department: "Dermatology",
    priority: PriorityLevel.NORMAL,
    score: 35,
    primaryPhysicians: ["Dermatology", "Dermatopathology"]
  },
  // Gastroenterology specific
  {
    id: 6,
    keywords: [
      "stomach", "digestion", "intestine", "liver", "colon", "ulcer", "reflux",
      "abdominal", "pain", "diarrhea", "constipation", "nausea", "vomiting",
      "heartburn", "indigestion", "crohn", "colitis", "gastritis", "IBS",
      "gallbladder", "appendix", "celiac", "bloating", "GERD", "acid reflux"
    ],
    department: "Gastroenterology",
    priority: PriorityLevel.NORMAL,
    score: 40,
    primaryPhysicians: ["Gastroenterology", "Digestive Health", "Hepatology"]
  },
  // ENT specific
  {
    id: 7,
    keywords: [
      "ear", "nose", "throat", "sinus", "hearing", "tonsil", "snoring",
      "rhinitis", "voice", "hoarse", "sore throat", "tinnitus", "vertigo",
      "nasal congestion", "ear infection", "deviated septum", "sleep apnea",
      "hearing loss", "ear pain", "sinus infection", "allergies"
    ],
    department: "ENT",
    priority: PriorityLevel.NORMAL,
    score: 35,
    primaryPhysicians: ["Otolaryngology", "ENT", "Ear-Nose-Throat"]
  },
  // Pulmonary specific
  {
    id: 8,
    keywords: [
      "lung", "breathing", "asthma", "cough", "COPD", "pneumonia", "bronchitis",
      "tuberculosis", "emphysema", "pulmonary", "respiratory", "shortness of breath",
      "wheezing", "oxygen", "inhaler", "sleep apnea", "pulmonary fibrosis"
    ],
    department: "Pulmonology",
    priority: PriorityLevel.NORMAL,
    score: 40,
    primaryPhysicians: ["Pulmonology", "Respiratory Medicine", "Thoracic Medicine"]
  },
  // Endocrinology specific
  {
    id: 9,
    keywords: [
      "diabetes", "thyroid", "hormone", "insulin", "metabolism", "endocrine",
      "pituitary", "adrenal", "growth", "obesity", "osteoporosis", "cortisol",
      "hyperthyroidism", "hypothyroidism", "gestational diabetes", "PCOS"
    ],
    department: "Endocrinology",
    priority: PriorityLevel.NORMAL,
    score: 38,
    primaryPhysicians: ["Endocrinology", "Diabetes Specialist", "Metabolism"]
  },
  // General/Default
  {
    id: 10,
    keywords: [
      "checkup", "general", "routine", "annual", "physical", "examination",
      "follow up", "consultation", "review", "preventive", "wellness", "screening",
      "blood test", "vaccination", "immunization", "prescription refill"
    ],
    department: "General Practice",
    priority: PriorityLevel.NORMAL,
    score: 30,
    primaryPhysicians: ["General Practice", "Family Medicine", "Internal Medicine"]
  }
];

// Define common symptom connections across departments
// This represents the actual graph structure where symptoms can connect to multiple departments
const SYMPTOM_CONNECTIONS: Edge[] = [
  // Chest pain connections (could be cardiac, pulmonary, or emergency)
  { from: 0, to: 2, weight: 5 }, // Emergency to Cardiology
  { from: 0, to: 8, weight: 8 }, // Emergency to Pulmonology
  
  // Headache connections (neurology, ENT, general)
  { from: 3, to: 7, weight: 6 }, // Neurology to ENT
  { from: 3, to: 10, weight: 7 }, // Neurology to General Practice
  
  // Joint pain connections (orthopedics, rheumatology represented by endocrinology)
  { from: 4, to: 9, weight: 7 }, // Orthopedics to Endocrinology
  
  // Abdominal pain (gastro, emergency)
  { from: 6, to: 0, weight: 8 }, // Gastroenterology to Emergency
  { from: 6, to: 10, weight: 6 }, // Gastroenterology to General Practice
  
  // Breathing issues (pulmonology, emergency, cardiology)
  { from: 8, to: 0, weight: 5 }, // Pulmonology to Emergency
  { from: 8, to: 2, weight: 7 }, // Pulmonology to Cardiology
  
  // Fever (urgent care, general)
  { from: 1, to: 10, weight: 6 }, // Urgent Care to General Practice
  
  // Add edges from emergency to all other departments (lower weight)
  ...Array.from({ length: 10 }, (_, i) => ({ from: 0, to: i + 1, weight: 10 })),
  
  // Add edges from urgent care to most departments
  ...Array.from({ length: 9 }, (_, i) => ({ from: 1, to: i + 2, weight: 12 })),
  
  // Add edges between general practice and all other departments (higher weight)
  ...Array.from({ length: 10 }, (_, i) => ({ from: 10, to: i, weight: 15 }))
];

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

interface AdvancedSettings {
  sensitivityLevel: number;
  showPartialMatches: boolean;
  enableSymptomCombinations: boolean;
  urgentThreshold: number;
  emergencyThreshold: number;
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  sensitivityLevel: 70,
  showPartialMatches: true,
  enableSymptomCombinations: true,
  urgentThreshold: 65,
  emergencyThreshold: 85
};

const AppointmentPriorityAnalyzer: React.FC<AppointmentPriorityAnalyzerProps> = ({
  patientId,
  appointmentNote,
  defaultDoctorId,
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
    pathTrace?: string[];  // For debugging/explaining the algorithm path
  } | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctorId || '');
  const [suggestedDoctors, setSuggestedDoctors] = useState<any[]>([]);
  const [manualDepartment, setManualDepartment] = useState<string>("");
  const [isManualSelection, setIsManualSelection] = useState<boolean>(false);
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Available departments for manual selection
  const availableDepartments = [
    "Emergency", "Urgent Care", "Cardiology", "Neurology", "Orthopedics",
    "Dermatology", "Gastroenterology", "ENT", "Pulmonology", "Endocrinology",
    "General Practice", "Psychiatry", "Ophthalmology", "Urology", "Oncology",
    "Gynecology", "Pediatrics"
  ];

  // Helper function to normalize text
  const normalizeText = (text: string): string => {
    // Improved normalization with proper word boundaries
    const normalized = text.toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')  // Replace non-alphanumeric with spaces
      .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
      .trim();                     // Remove leading/trailing spaces
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
  const findOptimalPathWithDijkstra = useCallback((inputText: string): any => {
    // Sanitize input text
    const sanitizedInput = inputText.replace(/<[^>]*>?/gm, ''); // Basic XSS protection
    const normalizedText = normalizeText(sanitizedInput);
    
    if (normalizedText.trim().length < 4) {
      return {
        level: PriorityLevel.NORMAL,
        score: 30,
        suggestedDepartment: "General Practice",
        suggestedPrimaryPhysician: "General Practice, Family Medicine, Internal Medicine",
        matchedKeywords: [],
        pathTrace: ["Insufficient symptom description"]
      };
    }
    
    // Extract words for better matching
    const inputWords = normalizedText.split(' ').filter(w => w.length > 2);
    
    // Step 1: Initialize graph from our condition mappings
    const nodes = CONDITION_MAPPINGS;
    const numNodes = nodes.length;
    const graph: Map<number, { to: number; weight: number }[]> = new Map();
    
    // Initialize the graph with edges from SYMPTOM_CONNECTIONS
    for (let i = 0; i < numNodes; i++) {
      graph.set(i, []);
    }
    
    // Add edges from our predefined connections
    SYMPTOM_CONNECTIONS.forEach(edge => {
      const connections = graph.get(edge.from) || [];
      connections.push({ to: edge.to, weight: edge.weight });
      graph.set(edge.from, connections);
      
      // Also add reverse connection for undirected graph
      const reverseConnections = graph.get(edge.to) || [];
      reverseConnections.push({ to: edge.from, weight: edge.weight });
      graph.set(edge.to, reverseConnections);
    });
    
    // Step 2: Find initial symptom matches for each department node
    const virtualSourceNode = numNodes; // Virtual source node for Dijkstra
    graph.set(virtualSourceNode, []);
    
    const matchedKeywordsByNode: Map<number, { keyword: string; score: number }[]> = new Map();
    const pathTrace: string[] = ["Analyzing symptoms using Dijkstra's algorithm"];
    
    // For each node, evaluate how well it matches the input text
    nodes.forEach((node, nodeIndex) => {
      // Look for exact keyword matches
      const exactMatches = node.keywords.filter(keyword => {
        const normalizedKeyword = normalizeText(keyword);
        // Better exact match - ensure word boundaries
        return normalizedText.includes(` ${normalizedKeyword} `) || 
               normalizedText.startsWith(`${normalizedKeyword} `) || 
               normalizedText.endsWith(` ${normalizedKeyword}`) ||
               normalizedText === normalizedKeyword;
      });
      
      let matches: { keyword: string; score: number }[] = [];
      
      // Add exact matches with high confidence
      exactMatches.forEach(keyword => {
        // Longer keywords get higher weight (more specific)
        const keywordWeight = Math.min(1.0, keyword.length / 10); // Cap at 1.0
        matches.push({ 
          keyword, 
          score: keywordWeight * (1.0 + (settings.sensitivityLevel / 100))
        });
      });
      
      // Add partial matches if enabled
      if (settings.showPartialMatches) {
        const partialMatches = node.keywords.filter(keyword => {
          // Skip if already exact match
          if (exactMatches.includes(keyword)) return false;
          
          const normalizedKeyword = normalizeText(keyword);
          
          // Check if any input word is contained in this keyword
          for (const word of inputWords) {
            if (word.length > 3 && (
              normalizedKeyword.includes(` ${word} `) || 
              normalizedKeyword.startsWith(`${word} `) || 
              normalizedKeyword.endsWith(` ${word}`) ||
              normalizedKeyword === word
            )) {
              return true;
            }
          }
          
          return false;
        });
        
        // Add partial matches with lower confidence
        partialMatches.forEach(keyword => {
          // Partial matches get lower weight
          const keywordWeight = Math.min(0.7, keyword.length / 15); // Cap at 0.7
          matches.push({ 
            keyword: `~${keyword}`, // Mark as partial
            score: keywordWeight * (0.7 * (settings.sensitivityLevel / 100))
          });
        });
      }
      
      // Special case: Symptom combinations for emergencies
      if (settings.enableSymptomCombinations) {
        // Example: chest pain + shortness of breath indicates higher emergency priority
        const hasChestPain = normalizedText.includes("chest pain") || 
                            normalizedText.includes("chest") && normalizedText.includes("pain");
        const hasBreathingIssue = normalizedText.includes("breath") || 
                                 normalizedText.includes("breathing") ||
                                 normalizedText.includes("shortness");
        
        if (hasChestPain && hasBreathingIssue && node.id === 0) { // Emergency node
          matches.push({ 
            keyword: "chest pain + breathing difficulty", 
            score: 2.0 * (settings.sensitivityLevel / 100)
          });
          pathTrace.push("Detected critical symptom combination: chest pain + breathing difficulty");
        }
        
        // Severe headache + dizziness/confusion might indicate stroke or serious neurological issue
        const hasSevereHeadache = normalizedText.includes("severe headache") || 
                                 (normalizedText.includes("severe") && normalizedText.includes("headache"));
        const hasDizziness = normalizedText.includes("dizz") || normalizedText.includes("confusion");
        
        if (hasSevereHeadache && hasDizziness && (node.id === 0 || node.id === 3)) {
          matches.push({ 
            keyword: "severe headache + dizziness", 
            score: 1.8 * (settings.sensitivityLevel / 100) 
          });
          pathTrace.push("Detected critical symptom combination: severe headache + dizziness");
        }
        
        // Add more symptom combinations here as needed
      }
      
      if (matches.length > 0) {
        matchedKeywordsByNode.set(nodeIndex, matches);
        
        // Calculate the weight of the edge from virtual source to this node
        // Lower weight means stronger connection (higher priority in Dijkstra)
        const totalMatchScore = matches.reduce((sum, match) => sum + match.score, 0);
        const basePriority = node.score / 100; // Scale to 0-1
        const adjustedWeight = 1000 - (totalMatchScore * 100 * basePriority);
        
        // Connect virtual source to this node
        const sourceConnections = graph.get(virtualSourceNode) || [];
        sourceConnections.push({ to: nodeIndex, weight: adjustedWeight });
        graph.set(virtualSourceNode, sourceConnections);
        
        pathTrace.push(`Connected to ${node.department} with weight ${adjustedWeight.toFixed(2)}`);
      }
    });
    
    // Step 3: Run Dijkstra's algorithm from the virtual source node
    // Initialize distances
    const distances: number[] = Array(numNodes + 1).fill(Infinity);
    distances[virtualSourceNode] = 0;
    
    // Initialize previous nodes for path reconstruction
    const previous: number[] = Array(numNodes + 1).fill(-1);
    
    // Initialize priority queue
    const pq = new PriorityQueue<number>();
    pq.enqueue(virtualSourceNode, 0);
    
    // Track visited nodes
    const visited: Set<number> = new Set();
    
    // Dijkstra's main loop
    while (!pq.isEmpty()) {
      const currentNode = pq.dequeue();
      if (currentNode === undefined || visited.has(currentNode)) continue;
      
      visited.add(currentNode);
      
      // If we've already found all department nodes, we can stop
      if (currentNode !== virtualSourceNode && visited.size > 3) {
        break;
      }
      
      // Get all neighbors
      const neighbors = graph.get(currentNode) || [];
      
      // Update distances to neighbors
      for (const { to: neighbor, weight } of neighbors) {
        if (visited.has(neighbor)) continue;
        
        const newDistance = distances[currentNode] + weight;
        
        // If we found a shorter path, update distance
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = currentNode;
          
          // Update priority queue
          if (pq.contains(neighbor)) {
            pq.changePriority(neighbor, newDistance);
          } else {
            pq.enqueue(neighbor, newDistance);
          }
        }
      }
    }
    
    // Step 4: Find the node with the minimum final distance (excluding source)
    let minDistance = Infinity;
    let bestNodeIndex = -1;
    
    for (let i = 0; i < numNodes; i++) {
      // Only consider nodes that were reachable
      if (distances[i] < Infinity && distances[i] < minDistance) {
        minDistance = distances[i];
        bestNodeIndex = i;
      }
    }
    
    // Step 5: Reconstruct the path from source to best node
    const path: number[] = [];
    let current = bestNodeIndex;
    
    while (current !== -1 && current !== virtualSourceNode) {
      path.unshift(current);
      current = previous[current];
    }
    
    // If we found a valid path
    if (bestNodeIndex !== -1 && path.length > 0) {
      const bestNode = nodes[bestNodeIndex];
      const matchedKeywords = matchedKeywordsByNode.get(bestNodeIndex) || [];
      
      // Clean up the partial match markers for display
      const cleanedKeywords = matchedKeywords.map(match => 
        match.keyword.startsWith('~') ? match.keyword.substring(1) : match.keyword
      );
      
      // Calculate final score based on node score and matched keywords
      const keywordScoreSum = matchedKeywords.reduce((sum, match) => sum + match.score, 0);
      const baseScore = bestNode.score;
      let finalScore = Math.min(100, baseScore + (keywordScoreSum * 10));
      
      // Allow priority overrides based on settings thresholds
      const overriddenPriority = 
        finalScore >= settings.emergencyThreshold ? PriorityLevel.EMERGENCY :
        finalScore >= settings.urgentThreshold ? PriorityLevel.URGENT :
        PriorityLevel.NORMAL;
      
      const pathDetails = path.map(nodeId => nodes[nodeId].department).join(" → ");
      pathTrace.push(`Found optimal path: ${pathDetails}`);
      pathTrace.push(`Final score: ${finalScore.toFixed(1)}/100`);
      
      // Create result object
      return {
        level: overriddenPriority,
        score: Math.round(finalScore),
        suggestedDepartment: bestNode.department,
        suggestedPrimaryPhysician: bestNode.primaryPhysicians.join(', '),
        matchedKeywords: cleanedKeywords,
        pathTrace
      };
    }
    
    // Default to general practice if no good matches
    return {
      level: PriorityLevel.NORMAL,
      score: 25,
      suggestedDepartment: "General Practice",
      suggestedPrimaryPhysician: "General Practice, Family Medicine, Internal Medicine",
      matchedKeywords: [],
      pathTrace: [...pathTrace, "No strong symptom matches found - defaulting to General Practice"]
    };
  }, [settings]);

  const analyzeAppointmentPriority = useCallback((text: string) => {
    if (!text || text.length < 5) return;
    
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
        
        // If callback exists, notify parent component
        if (onPriorityAssigned) {
          onPriorityAssigned(
            result.level, 
            result.score, 
            result.suggestedDepartment, 
            selectedDoctorId || defaultDoctorId || '',
            true, // Indicate this is a manual override
          );
        }
        
        // Filter doctors based on department recommendation
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
          
          // Sort by load factor and specialization match
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
    }, 800); // 800ms debounce
    
    setDebounceTimeout(newTimeout);
  }, [findOptimalPathWithDijkstra, onPriorityAssigned, doctors, selectedDoctorId, defaultDoctorId]);

// Effect to analyze symptoms when note changes
useEffect(() => {
  if (note && note.trim().length > 0) {
    analyzeAppointmentPriority(note);
  }
}, [note]);  // Remove analyzeAppointmentPriority from dependencies

// Update note when appointmentNote prop changes
useEffect(() => {
  if (appointmentNote !== undefined && appointmentNote !== note) {
    setNote(appointmentNote);
  }
}, [appointmentNote]); // Remove note from dependencies

// Add a separate effect for settings changes to avoid infinite loops
useEffect(() => {
  // Only run if note exists and has content
  if (note && note.trim().length > 0) {
    analyzeAppointmentPriority(note);
  }
}, [settings]); // Only depend on settings

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

  // Handle settings changes
  const handleSettingChange = (settingName: keyof AdvancedSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [settingName]: value
    }));
    
  // Don't re-analyze immediately - wait for next render
  // analyzeAppointmentPriority(note); - REMOVE THIS LINE
  };


// Reset to default settings
const handleResetSettings = () => {
  setSettings(DEFAULT_SETTINGS);
  // Don't call analyzeAppointmentPriority here - let the effect handle it
  toast.success("Settings reset to defaults");
};

const [lastToastTime, setLastToastTime] = useState<number>(0);

  // Handle manual override of priority
  const handlePriorityOverride = (priority: PriorityLevel) => {
    if (!priorityResult) return;

    // Only show toast if we're actually changing the priority
    const isPriorityChanging = priorityResult.level !== priority;
    
    const updatedResult = {
      ...priorityResult,
      level: priority,
      score: priority === PriorityLevel.EMERGENCY ? 95 : 
             priority === PriorityLevel.URGENT ? 75 : 35,
      pathTrace: [...(priorityResult.pathTrace || []), "Manual priority override applied"]
    };
    
    setPriorityResult(updatedResult);
    
    if (onPriorityAssigned) {
      onPriorityAssigned(
        priority,
        updatedResult.score,
        updatedResult.suggestedDepartment,
        selectedDoctorId,
        true,
      );
    }
  // Only show toast if the priority actually changed and manage delay
  if (isPriorityChanging) {
    const now = Date.now();
    const timeSinceLastToast = now - lastToastTime;
    
    // If less than 1.5 seconds since last toast, delay this one
    if (timeSinceLastToast < 1500) {
      setTimeout(() => {
        toast.success(`Priority manually set to ${priority}`);
        setLastToastTime(Date.now());
      }, 1500 - timeSinceLastToast);
    } else {
      toast.success(`Priority manually set to ${priority}`);
      setLastToastTime(now);
      }
    }
  };

  return (
    <Card className={`p-4 bg-background/60 backdrop-blur-sm shadow-md rounded-lg border border-border/50 ${className}`}>
      <div className="space-y-4">
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
                <span className={`font-medium ${PRIORITY_INDICATORS[priorityResult.level].textColor}`}>
                  {priorityResult.score}/100
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="p-1 rounded-full hover:bg-secondary/50 transition-colors">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="shad-dialog max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle>Advanced Settings</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Sensitivity Level</span>
                                  <span className="text-sm text-muted-foreground">{settings.sensitivityLevel}%</span>
                                </div>
                                <Slider
                                  value={[settings.sensitivityLevel]}
                                  min={30}
                                  max={100}
                                  step={5}
                                  onValueChange={(value) => handleSettingChange('sensitivityLevel', value[0])}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Adjusts how sensitive the system is to symptom keywords
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Show Partial Matches</div>
                                  <div className="text-xs text-muted-foreground">
                                    Include symptoms with partial keyword matches
                                  </div>
                                </div>
                                <Switch
                                  checked={settings.showPartialMatches}
                                  onCheckedChange={(value) => handleSettingChange('showPartialMatches', value)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium">Enable Symptom Combinations</div>
                                  <div className="text-xs text-muted-foreground">
                                    Detect combined symptoms for better priority assessment
                                  </div>
                                </div>
                                <Switch
                                  checked={settings.enableSymptomCombinations}
                                  onCheckedChange={(value) => handleSettingChange('enableSymptomCombinations', value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Urgent Threshold</span>
                                  <span className="text-sm text-muted-foreground">{settings.urgentThreshold}/100</span>
                                </div>
                                <Slider
                                  value={[settings.urgentThreshold]}
                                  min={50}
                                  max={80}
                                  step={5}
                                  onValueChange={(value) => handleSettingChange('urgentThreshold', value[0])}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Emergency Threshold</span>
                                  <span className="text-sm text-muted-foreground">{settings.emergencyThreshold}/100</span>
                                </div>
                                <Slider
                                  value={[settings.emergencyThreshold]}
                                  min={75}
                                  max={95}
                                  step={5}
                                  onValueChange={(value) => handleSettingChange('emergencyThreshold', value[0])}
                                />
                              </div>
                              
                              <div className="flex justify-end pt-2">
                                <Button 
                                  variant="outline" 
                                  onClick={handleResetSettings}
                                  className="flex items-center gap-2"
                                >
                                  <RefreshCcw className="h-4 w-4" />
                                  Reset to Defaults
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adjust analysis settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                    <SelectContent>
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
              <SelectContent>
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