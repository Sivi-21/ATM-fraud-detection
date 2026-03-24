import React from 'react';
import { Camera, CreditCard, Keyboard, Activity, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ATMState } from '../types';

interface SensorPanelProps {
  state: ATMState;
  onUpdate: (updates: Partial<ATMState['sensors']>) => void;
}

export const SensorPanel: React.FC<SensorPanelProps> = ({ state, onUpdate }) => {
  const toggleCamera = (key: keyof ATMState['sensors']['camera']) => {
    onUpdate({
      camera: { ...state.sensors.camera, [key]: !state.sensors.camera[key] }
    });
  };

  const toggleCardReader = (key: keyof ATMState['sensors']['cardReader']) => {
    onUpdate({
      cardReader: { ...state.sensors.cardReader, [key]: !state.sensors.cardReader[key] }
    });
  };

  const toggleKeypad = (key: keyof ATMState['sensors']['keypad']) => {
    onUpdate({
      keypad: { ...state.sensors.keypad, [key]: !state.sensors.keypad[key] }
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-2 sm:p-4">
      {/* Camera Sensor */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#00A3FF]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#8E9299]">Visual Feed</h3>
          </div>
          <div className={`w-2 h-2 rounded-full ${state.sensors.camera.activityDetected ? 'bg-[#00FF9D] shadow-[0_0_8px_#00FF9D]' : 'bg-white/20'}`} />
        </div>
        
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/5">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Camera className="w-12 h-12" />
          </div>
          {state.sensors.camera.activityDetected && <div className="scan-line absolute w-full" />}
          <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/50">
            CAM_01_SECURE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => toggleCamera('activityDetected')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.camera.activityDetected ? 'bg-[#00FF9D]/10 border-[#00FF9D]/50 text-[#00FF9D]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            ACTIVITY
          </button>
          <button 
            onClick={() => toggleCamera('personPresent')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.camera.personPresent ? 'bg-[#00FF9D]/10 border-[#00FF9D]/50 text-[#00FF9D]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            PERSON
          </button>
          <button 
            onClick={() => toggleCamera('faceVisible')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.camera.faceVisible ? 'bg-[#00FF9D]/10 border-[#00FF9D]/50 text-[#00FF9D]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            FACE
          </button>
          <button 
            onClick={() => toggleCamera('suspiciousObject')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.camera.suspiciousObject ? 'bg-[#FF4444]/10 border-[#FF4444]/50 text-[#FF4444]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            OBJ_DET
          </button>
        </div>
      </div>

      {/* Card Reader Sensor */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00A3FF]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#8E9299]">Card Reader</h3>
          </div>
          <div className={`w-2 h-2 rounded-full ${state.sensors.cardReader.cardInserted ? 'bg-[#00FF9D]' : 'bg-white/20'}`} />
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-white/50">Swipe Count</span>
            <span className="text-lg font-mono">{state.sensors.cardReader.swipeCount}</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${state.sensors.cardReader.isLocked ? 'bg-[#FF4444]' : 'bg-[#00A3FF]'}`} 
              style={{ width: `${Math.min(state.sensors.cardReader.swipeCount * 20, 100)}%` }}
            />
          </div>
          {state.sensors.cardReader.isLocked && (
            <div className="text-[10px] font-mono text-[#FF4444] text-center uppercase animate-pulse">
              Reader Locked
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => toggleCardReader('cardInserted')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.cardReader.cardInserted ? 'bg-[#00FF9D]/10 border-[#00FF9D]/50 text-[#00FF9D]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            INSERTED
          </button>
          <button 
            onClick={() => toggleCardReader('isJammed')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.cardReader.isJammed ? 'bg-[#FF4444]/10 border-[#FF4444]/50 text-[#FF4444]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            JAMMED
          </button>
          <button 
            onClick={() => onUpdate({ cardReader: { ...state.sensors.cardReader, swipeCount: state.sensors.cardReader.swipeCount + 1 } })}
            className="text-[10px] py-1 px-2 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            SIM_SWIPE
          </button>
          <button 
            onClick={() => onUpdate({ cardReader: { ...state.sensors.cardReader, swipeCount: 0 } })}
            className="text-[10px] py-1 px-2 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Keypad Sensor */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#00A3FF]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#8E9299]">Input Matrix</h3>
          </div>
          <div className={`w-2 h-2 rounded-full ${state.sensors.keypad.keysPressed > 0 ? 'bg-[#00FF9D]' : 'bg-white/20'}`} />
        </div>

        <div className={`grid grid-cols-3 gap-1 transition-opacity ${state.sensors.keypad.isDisabled ? 'opacity-10 grayscale' : 'opacity-40'}`}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <div key={n} className="aspect-square bg-black/5 dark:bg-white/5 rounded flex items-center justify-center text-[10px] font-mono text-[var(--text-primary)]">
              {n}
            </div>
          ))}
        </div>
        {state.sensors.keypad.isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 px-3 py-1 rounded border border-[#FF4444]/50 text-[10px] font-mono text-[#FF4444] uppercase">
              Disabled
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => toggleKeypad('shielded')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.keypad.shielded ? 'bg-[#00FF9D]/10 border-[#00FF9D]/50 text-[#00FF9D]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            SHIELDED
          </button>
          <button 
            onClick={() => toggleKeypad('rapidInput')}
            className={`text-[10px] py-1 px-2 rounded border transition-colors ${state.sensors.keypad.rapidInput ? 'bg-[#FF4444]/10 border-[#FF4444]/50 text-[#FF4444]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
          >
            RAPID_IN
          </button>
          <button 
            onClick={() => onUpdate({ keypad: { ...state.sensors.keypad, keysPressed: state.sensors.keypad.keysPressed + 1 } })}
            className="text-[10px] py-1 px-2 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            KEY_PRESS
          </button>
          <button 
            onClick={() => onUpdate({ keypad: { ...state.sensors.keypad, keysPressed: 0 } })}
            className="text-[10px] py-1 px-2 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Vibration Sensor */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00A3FF]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#8E9299]">Tamper Sensor</h3>
          </div>
          <div className={`w-2 h-2 rounded-full ${state.sensors.vibration.level > 50 ? 'bg-[#FF4444] animate-pulse' : 'bg-white/20'}`} />
        </div>

        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-white/50">Vibration Level</span>
            <span className={`text-lg font-mono ${state.sensors.vibration.level > 50 ? 'text-[#FF4444]' : 'text-white'}`}>
              {state.sensors.vibration.level}%
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={state.sensors.vibration.level}
            onChange={(e) => onUpdate({ vibration: { level: parseInt(e.target.value) } })}
            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#00A3FF]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onUpdate({ vibration: { level: 85 } })}
            className="text-[10px] py-1 px-2 rounded border border-[#FF4444]/30 text-[#FF4444] hover:bg-[#FF4444]/10"
          >
            SIM_SHOCK
          </button>
          <button 
            onClick={() => onUpdate({ vibration: { level: 0 } })}
            className="text-[10px] py-1 px-2 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          >
            STABILIZE
          </button>
        </div>
      </div>
    </div>
  );
};
