
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Sun, Moon, Bell, Star, Download, Info, Check } from "lucide-react";

// Define all user settings and their default values
const DEFAULT_SETTINGS = {
  theme: "system",
  pwaInstallPrompt: true,
  notificationsEnabled: true,
  showTips: false,
  compactMode: false
};

const getSavedSettings = () => {
  try {
    return JSON.parse(localStorage.getItem("learningLabSettings") || "{}");
  } catch {
    return {};
  }
};

const SettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = getSavedSettings();
    setSettings({ ...DEFAULT_SETTINGS, ...saved });
  }, []);

  // Save to localStorage whenever settings update
  useEffect(() => {
    localStorage.setItem("learningLabSettings", JSON.stringify(settings));
  }, [settings]);

  // Theme switching
  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (settings.theme === "light") {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      // System
      document.documentElement.classList.remove('light', 'dark');
    }
  }, [settings.theme]);

  const close = () => onOpenChange(false);

  // PWA Install
  const handleInstall = () => {
    if ('BeforeInstallPromptEvent' in window && (window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
    } else {
      toast.info("You can install this app from your browser menu!");
    }
  };

  return (
    open ? (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center transition-all overlay">
        <div className="bg-card max-w-sm w-[95vw] rounded-2xl p-6 shadow-2xl glass text-app backdrop-blur-lg border border-slate-300/50 dark:border-slate-600">
          <div className="flex items-center gap-3 mb-6">
            <Info className="text-accent" size={22} />
            <h2 className="font-bold text-lg flex-1">Settings</h2>
            <Button variant="ghost" size="icon" onClick={close}>
              <Check size={18} className="text-primary" />
            </Button>
          </div>
          <div className="space-y-5">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <Sun size={16} className="hidden dark:inline-block" />
                <Moon size={16} className="inline-block dark:hidden" />
                Theme
              </span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSettings(s => ({ ...s, theme: "system" }))} 
                  className={`rounded-full px-3 ${settings.theme === "system" ? "bg-accent text-white" : "bg-muted"} shadow-none`} size="sm"
                >System</Button>
                <Button 
                  onClick={() => setSettings(s => ({ ...s, theme: "light" }))} 
                  className={`rounded-full px-3 ${settings.theme === "light" ? "bg-accent text-white" : "bg-muted"} shadow-none`} size="sm"
                >Light</Button>
                <Button 
                  onClick={() => setSettings(s => ({ ...s, theme: "dark" }))} 
                  className={`rounded-full px-3 ${settings.theme === "dark" ? "bg-accent text-white" : "bg-muted"} shadow-none`} size="sm"
                >Dark</Button>
              </div>
            </div>
            {/* Compact Mode */}
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium">
                <Star size={16} /> Compact mode
              </span>
              <Switch
                checked={!!settings.compactMode}
                onCheckedChange={v => setSettings(s => ({ ...s, compactMode: v }))}
                aria-label="Enable compact mode"
              />
            </div>
            {/* Notifications */}
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium">
                <Bell size={16} /> Enable notifications
              </span>
              <Switch
                checked={!!settings.notificationsEnabled}
                onCheckedChange={v => setSettings(s => ({ ...s, notificationsEnabled: v }))}
                aria-label="Enable notifications"
              />
            </div>
            {/* Tips/help/toggle */}
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium">
                <Info size={16} /> Show Tips
              </span>
              <Switch
                checked={!!settings.showTips}
                onCheckedChange={v => setSettings(s => ({ ...s, showTips: v }))}
                aria-label="Show feature tips"
              />
            </div>
            {/* PWA Install Prompt */}
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium">
                <Download size={16} /> Show install prompt
              </span>
              <Switch
                checked={!!settings.pwaInstallPrompt}
                onCheckedChange={v => setSettings(s => ({ ...s, pwaInstallPrompt: v }))}
                aria-label="Show install prompt"
              />
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-app-muted">
              <Info size={12} className="inline align-middle mr-1" />
              This app works offline and can be installed on your device (PWA).
            </p>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default SettingsDialog;
