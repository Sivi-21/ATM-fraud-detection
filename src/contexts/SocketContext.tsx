import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectedUsers: string[];
  liveData: {
    atms: any[];
    alerts: any[];
  };
  emitSensorUpdate: (atmId: string, sensors: any) => void;
  emitFraudAlert: (alert: { type: string; severity: string; atmId: string; message: string }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3004';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [liveData, setLiveData] = useState({ atms: [], alerts: [] });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get JWT token
    const token = localStorage.getItem('atm-guard-token');
    if (!token) return;

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Receive initial data
    newSocket.on('initial-data', (data) => {
      console.log('📊 Received initial data:', data);
      setLiveData({ atms: data.atms, alerts: data.alerts });
      setConnectedUsers(data.connectedUsers);
    });

    // Real-time sensor broadcast
    newSocket.on('sensor-broadcast', (data) => {
      setLiveData(prev => ({ ...prev, atms: data.atms }));
    });

    // Individual sensor update
    newSocket.on('sensor-update', (data) => {
      setLiveData(prev => ({
        ...prev,
        atms: prev.atms.map(atm => 
          atm.id === data.atmId 
            ? { ...atm, sensors: data.sensors }
            : atm
        )
      }));
    });

    // Fraud alert
    newSocket.on('fraud-alert', (alert) => {
      setLiveData(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts].slice(0, 50) // Keep last 50 alerts
      }));
    });

    // User joined
    newSocket.on('user-joined', (data) => {
      setConnectedUsers(data.connectedUsers);
    });

    // User left
    newSocket.on('user-left', (data) => {
      setConnectedUsers(data.connectedUsers);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const emitSensorUpdate = useCallback((atmId: string, sensors: any) => {
    if (socket && isConnected) {
      socket.emit('sensor-update', { atmId, sensors });
    }
  }, [socket, isConnected]);

  const emitFraudAlert = useCallback((alert: { type: string; severity: string; atmId: string; message: string }) => {
    if (socket && isConnected) {
      socket.emit('fraud-alert', alert);
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      connectedUsers,
      liveData,
      emitSensorUpdate,
      emitFraudAlert,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
