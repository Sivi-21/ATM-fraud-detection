export type SensorType = 'camera' | 'card_reader' | 'keypad' | 'vibration';

export interface SensorData {
  id: string;
  type: SensorType;
  value: any;
  timestamp: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface FraudAlert {
  id: string;
  timestamp: number;
  type: 'skimming' | 'trapping' | 'forced_transaction' | 'tampering' | 'none';
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  sensorEvidence: SensorType[];
  atmId: string;
}

export interface ATMState {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'alert';
  sensors: {
    camera: {
      activityDetected: boolean;
      personPresent: boolean;
      faceVisible: boolean;
      suspiciousObject: boolean;
    };
    cardReader: {
      cardInserted: boolean;
      swipeCount: number;
      isJammed: boolean;
      isLocked: boolean;
    };
    keypad: {
      keysPressed: number;
      shielded: boolean;
      rapidInput: boolean;
      isDisabled: boolean;
    };
    vibration: {
      level: number; // 0-100
    };
  };
  lastMaintenance: string;
}
