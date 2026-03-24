import React from 'react';
import { X, Cpu, Activity, Shield, Zap, Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface ModelsProps {
  onClose: () => void;
}

interface ModelInfo {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'training' | 'updating';
  accuracy: number;
  lastUpdated: string;
  description: string;
  detections: number;
}

const MODELS: ModelInfo[] = [
  {
    id: 'fraud-detection-v2',
    name: 'Fraud Detection Core',
    version: '2.4.1',
    status: 'active',
    accuracy: 97.8,
    lastUpdated: '2026-03-20',
    description: 'Primary AI model for detecting skimming, trapping, and forced transactions',
    detections: 15420
  },
  {
    id: 'anomaly-detection-v1',
    name: 'Anomaly Detection',
    version: '1.8.3',
    status: 'active',
    accuracy: 94.5,
    lastUpdated: '2026-03-15',
    description: 'Detects unusual sensor patterns and behavioral anomalies',
    detections: 8932
  },
  {
    id: 'image-recognition-v3',
    name: 'Visual Recognition',
    version: '3.1.0',
    status: 'training',
    accuracy: 96.2,
    lastUpdated: '2026-03-22',
    description: 'Analyzes camera feeds for suspicious objects and activities',
    detections: 12450
  },
  {
    id: 'vibration-analysis-v2',
    name: 'Vibration Analysis',
    version: '2.0.2',
    status: 'active',
    accuracy: 91.3,
    lastUpdated: '2026-03-10',
    description: 'Detects physical tampering through vibration sensor patterns',
    detections: 3421
  }
];

export const Models: React.FC<ModelsProps> = ({ onClose }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-[#00FF9D]" />;
      case 'training':
        return <Brain className="w-5 h-5 text-[#F27D26]" />;
      case 'updating':
        return <Zap className="w-5 h-5 text-[#00A3FF]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#FF4444]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D]';
      case 'training':
        return 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]';
      case 'updating':
        return 'bg-[#00A3FF]/10 border-[#00A3FF]/30 text-[#00A3FF]';
      default:
        return 'bg-[#FF4444]/10 border-[#FF4444]/30 text-[#FF4444]';
    }
  };

  const averageAccuracy = MODELS.reduce((sum, m) => sum + m.accuracy, 0) / MODELS.length;
  const totalDetections = MODELS.reduce((sum, m) => sum + m.detections, 0);
  const activeModels = MODELS.filter(m => m.status === 'active').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A3FF]/10 rounded-lg">
              <Cpu className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">AI Models</h2>
              <p className="text-xs text-[var(--text-secondary)]">Neural Network Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-[var(--border-color)]">
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#00A3FF]">{averageAccuracy.toFixed(1)}%</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Avg Accuracy</div>
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#00FF9D]">{totalDetections.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Total Detections</div>
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--text-primary)]">{activeModels}/{MODELS.length}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase">Active Models</div>
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {MODELS.map((model) => (
            <div
              key={model.id}
              className={`p-4 rounded-xl border ${getStatusColor(model.status)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(model.status)}
                    <div>
                      <h3 className="font-bold text-sm">{model.name}</h3>
                      <p className="text-xs opacity-70">v{model.version} • Updated {model.lastUpdated}</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-3">{model.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-black/20 rounded text-xs font-mono">
                      {model.accuracy}% accuracy
                    </span>
                    <span className="px-2 py-1 bg-black/20 rounded text-xs font-mono">
                      {model.detections.toLocaleString()} detections
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${
                      model.status === 'active' ? 'bg-[#00FF9D]/20' : 
                      model.status === 'training' ? 'bg-[#F27D26]/20' : 'bg-[#00A3FF]/20'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {model.status === 'active' && (
                    <button className="px-3 py-1.5 rounded-lg bg-[#FF4444]/10 text-[#FF4444] text-xs font-mono uppercase hover:bg-[#FF4444]/20 transition-colors">
                      Disable
                    </button>
                  )}
                  {model.status === 'training' && (
                    <button className="px-3 py-1.5 rounded-lg bg-[#00A3FF]/10 text-[#00A3FF] text-xs font-mono uppercase hover:bg-[#00A3FF]/20 transition-colors">
                      View Progress
                    </button>
                  )}
                  <button className="px-3 py-1.5 rounded-lg bg-black/10 text-[var(--text-primary)] text-xs font-mono uppercase hover:bg-black/20 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Activity className="w-4 h-4" />
            <span>All models are running on Gemini AI infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
