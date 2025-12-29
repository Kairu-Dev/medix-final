
import { PriorityLevel } from "@prisma/client";
import { AdvancedSettings } from "@/components/AdvancedSettings";

// Enhanced types for dynamic keyword system
export interface KeywordGroup {
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

export interface Keyword {
    id: string;
    text: string;
    weight: number;
    isPartialMatch: boolean;
    isActive: boolean;
    groupId: string;
}

export interface CrossGroupMatch {
    groupId: string;
    groupName: string;
    department: string;
    priority: PriorityLevel;
    score: number;
    matchedKeywords: string[];
    matchStrength: number; // Combined strength of all matches in this group
}

export interface MultiGroupAnalysisResult {
    primaryGroup: CrossGroupMatch;
    secondaryGroups: CrossGroupMatch[];
    hasCrossGroupMatches: boolean;
    combinedScore: number;
    suggestedSecondaryDepartments: string[];
    suggestedSecondaryPhysicians: string[];
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

export const enhancedNormalizeText = (text: string): {
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
export const soundex = (str: string): string => {
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
export const jaroWinklerDistance = (s1: string, s2: string): number => {
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
export const analyzeContext = (text: string, matchedKeyword: string, matchPosition: number): {
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

// Helper for substring matching
const getSubstringMatchScore = (inputWord: string, keywordWord: string): number => {
    if (inputWord.includes(keywordWord) || keywordWord.includes(inputWord)) {
        const ratio = Math.min(inputWord.length, keywordWord.length) / Math.max(inputWord.length, keywordWord.length);
        return ratio >= 0.7 ? ratio : 0;
    }
    return 0;
};

// Partial word scoring
const getPartialWordScore = (s1: string, s2: string): number => {
    // Only consider significant partial matches
    if (s1.length < 3 || s2.length < 3) return 0;

    // Check if one is a substring of the other
    if (s1.includes(s2) || s2.includes(s1)) {
        return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    }

    return 0;
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

// NEW DYNAMIC FUZZY MATCHING FUNCTION
export const performDynamicFuzzyMatch = (
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

export const performDynamicPartialMatch = (
    inputWords: string[],
    keywordWords: string[]
): { isMatch: boolean; confidence: number } => {
    // Check if any keyword word is contained in any input word
    let bestMatch = 0;

    for (const keywordWord of keywordWords) {
        for (const inputWord of inputWords) {
            if (inputWord.includes(keywordWord) && inputWord.length > keywordWord.length) {
                bestMatch = Math.max(bestMatch, keywordWord.length / inputWord.length);
            } else if (keywordWord.includes(inputWord) && keywordWord.length > inputWord.length) {
                bestMatch = Math.max(bestMatch, inputWord.length / keywordWord.length);
            }
        }
    }

    return {
        isMatch: bestMatch >= 0.7,
        confidence: bestMatch * 0.8
    };
};

// Enhanced keyword matching with multiple algorithms
// Enhanced fuzzy matching with dynamic multi-word support
export const enhancedKeywordMatch = (
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

// Cross-group keyword analysis - only activates when multiple groups are detected
export const performCrossGroupAnalysis = (
    inputText: string,
    keywordGroups: KeywordGroup[],
    settings: AdvancedSettings
): MultiGroupAnalysisResult | null => {

    const groupMatches = new Map<string, CrossGroupMatch>();
    let totalMatchingGroups = 0;

    // Analyze each group for keyword matches
    keywordGroups.forEach(group => {
        if (!group.isActive) return;

        const groupMatchDetails: Array<{
            keyword: string;
            confidence: number;
            matchType: string;
        }> = [];

        let groupTotalScore = 0;
        let groupMatchStrength = 0;

        group.keywords.forEach(keyword => {
            if (!keyword.isActive) return;

            const matchResult = enhancedKeywordMatch(inputText, keyword, settings);

            if (matchResult.isMatch) {
                const keywordScore = matchResult.confidence * matchResult.contextModifier * keyword.weight;
                groupTotalScore += keywordScore;
                groupMatchStrength += matchResult.confidence;

                groupMatchDetails.push({
                    keyword: keyword.text,
                    confidence: matchResult.confidence,
                    matchType: matchResult.matchType
                });
            }
        });

        // Only consider groups with actual matches
        if (groupMatchDetails.length > 0) {
            totalMatchingGroups++;

            // Apply group base score and sensitivity
            const finalGroupScore = (groupTotalScore + group.baseScore * 0.3) * (settings.sensitivityLevel / 100);

            groupMatches.set(group.id, {
                groupId: group.id,
                groupName: group.name,
                department: group.department,
                priority: group.priority,
                score: finalGroupScore,
                matchedKeywords: groupMatchDetails.map(detail =>
                    detail.matchType === 'exact' ? detail.keyword : `${detail.keyword} (${detail.matchType})`
                ),
                matchStrength: groupMatchStrength / groupMatchDetails.length // Average confidence
            });
        }
    });

    // Only proceed if we have matches from multiple groups (cross-group detection)
    if (totalMatchingGroups < 2) {
        return null; // Let the original algorithm handle single-group matches
    }

    // Sort groups by combined score and priority
    const sortedMatches = Array.from(groupMatches.values()).sort((a, b) => {
        // Primary sort by priority level (Emergency > Urgent > Normal)
        const priorityOrder = {
            [PriorityLevel.EMERGENCY]: 3,
            [PriorityLevel.URGENT]: 2,
            [PriorityLevel.NORMAL]: 1
        };

        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Secondary sort by score
        return b.score - a.score;
    });

    const primaryGroup = sortedMatches[0];
    const secondaryGroups = sortedMatches.slice(1);

    // Calculate combined score with cross-group bonus
    const crossGroupBonus = Math.min(20, secondaryGroups.length * 8); // Max 20 point bonus
    const combinedScore = Math.min(100, primaryGroup.score + crossGroupBonus);

    // Extract secondary departments and physicians
    const secondaryDepartments = secondaryGroups
        .map(group => group.department)
        .filter(dept => dept !== primaryGroup.department);

    const secondaryPhysicians = secondaryGroups
        .map(group => group.department) // Using department as physician for now
        .filter(physician => physician !== primaryGroup.department);

    return {
        primaryGroup,
        secondaryGroups,
        hasCrossGroupMatches: true,
        combinedScore,
        suggestedSecondaryDepartments: [...new Set(secondaryDepartments)], // Remove duplicates
        suggestedSecondaryPhysicians: [...new Set(secondaryPhysicians)]
    };
};
