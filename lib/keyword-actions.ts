"use server";

import { PriorityLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import db from "./db";
import { DEFAULT_SETTINGS, AdvancedSettings } from "@/components/AdvancedSettings";

// Fetch all keyword groups with their keywords
export const getKeywordGroups = async () => {
  try {
    console.log("Querying database for keyword groups...");
    
    const groups = await db.keywordGroup.findMany({
      include: {
        keywords: {
          where: { isActive: true },
          orderBy: { text: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Database returned ${groups.length} groups`);
    
    // Log each group for debugging
    groups.forEach(group => {
      console.log(`Group: ${group.name}, Active: ${group.isActive}, Keywords: ${group.keywords.length}`);
      group.keywords.forEach(keyword => {
        console.log(`  - Keyword: "${keyword.text}", Weight: ${keyword.weight}, Partial: ${keyword.isPartialMatch}`);
      });
    });
    
    return groups;
  } catch (error) {
    console.error("Error fetching keyword groups:", error);
    throw error; // Re-throw to handle in component
  }
};

// Create a new keyword group
export const createKeywordGroup = async (data: {
  name: string;
  department: string;
  priority: PriorityLevel;
  baseScore: number;
  description?: string;
}) => {
  try {
    const group = await db.keywordGroup.create({
      data: {
        name: data.name,
        department: data.department,
        priority: data.priority,
        baseScore: data.baseScore,
        description: data.description,
      },
      include: {
        keywords: true
      }
    });
    
    revalidatePath('/system-settings');
    return { success: true, data: group };
  } catch (error) {
    console.error("Error creating keyword group:", error);
    return { success: false, error: "Failed to create keyword group" };
  }
};

// Update keyword group
export const updateKeywordGroup = async (id: string, data: {
  name?: string;
  department?: string;
  priority?: PriorityLevel;
  baseScore?: number;
  description?: string;
  isActive?: boolean;
}) => {
  try {
    const group = await db.keywordGroup.update({
      where: { id },
      data,
      include: {
        keywords: true
      }
    });
    
    revalidatePath('/system-settings');
    return { success: true, data: group };
  } catch (error) {
    console.error("Error updating keyword group:", error);
    return { success: false, error: "Failed to update keyword group" };
  }
};

// Delete keyword group
export const deleteKeywordGroup = async (id: string) => {
  try {
    await db.keywordGroup.delete({
      where: { id }
    });
    
    revalidatePath('/system-settings');
    return { success: true };
  } catch (error) {
    console.error("Error deleting keyword group:", error);
    return { success: false, error: "Failed to delete keyword group" };
  }
};

// Add keyword to group
export const addKeyword = async (groupId: string, data: {
  text: string;
  weight?: number;
  isPartialMatch?: boolean;
  color?: string; // Add color parameter
}) => {
  try {
    const keyword = await db.keyword.create({
      data: {
        text: data.text.toLowerCase().trim(),
        weight: data.weight || 1.0,
        isPartialMatch: data.isPartialMatch || false,
        color: data.color, // Include color in database insert
        groupId,
      }
    });
    
    revalidatePath('/system-settings');
    return { success: true, data: keyword };
  } catch (error) {
    console.error("Error adding keyword:", error);
    return { success: false, error: "Failed to add keyword" };
  }
};

// Update keyword
export const updateKeyword = async (id: string, data: {
  text?: string;
  weight?: number;
  isPartialMatch?: boolean;
  isActive?: boolean;
  color?: string;
}) => {
  try {
    const keyword = await db.keyword.update({
      where: { id },
      data: {
        ...data,
        text: data.text ? data.text.toLowerCase().trim() : undefined,
      }
    });
    
    revalidatePath('/system-settings');
    return { success: true, data: keyword };
  } catch (error) {
    console.error("Error updating keyword:", error);
    return { success: false, error: "Failed to update keyword" };
  }
};

// Delete keyword
export const deleteKeyword = async (id: string) => {
  try {
    await db.keyword.delete({
      where: { id }
    });
    
    revalidatePath('/system-settings');
    return { success: true };
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return { success: false, error: "Failed to delete keyword" };
  }
};

// Bulk add keywords to group
export const bulkAddKeywords = async (groupId: string, keywords: string[]) => {
  try {
    const keywordData = keywords
      .filter(k => k.trim().length > 0)
      .map(text => ({
        text: text.toLowerCase().trim(),
        weight: 1.0,
        isPartialMatch: false,
        groupId,
      }));
    
    await db.keyword.createMany({
      data: keywordData,
      skipDuplicates: true
    });
    
    revalidatePath('/system-settings');
    return { success: true };
  } catch (error) {
    console.error("Error bulk adding keywords:", error);
    return { success: false, error: "Failed to add keywords" };
  }
};

// Get active keywords for priority analyzer
export const getActiveKeywordsForAnalyzer = async () => {
  try {
    const groups = await db.keywordGroup.findMany({
      where: { isActive: true },
      include: {
        keywords: {
          where: { isActive: true }
        }
      }
    });
    
    return groups;
  } catch (error) {
    console.error("Error fetching active keywords:", error);
    return [];
  }
};


//ADVANCED SETTINGS
export async function getAdvancedSettings(): Promise<AdvancedSettings> {
  try {
    const settings = await db.advancedSettings.findUnique({
      where: { id: 'global' }
    });

    if (!settings) {
      // Create default settings if they don't exist
      const created = await db.advancedSettings.create({
        data: {
          id: 'global',
          ...DEFAULT_SETTINGS
        }
      });
      
      return {
        sensitivityLevel: created.sensitivityLevel,
        showPartialMatches: created.showPartialMatches,
        enableSymptomCombinations: created.enableSymptomCombinations,
        urgentThreshold: created.urgentThreshold,
        emergencyThreshold: created.emergencyThreshold
      };
    }

    return {
      sensitivityLevel: settings.sensitivityLevel,
      showPartialMatches: settings.showPartialMatches,
      enableSymptomCombinations: settings.enableSymptomCombinations,
      urgentThreshold: settings.urgentThreshold,
      emergencyThreshold: settings.emergencyThreshold
    };
  } catch (error) {
    console.error('Error fetching advanced settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateAdvancedSettings(
  settings: AdvancedSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.advancedSettings.upsert({
      where: { id: 'global' },
      update: {
        sensitivityLevel: settings.sensitivityLevel,
        showPartialMatches: settings.showPartialMatches,
        enableSymptomCombinations: settings.enableSymptomCombinations,
        urgentThreshold: settings.urgentThreshold,
        emergencyThreshold: settings.emergencyThreshold,
        updatedAt: new Date()
      },
      create: {
        id: 'global',
        sensitivityLevel: settings.sensitivityLevel,
        showPartialMatches: settings.showPartialMatches,
        enableSymptomCombinations: settings.enableSymptomCombinations,
        urgentThreshold: settings.urgentThreshold,
        emergencyThreshold: settings.emergencyThreshold
      }
    });

    revalidatePath('/keyword-management'); // Adjust path as needed
    return { success: true };
  } catch (error) {
    console.error('Error updating advanced settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function resetAdvancedSettings(): Promise<{ success: boolean; error?: string }> {
  try {
    await db.advancedSettings.upsert({
      where: { id: 'global' },
      update: {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date()
      },
      create: {
        id: 'global',
        ...DEFAULT_SETTINGS
      }
    });

    revalidatePath('/keyword-management'); // Adjust path as needed
    return { success: true };
  } catch (error) {
    console.error('Error resetting advanced settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}