import React from 'react';
import { Play, ShieldAlert, Hammer, Zap } from 'lucide-react';
import { ATMState } from '../types';

interface ScenariosProps {
  onApply: (sensors: ATMState['sensors']) => void;
}

export const Scenarios: React.FC<ScenariosProps> = ({ onApply }) => {
  const scenarios = [
    {
      name: 'Skimming Attack',
      icon: <ShieldAlert className="w-4 h-4" />,
      description: 'Suspicious object on reader + shielded keypad',
      sensors: {
        camera: { activityDetected: true, personPresent: true, faceVisible: false, suspiciousObject: true },
        cardReader: { cardInserted: true, swipeCount: 2, isJammed: false, isLocked: false },
        keypad: { keysPressed: 4, shielded: true, rapidInput: false, isDisabled: false },
        vibration: { level: 5 }
      }
    },
    {
      name: 'Physical Tampering',
      icon: <Hammer className="w-4 h-4" />,
      description: 'High vibration + no person present',
      sensors: {
        camera: { activityDetected: true, personPresent: false, faceVisible: false, suspiciousObject: false },
        cardReader: { cardInserted: false, swipeCount: 0, isJammed: false, isLocked: false },
        keypad: { keysPressed: 0, shielded: false, rapidInput: false, isDisabled: false },
        vibration: { level: 95 }
      }
    },
    {
      name: 'Card Trapping',
      icon: <Zap className="w-4 h-4" />,
      description: 'Jammed reader + multiple failed swipes',
      sensors: {
        camera: { activityDetected: true, personPresent: true, faceVisible: true, suspiciousObject: false },
        cardReader: { cardInserted: true, swipeCount: 8, isJammed: true, isLocked: false },
        keypad: { keysPressed: 12, shielded: false, rapidInput: true, isDisabled: false },
        vibration: { level: 10 }
      }
    }
  ];

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-4">
      <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)]">Simulation Scenarios</h3>
      <div className="grid grid-cols-1 gap-2">
        {scenarios.map((s) => (
          <button
            key={s.name}
            onClick={() => onApply(s.sensors)}
            className="group flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:border-[#00A3FF]/50 hover:bg-[#00A3FF]/5 transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-[#00A3FF]/20 text-[var(--text-secondary)] group-hover:text-[#00A3FF] transition-colors">
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">{s.name}</div>
              <div className="text-[10px] text-[var(--text-secondary)] font-mono">{s.description}</div>
            </div>
            <Play className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[#00A3FF]" />
          </button>
        ))}
      </div>
    </div>
  );
};
