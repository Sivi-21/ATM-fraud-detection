import React from 'react';
import { Lock, Unlock, Keyboard, PhoneCall, Siren } from 'lucide-react';
import { ATMState } from '../types';

interface CountermeasuresProps {
  state: ATMState;
  onUpdate: (updates: Partial<ATMState['sensors']>) => void;
}

export const Countermeasures: React.FC<CountermeasuresProps> = ({ state, onUpdate }) => {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-4">
      <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)]">Active Countermeasures</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onUpdate({ cardReader: { ...state.sensors.cardReader, isLocked: !state.sensors.cardReader.isLocked } })}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
            state.sensors.cardReader.isLocked 
              ? 'bg-[#FF4444]/10 border-[#FF4444]/50 text-[#FF4444]' 
              : 'bg-black/5 dark:bg-white/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          {state.sensors.cardReader.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          <span className="text-[10px] font-mono uppercase">Lock Reader</span>
        </button>

        <button
          onClick={() => onUpdate({ keypad: { ...state.sensors.keypad, isDisabled: !state.sensors.keypad.isDisabled } })}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
            state.sensors.keypad.isDisabled 
              ? 'bg-[#FF4444]/10 border-[#FF4444]/50 text-[#FF4444]' 
              : 'bg-black/5 dark:bg-white/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          <Keyboard className="w-5 h-5" />
          <span className="text-[10px] font-mono uppercase">{state.sensors.keypad.isDisabled ? 'Enable Keypad' : 'Disable Keypad'}</span>
        </button>

        <button
          className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl bg-[#00A3FF]/10 border border-[#00A3FF]/30 text-[#00A3FF] hover:bg-[#00A3FF]/20 transition-all"
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Dispatch Security</span>
        </button>

        <button
          className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] hover:bg-[#FF4444]/20 transition-all animate-pulse"
        >
          <Siren className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Emergency Lockdown</span>
        </button>
      </div>
    </div>
  );
};
