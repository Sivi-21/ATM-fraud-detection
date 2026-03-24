import React, { useState } from 'react';
import { X, Settings, Bell, Shield, Activity, Save, RotateCcw } from 'lucide-react';

interface ConfigProps {
  onClose: () => void;
}

interface AlertThresholds {
  high: number;
  medium: number;
  low: number;
}

interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

export const Config: React.FC<ConfigProps> = ({ onClose }) => {
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    high: 85,
    medium: 60,
    low: 30
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    soundEnabled: true,
    desktopNotifications: true,
    emailAlerts: false,
    smsAlerts: false
  });

  const [scanInterval, setScanInterval] = useState(1500);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockThreshold, setAutoLockThreshold] = useState(90);

  const handleSave = () => {
    // In a real app, save to backend/localStorage
    alert('Settings saved successfully!');
    onClose();
  };

  const handleReset = () => {
    setThresholds({ high: 85, medium: 60, low: 30 });
    setNotifications({
      soundEnabled: true,
      desktopNotifications: true,
      emailAlerts: false,
      smsAlerts: false
    });
    setScanInterval(1500);
    setAutoLockEnabled(true);
    setAutoLockThreshold(90);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A3FF]/10 rounded-lg">
              <Settings className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Configuration</h2>
              <p className="text-xs text-[var(--text-secondary)]">System Settings & Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Alert Thresholds */}
          <section className="bg-black/5 dark:bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#00A3FF]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Alert Thresholds</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Set confidence thresholds for different alert severity levels
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#FF4444]">High Severity</span>
                  <span className="text-xs font-mono">{thresholds.high}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={thresholds.high}
                  onChange={(e) => setThresholds(prev => ({ ...prev, high: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#FF4444]/20 rounded-full appearance-none cursor-pointer accent-[#FF4444]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#F27D26]">Medium Severity</span>
                  <span className="text-xs font-mono">{thresholds.medium}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={thresholds.medium}
                  onChange={(e) => setThresholds(prev => ({ ...prev, medium: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#F27D26]/20 rounded-full appearance-none cursor-pointer accent-[#F27D26]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#00A3FF]">Low Severity</span>
                  <span className="text-xs font-mono">{thresholds.low}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={thresholds.low}
                  onChange={(e) => setThresholds(prev => ({ ...prev, low: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#00A3FF]/20 rounded-full appearance-none cursor-pointer accent-[#00A3FF]"
                />
              </div>
            </div>
          </section>

          {/* Scanning Settings */}
          <section className="bg-black/5 dark:bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#00A3FF]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Scanning Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-secondary)]">Analysis Interval</span>
                  <span className="text-xs font-mono">{scanInterval}ms</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={scanInterval}
                  onChange={(e) => setScanInterval(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#00A3FF]/20 rounded-full appearance-none cursor-pointer accent-[#00A3FF]"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  How often the AI analyzes sensor data
                </p>
              </div>
            </div>
          </section>

          {/* Auto-Lock Settings */}
          <section className="bg-black/5 dark:bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FF4444]" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Auto-Lock Protection</h3>
              </div>
              <button
                onClick={() => setAutoLockEnabled(!autoLockEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  autoLockEnabled ? 'bg-[#00FF9D]' : 'bg-[var(--border-color)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  autoLockEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
            {autoLockEnabled && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-secondary)]">Lock Threshold</span>
                  <span className="text-xs font-mono">{autoLockThreshold}% confidence</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={autoLockThreshold}
                  onChange={(e) => setAutoLockThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#FF4444]/20 rounded-full appearance-none cursor-pointer accent-[#FF4444]"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Automatically lock ATM when fraud confidence exceeds this threshold
                </p>
              </div>
            )}
          </section>

          {/* Notification Settings */}
          <section className="bg-black/5 dark:bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#00A3FF]" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Notifications</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play audio on high-severity alerts' },
                { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show browser notifications' },
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Send email for critical incidents' },
                { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Send SMS for emergency lockdowns' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof NotificationSettings] }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      notifications[item.key as keyof NotificationSettings] ? 'bg-[#00FF9D]' : 'bg-[var(--border-color)]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      notifications[item.key as keyof NotificationSettings] ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)] bg-black/5 dark:bg-white/5">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#00A3FF] text-white hover:bg-[#00A3FF]/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
