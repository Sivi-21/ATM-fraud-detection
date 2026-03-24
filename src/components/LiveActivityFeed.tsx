import React from 'react';
import { Activity, Users, Wifi, WifiOff, AlertTriangle, Shield, User } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

export const LiveActivityFeed: React.FC = () => {
  const { isConnected, connectedUsers, liveData } = useSocket();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'skimming':
        return <AlertTriangle className="w-4 h-4 text-[#FF4444]" />;
      case 'shoulder_surfing':
        return <User className="w-4 h-4 text-[#FF9500]" />;
      case 'suspicious_behavior':
        return <Shield className="w-4 h-4 text-[#00A3FF]" />;
      default:
        return <Activity className="w-4 h-4 text-[var(--text-secondary)]" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-[#FF4444] bg-[#FF4444]/10';
      case 'medium':
        return 'text-[#FF9500] bg-[#FF9500]/10';
      case 'low':
        return 'text-[#00FF9D] bg-[#00FF9D]/10';
      default:
        return 'text-[var(--text-secondary)] bg-black/5 dark:bg-white/5';
    }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-[#00FF9D]/10' : 'bg-[#FF4444]/10'}`}>
            {isConnected ? (
              <Wifi className="w-4 h-4 text-[#00FF9D]" />
            ) : (
              <WifiOff className="w-4 h-4 text-[#FF4444]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Live Activity</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isConnected ? 'Real-time updates active' : 'Disconnected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5">
          <Users className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span className="text-xs font-mono text-[var(--text-primary)]">{connectedUsers.length}</span>
        </div>
      </div>

      {/* Connected Users */}
      {connectedUsers.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-black/5 dark:bg-white/5">
          <p className="text-xs text-[var(--text-secondary)] mb-2">Active Users:</p>
          <div className="flex flex-wrap gap-2">
            {connectedUsers.map((username, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 rounded-md bg-[#00A3FF]/10 text-[#00A3FF] text-xs font-mono"
              >
                {username}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Alerts */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <p className="text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Recent Alerts</p>
        
        {liveData.alerts.length === 0 ? (
          <div className="text-center py-4 text-[var(--text-secondary)] text-sm">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent alerts</p>
          </div>
        ) : (
          liveData.alerts.slice(0, 10).map((alert, idx) => (
            <div 
              key={alert.id || idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <div className="mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] truncate">
                    {alert.atmId}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {alert.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live ATM Status */}
      <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
        <p className="text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">ATM Status</p>
        <div className="grid grid-cols-3 gap-2">
          {liveData.atms.slice(0, 3).map((atm) => (
            <div 
              key={atm.id}
              className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-center"
            >
              <p className="text-xs font-mono text-[var(--text-primary)] truncate">{atm.id}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${atm.status === 'online' ? 'bg-[#00FF9D]' : 'bg-[#FF4444]'}`} />
                <span className="text-[10px] text-[var(--text-secondary)] uppercase">{atm.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
