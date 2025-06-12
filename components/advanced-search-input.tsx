"use client";
/* eslint-disable */
import { Search, Calendar as CalendarIcon, X, User, UserCheck, Clock, AlertCircle, ChevronRight, History } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useState, useEffect, useRef } from "react";

// Types for search suggestions
interface SearchSuggestion {
  id: string;
  type: 'doctor' | 'patient' | 'status' | 'priority' | 'date' | 'keyword';
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  matchScore?: number;
}

interface SearchToken {
  type: 'keyword' | 'value';
  key?: string;
  value: string;
  id: string;
}

// Debounce hook for API calls
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdvancedSearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [searchValue, setSearchValue] = useState("");
  const [tokens, setTokens] = useState<SearchToken[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionCache, setSuggestionCache] = useState<Record<string, SearchSuggestion[]>>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [focusedKeyword, setFocusedKeyword] = useState<string | null>(null);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounce search input for API calls
  const debouncedSearchValue = useDebounce(searchValue, 150);

  // Predefined search keywords
  const searchKeywords = [
    { key: 'from', label: 'from:', description: 'Search by patient name', icon: <User size={14} className="text-blue-400" /> },
    { key: 'doctor', label: 'doctor:', description: 'Search by doctor name', icon: <UserCheck size={14} className="text-green-400" /> },
    { key: 'status', label: 'status:', description: 'Filter by appointment status', icon: <Clock size={14} className="text-yellow-400" /> },
    { key: 'priority', label: 'priority:', description: 'Filter by priority level', icon: <AlertCircle size={14} className="text-red-400" /> },
    { key: 'date', label: 'date:', description: 'Filter by appointment date', icon: <CalendarIcon size={14} className="text-purple-400" /> },
    { key: 'time', label: 'time:', description: 'Filter by appointment time', icon: <Clock size={14} className="text-cyan-400" /> },
    { key: 'type', label: 'type:', description: 'Filter by appointment type', icon: <Search size={14} className="text-orange-400" /> }
  ];

  // Status options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', icon: <Clock size={14} className="text-yellow-400" />, description: 'Appointments awaiting confirmation' },
    { value: 'SCHEDULED', label: 'Scheduled', icon: <CalendarIcon size={14} className="text-green-400" />, description: 'Confirmed appointments' },
    { value: 'COMPLETED', label: 'Completed', icon: <User size={14} className="text-green-500" />, description: 'Finished appointments' },
    { value: 'CANCELLED', label: 'Cancelled', icon: <X size={14} className="text-red-400" />, description: 'Cancelled appointments' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'NORMAL', label: 'Normal', icon: <div className="w-2 h-2 bg-green-400 rounded-full" />, description: 'Standard priority' },
    { value: 'URGENT', label: 'Urgent', icon: <div className="w-2 h-2 bg-yellow-400 rounded-full" />, description: 'High priority' },
    { value: 'EMERGENCY', label: 'Emergency', icon: <AlertCircle size={14} className="text-red-400" />, description: 'Critical priority' }
  ];

  const appointmentTypes = [
    { label: "General Consultation", value: "General Consultation" },
    { label: "General Check up", value: "General Check Up" },
    { label: "Antenatal", value: "Antenatal" },
    { label: "Maternity", value: "Maternity" },
    { label: "Emergency", value: "Emergency" }
  ];

  // Enhanced fuzzy matching function
  const fuzzyMatch = (query: string, target: string): { score: number; matches: boolean } => {
    const queryLower = query.toLowerCase();
    const targetLower = target.toLowerCase();
    
    // Exact match gets highest score
    if (targetLower === queryLower) return { score: 100, matches: true };
    
    // Starts with match gets high score
    if (targetLower.startsWith(queryLower)) return { score: 90, matches: true };
    
    // Contains match gets medium score
    if (targetLower.includes(queryLower)) return { score: 70, matches: true };
    
    // Fuzzy matching for partial character matches
    let score = 0;
    let queryIndex = 0;
    let matchCount = 0;
    
    for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
      if (targetLower[i] === queryLower[queryIndex]) {
        matchCount++;
        queryIndex++;
        score += 10;
      }
    }
    
    // Check if all query characters were found
    const allMatched = queryIndex === queryLower.length;
    const matchRatio = matchCount / queryLower.length;
    
    if (allMatched && matchRatio > 0.6) {
      return { score: Math.max(score, 50), matches: true };
    }
    
    return { score: 0, matches: false };
  };

  // Enhanced suggestion fetching with caching
  const fetchSuggestions = async (query: string, type: string): Promise<SearchSuggestion[]> => {
    if (!query.trim() || query.length < 1) return [];
    
    const cacheKey = `${type}-${query.toLowerCase()}`;
    
    // Check cache first
    if (suggestionCache[cacheKey]) {
      return suggestionCache[cacheKey];
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}&type=${type}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      const suggestions = data.suggestions || [];
  
  // ADD THIS ENHANCED PROCESSING RIGHT AFTER THE ABOVE:
      
      // Enhanced processing for patient/from suggestions
      let processedSuggestions = suggestions;
      
      if (type === 'from' || type === 'patient') {
        processedSuggestions = suggestions.map((suggestion: any) => ({
          ...suggestion,
          type: 'patient' as const,
          icon: <User size={14} className="text-blue-400" />,
          // Enhance the description to show more context
          description: suggestion.description || `Patient: ${suggestion.label}`
        }));
      }
      
      // Add fuzzy matching scores
      const scoredSuggestions = processedSuggestions.map((suggestion: any) => {
        const match = fuzzyMatch(query, suggestion.label);
        return {
          ...suggestion,
          matchScore: match.score
        };
      }).filter((s: any) => s.matchScore > 0)
        .sort((a: any, b: any) => b.matchScore - a.matchScore);
      
      // Cache the results
      setSuggestionCache(prev => ({
        ...prev,
        [cacheKey]: scoredSuggestions
      }));
      
      return scoredSuggestions;
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced search input parsing
// Enhanced search input parsing with better keyword detection
const parseSearchInput = (input: string): { 
  currentKeyword: string | null; 
  currentValue: string; 
  remainingInput: string;
  beforeKeyword: string;
  hasKeywordFilters: boolean;
} => {
  const validKeywords = searchKeywords.map(k => k.key);
  
  // Check if input contains any keyword filters
  const hasKeywordFilters = validKeywords.some(keyword => {
    const pattern = new RegExp(`\\b${keyword}:`, 'i');
    return pattern.test(input);
  });
  
  // Find the last occurrence of any valid keyword followed by colon
  let lastKeywordMatch: { keyword: string; index: number; colonIndex: number } | null = null;
  
  validKeywords.forEach(keyword => {
    const pattern = new RegExp(`\\b${keyword}:`, 'gi');
    let match;
    while ((match = pattern.exec(input)) !== null) {
      const keywordIndex = match.index;
      const colonIndex = keywordIndex + keyword.length;
      
      if (!lastKeywordMatch || keywordIndex > lastKeywordMatch.index) {
        lastKeywordMatch = {
          keyword,
          index: keywordIndex,
          colonIndex
        };
      }
    }
  });
  
  if (lastKeywordMatch) {
    const { keyword, colonIndex, index } = lastKeywordMatch;
    const beforeKeyword = input.substring(0, index).trim();
    const afterColon = input.substring(colonIndex + 1);
    
    // Find where this keyword's value ends (next keyword or end of string)
    let valueEndIndex = afterColon.length;
    
    // Look for the next keyword pattern
    const nextKeywordPattern = new RegExp(`\\s+(?:${validKeywords.join('|')}):`, 'i');
    const nextMatch = afterColon.search(nextKeywordPattern);
    if (nextMatch !== -1) {
      valueEndIndex = nextMatch;
    }
    
    const currentValue = afterColon.substring(0, valueEndIndex).trim();
    
    return {
      currentKeyword: keyword,
      currentValue,
      remainingInput: currentValue,
      beforeKeyword,
      hasKeywordFilters
    };
  }

  // No valid keyword found, but check if there are other keywords in the input
  return { 
    currentKeyword: null, 
    currentValue: input.trim(), 
    remainingInput: input.trim(),
    beforeKeyword: '',
    hasKeywordFilters
  };
};

  // Enhanced suggestion generation
  const generateSuggestions = async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const { currentKeyword, currentValue, beforeKeyword, hasKeywordFilters } = parseSearchInput(input);
    let newSuggestions: SearchSuggestion[] = [];

    if (!currentKeyword) {
      // Show keyword suggestions with fuzzy matching
      const matchingKeywords = searchKeywords
        .map(k => {
          const labelMatch = fuzzyMatch(currentValue, k.label);
          const keyMatch = fuzzyMatch(currentValue, k.key);
          const descMatch = fuzzyMatch(currentValue, k.description);
          
          const bestMatch = Math.max(labelMatch.score, keyMatch.score, descMatch.score);
          
          return { ...k, matchScore: bestMatch };
        })
        .filter(k => k.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
      
      newSuggestions = matchingKeywords.map(k => ({
        id: `keyword-${k.key}`,
        type: 'keyword' as const,
        value: k.label,
        label: k.label,
        description: k.description,
        icon: k.icon,
        matchScore: k.matchScore
      }));
      
      // Also search for general content if there's meaningful input
      if (currentValue.length >= 2) {
        const generalSuggestions = await fetchSuggestions(currentValue, 'all');
        newSuggestions.push(...generalSuggestions);
      }
    } else {
      // Show value suggestions based on keyword
      setFocusedKeyword(currentKeyword);
      
      switch (currentKeyword) {
        case 'status':
          newSuggestions = statusOptions
            .map(s => {
              const match = fuzzyMatch(currentValue, s.label);
              return { ...s, matchScore: match.score };
            })
            .filter(s => s.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .map(s => ({
              id: `status-${s.value}`,
              type: 'status' as const,
              value: s.value,
              label: s.label,
              description: s.description,
              icon: s.icon,
              matchScore: s.matchScore
            }));
          break;
          
        case 'priority':
          newSuggestions = priorityOptions
            .map(p => {
              const match = fuzzyMatch(currentValue, p.label);
              return { ...p, matchScore: match.score };
            })
            .filter(p => p.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .map(p => ({
              id: `priority-${p.value}`,
              type: 'priority' as const,
              value: p.value,
              label: p.label,
              description: p.description,
              icon: p.icon,
              matchScore: p.matchScore
            }));
          break;
          
        case 'date':
          if (currentValue.length === 0) {
            setShowCalendar(true);
            setShowTimePicker(false);
          } else {
            setShowCalendar(false);
            // Could add date parsing suggestions here
          }
          break;
          
        case 'time':
          if (currentValue.length === 0) {
            setShowTimePicker(true);
            setShowCalendar(false);
          } else {
            setShowTimePicker(false);
            // Could add time parsing suggestions here
          }
          break;
          
          case 'from':
            if (currentValue.length >= 1) {
              newSuggestions = await fetchSuggestions(currentValue, 'from');
            } else if (currentValue.length === 0) {
              // Show placeholder when no input
              newSuggestions = [{
                id: 'from-placeholder',
                type: 'keyword' as const,
                value: '',
                label: '👤 Type patient name...',
                description: 'Start typing to search for patients (e.g., "A" for Andrew)',
                icon: <User size={14} className="text-blue-400" />
              }];
            }
            break;
          
        case 'doctor':
          if (currentValue.length >= 1) {
            newSuggestions = await fetchSuggestions(currentValue, 'doctor');
          }
          break;
          
          case 'type':
            if (currentValue.length === 0) {
              // Show all appointment types when no value is entered
              newSuggestions = appointmentTypes.map(type => ({
                id: `type-${type.value}`,
                type: 'keyword' as const,
                value: type.value,
                label: type.label,
                description: `Select ${type.label}`,
                icon: <Search size={14} className="text-orange-400" />,
                matchScore: 100
              }));
            } else if (currentValue.length >= 1) {
              // Filter appointment types based on input
              const matchingTypes = appointmentTypes
                .map(type => {
                  const labelMatch = fuzzyMatch(currentValue, type.label);
                  const valueMatch = fuzzyMatch(currentValue, type.value);
                  const bestMatch = Math.max(labelMatch.score, valueMatch.score);
                  return { ...type, matchScore: bestMatch };
                })
                .filter(type => type.matchScore > 0)
                .sort((a, b) => b.matchScore - a.matchScore);
          
              newSuggestions = matchingTypes.map(type => ({
                id: `type-${type.value}`,
                type: 'keyword' as const,
                value: type.value,
                label: type.label,
                description: `Select ${type.label}`,
                icon: <Search size={14} className="text-orange-400" />,
                matchScore: type.matchScore
              }));
          
              // Also fetch from API if available
              const apiSuggestions = await fetchSuggestions(currentValue, 'type');
              newSuggestions.push(...apiSuggestions);
            }
            break;
      }
    }

    // Limit suggestions to prevent overwhelming UI
    newSuggestions = newSuggestions.slice(0, 8);
    
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  // Effect for debounced search
  useEffect(() => {
    generateSuggestions(debouncedSearchValue);
  }, [debouncedSearchValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    // generateSuggestions will be called via useEffect with debounced value
  };

  // Handle input focus to show suggestions
// Handle input focus to show all available search options
const handleInputFocus = () => {
  if (searchValue.trim() === '') {
    // Show comprehensive search guide when input is empty (Discord-style)
    const searchGuideSuggestions: SearchSuggestion[] = [
      {
        id: 'guide-header',
        type: 'keyword' as const,
        value: '',
        label: '🔍 Available Search Options',
        description: 'Click on any option below or type to search',
        icon: <Search size={14} className="text-blue-400" />
      },
      ...searchKeywords.map(k => ({
        id: `guide-${k.key}`,
        type: 'keyword' as const,
        value: k.label,
        label: k.label,
        description: k.description + ' • Example: ' + k.key + ':value',
        icon: k.icon
      })),
      {
        id: 'guide-examples',
        type: 'keyword' as const,
        value: '',
        label: '💡 Search Examples',
        description: 'Try these example searches below',
        icon: <AlertCircle size={14} className="text-yellow-400" />
      },
      {
        id: 'example-1',
        type: 'keyword' as const,
        value: 'doctor:Smith status:pending',
        label: 'doctor:Smith status:pending',
        description: 'Find pending appointments with Dr. Smith',
        icon: <ChevronRight size={14} className="text-gray-400" />
      },
      {
        id: 'example-2',
        type: 'keyword' as const,
        value: 'from:John type:Emergency',
        label: 'from:John type:Emergency',
        description: 'Find emergency appointments from John',
        icon: <ChevronRight size={14} className="text-gray-400" />
      },
      {
        id: 'example-3',
        type: 'keyword' as const,
        value: 'priority:urgent date:2024-12',
        label: 'priority:urgent date:2024-12',
        description: 'Find urgent appointments in December 2024',
        icon: <ChevronRight size={14} className="text-gray-400" />
      }
    ];
    
    // Add search history if available
    if (searchHistory.length > 0) {
      const historySuggestions: SearchSuggestion[] = [
        {
          id: 'history-header',
          type: 'keyword' as const,
          value: '',
          label: '🕒 Recent Searches',
          description: 'Your recent search history',
          icon: <History size={14} className="text-purple-400" />
        },
        ...searchHistory.slice(0, 3).map((term, index) => ({
          id: `history-${index}`,
          type: 'keyword' as const,
          value: term,
          label: term,
          description: 'Recent search • Click to use again',
          icon: <History size={14} className="text-gray-400" />
        }))
      ];
      
      searchGuideSuggestions.splice(1, 0, ...historySuggestions);
    }
    
    setSuggestions(searchGuideSuggestions);
    setShowSuggestions(true);
  } else {
    // Generate suggestions for non-empty input
    generateSuggestions(searchValue);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }
};
  

  // Enhanced suggestion selection
// Enhanced suggestion selection with example handling
const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
  // Handle header/info suggestions (don't select them)
  if (suggestion.id.includes('guide-header') || suggestion.id.includes('guide-examples') || suggestion.id.includes('history-header')) {
    return;
  }
  
  // Handle example suggestions (use the full example)
  if (suggestion.id.includes('example-')) {
    setSearchValue(suggestion.value);
    setShowSuggestions(false);
    setShowCalendar(false);
    setFocusedKeyword(null);
    
    // Auto-submit the example search
    setTimeout(() => {
      const queryString = createQueryString(suggestion.value);
      router.push(pathname + (queryString ? "?" + queryString : ""));
    }, 100);
    return;
  }
  
  // Handle history suggestions
  if (suggestion.id.includes('history-')) {
    setSearchValue(suggestion.value);
    setShowSuggestions(false);
    setShowCalendar(false);
    setFocusedKeyword(null);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return;
  }

  if (suggestion.type === 'patient' || suggestion.id.includes('patient-')) {
    const { currentKeyword, beforeKeyword } = parseSearchInput(searchValue);
    
    if (currentKeyword === 'from') {
      // Replace the current value after 'from:'
      const keywordPattern = new RegExp(`\\b${currentKeyword}:`);
      const match = searchValue.match(keywordPattern);
      if (match) {
        const keywordEndIndex = searchValue.lastIndexOf(currentKeyword + ':') + currentKeyword.length + 1;
        const beforeKeywordValue = searchValue.substring(0, keywordEndIndex);
        const afterKeywordValue = searchValue.substring(keywordEndIndex);
        
        // Find where the current value ends (next keyword or end)
        const validKeywords = searchKeywords.map(k => k.key);
        const nextKeywordPattern = new RegExp(`\\s+(?:${validKeywords.join('|')}):`, 'i');
        const nextMatch = afterKeywordValue.search(nextKeywordPattern);
        
        if (nextMatch !== -1) {
          const afterNextKeyword = afterKeywordValue.substring(nextMatch);
          setSearchValue(`${beforeKeywordValue}${suggestion.value} ${afterNextKeyword}`);
        } else {
          setSearchValue(`${beforeKeywordValue}${suggestion.value} `);
        }
      }
    } else {
      // Add as new from: filter
      const currentContent = searchValue.trim();
      const newValue = currentContent ? `${currentContent} from:${suggestion.value} ` : `from:${suggestion.value} `;
      setSearchValue(newValue);
    }
    
    setShowSuggestions(false);
    setShowCalendar(false);
    setShowTimePicker(false);
    setFocusedKeyword(null);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return;
  }
  
  const { currentKeyword, beforeKeyword, hasKeywordFilters } = parseSearchInput(searchValue);
  
  if (!currentKeyword && suggestion.type === 'keyword') {
    // Adding a new keyword - preserve existing content
    const trimmedBefore = beforeKeyword.trim();
    const newValue = trimmedBefore ? `${trimmedBefore} ${suggestion.value}` : suggestion.value;
    setSearchValue(newValue);
  } else if (suggestion.type === 'keyword') {
    // Replacing current keyword - preserve content before current keyword
    const trimmedBefore = beforeKeyword.trim();
    const newValue = trimmedBefore ? `${trimmedBefore} ${suggestion.value}` : suggestion.value;
    setSearchValue(newValue);
  } else {
    // Adding value to current keyword
    const { currentKeyword, beforeKeyword, hasKeywordFilters } = parseSearchInput(searchValue);
    
    if (currentKeyword) {
      // Find the last occurrence of the current keyword
      const keywordPattern = new RegExp(`\\b${currentKeyword}:`);
      const match = searchValue.match(keywordPattern);
      if (match) {
        const keywordEndIndex = searchValue.lastIndexOf(currentKeyword + ':') + currentKeyword.length + 1;
        const beforeKeywordValue = searchValue.substring(0, keywordEndIndex);
        const afterKeywordValue = searchValue.substring(keywordEndIndex);
        
        // Find where the current value ends (next keyword or end)
        const validKeywords = searchKeywords.map(k => k.key);
        const nextKeywordPattern = new RegExp(`\\s+(?:${validKeywords.join('|')}):`, 'i');
        const nextMatch = afterKeywordValue.search(nextKeywordPattern);
        
        if (nextMatch !== -1) {
          // There's a next keyword, preserve everything after it
          const afterNextKeyword = afterKeywordValue.substring(nextMatch);
          setSearchValue(`${beforeKeywordValue}${suggestion.value} ${afterNextKeyword}`);
        } else {
          // No next keyword, just add the value
          setSearchValue(`${beforeKeywordValue}${suggestion.value} `);
        }
      }
    } else {
      // No keyword context, add as general search
      const currentContent = searchValue.trim();
      const newValue = currentContent ? `${currentContent} ${suggestion.value} ` : `${suggestion.value} `;
      setSearchValue(newValue);
    }
  }
  
  setShowSuggestions(false);
  setShowCalendar(false);
  setShowTimePicker(false);
  setFocusedKeyword(null);
  
  // Focus back to input after a brief delay
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
};

  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCalendar && e.key === 'Escape') {
      setShowCalendar(false);
      return;
    }

    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          // Submit search if no suggestion is selected
          handleSearch(e as any);
        }
        break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          setShowCalendar(false);
          setShowTimePicker(false);
          setFocusedKeyword(null);
          break;
      case 'Tab':
        // Allow tab to select first suggestion
        if (suggestions.length > 0 && selectedSuggestionIndex === -1) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[0]);
        }
        break;
    }
  };

// Convert search string to query parameters with multiple filter support
// Convert search string to query parameters with multiple filter support
// Convert search string to query parameters with multiple filter support
const createQueryString = useCallback(
  (searchString: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Enhanced parsing for multiple filters with proper space handling
    const filters: Record<string, string[]> = {};
    let generalSearch = '';
    
    // Get all valid keywords for validation
    const validKeywords = searchKeywords.map(k => k.key);
    
    // Step 1: Extract all keyword:value pairs with improved regex
    let processedString = searchString.trim();
    
    // Create a more robust regex that handles spaces properly
    validKeywords.forEach(keyword => {
      // This regex captures everything after keyword: until the next keyword: or end of string
      const keywordPattern = new RegExp(`\\b${keyword}:\\s*([^\\n]*?)(?=\\s+(?:${validKeywords.join('|')}):|\$)`, 'gi');
      let match;
      
      const keywordMatches: Array<{match: RegExpExecArray, cleanValue: string}> = [];
      
      // Collect all matches for this keyword first
      while ((match = keywordPattern.exec(searchString)) !== null) {
        const [fullMatch, value] = match;
        
        // Clean the value - trim and handle quotes
        let cleanValue = value.trim();
        
        // Remove quotes if present
        cleanValue = cleanValue.replace(/^["']|["']$/g, '');
        
        if (cleanValue) {
          keywordMatches.push({ match, cleanValue });
        }
      }
      
      // Process matches for this keyword
      keywordMatches.forEach(({ match, cleanValue }) => {
        const [fullMatch] = match;
        
        // Initialize filter array if not exists
        if (!filters[keyword]) filters[keyword] = [];
        
        // Split by commas for multiple values and clean each
        const values = cleanValue.split(',').map(v => v.trim()).filter(v => v);
        filters[keyword].push(...values);
        
        // Remove this match from processed string
        processedString = processedString.replace(fullMatch, ' ');
      });
    });
    
    // Step 2: Extract general search terms (what's left after removing all keyword:value pairs)
    generalSearch = processedString.replace(/\s+/g, ' ').trim();
    
    // Clear existing filter params
    ['q', 'from', 'doctor', 'status', 'priority', 'date', 'time', 'type'].forEach(key => {
      params.delete(key);
    });

    // IMPORTANT: Only set general search if there are no keyword filters
    // This prevents the regular search from interfering with multi-filter searches
    const hasKeywordFilters = Object.keys(filters).length > 0;
    
    if (generalSearch && !hasKeywordFilters) {
      params.set('q', generalSearch);
    }

    // Set filter parameters
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        // Remove duplicates and join with commas
        const uniqueValues = [...new Set(values)];
        params.set(key, uniqueValues.join(','));
      }
    });

    return params.toString();
  },
  [searchParams, searchKeywords]
);

  // Handle form submission
// Handle form submission
const handleSearch = (e: FormEvent) => {
  e.preventDefault();
  
  // Add debug logging
  console.log('Search input:', searchValue);
  const queryString = createQueryString(searchValue);
  console.log('Generated query string:', queryString);
  console.log('Final URL:', pathname + (queryString ? "?" + queryString : ""));
  
  // Save to search history if not empty
  if (searchValue.trim() && !searchHistory.includes(searchValue.trim())) {
    setSearchHistory(prev => [searchValue.trim(), ...prev.slice(0, 9)]); // Keep only 10 recent searches
  }
  
  router.push(pathname + (queryString ? "?" + queryString : ""));
  setShowSuggestions(false);
  setShowCalendar(false);
  setShowTimePicker(false);
};

const handleDateSelect = (date: Date) => {
  // Create date in Philippines timezone to avoid timezone conversion issues
  const phDate = new Date(date);
  // Format as YYYY-MM-DD in local timezone (Philippines)
  const year = phDate.getFullYear();
  const month = String(phDate.getMonth() + 1).padStart(2, '0');
  const day = String(phDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  const { currentKeyword, beforeKeyword, hasKeywordFilters } = parseSearchInput(searchValue);
  
  if (currentKeyword === 'date') {
    const colonIndex = searchValue.lastIndexOf(':');
    if (colonIndex !== -1) {
      const beforeColon = searchValue.substring(0, colonIndex + 1);
      setSearchValue(`${beforeColon}${dateString} `);
    }
  } else {
    const newValue = beforeKeyword ? `${beforeKeyword} date:${dateString} ` : `date:${dateString} `;
    setSearchValue(newValue);
  }
  
  setShowCalendar(false);
  setSelectedDate(date);
  
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
};

// Enhanced calendar component with Philippines timezone support
// Enhanced calendar component with navigation
// Enhanced calendar component with Philippines timezone support
const CalendarComponent = () => {
  // Get current date in Philippines timezone (UTC+8)
  const getPhilippinesDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (8 * 3600000)); // UTC+8 for Philippines
  };

  const [currentDate, setCurrentDate] = useState(() => {
    const phDate = getPhilippinesDate();
    return new Date(phDate.getFullYear(), phDate.getMonth(), 1);
  });
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get today in Philippines timezone
  const philippinesToday = getPhilippinesDate();
  const today = philippinesToday.getDate();
  const isCurrentMonth = currentDate.getMonth() === philippinesToday.getMonth() && 
                         currentDate.getFullYear() === philippinesToday.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const navigateToPrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const navigateToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const navigateToPrevYear = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  };
  
  const navigateToNextYear = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  };
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = day === today && isCurrentMonth;
    const isSelected = selectedDate && selectedDate.getDate() === day && 
                     selectedDate.getMonth() === currentMonth && 
                     selectedDate.getFullYear() === currentYear;
    
    days.push(
      <button
        key={day}
        onClick={() => handleDateSelect(date)}
        className={`w-8 h-8 text-sm rounded hover:bg-green-600 transition-colors ${
          isSelected 
            ? 'bg-green-500 text-black font-semibold' 
            : isToday 
              ? 'bg-green-600 text-white font-semibold' 
              : 'text-gray-300 hover:text-white'
        }`}
      >
        {day}
      </button>
    );
  }
  
  return (
    <div className="calendar-container absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 z-50 min-w-[320px]">
      {/* Timezone indicator */}
      <div className="text-xs text-gray-400 text-center mb-2">
        Philippines Time (UTC+8)
      </div>
      
      {/* Year navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={navigateToPrevYear}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Previous Year"
        >
          <ChevronRight size={16} className="text-gray-400 rotate-180 transform scale-x-150" />
        </button>
        <div className="text-lg font-semibold text-green-400">
          {currentYear}
        </div>
        <button
          onClick={navigateToNextYear}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Next Year"
        >
          <ChevronRight size={16} className="text-gray-400 transform scale-x-150" />
        </button>
      </div>
      
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={navigateToPrevMonth}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Previous Month"
        >
          <ChevronRight size={16} className="text-gray-400 rotate-180" />
        </button>
        <div className="text-center font-semibold text-green-400 min-w-[120px]">
          {monthNames[currentMonth]}
        </div>
        <button
          onClick={navigateToNextMonth}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Next Month"
        >
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-400 mb-1">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      {/* Quick navigation buttons */}
      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-700">
        <button
          onClick={() => {
            const today = getPhilippinesDate();
            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            handleDateSelect(today);
          }}
          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => setShowCalendar(false)}
          className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

  // Enhanced time picker component
  const TimePickerComponent = () => {
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
  
    const handleTimeSelect = () => {
      const hour24 = selectedPeriod === 'AM' 
        ? (selectedHour === 12 ? 0 : selectedHour)
        : (selectedHour === 12 ? 12 : selectedHour + 12);
      
      // Format to match your database format (e.g., "9:00 PM")
      const displayTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
      
      const { currentKeyword, beforeKeyword, hasKeywordFilters } = parseSearchInput(searchValue);
      
      if (currentKeyword === 'time') {
        const colonIndex = searchValue.lastIndexOf(':');
        if (colonIndex !== -1) {
          const beforeColon = searchValue.substring(0, colonIndex + 1);
          setSearchValue(`${beforeColon}${displayTime} `);
        }
      } else {
        const newValue = beforeKeyword ? `${beforeKeyword} time:${displayTime} ` : `time:${displayTime} `;
        setSearchValue(newValue);
      }
      
      setShowTimePicker(false);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    
    return (
      <div className="time-picker-container absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 z-50 min-w-[320px]">
        <div className="text-center font-semibold mb-4 text-green-400">
          Select Time
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Hour Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-1">Hour</label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>
  
          <div className="text-gray-400 text-lg">:</div>
  
          {/* Minute Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-1">Minute</label>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {minutes.filter(m => m % 5 === 0).map(minute => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
  
          {/* AM/PM Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-1">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'AM' | 'PM')}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
  
        <div className="text-center mb-4">
          <div className="text-lg font-mono text-green-400">
            {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
          </div>
        </div>
  
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setShowTimePicker(false)}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTimeSelect}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    );
  };

  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-green-500 bg-opacity-30 text-green-300 font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch}>
        <div className="hidden xl:flex items-center border border-gray-600 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 bg-gray-800 transition-all duration-200">
          <Search size={18} className="text-gray-400 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 outline-none text-sm bg-transparent text-gray-200 placeholder-gray-400 min-w-0"
            placeholder="Search appointments... Try 'doctor: M' or 'from: Kyle'"
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={(e) => {
              // Check if the blur is moving to an element within our component
              const relatedTarget = e.relatedTarget as HTMLElement;
              const isWithinComponent = relatedTarget && (
                relatedTarget.closest('.time-picker-container') ||
                relatedTarget.closest('.calendar-container') ||
                relatedTarget.closest('.suggestions-container')
              );
              
              if (!isWithinComponent) {
                setTimeout(() => {
                  setShowSuggestions(false);
                  setShowCalendar(false);
                  setShowTimePicker(false);
                  setFocusedKeyword(null);
                }, 200);
              }
            }}
            autoComplete="off"
            spellCheck={false}
          />
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-green-500 flex-shrink-0 ml-2"></div>
          )}
        </div>
      </form>

      {/* Enhanced suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
  <div className="suggestions-container absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
    {focusedKeyword && (
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-750">
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>Searching for</span>
          <span className="text-green-400 font-semibold">{focusedKeyword}:</span>
          <ChevronRight size={12} />
        </div>
      </div>
    )}
    
    {suggestions.map((suggestion, index) => {
      const { currentValue } = parseSearchInput(searchValue);
      const query = suggestion.type === 'keyword' ? currentValue : currentValue;
      
      return (
        <div
          key={suggestion.id}
          ref={el => { suggestionRefs.current[index] = el; }}
          className={`px-3 py-2 cursor-pointer flex items-center gap-3 transition-colors ${
            index === selectedSuggestionIndex 
              ? 'bg-green-600 bg-opacity-20 border-l-2 border-green-500' 
              : 'hover:bg-gray-700'
          }`}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
          onClick={() => handleSuggestionSelect(suggestion)}
        >
          <div className="flex-shrink-0">
            {suggestion.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-200 font-medium">
              {highlightMatch(suggestion.label, query)}
            </div>
            {suggestion.description && (
              <div className="text-xs text-gray-400 truncate">
                {suggestion.description}
              </div>
            )}
          </div>
          {suggestion.matchScore && (
            <div className="text-xs text-gray-500 flex-shrink-0">
              {Math.round(suggestion.matchScore)}%
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

      {/* Calendar popup */}
      {showCalendar && <CalendarComponent />}

      {/* Time picker popup */}
      {showTimePicker && <TimePickerComponent />}
    </div>
  );
};

export default AdvancedSearchInput;