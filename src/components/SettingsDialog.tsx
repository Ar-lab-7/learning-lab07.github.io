
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X, Settings, MonitorSmartphone, PaintBucket, Download, Upload, Info, Trash2, Database } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extract types for better type safety
type ThemeOption = 'dark' | 'light' | 'system';
type FontSizeOption = 'small' | 'medium' | 'large';

interface AppSettings {
  theme: ThemeOption;
  fontSize: FontSizeOption;
  autoSave: boolean;
  notificationsEnabled: boolean;
  blogStorageLocation: string;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'dark',
  fontSize: 'medium',
  autoSave: true,
  notificationsEnabled: true,
  blogStorageLocation: 'localStorage',
};

/**
 * Settings dialog component for app configuration
 */
const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  // Settings state
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('learningLabSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded settings:', parsedSettings);
        setSettings(parsedSettings);
        applyTheme(parsedSettings.theme);
        applyFontSize(parsedSettings.fontSize);
      } catch (error) {
        console.error('Failed to parse settings:', error);
        // Fall back to defaults
        applyTheme(defaultSettings.theme);
        applyFontSize(defaultSettings.fontSize);
      }
    } else {
      // Apply default settings
      applyTheme(defaultSettings.theme);
      applyFontSize(defaultSettings.fontSize);
    }
  }, []);
  
  // Save settings to localStorage when changed
  useEffect(() => {
    console.log('Saving settings:', settings);
    localStorage.setItem('learningLabSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Apply theme setting
  const applyTheme = (theme: ThemeOption) => {
    console.log('Applying theme:', theme);
    const root = document.documentElement;
    
    // First remove all theme classes
    root.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    }
  };
  
  // Apply font size setting
  const applyFontSize = (fontSize: FontSizeOption) => {
    console.log('Applying font size:', fontSize);
    const html = document.documentElement;
    
    if (fontSize === 'small') {
      html.style.fontSize = '14px';
    } else if (fontSize === 'medium') {
      html.style.fontSize = '16px';
    } else if (fontSize === 'large') {
      html.style.fontSize = '18px';
    }
  };
  
  // Handle settings changes
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Apply settings immediately
    if (key === 'theme') {
      applyTheme(value as ThemeOption);
    } else if (key === 'fontSize') {
      applyFontSize(value as FontSizeOption);
    }
    
    // Show toast for feedback
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated`);
  };
  
  // Data management functions
  const exportBlogs = () => {
    try {
      const blogsData = localStorage.getItem('userBlogs');
      if (!blogsData) {
        toast.error('No blogs found to export');
        return;
      }
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(blogsData);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "learning_lab_blogs.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success('Blogs exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export blogs');
    }
  };
  
  const importBlogs = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          toast.error('No file selected');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const blogs = JSON.parse(content);
            
            // Validate basic structure
            if (!Array.isArray(blogs)) {
              toast.error('Invalid blog data format');
              return;
            }
            
            localStorage.setItem('userBlogs', content);
            toast.success('Blogs imported successfully');
            window.location.reload(); // Reload to show imported blogs
          } catch (error) {
            console.error('Parse error:', error);
            toast.error('Failed to parse import file');
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import blogs');
    }
  };
  
  const clearAllBlogs = () => {
    if (confirm('Are you sure you want to delete all blogs? This action cannot be undone.')) {
      localStorage.removeItem('userBlogs');
      toast.success('All blogs have been removed');
      setTimeout(() => window.location.reload(), 1500); // Reload after toast
    }
  };
  
  const showAppInfo = () => {
    toast.info(
      <div className="text-sm">
        <p className="font-medium mb-1">Learning Lab v1.0.0</p>
        <p>Created by AR Labs</p>
        <p className="text-xs mt-1 text-muted-foreground">© 2025 All rights reserved</p>
      </div>,
      {
        duration: 5000,
      }
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass border-eduAccent/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>App Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure your Learning Lab experience. Settings are saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4 text-eduAccent" />
              <span>Theme</span>
            </div>
            <Select 
              value={settings.theme} 
              onValueChange={(value: ThemeOption) => updateSetting('theme', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Font Size Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-eduAccent" />
              <span>Font Size</span>
            </div>
            <Select 
              value={settings.fontSize} 
              onValueChange={(value: FontSizeOption) => updateSetting('fontSize', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Auto Save Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-eduAccent" />
              <span>Auto Save</span>
            </div>
            <Switch 
              checked={settings.autoSave} 
              onCheckedChange={(checked) => updateSetting('autoSave', checked)} 
            />
          </div>
          
          {/* Notifications Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 text-eduAccent">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
              </div>
              <span>Notifications</span>
            </div>
            <Switch 
              checked={settings.notificationsEnabled} 
              onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)} 
            />
          </div>
          
          {/* Data Management Section */}
          <div className="pt-2 border-t border-white/10">
            <h4 className="text-sm font-medium mb-3">Data Management</h4>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportBlogs}
                className="flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Blogs</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={importBlogs}
                className="flex items-center gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import Blogs</span>
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={clearAllBlogs}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Blogs</span>
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={showAppInfo}
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
