//components/keyword-management.tsx
"use client";

    /* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Settings, 
  Download,
  Upload,
  AlertTriangle,
  Activity,
  HeartPulse,
  Search
} from 'lucide-react';
import { PriorityLevel } from '@prisma/client';
import { toast } from 'sonner';
import { addKeyword, bulkAddKeywords, createKeywordGroup, deleteKeyword, deleteKeywordGroup, getAdvancedSettings, getKeywordGroups, resetAdvancedSettings, updateAdvancedSettings, updateKeyword, updateKeywordGroup } from '@/lib/keyword-actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';



import { 
  AdvancedSettings, 
  AdvancedSettingsComponent, 
  DEFAULT_SETTINGS 
} from './AdvancedSettings';

// Import your existing interfaces and functions
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
  color?: string; // Add color property
}

const KEYWORD_COLORS = [
  { name: 'Blue', value: 'bg-blue-100 text-blue-800 border-blue-200', hex: '#3B82F6' },
  { name: 'Green', value: 'bg-green-100 text-green-800 border-green-200', hex: '#10B981' },
  { name: 'Purple', value: 'bg-purple-100 text-purple-800 border-purple-200', hex: '#8B5CF6' },
  { name: 'Pink', value: 'bg-pink-100 text-pink-800 border-pink-200', hex: '#EC4899' },
  { name: 'Orange', value: 'bg-orange-100 text-orange-800 border-orange-200', hex: '#F97316' },
  { name: 'Red', value: 'bg-red-100 text-red-800 border-red-200', hex: '#EF4444' },
  { name: 'Yellow', value: 'bg-yellow-100 text-yellow-800 border-yellow-200', hex: '#EAB308' },
  { name: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-200', hex: '#6366F1' }
];

const DEPARTMENTS = [
  "Emergency", "Urgent Care", "Cardiology", "Neurology", "Orthopedics",
  "Dermatology", "Gastroenterology", "ENT", "Pulmonology", "Endocrinology",
  "General Practice", "Psychiatry", "Ophthalmology", "Urology", "Oncology",
  "Gynecology", "Pediatrics",
  // ADDED - Missing from original DEPARTMENTS
  "Radiology", "General Surgery"
];

const PRIORITY_COLORS = {
  [PriorityLevel.EMERGENCY]: "bg-red-500 text-white",
  [PriorityLevel.URGENT]: "bg-amber-500 text-white",
  [PriorityLevel.NORMAL]: "bg-emerald-500 text-white",
};

const PRIORITY_ICONS = {
  [PriorityLevel.EMERGENCY]: AlertTriangle,
  [PriorityLevel.URGENT]: Activity,
  [PriorityLevel.NORMAL]: HeartPulse,
};

export const KeywordManagement: React.FC = () => {
  const [groups, setGroups] = useState<KeywordGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<KeywordGroup | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isKeywordDialogOpen, setIsKeywordDialogOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<KeywordGroup | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Settings State
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Form states
  const [groupForm, setGroupForm] = useState({
    name: '',
    department: '',
    priority: PriorityLevel.NORMAL as PriorityLevel,
    baseScore: 50,
    description: ''
  });

// Update the keyword form state to include color
const [keywordForm, setKeywordForm] = useState({
  text: '',
  weight: 1.0,
  isPartialMatch: false,
  color: KEYWORD_COLORS[0].value // Default color
});

  // Load keyword groups
  const loadGroups = async () => {
    setLoading(true);
    const data = await getKeywordGroups();
    setGroups(data.map(group => ({
      ...group,
      description: group.description ?? undefined,
      keywords: group.keywords.map(keyword => ({
        ...keyword,
        color: keyword.color ?? undefined, // Ensure color is string | undefined
      })),
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await getAdvancedSettings();
        setSettings(dbSettings);
        setSettingsLoaded(true);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettingsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);

  // Advanced Settings Handlers
  const [settingsSaveTimeout, setSettingsSaveTimeout] = useState<NodeJS.Timeout | null>(null);


const handleSettingChange = async (settingName: keyof AdvancedSettings, value: any) => {
  const newSettings = {
    ...settings,
    [settingName]: value
  };
  
  setSettings(newSettings);
  
  // Debounce the save operation (wait 1 second after last change)
  if (settingsSaveTimeout) {
    clearTimeout(settingsSaveTimeout);
  }
  
  const timeout = setTimeout(async () => {
    const result = await updateAdvancedSettings(newSettings);
    if (result.success) {
      toast.success("Settings saved automatically", { duration: 2000 });
    } else {
      toast.error("Failed to save settings: " + result.error);
    }
  }, 1000);
  
  setSettingsSaveTimeout(timeout);
};

// Update the handleResetSettings function:
const handleResetSettings = async () => {
  const result = await resetAdvancedSettings();
  if (result.success) {
    setSettings(DEFAULT_SETTINGS);
    toast.success("Settings reset to defaults");
  } else {
    toast.error("Failed to reset settings: " + result.error);
  }
};

// Add cleanup for timeout:
useEffect(() => {
  return () => {
    if (settingsSaveTimeout) {
      clearTimeout(settingsSaveTimeout);
    }
  };
}, [settingsSaveTimeout]);


  // Handle group operations
  const handleCreateGroup = async () => {
    if (!groupForm.name.trim() || !groupForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createKeywordGroup(groupForm);
    if (result.success) {
      toast.success('Keyword group created successfully');
      setIsGroupDialogOpen(false);
      resetGroupForm();
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to create group');
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    const result = await updateKeywordGroup(editingGroup.id, groupForm);
    if (result.success) {
      toast.success('Group updated successfully');
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      resetGroupForm();
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to update group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const result = await deleteKeywordGroup(groupId);
    if (result.success) {
      toast.success('Group deleted successfully');
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to delete group');
    }
  };

  // Handle keyword operations
  const handleAddKeyword = async () => {
    if (!selectedGroup || !keywordForm.text.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    const result = await addKeyword(selectedGroup.id, keywordForm);
    if (result.success) {
      toast.success('Keyword added successfully');
      setIsKeywordDialogOpen(false);
      resetKeywordForm();
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to add keyword');
    }
  };

  const handleUpdateKeyword = async () => {
    if (!editingKeyword) return;

    const result = await updateKeyword(editingKeyword.id, keywordForm);
    if (result.success) {
      toast.success('Keyword updated successfully');
      setIsKeywordDialogOpen(false);
      setEditingKeyword(null);
      resetKeywordForm();
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to update keyword');
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    const result = await deleteKeyword(keywordId);
    if (result.success) {
      toast.success('Keyword deleted successfully');
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to delete keyword');
    }
  };

  const handleBulkAddKeywords = async () => {
    if (!selectedGroup || !bulkKeywords.trim()) {
      toast.error('Please enter keywords');
      return;
    }
  
    // Split by lines first, then process each line
    const lines = bulkKeywords
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  
    const keywords: string[] = [];
  
    lines.forEach(line => {
      // Split by spaces to get individual words/phrases
      const wordsInLine = line.split(/\s+/);
      
      wordsInLine.forEach(word => {
        if (word.includes('_')) {
          // Replace underscore with space for multi-word keywords
          keywords.push(word.replace(/_/g, ' '));
        } else {
          // Single word keyword
          keywords.push(word);
        }
      });
    });
  
    // Remove duplicates
    const uniqueKeywords = [...new Set(keywords)];
  
    const result = await bulkAddKeywords(selectedGroup.id, uniqueKeywords);
    if (result.success) {
      toast.success(`Added ${uniqueKeywords.length} keywords successfully`);
      setBulkKeywords('');
      loadGroups();
    } else {
      toast.error(result.error || 'Failed to add keywords');
    }
  };

  // Form helpers
  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      department: '',
      priority: PriorityLevel.NORMAL,
      baseScore: 50,
      description: ''
    });
  };

// Update resetKeywordForm function
const resetKeywordForm = () => {
  setKeywordForm({
    text: '',
    weight: 1.0,
    isPartialMatch: false,
    color: KEYWORD_COLORS[0].value
  });
};

  const openEditGroup = (group: KeywordGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      department: group.department,
      priority: group.priority,
      baseScore: group.baseScore,
      description: group.description || ''
    });
    setIsGroupDialogOpen(true);
  };

// Update openEditKeyword function
const openEditKeyword = (keyword: Keyword) => {
  setEditingKeyword(keyword);
  setKeywordForm({
    text: keyword.text,
    weight: keyword.weight,
    isPartialMatch: keyword.isPartialMatch,
    color: keyword.color || KEYWORD_COLORS[0].value
  });
  setIsKeywordDialogOpen(true);
};

  // Filter groups based on search term
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.keywords.some(keyword => 
      keyword.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Keyword Management</h1>
          <p className="text-gray-400 text-sm">
            Manage symptom keywords and their priority classifications with advanced analysis settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Advanced Analysis Settings</DialogTitle>
              </DialogHeader>
              <AdvancedSettingsComponent
                settings={settings}
                onSettingChange={handleSettingChange}
                onResetSettings={handleResetSettings}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetGroupForm(); setEditingGroup(null); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingGroup ? 'Edit Keyword Group' : 'Create Keyword Group'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Group Name *</Label>
                    <Input
                      id="name"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                      placeholder="Emergency Symptoms"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-gray-300">Department *</Label>
                    <Select value={groupForm.department} onValueChange={(value) => setGroupForm({...groupForm, department: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept} className="text-gray-300 focus:bg-gray-700">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Priority Level</Label>
                    <Select value={groupForm.priority} onValueChange={(value: PriorityLevel) => setGroupForm({...groupForm, priority: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value={PriorityLevel.EMERGENCY} className="text-gray-300 focus:bg-gray-700">🚨 Emergency</SelectItem>
                        <SelectItem value={PriorityLevel.URGENT} className="text-gray-300 focus:bg-gray-700">⚡ Urgent</SelectItem>
                        <SelectItem value={PriorityLevel.NORMAL} className="text-gray-300 focus:bg-gray-700">💚 Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Base Score: {groupForm.baseScore}</Label>
                    <Slider
                      value={[groupForm.baseScore]}
                      onValueChange={(value) => setGroupForm({...groupForm, baseScore: value[0]})}
                      min={10}
                      max={100}
                      step={5}
                      className="mt-3 shad-slider"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                    placeholder="Optional description for this keyword group..."
                    rows={3}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)} className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
                <Button onClick={editingGroup ? handleUpdateGroup : handleCreateGroup} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
  
      {/* Search and Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search groups, departments, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="font-mono">{filteredGroups.length} of {groups.length} groups</span>
          <span className="font-mono">{groups.reduce((acc, group) => acc + group.keywords.length, 0)} total keywords</span>
        </div>
      </div>
  
      {/* Settings Overview Card */}
      <Card className="border-gray-800 bg-gray-900/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Activity className="h-4 w-4 text-emerald-500" />
              Current Analysis Settings
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsAdvancedSettingsOpen(true)}
              className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Modify
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-emerald-500 font-mono">{settings.sensitivityLevel}%</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Sensitivity</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-emerald-500 font-mono">{settings.showPartialMatches ? '✓' : '✗'}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Partial Match</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-emerald-500 font-mono">{settings.enableSymptomCombinations ? '✓' : '✗'}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Combinations</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-amber-500 font-mono">{settings.urgentThreshold}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Urgent</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-red-500 font-mono">{settings.emergencyThreshold}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Emergency</div>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed border-gray-700 bg-gray-900/30">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
              <Tag className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No keyword groups found</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Create your first keyword group to start managing symptoms and priorities
            </p>
            <Button onClick={() => setIsGroupDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGroups.map((group) => {
            const PriorityIcon = PRIORITY_ICONS[group.priority];
            return (
              <Card key={group.id} className="overflow-hidden hover:bg-gray-800/50 transition-all border-gray-800 bg-gray-900/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${PRIORITY_COLORS[group.priority]} border border-gray-700`}>
                        <PriorityIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-white">{group.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-gray-800 border-gray-700 text-gray-300">
                            {group.department}
                          </Badge>
                          <Badge className={`${PRIORITY_COLORS[group.priority]} text-xs border border-gray-700`}>
                            {group.priority.toLowerCase()}
                          </Badge>
                          <div className="text-sm text-gray-400 font-mono">
                            Score: {group.baseScore}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                        className="flex items-center gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Tag className="h-4 w-4" />
                        Keywords ({group.keywords.length})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditGroup(group)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Keyword Group</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to delete "{group.name}"? This will permanently remove all {group.keywords.length} keywords in this group.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteGroup(group.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-400 mt-3 pl-11">
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-mono">Keywords ({group.keywords.length})</span>
                      {group.keywords.length > 8 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGroup(group)}
                          className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          View All
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.keywords.slice(0, 8).map((keyword) => (
                        <Badge 
                          key={keyword.id} 
                          className={`${keyword.color || KEYWORD_COLORS[0].value} border border-gray-700 text-xs font-mono`}
                          variant="outline"
                        >
                          {keyword.text}
                          {keyword.weight !== 1.0 && <span className="ml-1 opacity-70">({keyword.weight}x)</span>}
                        </Badge>
                      ))}
                      {group.keywords.length > 8 && (
                        <Badge variant="secondary" className="text-xs bg-gray-800 border-gray-700 text-gray-400 font-mono">
                          +{group.keywords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
  
      {/* Enhanced Keyword Management Dialog */}
      {selectedGroup && (
        <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-gray-900 border-gray-700">
            <DialogHeader className="pb-4 border-b border-gray-800">
              <DialogTitle className="flex items-center gap-3 text-white">
                <div className={`p-2 rounded-lg ${PRIORITY_COLORS[selectedGroup.priority]} border border-gray-700`}>
                  {React.createElement(PRIORITY_ICONS[selectedGroup.priority], { className: "h-5 w-5" })}
                </div>
                Manage Keywords - {selectedGroup.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* Action Bar */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Dialog open={isKeywordDialogOpen} onOpenChange={setIsKeywordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetKeywordForm(); setEditingKeyword(null); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Keyword
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {editingKeyword ? 'Edit Keyword' : 'Add New Keyword'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyword" className="text-gray-300">Keyword/Phrase *</Label>
                        <Input
                          id="keyword"
                          value={keywordForm.text}
                          onChange={(e) => setKeywordForm({...keywordForm, text: e.target.value})}
                          placeholder="e.g., chest pain, difficulty breathing"
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-300">Color Theme</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {KEYWORD_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setKeywordForm({...keywordForm, color: color.value})}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                keywordForm.color === color.value 
                                  ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div 
                                className={`w-full h-6 rounded ${color.value} flex items-center justify-center text-xs font-medium border border-gray-700`}
                              >
                                Aa
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-300">Weight: {keywordForm.weight}x</Label>
                        <Slider
                          value={[keywordForm.weight]}
                          onValueChange={(value) => setKeywordForm({...keywordForm, weight: value[0]})}
                          min={0.1}
                          max={2.0}
                          step={0.1}
                          className="mt-2 shad-slider"
                        />
                        <p className="text-xs text-gray-400">
                          Higher weight increases importance in analysis
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800">
                        <div>
                          <Label htmlFor="partial" className="text-gray-300">Partial Matching</Label>
                          <p className="text-xs text-gray-400">Allow substring matches</p>
                        </div>
                        <Switch
                          id="partial"
                          checked={keywordForm.isPartialMatch}
                          onCheckedChange={(checked) => setKeywordForm({...keywordForm, isPartialMatch: checked})}
                          className="switch"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsKeywordDialogOpen(false)} className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                        Cancel
                      </Button>
                      <Button onClick={editingKeyword ? handleUpdateKeyword : handleAddKeyword} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {editingKeyword ? 'Update Keyword' : 'Add Keyword'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Bulk Import Keywords</DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 mb-4">
  <h4 className="text-sm font-medium text-white mb-2">Import Rules:</h4>
  <ul className="text-xs text-gray-400 space-y-1">
    <li>• Words with underscores become phrases: <code className="bg-gray-800 px-1 rounded">chest_pain</code> → "chest pain"</li>
    <li>• Words without underscores remain single: <code className="bg-gray-800 px-1 rounded">fever</code> → "fever"</li>
    <li>• Separate multiple keywords with spaces or new lines</li>
    <li>• Duplicates will be automatically removed</li>
  </ul>
</div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bulk" className="text-gray-300">Keywords (one per line)</Label>
                        <Textarea
  id="bulk"
  value={bulkKeywords}
  onChange={(e) => setBulkKeywords(e.target.value)}
  placeholder="chest_pain heart_attack difficulty breathing shortness_of_breath&#10;fever headache nausea&#10;back_pain leg_pain"
  rows={8}
  className="font-mono text-sm bg-gray-800 border-gray-700 text-white placeholder-gray-500"
/>
<p className="text-xs text-gray-400">
  Enter keywords separated by spaces or new lines. Use underscores for multi-word keywords (e.g., "chest_pain" becomes "chest pain").
</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBulkKeywords('')} className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                        Cancel
                      </Button>
                      <Button onClick={handleBulkAddKeywords} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Import Keywords
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
  
              {/* Keywords List */}
              <div className="flex-1 overflow-hidden">
                <div className="border border-gray-800 rounded-lg h-full flex flex-col bg-gray-900/50">
                  <div className="p-3 bg-gray-800/50 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">Keywords ({selectedGroup.keywords.length})</h4>
                      {selectedGroup.keywords.length > 0 && (
                        <div className="text-sm text-gray-400 font-mono">
                          Total weight: {selectedGroup.keywords.reduce((sum, k) => sum + k.weight, 0).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {selectedGroup.keywords.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                          <Tag className="h-6 w-6 text-gray-500" />
                        </div>
                        <h4 className="font-medium mb-2 text-white">No keywords yet</h4>
                        <p className="text-sm text-gray-400 mb-4">
                          Add your first keyword to get started
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => setIsKeywordDialogOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Add Keyword
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {selectedGroup.keywords.map((keyword) => (
                          <div 
                            key={keyword.id} 
                            className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg transition-colors group border border-transparent hover:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <Badge 
                                className={`${keyword.color || KEYWORD_COLORS[0].value} border border-gray-700 font-mono`}
                                variant="outline"
                              >
                                {keyword.text}
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                {keyword.weight !== 1.0 && (
                                  <span className="bg-gray-800 border border-gray-700 px-2 py-1 rounded font-mono">
                                    {keyword.weight}x weight
                                  </span>
                                )}
                                {keyword.isPartialMatch && (
                                  <span className="bg-gray-800 border border-gray-700 px-2 py-1 rounded font-mono">
                                    partial match
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditKeyword(keyword)}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-900 border-gray-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Keyword</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Are you sure you want to delete the keyword "{keyword.text}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteKeyword(keyword.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
  }
