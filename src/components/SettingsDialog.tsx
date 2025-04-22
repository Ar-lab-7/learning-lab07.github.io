import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X, Settings, MonitorSmartphone, PaintBucket, Download, Upload, Info, Trash2, Database, Sun, Moon, Monitor, Bell, Palette, CloudUpload, CloudOff, Lock, Laptop, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extract types for better type safety
type ThemeOption = 'dark' | 'light' | 'system';
type FontSizeOption = 'small' | 'medium' | 'large';
type StorageOption = 'local' | 'cloud';
type NotificationOption = 'all' | 'important' | 'none';

interface AppSettings {
  theme: ThemeOption;
  fontSize: FontSizeOption;
  autoSave: boolean;
  notificationsEnabled: boolean;
  notificationLevel: NotificationOption;
  blogStorageLocation: StorageOption;
  offlineMode: boolean;
  highContrastMode: boolean;
  installPrompt: boolean;
  animationsEnabled: boolean;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'dark',
  fontSize: 'medium',
  autoSave: true,
  notificationsEnabled: true,
  notificationLevel: 'important',
  blogStorageLocation: 'local',
  offlineMode: false,
  highContrastMode: false,
  installPrompt: true,
  animationsEnabled: true,
};

/**
 * Settings dialog component for app configuration
 */
const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  // Settings state
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [installable, setInstallable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { isDeveloper } = useAuth();
  
  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallable(false);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('learningLabSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded settings:', parsedSettings);
        setSettings({...defaultSettings, ...parsedSettings});
        applyTheme(parsedSettings.theme || defaultSettings.theme);
        applyFontSize(parsedSettings.fontSize || defaultSettings.fontSize);
        if (parsedSettings.highContrastMode) {
          applyHighContrast(true);
        }
        if (parsedSettings.animationsEnabled === false) {
          disableAnimations();
        }
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
      document.body.style.setProperty('--background-color', '#1A1F2C');
      document.body.style.setProperty('--text-color', '#F1F0FB');
    } else if (theme === 'light') {
      root.classList.add('light');
      document.body.style.setProperty('--background-color', '#F9F9FF');
      document.body.style.setProperty('--text-color', '#1A1F2C');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
      document.body.style.setProperty('--background-color', prefersDark ? '#1A1F2C' : '#F9F9FF');
      document.body.style.setProperty('--text-color', prefersDark ? '#F1F0FB' : '#1A1F2C');
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
  
  // Apply high contrast mode
  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.body.classList.add('high-contrast');
      // Increase contrast for text and UI elements
      document.body.style.setProperty('--foreground', '0 0% 0%');
      document.body.style.setProperty('--background', '0 0% 100%');
      document.body.style.setProperty('--muted-foreground', '0 0% 20%');
    } else {
      document.body.classList.remove('high-contrast');
      // Reset to theme default
      const isDarkMode = document.documentElement.classList.contains('dark');
      if (isDarkMode) {
        applyTheme('dark');
      } else {
        applyTheme('light');
      }
    }
  };
  
  // Disable animations globally
  const disableAnimations = () => {
    const style = document.createElement('style');
    style.id = 'disable-animations';
    style.textContent = '* { animation: none !important; transition: none !important; }';
    document.head.appendChild(style);
  };
  
  // Enable animations globally
  const enableAnimations = () => {
    const style = document.getElementById('disable-animations');
    if (style) {
      style.remove();
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
    } else if (key === 'highContrastMode') {
      applyHighContrast(value as boolean);
    } else if (key === 'animationsEnabled') {
      if (value) {
        enableAnimations();
      } else {
        disableAnimations();
      }
    }
    
    // Show toast for feedback
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} updated`);
  };
  
  // Install PWA
  const installPWA = async () => {
    if (!deferredPrompt) {
      toast.error("Installation prompt not available");
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Thank you for installing Learning Lab!');
      setInstallable(false);
    } else {
      toast.info('Installation declined');
    }
    
    // Clear the deferred prompt variable
    setDeferredPrompt(null);
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
        <p className="text-xs mt-1 text-muted-foreground">© {new Date().getFullYear()} All rights reserved</p>
      </div>,
      {
        duration: 5000,
      }
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass border-eduAccent/20 text-app">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-app">
            <Settings className="h-5 w-5" />
            <span>App Settings</span>
          </DialogTitle>
          <DialogDescription className="text-app-muted">
            Configure your Learning Lab experience. Settings are saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Theme</span>
            </div>
            <Select 
              value={settings.theme} 
              onValueChange={(value: ThemeOption) => updateSetting('theme', value)}
            >
              <SelectTrigger className="w-[140px] text-app">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Moon size={14} />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="light" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Sun size={14} />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="system" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Font Size Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Font Size</span>
            </div>
            <Select 
              value={settings.fontSize} 
              onValueChange={(value: FontSizeOption) => updateSetting('fontSize', value)}
            >
              <SelectTrigger className="w-[140px] text-app">
                <SelectValue placeholder="Font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* High Contrast Mode Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-eduAccent" />
              <span className="text-app">High Contrast</span>
            </div>
            <Switch 
              checked={settings.highContrastMode} 
              onCheckedChange={(checked) => updateSetting('highContrastMode', checked)} 
            />
          </div>
          
          {/* Auto Save Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Auto Save</span>
            </div>
            <Switch 
              checked={settings.autoSave} 
              onCheckedChange={(checked) => updateSetting('autoSave', checked)} 
            />
          </div>
          
          {/* Animations Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 text-eduAccent">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13a10 10 0 0 1 14 0"></path>
                  <path d="M8.5 16.5a5 5 0 0 1 7 0"></path>
                  <path d="M2 8.82a15 15 0 0 1 20 0"></path>
                  <path d="M12 20v-8"></path>
                </svg>
              </div>
              <span className="text-app">Animations</span>
            </div>
            <Switch 
              checked={settings.animationsEnabled} 
              onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)} 
            />
          </div>
          
          {/* Notifications Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Notifications</span>
            </div>
            <div className="flex flex-col gap-1">
              <Switch 
                checked={settings.notificationsEnabled} 
                onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)} 
              />
              {settings.notificationsEnabled && (
                <Select 
                  value={settings.notificationLevel} 
                  onValueChange={(value: NotificationOption) => updateSetting('notificationLevel', value)}
                >
                  <SelectTrigger className="w-[140px] text-app h-8 text-xs">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="important">Important only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          {/* Storage Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Storage Mode</span>
            </div>
            <Select 
              value={settings.blogStorageLocation} 
              onValueChange={(value: StorageOption) => updateSetting('blogStorageLocation', value)}
            >
              <SelectTrigger className="w-[140px] text-app">
                <SelectValue placeholder="Storage location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Storage</SelectItem>
                <SelectItem value="cloud">Cloud Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Offline Mode Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Offline Mode</span>
            </div>
            <Switch 
              checked={settings.offlineMode} 
              onCheckedChange={(checked) => updateSetting('offlineMode', checked)} 
            />
          </div>
          
          {/* PWA Install Prompt Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-eduAccent" />
              <span className="text-app">Installation Prompt</span>
            </div>
            <Switch 
              checked={settings.installPrompt} 
              onCheckedChange={(checked) => updateSetting('installPrompt', checked)} 
            />
          </div>
          
          {/* PWA Install Button */}
          {installable && (
            <Button 
              onClick={installPWA}
              className="w-full bg-eduAccent text-white hover:bg-eduAccent/90 mt-2 flex items-center justify-center gap-2"
            >
              <ArrowDown size={16} />
              Install Learning Lab App
            </Button>
          )}
          
          {/* Data Management Section */}
          <div className="pt-2 border-t border-white/10">
            <h4 className="text-sm font-medium mb-3 text-app">Data Management</h4>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportBlogs}
                className="flex items-center gap-1 text-app"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Blogs</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={importBlogs}
                className="flex items-center gap-1 text-app"
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
          
          {/* Privacy section */}
          {isDeveloper && (
            <div className="pt-2 border-t border-white/10">
              <h4 className="text-sm font-medium mb-3 text-app">Developer Options</h4>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-eduAccent" />
                    <span className="text-app">Privacy Mode</span>
                  </div>
                  <Switch 
                    checked={false}
                    onCheckedChange={() => toast.info('Privacy mode is available in the pro version')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={showAppInfo}
            className="text-app"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="bg-eduAccent text-white hover:bg-eduAccent/90"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
