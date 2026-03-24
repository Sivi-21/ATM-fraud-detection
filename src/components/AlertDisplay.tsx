import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Clock, Info } from 'lucide-react';
import { FraudAlert } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AlertDisplayProps {
  alerts: FraudAlert[];
  isAnalyzing: boolean;
}

export const AlertDisplay: React.FC<AlertDisplayProps> = ({ alerts, isAnalyzing }) => {
  const latestAlert = alerts[0];

  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <h2 className="text-base sm:text-lg font-mono uppercase tracking-widest text-[var(--text-primary)]">Security Status</h2>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-[#00A3FF] text-xs font-mono animate-pulse">
            <div className="w-2 h-2 bg-[#00A3FF] rounded-full" />
            AI_ANALYZING...
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {latestAlert && latestAlert.type !== 'none' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col gap-3 sm:gap-4 ${
              latestAlert.severity === 'high' 
                ? 'bg-[#FF4444]/10 border-[#FF4444]/50 shadow-[0_0_20px_rgba(255,68,68,0.2)]' 
                : 'bg-[#F27D26]/10 border-[#F27D26]/50 shadow-[0_0_20px_rgba(242,125,38,0.2)]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-3 rounded-full ${latestAlert.severity === 'high' ? 'bg-[#FF4444]' : 'bg-[#F27D26]'}`}>
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold uppercase tracking-tight">
                    {latestAlert.type.replace('_', ' ')} DETECTED
                  </h3>
                  <div className="flex items-center gap-2 text-xs opacity-70 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(latestAlert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="bg-black/40 px-3 py-1 rounded-full border border-white/10 text-xs font-mono self-start sm:self-auto">
                CONF: {(latestAlert.confidence * 100).toFixed(0)}%
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]">
              {latestAlert.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {latestAlert.sensorEvidence.map(sensor => (
                <span key={sensor} className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-[10px] font-mono uppercase border border-[var(--border-color)]">
                  {sensor}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 sm:p-12 rounded-2xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center gap-3 sm:gap-4 text-center"
          >
            <div className="p-3 sm:p-4 rounded-full bg-[#00FF9D]/10 border border-[#00FF9D]/20">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#00FF9D]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">System Secure</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono mt-1">NO ANOMALIES DETECTED</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 sm:mt-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-2 sm:mb-3">Recent Event Log</h3>
        <div className="flex flex-col gap-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {alerts.slice(1, 10).map((alert) => (
            <div 
              key={alert.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--text-secondary)]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {alert.type === 'none' ? (
                  <ShieldCheck className="w-4 h-4 text-[#00FF9D]" />
                ) : (
                  <AlertTriangle className={`w-4 h-4 ${alert.severity === 'high' ? 'text-[#FF4444]' : 'text-[#F27D26]'}`} />
                )}
                <div>
                  <div className="text-xs font-medium uppercase text-[var(--text-primary)]">{alert.type === 'none' ? 'Normal Activity' : alert.type.replace('_', ' ')}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-secondary)]">
                {alert.type === 'none' ? '-' : `CONF: ${(alert.confidence * 100).toFixed(0)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
