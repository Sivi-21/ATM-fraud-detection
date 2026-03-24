import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Activity, Bell, Settings, Database, Cpu, Lock, Sun, Moon, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { ATMState, FraudAlert } from './types';
import { useTheme } from './contexts/ThemeContext';
import { useSound } from './hooks/useSound';
import { SensorPanel } from './components/SensorPanel';
import { AlertDisplay } from './components/AlertDisplay';
import { Analytics } from './components/Analytics';
import { analyzeATMState } from './services/fraudDetection';
import { Scenarios } from './components/Scenarios';
import { Countermeasures } from './components/Countermeasures';
import { ExportPanel } from './components/ExportPanel';
import { Archive } from './components/Archive';
import { Models } from './components/Models';
import { Config } from './components/Config';
import { Login } from './components/Login';
import { AuditLogs } from './components/AuditLogs';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { useAuth } from './contexts/AuthContext';
import { MapPin, Server, LogOut, Clock, FileText } from 'lucide-react';

const INITIAL_ATMS: ATMState[] = [
  {
    id: 'ATM-7742-DX',
    name: 'Downtown Main',
    location: 'Downtown Financial District, Block 4',
    status: 'online',
    lastMaintenance: '2026-03-15',
    sensors: {
      camera: { activityDetected: false, personPresent: false, faceVisible: false, suspiciousObject: false },
      cardReader: { cardInserted: false, swipeCount: 0, isJammed: false, isLocked: false },
      keypad: { keysPressed: 0, shielded: false, rapidInput: false, isDisabled: false },
      vibration: { level: 0 },
    },
  },
  {
    id: 'ATM-2210-AP',
    name: 'Airport Terminal 1',
    location: 'International Airport, Arrivals Level',
    status: 'online',
    lastMaintenance: '2026-03-20',
    sensors: {
      camera: { activityDetected: true, personPresent: true, faceVisible: true, suspiciousObject: false },
      cardReader: { cardInserted: true, swipeCount: 1, isJammed: false, isLocked: false },
      keypad: { keysPressed: 2, shielded: false, rapidInput: false, isDisabled: false },
      vibration: { level: 2 },
    },
  },
  {
    id: 'ATM-9903-SB',
    name: 'Suburban Branch',
    location: 'Westside Mall, Entrance B',
    status: 'maintenance',
    lastMaintenance: '2026-03-22',
    sensors: {
      camera: { activityDetected: false, personPresent: false, faceVisible: false, suspiciousObject: false },
      cardReader: { cardInserted: false, swipeCount: 0, isJammed: false, isLocked: true },
      keypad: { keysPressed: 0, shielded: false, rapidInput: false, isDisabled: true },
      vibration: { level: 0 },
    },
  },
];

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--text-primary)]">Loading...</span>
      </div>
    </div>
  );
}

// Main dashboard component
function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggleSound, playAlertSound, initAudioContext } = useSound();
  const { user, logout, hasPermission, sessionTimeRemaining, addAuditLog } = useAuth();
  const [atms, setAtms] = useState<ATMState[]>(INITIAL_ATMS);
  const [activeAtmId, setActiveAtmId] = useState(INITIAL_ATMS[0].id);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [atmSelectorOpen, setAtmSelectorOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const activeAtm = atms.find(a => a.id === activeAtmId) || atms[0];

  // Update sensor state for active ATM
  const handleSensorUpdate = (updates: Partial<ATMState['sensors']>) => {
    setAtms(prev => prev.map(atm => 
      atm.id === activeAtmId 
        ? { ...atm, sensors: { ...atm.sensors, ...updates } }
        : atm
    ));
  };

  const applyScenario = (sensors: ATMState['sensors']) => {
    handleSensorUpdate(sensors);
  };

  // Run AI Analysis when sensors change significantly
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      const result = await analyzeATMState(activeAtm);
      setAlerts(prev => [result, ...prev]);
      setIsAnalyzing(false);
      
      // Play sound alert for fraud detection
      if (result.type !== 'none') {
        playAlertSound(result.severity);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeAtm.sensors, activeAtmId, playAlertSound]);

  // Update analytics data
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      setHistory(prev => {
        const newData = [
          ...prev,
          {
            time: timeStr,
            vibration: activeAtm.sensors.vibration.level,
            activity: activeAtm.sensors.camera.activityDetected ? 80 : 10,
            risk: alerts.find(a => a.atmId === activeAtmId)?.confidence ? (alerts.find(a => a.atmId === activeAtmId)?.confidence || 0) * 100 : 0
          }
        ];
        return newData.slice(-20);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeAtm.sensors, alerts, activeAtmId]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] selection:bg-[#00A3FF]/30 transition-colors duration-300">
      {/* Top Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--card-bg)]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-2 bg-[#00A3FF] rounded-lg shadow-[0_0_15px_rgba(0,163,255,0.4)]">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold tracking-tight">ATM_GUARD <span className="text-[#00A3FF]">v2.4</span></h1>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                SYSTEM_ONLINE // {activeAtm.id}
              </div>
            </div>
            {/* Mobile ATM Selector */}
            <div className="sm:hidden relative">
              <button 
                onClick={() => setAtmSelectorOpen(!atmSelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00A3FF] text-white text-xs font-mono"
              >
                <Server className="w-3 h-3" />
                {activeAtm.name}
              </button>
              {atmSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 py-2">
                  {atms.map(atm => (
                    <button
                      key={atm.id}
                      onClick={() => {
                        setActiveAtmId(atm.id);
                        setAtmSelectorOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-mono transition-colors ${
                        activeAtmId === atm.id 
                          ? 'bg-[#00A3FF]/10 text-[#00A3FF]' 
                          : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {atm.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-black/10 dark:bg-black/20 p-1 rounded-xl border border-[var(--border-color)]">
            {atms.map(atm => (
              <button
                key={atm.id}
                onClick={() => setActiveAtmId(atm.id)}
                className={`px-4 py-2 rounded-lg text-[10px] font-mono transition-all flex items-center gap-2 ${
                  activeAtmId === atm.id 
                    ? 'bg-[#00A3FF] text-white shadow-[0_0_10px_rgba(0,163,255,0.3)]' 
                    : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Server className="w-3 h-3" />
                {atm.name}
              </button>
            ))}
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setShowArchive(true)}
              className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Database className="w-4 h-4" />
              ARCHIVE
            </button>
            <button 
              onClick={() => setShowModels(true)}
              className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Cpu className="w-4 h-4" />
              MODELS
            </button>
            <button 
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Settings className="w-4 h-4" />
              CONFIG
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Timer */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5">
              <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className={`text-xs font-mono ${sessionTimeRemaining < 300000 ? 'text-[#FF4444]' : 'text-[var(--text-secondary)]'}`}>
                {Math.floor(sessionTimeRemaining / 60000)}:{String(Math.floor((sessionTimeRemaining % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">{user?.role}</span>
              <span className="text-xs font-mono text-[#00FF9D]">{user?.username}</span>
            </div>
            {/* Sound Toggle */}
            <button 
              onClick={() => {
                initAudioContext();
                toggleSound();
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                soundEnabled 
                  ? 'bg-[#00FF9D]/10 text-[#00FF9D]' 
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'
              } hover:bg-black/10 dark:hover:bg-white/10`}
              title={soundEnabled ? 'Sound alerts on' : 'Sound alerts off'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            <button 
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
              )}
            </button>
            <button className="p-1.5 sm:p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
              {alerts.some(a => a.type !== 'none') && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF4444] rounded-full border-2 border-[var(--bg-color)]" />
              )}
            </button>
            {/* Logout */}
            <button 
              onClick={logout}
              className="p-1.5 sm:p-2 rounded-full bg-[#FF4444]/10 text-[#FF4444] hover:bg-[#FF4444]/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
              )}
            </button>
            <div className="hidden sm:block w-8 h-8 rounded-full bg-gradient-to-br from-[#00A3FF] to-[#00FF9D] p-[1px]">
              <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[var(--text-primary)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--card-bg)]/95 backdrop-blur-xl">
            <nav className="flex flex-col p-4 gap-2">
              <button 
                onClick={() => { setShowArchive(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-primary)]"
              >
                <Database className="w-5 h-5" />
                <span className="text-sm font-mono">ARCHIVE</span>
              </button>
              <button 
                onClick={() => { setShowModels(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-primary)]"
              >
                <Cpu className="w-5 h-5" />
                <span className="text-sm font-mono">MODELS</span>
              </button>
              <button 
                onClick={() => { setShowConfig(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-primary)]"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-mono">CONFIG</span>
              </button>
              {hasPermission('view_audit_logs') && (
                <button 
                  onClick={() => { setShowAuditLogs(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-primary)]"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-mono">AUDIT LOGS</span>
                </button>
              )}
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF4444]/10 text-[#FF4444]"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-mono">LOGOUT</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Monitoring & Analytics */}
        <div className="xl:col-span-8 flex flex-col gap-4 sm:gap-6">
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 px-2 sm:px-4 gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00A3FF]" />
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">Sensor Fusion Matrix</h2>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[200px] sm:max-w-none">{activeAtm.location}</span>
              </div>
            </div>
            <SensorPanel state={activeAtm} onUpdate={handleSensorUpdate} />
          </section>

          <section className="flex-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4 px-2 sm:px-4">
              <Activity className="w-4 h-4 text-[#00A3FF]" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">Real-time Telemetry</h2>
            </div>
            <Analytics data={history} />
          </section>
        </div>

        {/* Right Column: AI Insights & Alerts */}
        <div className="xl:col-span-4 flex flex-col gap-4 sm:gap-6">
          <LiveActivityFeed />
          
          <ExportPanel alerts={alerts} atmInfo={activeAtm} />
          
          <Scenarios onApply={applyScenario} />
          
          <Countermeasures state={activeAtm} onUpdate={handleSensorUpdate} />

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00A3FF]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-primary)]">AI_CORE_NEURAL_LINK</span>
              </div>
              <span className="text-[10px] font-mono text-[#00FF9D]">ACTIVE</span>
            </div>
            <AlertDisplay alerts={alerts.filter(a => a.atmId === activeAtmId)} isAnalyzing={isAnalyzing} />
          </div>

          <div className="bg-gradient-to-br from-[#00A3FF]/10 to-transparent border border-[#00A3FF]/20 rounded-2xl p-4 sm:p-6">
            <h4 className="text-sm font-bold mb-2 uppercase tracking-tight text-[var(--text-primary)]">System Protocol</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
              The neural detection engine is currently monitoring for skimming devices, keypad overlays, and physical tampering. Sensor fusion data is analyzed every 1500ms for pattern matching against known fraud vectors.
            </p>
            <button className="mt-4 w-full py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[var(--border-color)] rounded-lg text-[10px] font-mono uppercase tracking-widest text-[var(--text-primary)] transition-all">
              Run Full Diagnostic
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showArchive && <Archive alerts={alerts} onClose={() => setShowArchive(false)} />}
      {showModels && <Models onClose={() => setShowModels(false)} />}
      {showConfig && <Config onClose={() => setShowConfig(false)} />}
      {showAuditLogs && hasPermission('view_audit_logs') && <AuditLogs onClose={() => setShowAuditLogs(false)} />}

      {/* Footer Status Bar */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-color)] py-2 sm:py-3 px-3 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 sm:gap-4 text-[10px] font-mono text-[var(--text-secondary)]">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
              <span className="hidden sm:inline">ENC_LINK: STABLE</span>
              <span className="sm:hidden">LINK: OK</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
              <span>42ms</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]" />
              UPTIME: 142:12:04
            </div>
          </div>
          <div className="uppercase tracking-widest text-center sm:text-right">
            <span className="hidden sm:inline">© 2026 ATM_GUARD SECURITY SYSTEMS // SECURE_NODE_ALPHA</span>
            <span className="sm:hidden">© 2026 ATM_GUARD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App component that handles auth state
export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />;
  }

  return <Dashboard />;
}
