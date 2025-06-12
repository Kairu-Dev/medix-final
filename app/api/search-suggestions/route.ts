// app/api/search-suggestions/route.ts
/* eslint-disable */
import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Enhanced fuzzy matching function
function calculateMatchScore(query: string, target: string): number {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match gets highest score
  if (targetLower === queryLower) return 100;
  
  // Starts with match gets high score
  if (targetLower.startsWith(queryLower)) return 90;
  
  // Contains match gets medium score
  if (targetLower.includes(queryLower)) return 70;
  
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
    return Math.max(score, 50);
  }
  
  return 0;
}

// Generate multiple search patterns for better matching
function generateSearchPatterns(query: string) {
  const trimmedQuery = query.trim();
  const patterns = [];
  
  if (trimmedQuery.length >= 2) {
    // Exact match patterns
    patterns.push({
      startsWith: trimmedQuery,
      mode: 'insensitive' as const
    });
    
    patterns.push({
      contains: trimmedQuery,
      mode: 'insensitive' as const
    });
    
    // If query has spaces, try individual words
    const words = trimmedQuery.split(' ').filter(word => word.length >= 2);
    words.forEach(word => {
      patterns.push({
        startsWith: word,
        mode: 'insensitive' as const
      });
      patterns.push({
        contains: word,
        mode: 'insensitive' as const
      });
    });
  }
  
  return patterns;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    if (!query.trim() || query.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    let suggestions: any[] = [];
    const searchPatterns = generateSearchPatterns(query);

    switch (type) {
      case 'doctor':
        // Enhanced doctor search with better fuzzy matching
        const doctors = await db.doctor.findMany({
          where: {
            OR: searchPatterns.map(pattern => ({
              name: pattern
            }))
          },
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true
          },
          take: 15 // Get more results for better scoring
        });

        // Score and sort doctors
        const scoredDoctors = doctors
          .map(doctor => ({
            ...doctor,
            matchScore: calculateMatchScore(query, doctor.name)
          }))
          .filter(doctor => doctor.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 8); // Limit final results

        suggestions = scoredDoctors.map(doctor => ({
          id: `doctor-${doctor.id}`,
          type: 'doctor',
          value: doctor.name,
          label: `Dr. ${doctor.name}`,
          description: doctor.specialization,
          icon: 'stethoscope',
          matchScore: doctor.matchScore
        }));
        break;

      case 'from':
        // Enhanced patient search with better name matching
        const patients = await db.patient.findMany({
          where: {
            OR: [
              // Search in first name
              ...searchPatterns.map(pattern => ({
                first_name: pattern
              })),
              // Search in last name
              ...searchPatterns.map(pattern => ({
                last_name: pattern
              })),
              // Search in full name concatenation (if your DB supports it)
              ...searchPatterns.map(pattern => ({
                OR: [
                  { first_name: pattern },
                  { last_name: pattern }
                ]
              }))
            ]
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          },
          take: 15
        });

        // Score and sort patients
        const scoredPatients = patients
          .map(patient => {
            const fullName = `${patient.first_name} ${patient.last_name}`;
            const firstNameScore = calculateMatchScore(query, patient.first_name);
            const lastNameScore = calculateMatchScore(query, patient.last_name);
            const fullNameScore = calculateMatchScore(query, fullName);
            
            return {
              ...patient,
              fullName,
              matchScore: Math.max(firstNameScore, lastNameScore, fullNameScore)
            };
          })
          .filter(patient => patient.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 8);

        suggestions = scoredPatients.map(patient => ({
          id: `patient-${patient.id}`,
          type: 'patient',
          value: patient.fullName,
          label: patient.fullName,
          description: patient.email || 'Patient',
          icon: 'user',
          matchScore: patient.matchScore
        }));
        break;

      case 'type':
        // Appointment types with fuzzy matching
        const appointmentTypes = [

          'General Consultation',
          'General Check Up',
          'Follow Up',
          'Emergency',
          'Antenatal',
          'Maternity',

        ];

        const matchedTypes = appointmentTypes
          .map(type => ({
            type,
            matchScore: calculateMatchScore(query, type)
          }))
          .filter(item => item.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 6);

        suggestions = matchedTypes.map((item, index) => ({
          id: `type-${index}`,
          type: 'type',
          value: item.type,
          label: item.type,
          description: `${item.type} appointment`,
          icon: 'calendar',
          matchScore: item.matchScore
        }));
        break;

        case 'time':
          // Time suggestions with better format matching
          const timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
          ];
        
          const matchedTimes = timeSlots
            .map(time => ({
              time,
              matchScore: calculateMatchScore(query, time)
            }))
            .filter(item => item.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 6);
        
          suggestions = matchedTimes.map((item, index) => ({
            id: `time-${index}`,
            type: 'time',
            value: item.time,
            label: item.time,
            description: `Appointment at ${item.time}`,
            icon: 'clock',
            matchScore: item.matchScore
          }));
          break;

      case 'all':
        // Comprehensive search across all types
        const [allDoctors, allPatients] = await Promise.all([
          db.doctor.findMany({
            where: {
              OR: searchPatterns.map(pattern => ({
                name: pattern
              }))
            },
            select: {
              id: true,
              name: true,
              specialization: true
            },
            take: 8
          }),
          db.patient.findMany({
            where: {
              OR: [
                ...searchPatterns.map(pattern => ({
                  first_name: pattern
                })),
                ...searchPatterns.map(pattern => ({
                  last_name: pattern
                }))
              ]
            },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            },
            take: 8
          })
        ]);

        // Score and combine all results
        const scoredAllDoctors = allDoctors
          .map(doctor => ({
            ...doctor,
            matchScore: calculateMatchScore(query, doctor.name)
          }))
          .filter(doctor => doctor.matchScore > 0);

        const scoredAllPatients = allPatients
          .map(patient => {
            const fullName = `${patient.first_name} ${patient.last_name}`;
            return {
              ...patient,
              fullName,
              matchScore: Math.max(
                calculateMatchScore(query, patient.first_name),
                calculateMatchScore(query, patient.last_name),
                calculateMatchScore(query, fullName)
              )
            };
          })
          .filter(patient => patient.matchScore > 0);

        // Combine and sort all suggestions
        const allSuggestions = [
          ...scoredAllDoctors.map(doctor => ({
            id: `doctor-${doctor.id}`,
            type: 'doctor',
            value: doctor.name,
            label: `Dr. ${doctor.name}`,
            description: doctor.specialization,
            icon: 'stethoscope',
            matchScore: doctor.matchScore
          })),
          ...scoredAllPatients.map(patient => ({
            id: `patient-${patient.id}`,
            type: 'patient',
            value: patient.fullName,
            label: patient.fullName,
            description: patient.email || 'Patient',
            icon: 'user',
            matchScore: patient.matchScore
          }))
        ];

        suggestions = allSuggestions
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 10);
        break;

      default:
        suggestions = [];
    }

    // Add response time for debugging (optional)
    const responseTime = Date.now();
    
    return NextResponse.json({ 
      suggestions,
      query,
      type,
      count: suggestions.length,
      // timestamp: responseTime // Uncomment for debugging
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch suggestions',
      suggestions: [] 
    }, { status: 500 });
  }
}