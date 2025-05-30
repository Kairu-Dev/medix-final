
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
interface EnhancedAnalysisResult {
  nlpConfidence: number;
  pathwayScore: number;
  contextFactors: {
    negation: boolean;
    severity: 'mild' | 'moderate' | 'severe';
    temporal: 'acute' | 'chronic' | 'unknown';
    urgencyMarkers: string[];
  };
  enhancedMatches: Array<{
    keyword: string;
    matchType: 'exact' | 'fuzzy' | 'phonetic' | 'abbreviation' | 'partial';
    confidence: number;
    contextModifier: number;
  }>;
}



// Medical abbreviations and synonyms database
const MEDICAL_ABBREVIATIONS = new Map([
  ['sob', 'shortness of breath'],
  ['cp', 'chest pain'],
  ['ha', 'headache'],
  ['n/v', 'nausea vomiting'],
  ['nv', 'nausea vomiting'],
  ['abd', 'abdominal'],
  ['gi', 'gastrointestinal'],
  ['uti', 'urinary tract infection'],
  ['uri', 'upper respiratory infection'],
  ['bp', 'blood pressure'],
  ['hr', 'heart rate'],
  ['rr', 'respiratory rate'],
  ['temp', 'temperature'],
  ['fever', 'high temperature'],
  ['chills', 'cold shivering'],
  ['dizziness', 'lightheaded'],
  ['fatigue', 'tired exhausted'],
  ['weakness', 'weak tired'],
]);

const SEVERITY_INDICATORS = {
  severe: ['severe', 'excruciating', 'unbearable', 'worst', 'intense', 'crushing', 'stabbing', 'shooting'],
  moderate: ['moderate', 'significant', 'noticeable', 'bothersome', 'uncomfortable'],
  mild: ['mild', 'slight', 'minor', 'little', 'light', 'small']
};

const TEMPORAL_INDICATORS = {
  acute: ['sudden', 'suddenly', 'acute', 'immediate', 'rapid', 'quick', 'just started', 'began today'],
  chronic: ['chronic', 'ongoing', 'persistent', 'long-term', 'months', 'years', 'always', 'constant']
};

const NEGATION_WORDS = ['no', 'not', 'never', 'without', 'absent', 'negative', 'deny', 'denies'];

const URGENCY_MARKERS = [
  'cant breathe', 'difficulty breathing', 'chest pain', 'severe pain', 'unconscious',
  'bleeding heavily', 'severe bleeding', 'heart attack', 'stroke', 'seizure',
  'allergic reaction', 'anaphylaxis', 'overdose', 'poisoning', 'suicide'
];

// ===== ENHANCED NLP FUNCTIONS =====
// Replace your existing normalizeText function with this enhanced version

const enhancedNormalizeText = (text: string): { 
  normalized: string; 
  originalWords: string[]; 
  expandedText: string;
} => {
  // Basic normalization
  const basicNormalized = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const originalWords = basicNormalized.split(' ').filter(w => w.length >= 2);
  
  // Expand abbreviations and synonyms
  let expandedText = basicNormalized;
  MEDICAL_ABBREVIATIONS.forEach((expansion, abbrev) => {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    expandedText = expandedText.replace(regex, `${abbrev} ${expansion}`);
  });

  return {
    normalized: basicNormalized,
    originalWords,
    expandedText
  };
};

// Phonetic matching using Soundex algorithm
const soundex = (str: string): string => {
  const code = str.toUpperCase().charAt(0);
  const consonants = str.toUpperCase().replace(/[AEIOUYHW]/g, '').substring(1);
  const mapped = consonants
    .replace(/[BFPV]/g, '1')
    .replace(/[CGJKQSXZ]/g, '2')
    .replace(/[DT]/g, '3')
    .replace(/[L]/g, '4')
    .replace(/[MN]/g, '5')
    .replace(/[R]/g, '6')
    .replace(/(.)\1+/g, '$1');
  
  return (code + mapped + '000').substring(0, 4);
};

// Advanced fuzzy matching with Jaro-Winkler distance
const jaroWinklerDistance = (s1: string, s2: string): number => {
  if (s1 === s2) return 1;
  
  const len1 = s1.length;
  const len2 = s2.length;
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  
  if (matchWindow < 1) return s1 === s2 ? 1 : 0;
  
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Winkler modification
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
};

// Context analysis for negation, severity, and temporal indicators
const analyzeContext = (text: string, matchedKeyword: string, matchPosition: number): {
  negation: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  temporal: 'acute' | 'chronic' | 'unknown';
  urgencyMarkers: string[];
} => {
  const words = text.toLowerCase().split(/\s+/);
  const keywordIndex = words.findIndex((word, index) => 
    index >= Math.max(0, matchPosition - 2) && 
    index <= matchPosition + 2 && 
    word.includes(matchedKeyword.toLowerCase().split(' ')[0])
  );
  
  // Check for negation in surrounding context (3 words before keyword)
  const contextStart = Math.max(0, keywordIndex - 3);
  const contextEnd = Math.min(words.length, keywordIndex + 1);
  const contextWords = words.slice(contextStart, contextEnd);
  
  const negation = NEGATION_WORDS.some(neg => contextWords.includes(neg));
  
  // Determine severity
  let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
  const allText = text.toLowerCase();
  
  if (SEVERITY_INDICATORS.severe.some(indicator => allText.includes(indicator))) {
    severity = 'severe';
  } else if (SEVERITY_INDICATORS.mild.some(indicator => allText.includes(indicator))) {
    severity = 'mild';
  }
  
  // Determine temporal aspect
  let temporal: 'acute' | 'chronic' | 'unknown' = 'unknown';
  if (TEMPORAL_INDICATORS.acute.some(indicator => allText.includes(indicator))) {
    temporal = 'acute';
  } else if (TEMPORAL_INDICATORS.chronic.some(indicator => allText.includes(indicator))) {
    temporal = 'chronic';
  }
  
  // Find urgency markers
  const urgencyMarkers = URGENCY_MARKERS.filter(marker => allText.includes(marker));
  
  return { negation, severity, temporal, urgencyMarkers };
};

// Enhanced keyword matching with multiple algorithms
// Enhanced fuzzy matching with dynamic multi-word support
const enhancedKeywordMatch = (
  inputText: string, 
  keyword: Keyword, 
  settings: AdvancedSettings
): {
  isMatch: boolean;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'phonetic' | 'abbreviation' | 'partial';
  contextModifier: number;
} => {
  const { normalized, expandedText } = enhancedNormalizeText(inputText);
  const keywordText = keyword.text.toLowerCase();
  
  let bestMatch = {
    isMatch: false,
    confidence: 0,
    matchType: 'partial' as 'exact' | 'fuzzy' | 'phonetic' | 'abbreviation' | 'partial',
    contextModifier: 1
  };
  
  // Helper function to check word boundaries
  const isWordBoundaryMatch = (text: string, searchTerm: string): boolean => {
    const regex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  };
  
  // Helper function to get match position for context analysis
  const getMatchPosition = (text: string, searchTerm: string): number => {
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    return index >= 0 ? text.substring(0, index).split(/\s+/).length - 1 : 0;
  };
  
  // Split input and keyword into words for analysis
  const inputWords = normalized.split(/\s+/).filter(w => w.length >= 1);
  const keywordWords = keywordText.split(/\s+/).filter(w => w.length >= 1);
  
  // 1. EXACT WORD BOUNDARY MATCH (highest confidence)
  if (isWordBoundaryMatch(normalized, keywordText) || isWordBoundaryMatch(expandedText, keywordText)) {
    const matchPosition = getMatchPosition(normalized, keywordText);
    const context = analyzeContext(inputText, keywordText, matchPosition);
    
    bestMatch = {
      isMatch: true,
      confidence: 0.95,
      matchType: 'exact' as const,
      contextModifier: context.negation ? 0.1 : (context.severity === 'severe' ? 1.3 : context.severity === 'mild' ? 0.8 : 1.0)
    };
  }
  
  // 2. ABBREVIATION MATCH with word boundaries
  if (!bestMatch.isMatch) {
    for (const [abbrev, expansion] of MEDICAL_ABBREVIATIONS.entries()) {
      if (isWordBoundaryMatch(normalized, abbrev) && expansion.includes(keywordText)) {
        bestMatch = {
          isMatch: true,
          confidence: 0.85,
          matchType: 'abbreviation' as const,
          contextModifier: 1.0
        };
        break;
      }
    }
  }
  
  // 3. ENHANCED FUZZY MATCHING - COMPLETELY REWRITTEN FOR DYNAMIC WORDS
  if (!bestMatch.isMatch || bestMatch.confidence < 0.7) {
    const fuzzyResult = performDynamicFuzzyMatch(inputWords, keywordWords, inputText);
    
    if (fuzzyResult.isMatch && fuzzyResult.confidence > bestMatch.confidence) {
      bestMatch = {
        isMatch: true,
        confidence: fuzzyResult.confidence,
        matchType: 'fuzzy' as const,
        contextModifier: fuzzyResult.contextModifier
      };
    }
  }
  
  // 4. PHONETIC MATCHING (single words only)
  if (!bestMatch.isMatch || bestMatch.confidence < 0.6) {
    if (keywordWords.length === 1) {
      const keywordWord = keywordWords[0];
      
      for (const inputWord of inputWords) {
        if (inputWord.length >= 4 && keywordWord.length >= 4) {
          if (soundex(inputWord) === soundex(keywordWord)) {
            bestMatch = {
              isMatch: true,
              confidence: 0.7,
              matchType: 'phonetic' as const,
              contextModifier: 1.0
            };
            break;
          }
        }
      }
    }
  }
  
  // 5. STRICT PARTIAL MATCHING
  if (settings.showPartialMatches && keyword.isPartialMatch && 
      (!bestMatch.isMatch || bestMatch.confidence < 0.5)) {
    
    const partialResult = performDynamicPartialMatch(inputWords, keywordWords);
    
    if (partialResult.isMatch && partialResult.confidence > bestMatch.confidence) {
      bestMatch = {
        isMatch: true,
        confidence: partialResult.confidence,
        matchType: 'partial' as const,
        contextModifier: 1.0
      };
    }
  }
  
  return bestMatch;
};

// NEW DYNAMIC FUZZY MATCHING FUNCTION
const performDynamicFuzzyMatch = (
  inputWords: string[], 
  keywordWords: string[], 
  originalText: string
): { isMatch: boolean; confidence: number; contextModifier: number } => {
  
  // Handle single-word keywords
  if (keywordWords.length === 1) {
    const keywordWord = keywordWords[0];
    let bestSimilarity = 0;
    
    for (const inputWord of inputWords) {
      if (inputWord.length >= 3 && keywordWord.length >= 3) {
        const similarity = jaroWinklerDistance(inputWord, keywordWord);
        bestSimilarity = Math.max(bestSimilarity, similarity);
      }
    }
    
    if (bestSimilarity >= 0.8) {
      const context = analyzeContext(originalText, keywordWords[0], 0);
      return {
        isMatch: true,
        confidence: bestSimilarity * 0.9,
        contextModifier: context.negation ? 0.1 : 1.0
      };
    }
  }
  
  // Handle multi-word keywords with FLEXIBLE MATCHING
  else {
    const results = findBestWordSequenceMatch(inputWords, keywordWords);
    
    if (results.length > 0) {
      // Find the best matching result
      const bestResult = results.reduce((best, current) => 
        current.totalScore > best.totalScore ? current : best
      );
      
      // Calculate minimum threshold based on keyword length
      const minThreshold = Math.max(0.7, 0.9 - (keywordWords.length * 0.05));
      
      if (bestResult.totalScore >= minThreshold) {
        return {
          isMatch: true,
          confidence: bestResult.totalScore * 0.9,
          contextModifier: 1.0
        };
      }
    }
  }
  
  return { isMatch: false, confidence: 0, contextModifier: 1.0 };
};

// FLEXIBLE WORD SEQUENCE MATCHING
const findBestWordSequenceMatch = (
  inputWords: string[], 
  keywordWords: string[]
): Array<{
  matchedWords: number;
  totalScore: number;
  matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }>;
}> => {
  
  const results: Array<{
    matchedWords: number;
    totalScore: number;
    matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }>;
  }> = [];
  
  // Strategy 1: Sequential matching (preserving order)
  const sequentialResult = findSequentialMatch(inputWords, keywordWords);
  if (sequentialResult.matchedWords > 0) {
    results.push(sequentialResult);
  }
  
  // Strategy 2: Best available matching (any order)
  const flexibleResult = findFlexibleMatch(inputWords, keywordWords);
  if (flexibleResult.matchedWords > 0) {
    results.push(flexibleResult);
  }
  
  // Strategy 3: Substring-based matching for root words
  const substringResult = findSubstringMatch(inputWords, keywordWords);
  if (substringResult.matchedWords > 0) {
    results.push(substringResult);
  }
  
  return results;
};

// Sequential matching: "short of breathe" -> "shortness of breath"
const findSequentialMatch = (inputWords: string[], keywordWords: string[]): {
  matchedWords: number;
  totalScore: number;
  matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }>;
} => {
  
  let bestScore = 0;
  let bestMatchDetails: Array<{ inputWord: string; keywordWord: string; score: number }> = [];
  let bestMatchedWords = 0;
  
  // Try different starting positions in input
  for (let startPos = 0; startPos <= inputWords.length - keywordWords.length; startPos++) {
    const matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }> = [];
    let totalScore = 0;
    let matchedWords = 0;
    
    for (let i = 0; i < keywordWords.length; i++) {
      const inputIndex = startPos + i;
      if (inputIndex >= inputWords.length) break;
      
      const inputWord = inputWords[inputIndex];
      const keywordWord = keywordWords[i];
      
      // Calculate similarity
      const similarity = jaroWinklerDistance(inputWord, keywordWord);
      
      if (similarity >= 0.6) { // Lower threshold for partial words
        matchDetails.push({ inputWord, keywordWord, score: similarity });
        totalScore += similarity;
        matchedWords++;
      } else {
        // Check if it's a partial word match
        const partialScore = getPartialWordScore(inputWord, keywordWord);
        if (partialScore >= 0.6) {
          matchDetails.push({ inputWord, keywordWord, score: partialScore });
          totalScore += partialScore;
          matchedWords++;
        }
      }
    }
    
    if (matchedWords > 0) {
      const avgScore = totalScore / matchedWords;
      const completeness = matchedWords / keywordWords.length;
      const finalScore = avgScore * completeness;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatchDetails = matchDetails;
        bestMatchedWords = matchedWords;
      }
    }
  }
  
  return {
    matchedWords: bestMatchedWords,
    totalScore: bestScore,
    matchDetails: bestMatchDetails
  };
};

// Flexible matching: find best matches in any order
const findFlexibleMatch = (inputWords: string[], keywordWords: string[]): {
  matchedWords: number;
  totalScore: number;
  matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }>;
} => {
  
  const matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }> = [];
  const usedInputWords = new Set<number>();
  
  for (const keywordWord of keywordWords) {
    let bestMatch = { inputIndex: -1, inputWord: '', score: 0 };
    
    inputWords.forEach((inputWord, index) => {
      if (usedInputWords.has(index)) return;
      
      // Try fuzzy similarity
      const similarity = jaroWinklerDistance(inputWord, keywordWord);
      if (similarity > bestMatch.score && similarity >= 0.6) {
        bestMatch = { inputIndex: index, inputWord, score: similarity };
      }
      
      // Try partial word matching
      const partialScore = getPartialWordScore(inputWord, keywordWord);
      if (partialScore > bestMatch.score && partialScore >= 0.6) {
        bestMatch = { inputIndex: index, inputWord, score: partialScore };
      }
    });
    
    if (bestMatch.inputIndex !== -1) {
      matchDetails.push({ 
        inputWord: bestMatch.inputWord, 
        keywordWord, 
        score: bestMatch.score 
      });
      usedInputWords.add(bestMatch.inputIndex);
    }
  }
  
  const totalScore = matchDetails.length > 0 ? 
    (matchDetails.reduce((sum, detail) => sum + detail.score, 0) / matchDetails.length) *
    (matchDetails.length / keywordWords.length) : 0;
  
  return {
    matchedWords: matchDetails.length,
    totalScore,
    matchDetails
  };
};

// Substring matching for root words: "short" matches "shortness"
const findSubstringMatch = (inputWords: string[], keywordWords: string[]): {
  matchedWords: number;
  totalScore: number;
  matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }>;
} => {
  
  const matchDetails: Array<{ inputWord: string; keywordWord: string; score: number }> = [];
  
  for (const keywordWord of keywordWords) {
    let bestMatch = { inputWord: '', score: 0 };
    
    for (const inputWord of inputWords) {
      const score = getSubstringMatchScore(inputWord, keywordWord);
      if (score > bestMatch.score && score >= 0.6) {
        bestMatch = { inputWord, score };
      }
    }
    
    if (bestMatch.score > 0) {
      matchDetails.push({ 
        inputWord: bestMatch.inputWord, 
        keywordWord, 
        score: bestMatch.score 
      });
    }
  }
  
  const totalScore = matchDetails.length > 0 ? 
    (matchDetails.reduce((sum, detail) => sum + detail.score, 0) / matchDetails.length) *
    (matchDetails.length / keywordWords.length) : 0;
  
  return {
    matchedWords: matchDetails.length,
    totalScore,
    matchDetails
  };
};

// Calculate partial word score
const getPartialWordScore = (inputWord: string, keywordWord: string): number => {
  if (inputWord.length < 3 || keywordWord.length < 3) return 0;
  
  // Check if input is a prefix of keyword
  if (keywordWord.startsWith(inputWord)) {
    return Math.min(0.85, inputWord.length / keywordWord.length + 0.1);
  }
  
  // Check if keyword is a prefix of input
  if (inputWord.startsWith(keywordWord)) {
    return Math.min(0.85, keywordWord.length / inputWord.length + 0.1);
  }
  
  return 0;
};

// Calculate substring match score
const getSubstringMatchScore = (inputWord: string, keywordWord: string): number => {
  if (inputWord.length < 3 || keywordWord.length < 3) return 0;
  
  const shorter = inputWord.length <= keywordWord.length ? inputWord : keywordWord;
  const longer = inputWord.length > keywordWord.length ? inputWord : keywordWord;
  
  // Check if shorter word is contained in longer word
  if (longer.includes(shorter)) {
    const ratio = shorter.length / longer.length;
    return Math.min(0.8, ratio + 0.2); // Cap at 0.8 for substring matches
  }
  
  return 0;
};

// DYNAMIC PARTIAL MATCHING
const performDynamicPartialMatch = (
  inputWords: string[], 
  keywordWords: string[]
): { isMatch: boolean; confidence: number } => {
  
  if (keywordWords.length === 1) {
    const keywordWord = keywordWords[0];
    
    for (const inputWord of inputWords) {
      if (inputWord.length >= 3 && keywordWord.length >= 3) {
        // Only allow partial match if input is shorter than keyword
        if (inputWord.length < keywordWord.length && keywordWord.startsWith(inputWord)) {
          const matchRatio = inputWord.length / keywordWord.length;
          if (matchRatio >= 0.6) {
            return {
              isMatch: true,
              confidence: matchRatio * 0.6
            };
          }
        }
      }
    }
  } else {
    // Multi-word partial matching
    const result = findSequentialMatch(inputWords, keywordWords);
    if (result.matchedWords === keywordWords.length && result.totalScore >= 0.6) {
      return {
        isMatch: true,
        confidence: result.totalScore * 0.6
      };
    }
  }
  
  return { isMatch: false, confidence: 0 };
};

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
    if (keywordGroups.length === 0) {
      return {
        level: PriorityLevel.NORMAL,
        score: 30,
        suggestedDepartment: "General Practice",
        suggestedPrimaryPhysician: "General Practice",
        matchedKeywords: [],
        pathTrace: ["No keyword groups available"]
      };
    }

    class EnhancedMedicalGraph {
  private nodes: ConditionNode[];
  private adjacencyMatrix: number[][];
  
  constructor(nodes: ConditionNode[]) {
    this.nodes = nodes;
    this.adjacencyMatrix = this.buildAdjacencyMatrix();
  }
  
  private buildAdjacencyMatrix(): number[][] {
    const size = this.nodes.length;
    const matrix = Array(size).fill(0).map(() => Array(size).fill(Infinity));
    
    // Initialize diagonal to 0
    for (let i = 0; i < size; i++) {
      matrix[i][i] = 0;
    }
    
    // Calculate relationships between nodes
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        const weight = this.calculateNodeRelationship(this.nodes[i], this.nodes[j]);
        matrix[i][j] = weight;
        matrix[j][i] = weight;
      }
    }
    
    return matrix;
  }
  
  private calculateNodeRelationship(node1: ConditionNode, node2: ConditionNode): number {
    let weight = 10; // Base weight
    
    // Same department = strong relationship
    if (node1.department === node2.department) {
      weight = 2;
    }
    // Same priority = moderate relationship  
    else if (node1.priority === node2.priority) {
      weight = 5;
    }
    
    // Shared symptoms = stronger relationship
    const sharedSymptoms = node1.keywords.filter(k1 =>
      node2.keywords.some(k2 => 
        normalizeText(k1.text) === normalizeText(k2.text) ||
        jaroWinklerDistance(normalizeText(k1.text), normalizeText(k2.text)) > 0.8
      )
    );
    
    if (sharedSymptoms.length > 0) {
      weight -= sharedSymptoms.length * 2;
    }
    
    // Priority escalation paths (normal -> urgent -> emergency)
    if ((node1.priority === PriorityLevel.NORMAL && node2.priority === PriorityLevel.URGENT) ||
        (node1.priority === PriorityLevel.URGENT && node2.priority === PriorityLevel.EMERGENCY)) {
      weight = 3;
    }
    
    return Math.max(1, weight);
  }
  
  findOptimalPath(inputText: string, settings: AdvancedSettings): EnhancedAnalysisResult & {
    level: PriorityLevel;
    score: number;
    suggestedDepartment: string;
    suggestedPrimaryPhysician: string;
    matchedKeywords: string[];
    pathTrace: string[];
  } {
    const sanitizedInput = inputText.replace(/<[^>]*>?/gm, '').trim();
    
    if (sanitizedInput.length < 2) {
      return this.getDefaultResult("Input too short for analysis");
    }
    
    // Enhanced NLP Analysis
    const nlpResults = new Map<number, {
      nlpScore: number;
      matches: Array<{
        keyword: string;
        matchType: 'exact' | 'fuzzy' | 'phonetic' | 'abbreviation' | 'partial';
        confidence: number;
        contextModifier: number;
      }>;
      contextFactors: {
        negation: boolean;
        severity: 'mild' | 'moderate' | 'severe';
        temporal: 'acute' | 'chronic' | 'unknown';
        urgencyMarkers: string[];
      };
    }>();
    
    // Analyze each node with enhanced NLP
    this.nodes.forEach((node, nodeIndex) => {
      let totalNlpScore = 0;
      const enhancedMatches: EnhancedAnalysisResult['enhancedMatches'] = [];

          // ADD THIS CONSOLE GROUP FOR EACH NODE
    console.group(`🏥 Analyzing Node: ${node.name} (${node.department})`);
    console.log(`📊 Node Base Score: ${node.score}`);
    console.log(`⚖️ Current Sensitivity Level: ${settings.sensitivityLevel}%`);


      let overallContext: {
        negation: boolean;
        severity: 'mild' | 'moderate' | 'severe';
        temporal: 'acute' | 'chronic' | 'unknown';
        urgencyMarkers: string[];
      } = {
        negation: false,
        severity: 'moderate',
        temporal: 'unknown',
        urgencyMarkers: []
      };
      
      node.keywords.forEach((keyword) => {
        if (!keyword.isActive) return;

              
      // ADD THIS CONSOLE LOG BEFORE MATCHING
      console.log(`\n🔍 Testing Keyword: "${keyword.text}"`);
      console.log(`   📏 Original Weight: ${keyword.weight}`);
      console.log(`   🎯 Keyword Active: ${keyword.isActive}`);
      console.log(`   🧩 Partial Match Allowed: ${keyword.isPartialMatch}`);
        
        const matchResult = enhancedKeywordMatch(sanitizedInput, keyword, settings);
        
        if (matchResult.isMatch) {
                 // ADD THIS DETAILED CALCULATION LOG
        console.log(`   ✅ MATCH FOUND!`);
        console.log(`   📈 Match Confidence: ${matchResult.confidence.toFixed(3)}`);
        console.log(`   🎭 Context Modifier: ${matchResult.contextModifier.toFixed(3)}`);
        console.log(`   ⚖️ Keyword Weight: ${keyword.weight}`);

          const contextualScore = matchResult.confidence * matchResult.contextModifier * keyword.weight;
          console.log(`   🧮 Calculation: ${matchResult.confidence.toFixed(3)} × ${matchResult.contextModifier.toFixed(3)} × ${keyword.weight} = ${contextualScore.toFixed(3)}`);

          totalNlpScore += contextualScore;
          console.log(`   📊 Running Total NLP Score: ${totalNlpScore.toFixed(3)}`);
          
          enhancedMatches.push({
            keyword: keyword.text,
            matchType: matchResult.matchType,
            confidence: matchResult.confidence,
            contextModifier: matchResult.contextModifier
          });
          
          
          
          // Update overall context
          const keywordContext = analyzeContext(sanitizedInput, keyword.text, 0);
          if (keywordContext.negation) overallContext.negation = true;

          if (keywordContext.severity === 'severe') {
            overallContext.severity = 'severe';
          } else if (keywordContext.severity === 'mild' && overallContext.severity !== 'severe') {
            overallContext.severity = 'mild';
          }
          
          if (keywordContext.temporal !== 'unknown') overallContext.temporal = keywordContext.temporal;
          overallContext.urgencyMarkers.push(...keywordContext.urgencyMarkers);
        }
        else {
          // ADD THIS LOG FOR NO MATCH
          console.log(`   ❌ NO MATCH for "${keyword.text}"`);
        }
        
      });

      console.log(`\n📈 Pre-Sensitivity Total Score: ${totalNlpScore.toFixed(3)}`);

      
      // Apply sensitivity settings
      totalNlpScore *= (settings.sensitivityLevel / 100);
      console.log(`🎛️ After Sensitivity (${settings.sensitivityLevel}%): ${totalNlpScore.toFixed(3)}`);

      
      // Combination bonus
      if (settings.enableSymptomCombinations && enhancedMatches.length > 1) {
        const beforeCombo = totalNlpScore;
        totalNlpScore *= 1.4;
        console.log(`🔗 Combination Bonus Applied: ${beforeCombo.toFixed(3)} × 1.4 = ${totalNlpScore.toFixed(3)}`);
      }
      
      // Temporal and severity modifiers
      if (overallContext.temporal === 'acute') {
        const beforeTemporal = totalNlpScore;
        totalNlpScore *= 1.3;
        console.log(`⏰ Acute Temporal Bonus: ${beforeTemporal.toFixed(3)} × 1.3 = ${totalNlpScore.toFixed(3)}`);
      }

      if (overallContext.severity === 'severe') {
        const beforeSeverity = totalNlpScore;
        totalNlpScore *= 1.5;      
        console.log(`🚨 Severe Severity Bonus: ${beforeSeverity.toFixed(3)} × 1.5 = ${totalNlpScore.toFixed(3)}`);
      } else if (overallContext.severity === 'mild') {
        const beforeSeverity = totalNlpScore;
        totalNlpScore *= 0.8;
        console.log(`😌 Mild Severity Reduction: ${beforeSeverity.toFixed(3)} × 0.8 = ${totalNlpScore.toFixed(3)}`);
      }
      
      // Urgency markers bonus
      if (overallContext.urgencyMarkers.length > 0) {
        const beforeUrgency = totalNlpScore;
        totalNlpScore *= (1 + overallContext.urgencyMarkers.length * 0.3);
        console.log(`🚑 Urgency Markers Bonus (${overallContext.urgencyMarkers.length}): ${beforeUrgency.toFixed(3)} × ${(1 + overallContext.urgencyMarkers.length * 0.3).toFixed(2)} = ${totalNlpScore.toFixed(3)}`);
      }

      console.log(`\n🎯 FINAL NODE SCORE: ${totalNlpScore.toFixed(3)}`);
      console.log(`📝 Matched Keywords: ${enhancedMatches.length}`);
      console.groupEnd();
      
      if (totalNlpScore > 0) {
        nlpResults.set(nodeIndex, {
          nlpScore: totalNlpScore,
          matches: enhancedMatches,
          contextFactors: overallContext
        });
      }
    });
    

    
    
    if (nlpResults.size === 0) {
      return this.getDefaultResult(`No symptoms recognized in: "${inputText.substring(0, 30)}..."`);
    }
    
    // Dijkstra's algorithm for pathway optimization
    const distances = Array(this.nodes.length).fill(Infinity);
    const visited = Array(this.nodes.length).fill(false);
    const previous = Array(this.nodes.length).fill(-1);
    const pq = new PriorityQueue<number>();
    
    // Initialize distances for nodes with NLP matches
    nlpResults.forEach((data, nodeIndex) => {
      distances[nodeIndex] = 100 - data.nlpScore; // Convert to distance (lower is better)
      pq.enqueue(nodeIndex, distances[nodeIndex]);
    });
    
    // Run Dijkstra's algorithm
    while (!pq.isEmpty()) {
      const currentNode = pq.dequeue()!;
      
      if (visited[currentNode]) continue;
      visited[currentNode] = true;
      
      for (let neighbor = 0; neighbor < this.nodes.length; neighbor++) {
        if (!visited[neighbor] && this.adjacencyMatrix[currentNode][neighbor] !== Infinity) {
          const newDistance = distances[currentNode] + this.adjacencyMatrix[currentNode][neighbor];
          
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            previous[neighbor] = currentNode;
            pq.enqueue(neighbor, newDistance);
          }
        }
      }
    }
    
    // Find optimal result combining NLP and pathway scores
    let bestNodeIndex = -1;
    let bestCombinedScore = 0;
    
    nlpResults.forEach((nlpData, nodeIndex) => {
      const pathwayScore = Math.max(0, 100 - distances[nodeIndex]);
      const combinedScore = (nlpData.nlpScore * 0.7) + (pathwayScore * 0.3); // Weight NLP more heavily
      
      if (combinedScore > bestCombinedScore) {
        bestCombinedScore = combinedScore;
        bestNodeIndex = nodeIndex;
      }

      
    });
    
    const selectedNlpData = nlpResults.get(bestNodeIndex)!;
    const selectedNode = this.nodes[bestNodeIndex];
    const pathwayScore = Math.max(0, 100 - distances[bestNodeIndex]);
    
    // Calculate final scores and priority
    let finalScore = Math.min(100, Math.max(0, bestCombinedScore + selectedNode.score * 0.2));
    let finalPriority = selectedNode.priority;
    
    // Apply threshold-based priority escalation
    if (finalScore >= settings.emergencyThreshold) {
      finalPriority = PriorityLevel.EMERGENCY;
    } else if (finalScore >= settings.urgentThreshold) {
      finalPriority = PriorityLevel.URGENT;
    }
    
    // Override for critical combinations
    const criticalSymptoms = selectedNlpData.contextFactors.urgencyMarkers;
    if (criticalSymptoms.length >= 2 || 
        (criticalSymptoms.length >= 1 && selectedNlpData.contextFactors.severity === 'severe')) {
      finalPriority = PriorityLevel.EMERGENCY;
      finalScore = Math.max(finalScore, 92);
    }

      // ADD FINAL SUMMARY LOG
  console.group(`🏆 FINAL ANALYSIS SUMMARY`);
  console.log(`📊 Settings Used:`);
  console.log(`   🎛️ Sensitivity Level: ${settings.sensitivityLevel}%`);
  console.log(`   🔗 Symptom Combinations: ${settings.enableSymptomCombinations ? 'Enabled' : 'Disabled'}`);
  console.log(`   📄 Partial Matches: ${settings.showPartialMatches ? 'Enabled' : 'Disabled'}`);
  console.log(`   🚨 Emergency Threshold: ${settings.emergencyThreshold}`);
  console.log(`   ⚠️ Urgent Threshold: ${settings.urgentThreshold}`);
  
  console.log(`\n🎯 Results Found: ${nlpResults.size} nodes with matches`);
  nlpResults.forEach((data, nodeIndex) => {
    const node = this.nodes[nodeIndex];
    console.log(`   ${node.name}: ${data.nlpScore.toFixed(2)} (${data.matches.length} keywords)`);
  });
  
  console.log(`\n🥇 Best Match: ${this.nodes[bestNodeIndex]?.name || 'None'}`);
  console.log(`📈 Final Combined Score: ${bestCombinedScore.toFixed(2)}`);
  console.log(`🎯 Final Priority: ${finalPriority}`);
  console.groupEnd();

    
    return {
      level: finalPriority,
      score: Math.round(finalScore),
      suggestedDepartment: selectedNode.department,
      suggestedPrimaryPhysician: selectedNode.primaryPhysicians.join(', '),
      matchedKeywords: selectedNlpData.matches.map(m => 
        m.matchType === 'exact' ? m.keyword : `${m.keyword} (${m.matchType})`
      ),
      pathTrace: [
        `Enhanced NLP analyzed ${this.nodes.length} medical pathways`,
        `Found ${nlpResults.size} relevant symptom groups`,
        `Optimal pathway: ${selectedNode.name} (NLP: ${selectedNlpData.nlpScore.toFixed(1)}, Path: ${pathwayScore.toFixed(1)})`,
        `Context: ${selectedNlpData.contextFactors.severity} severity, ${selectedNlpData.contextFactors.temporal} onset`,
        `Final decision: ${finalPriority} priority (${finalScore}/100)`
      ],
      nlpConfidence: selectedNlpData.nlpScore / 100,
      pathwayScore: pathwayScore,
      contextFactors: selectedNlpData.contextFactors,
      enhancedMatches: selectedNlpData.matches
    };

    
  }
  
  private getDefaultResult(reason: string) {
    return {
      level: PriorityLevel.NORMAL,
      score: 30,
      suggestedDepartment: "General Practice",
      suggestedPrimaryPhysician: "General Practice",
      matchedKeywords: [],
      pathTrace: [reason],
      nlpConfidence: 0,
      pathwayScore: 0,
      contextFactors: {
        negation: false,
        severity: 'moderate' as const,
        temporal: 'unknown' as const,
        urgencyMarkers: []
      },
      enhancedMatches: []
    };
  }
}

  


  
    const nodes = convertToConditionNodes(keywordGroups);
    const medicalGraph = new EnhancedMedicalGraph(nodes);
    return medicalGraph.findOptimalPath(inputText, settings);
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
            { duration: 5000}
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
    }, 7000); // Further reduced debounce time for better responsiveness
    
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
        
        // ADD THIS LINE TO VERIFY WEIGHTS ARE LOADED
        verifyKeywordWeights(groups);
        
      } catch (error) {
        console.error('Failed to load keyword groups:', error);
        toast.error('Failed to load symptom database');
      } finally {
        setLoadingKeywords(false);
      }
    };
  
    loadKeywords();
  }, []);

  const verifyKeywordWeights = (keywordGroups: KeywordGroup[]) => {
    console.group('🔍 KEYWORD WEIGHTS VERIFICATION');
    
    keywordGroups.forEach(group => {
      console.log(`\n📋 Group: ${group.name} (${group.department})`);
      console.log(`   Base Score: ${group.baseScore}`);
      console.log(`   Priority: ${group.priority}`);
      console.log(`   Keywords:`);
      
      group.keywords.forEach(keyword => {
        console.log(`      "${keyword.text}": weight=${keyword.weight}, active=${keyword.isActive}, partial=${keyword.isPartialMatch}`);
      });
    });
    
    console.groupEnd();
  };
  




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
  <Card className={`p-6 bg-background/60 backdrop-blur-sm shadow-md rounded-lg border border-border/50 ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-foreground">
        Appointment Priority Analysis
      </h3>
      {loadingKeywords && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading symptom database...</span>
        </div>
      )}
    </div>

    <div className="space-y-4">
      {/* Analysis Status */}
      {analyzingPriority && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-primary font-medium">Analyzing symptoms and priority...</span>
          </div>
        </div>
      )}

      {/* Priority Result */}
      {priorityResult && !analyzingPriority && (
        <div className={`p-4 rounded-lg border ${PRIORITY_INDICATORS[priorityResult.level].bgColor} ${PRIORITY_INDICATORS[priorityResult.level].borderColor}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              {priorityResult.level === PriorityLevel.EMERGENCY && (
                <AlertTriangle className={`h-5 w-5 ${PRIORITY_INDICATORS[priorityResult.level].textColor}`} />
              )}
              {priorityResult.level === PriorityLevel.URGENT && (
                <Activity className={`h-5 w-5 ${PRIORITY_INDICATORS[priorityResult.level].textColor}`} />
              )}
              {priorityResult.level === PriorityLevel.NORMAL && (
                <HeartPulse className={`h-5 w-5 ${PRIORITY_INDICATORS[priorityResult.level].textColor}`} />
              )}
              <h3 className={`font-semibold text-lg ${PRIORITY_INDICATORS[priorityResult.level].textColor}`}>
                {priorityResult.level} Priority
              </h3>
              <span className={`font-medium ${PRIORITY_INDICATORS[priorityResult.level].textColor}`}>
                ({priorityResult.score}/100)
              </span>
            </div>
          </div>

          {/* Department Selection */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Department:</span>
              {isManualSelection ? (
                <div className="flex items-center gap-2">
                  <Select value={manualDepartment || priorityResult.suggestedDepartment} onValueChange={handleManualDepartmentChange}>
                    <SelectTrigger className="h-7 py-0 px-2 text-sm w-auto min-w-[140px] bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => {setIsManualSelection(false); setManualDepartment('');}}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    (Reset)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{priorityResult.suggestedDepartment}</span>
                  <button 
                    className="text-xs text-primary hover:underline" 
                    onClick={() => {
                      setManualDepartment(priorityResult.suggestedDepartment);
                      setIsManualSelection(true);
                    }}
                  >
                    (Change)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Matched Keywords */}
          {priorityResult.matchedKeywords.length > 0 && (
            <div className="mb-3">
              <span className="text-sm text-muted-foreground">Detected symptoms: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {priorityResult.matchedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md border"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Priority Override Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Override priority:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePriorityOverride(PriorityLevel.EMERGENCY)}
                className={`px-2 py-1 text-xs rounded transition-colors
                  ${priorityResult.level === PriorityLevel.EMERGENCY 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'}`}
              >
                Emergency
              </button>
              <button
                onClick={() => handlePriorityOverride(PriorityLevel.URGENT)}
                className={`px-2 py-1 text-xs rounded transition-colors
                  ${priorityResult.level === PriorityLevel.URGENT 
                    ? 'bg-amber-500 text-white border-amber-500' 
                    : 'bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30'}`}
              >
                Urgent
              </button>
              <button
                onClick={() => handlePriorityOverride(PriorityLevel.NORMAL)}
                className={`px-2 py-1 text-xs rounded transition-colors
                  ${priorityResult.level === PriorityLevel.NORMAL 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/30'}`}
              >
                Normal
              </button>
            </div>
          </div>

          {/* Analysis Path Trace (Collapsible) */}
          {priorityResult.pathTrace && priorityResult.pathTrace.length > 0 && (
            <details className="mt-4">
              <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                Analysis Details
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-border/50">
                {priorityResult.pathTrace.map((trace, index) => (
                  <p key={index} className="text-xs text-muted-foreground mb-1">
                    {index + 1}. {trace}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Doctor Selection */}
      {priorityResult && (suggestedDoctors.length > 0 || doctors.length > 0) && (
        <div className="space-y-2">
          <label htmlFor="doctor-select" className="block text-sm font-medium text-foreground">
            Assign to Doctor
          </label>
          <Select value={selectedDoctorId} onValueChange={handleDoctorChange}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select a doctor..." />
            </SelectTrigger>
            <SelectContent>
              {(suggestedDoctors.length > 0 ? suggestedDoctors : doctors).map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization || doctor.department || 'General'}
                  {doctor.loadFactor !== undefined && ` (Load: ${doctor.loadFactor}%)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Doctors are sorted by availability and specialization match
          </p>
        </div>
      )}

      {/* No Analysis Message */}
      {!priorityResult && !analyzingPriority && note.length >= 2 && !loadingKeywords && (
        <div className="p-4 rounded-lg bg-muted/20 border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            No symptoms recognized. Try using more specific medical terms or check spelling.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!note.trim() && !loadingKeywords && (
        <div className="p-4 rounded-lg bg-muted/20 border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            Enter appointment notes or symptoms above to begin priority analysis
          </p>
        </div>
      )}
    </div>
  </Card>
  );
}

export default AppointmentPriorityAnalyzer;