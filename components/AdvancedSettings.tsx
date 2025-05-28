
//components/AdvancedSettings.tsx
    /* eslint-disable */

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export interface AdvancedSettings {
  sensitivityLevel: number;
  showPartialMatches: boolean;
  enableSymptomCombinations: boolean;
  urgentThreshold: number;
  emergencyThreshold: number;
}

export const DEFAULT_SETTINGS: AdvancedSettings = {
  sensitivityLevel: 70,
  showPartialMatches: true,
  enableSymptomCombinations: true,
  urgentThreshold: 65,
  emergencyThreshold: 85
};

interface AdvancedSettingsComponentProps {
  settings: AdvancedSettings;
  onSettingChange: (settingName: keyof AdvancedSettings, value: any) => void;
  onResetSettings: () => void;
}

export const AdvancedSettingsComponent: React.FC<AdvancedSettingsComponentProps> = ({
  settings,
  onSettingChange,
  onResetSettings
}) => {
  const handleResetSettings = () => {
    onResetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="space-y-6 p-1">
      {/* Sensitivity Section */}
      <div className="space-y-4">
        <div className="pb-2 border-b">
          <h4 className="font-medium text-sm">Analysis Sensitivity</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Control how the system detects and processes symptoms
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Sensitivity Level</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {settings.sensitivityLevel}%
              </span>
            </div>
          </div>
          <Slider
            value={[settings.sensitivityLevel]}
            min={30}
            max={100}
            step={5}
            onValueChange={(value) => onSettingChange('sensitivityLevel', value[0])}
            className="py-2 shad-slider"
          />
          <p className="text-xs text-muted-foreground">
            Higher values increase detection accuracy but may catch more false positives
          </p>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <div className="space-y-1">
            <div className="text-sm font-medium">Partial Match Recognition</div>
            <div className="text-xs text-muted-foreground">
              Detect symptoms even with incomplete keyword matches
            </div>
          </div>
          <Switch
            checked={settings.showPartialMatches}
            onCheckedChange={(value) => onSettingChange('showPartialMatches', value)}
            className="shad-switch"
          />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <div className="space-y-1">
            <div className="text-sm font-medium">Symptom Combinations</div>
            <div className="text-xs text-muted-foreground">
              Enhanced analysis for multiple related symptoms
            </div>
          </div>
          <Switch
            checked={settings.enableSymptomCombinations}
            onCheckedChange={(value) => onSettingChange('enableSymptomCombinations', value)}
            className="shad-switch"
          />
        </div>
      </div>
      
      {/* Priority Thresholds Section */}
      <div className="space-y-4">
        <div className="pb-2 border-b">
          <h4 className="font-medium text-sm">Priority Thresholds</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Set score thresholds for automatic priority classification
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Urgent Priority</span>
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              </div>
              <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded font-mono">
                {settings.urgentThreshold}/100
              </span>
            </div>
            <Slider
              value={[settings.urgentThreshold]}
              min={50}
              max={80}
              step={5}
              onValueChange={(value) => onSettingChange('urgentThreshold', value[0])}
              className="py-2 shad-slider"
            />
            <p className="text-xs text-muted-foreground">
              Scores above this threshold will be marked as urgent
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Emergency Priority</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded font-mono">
                {settings.emergencyThreshold}/100
              </span>
            </div>
            <Slider
              value={[settings.emergencyThreshold]}
              min={75}
              max={95}
              step={5}
              onValueChange={(value) => onSettingChange('emergencyThreshold', value[0])}
              className="py-2 shad-slider"
            />
            <p className="text-xs text-muted-foreground">
              Scores above this threshold will be marked as emergency
            </p>
          </div>
        </div>
        
        {/* Threshold Validation Warning */}
        {settings.urgentThreshold >= settings.emergencyThreshold && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <div className="text-xs">
                <div className="font-medium text-amber-800">Threshold Overlap</div>
                <div className="text-amber-700 mt-1">
                  Emergency threshold should be higher than urgent threshold for proper classification
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Reset Section */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Reset Configuration</div>
            <div className="text-xs text-muted-foreground">Restore all settings to default values</div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetSettings}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};