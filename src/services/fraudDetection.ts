import { GoogleGenAI } from "@google/genai";
import { ATMState, FraudAlert, SensorType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Local rule-based analysis as fallback
function localAnalyzeATMState(state: ATMState): Omit<FraudAlert, 'id' | 'timestamp' | 'atmId'> {
  const sensors = state.sensors;
  let type: FraudAlert['type'] = 'none';
  let confidence = 0;
  let description = "No anomalies detected.";
  let severity: FraudAlert['severity'] = 'low';
  const sensorEvidence: SensorType[] = [];

  // Check for skimming
  if (sensors.camera.suspiciousObject && sensors.keypad.shielded) {
    type = 'skimming';
    confidence = 0.92;
    severity = 'high';
    description = "Suspicious object detected on card reader with keypad shielding. Possible skimming device installed.";
    sensorEvidence.push('camera', 'keypad');
  }
  // Check for trapping
  else if (sensors.cardReader.isJammed && sensors.cardReader.swipeCount > 5) {
    type = 'trapping';
    confidence = 0.88;
    severity = 'high';
    description = `Card reader jammed after ${sensors.cardReader.swipeCount} swipe attempts. Possible card trapping attack.`;
    sensorEvidence.push('card_reader');
  }
  // Check for forced transaction
  else if (sensors.vibration.level > 70 && sensors.keypad.rapidInput) {
    type = 'forced_transaction';
    confidence = 0.85;
    severity = 'high';
    description = "High vibration detected with rapid keypad input. Possible forced transaction attempt.";
    sensorEvidence.push('vibration', 'keypad');
  }
  // Check for tampering
  else if (sensors.vibration.level > 80) {
    type = 'tampering';
    confidence = 0.78;
    severity = 'medium';
    description = `High vibration level (${sensors.vibration.level}%) detected. Possible physical tampering.`;
    sensorEvidence.push('vibration');
  }
  // Check for suspicious activity
  else if (sensors.camera.suspiciousObject) {
    type = 'skimming';
    confidence = 0.65;
    severity = 'medium';
    description = "Suspicious object detected near card reader. Monitor for potential skimming.";
    sensorEvidence.push('camera');
  }
  // Check for keypad shielding only
  else if (sensors.keypad.shielded) {
    type = 'skimming';
    confidence = 0.55;
    severity = 'low';
    description = "Keypad appears to be shielded. Possible camera installed for PIN capture.";
    sensorEvidence.push('keypad');
  }

  return { type, confidence, description, severity, sensorEvidence };
}

export async function analyzeATMState(state: ATMState): Promise<FraudAlert> {
  // First, try local analysis
  const localResult = localAnalyzeATMState(state);
  
  // If we have a high-confidence local detection, use it immediately
  if (localResult.confidence > 0.7) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      atmId: state.id,
      ...localResult
    };
  }

  // Try Gemini AI for more nuanced analysis
  const prompt = `
    Analyze the following ATM sensor data for potential fraud or anomalies.
    Sensors:
    - Camera: Activity=${state.sensors.camera.activityDetected}, Person=${state.sensors.camera.personPresent}, FaceVisible=${state.sensors.camera.faceVisible}, SuspiciousObject=${state.sensors.camera.suspiciousObject}
    - Card Reader: CardInserted=${state.sensors.cardReader.cardInserted}, SwipeCount=${state.sensors.cardReader.swipeCount}, Jammed=${state.sensors.cardReader.isJammed}
    - Keypad: KeysPressed=${state.sensors.keypad.keysPressed}, Shielded=${state.sensors.keypad.shielded}, RapidInput=${state.sensors.keypad.rapidInput}
    - Vibration: Level=${state.sensors.vibration.level}/100

    Potential Fraud Types:
    - Skimming: Often involves suspicious objects on card reader or camera shielding.
    - Trapping: Card reader jammed or multiple failed swipes.
    - Forced Transaction: High vibration (tampering) or rapid keypad input with no face visible.
    - Tampering: High vibration or suspicious objects.

    Return a JSON object with the following structure:
    {
      "type": "skimming" | "trapping" | "forced_transaction" | "tampering" | "none",
      "confidence": number (0-1),
      "description": "string explaining the reasoning",
      "severity": "low" | "medium" | "high",
      "sensorEvidence": ["camera", "card_reader", etc.]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      atmId: state.id,
      ...result
    };
  } catch (error) {
    console.error("Fraud analysis failed:", error);
    // Return local analysis result instead of error message
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      atmId: state.id,
      ...localResult
    };
  }
}
