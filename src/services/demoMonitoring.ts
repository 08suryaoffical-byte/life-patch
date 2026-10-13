import {
  VitalsDataset,
  DemoScenarioId,
  PulseRhythm,
  FallDetectionState,
  VitalTrend,
} from '../types';

export interface DemoMonitoringState {
  isRunning: boolean;
  intervalMs: number;
  currentScenario: DemoScenarioId;
  vitals: VitalsDataset;
}

/**
 * Baseline initial dataset for Demo Mode (Yokitha)
 */
export function createInitialDemoVitals(scenario: DemoScenarioId = 'normal'): VitalsDataset {
  const now = new Date().toISOString();

  switch (scenario) {
    case 'high_pulse':
      return {
        pulse: {
          value: 138,
          unit: 'BPM',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Normal',
          unit: 'Status',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 97,
          unit: '%',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 37.1,
          unit: '°C',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 1.2,
            activityLevel: 'Active',
            inactivityDurationMinutes: 2,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'no_fall',
            timestamp: now,
            confidence: 0,
            impactForceG: 1.0,
          },
          unit: 'State',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 79,
        source: 'demo',
      };

    case 'irregular_rhythm':
      return {
        pulse: {
          value: 94,
          unit: 'BPM',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Irregular',
          unit: 'Status',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 96,
          unit: '%',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 36.7,
          unit: '°C',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 0.3,
            activityLevel: 'Resting',
            inactivityDurationMinutes: 5,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'no_fall',
            timestamp: now,
            confidence: 0,
            impactForceG: 1.0,
          },
          unit: 'State',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 78,
        source: 'demo',
      };

    case 'low_oxygen':
      return {
        pulse: {
          value: 106,
          unit: 'BPM',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Normal',
          unit: 'Status',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 86,
          unit: '%',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 36.9,
          unit: '°C',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 0.2,
            activityLevel: 'Sedentary',
            inactivityDurationMinutes: 14,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'no_fall',
            timestamp: now,
            confidence: 0,
            impactForceG: 1.0,
          },
          unit: 'State',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 77,
        source: 'demo',
      };

    case 'high_temperature':
      return {
        pulse: {
          value: 114,
          unit: 'BPM',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Normal',
          unit: 'Status',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 96,
          unit: '%',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 39.5,
          unit: '°C',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 0.2,
            activityLevel: 'Resting',
            inactivityDurationMinutes: 18,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'no_fall',
            timestamp: now,
            confidence: 0,
            impactForceG: 1.0,
          },
          unit: 'State',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 76,
        source: 'demo',
      };

    case 'fall_detected':
      return {
        pulse: {
          value: 126,
          unit: 'BPM',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Normal',
          unit: 'Status',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 95,
          unit: '%',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 36.8,
          unit: '°C',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 0.05,
            activityLevel: 'Resting',
            inactivityDurationMinutes: 3,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'fall_detected',
            timestamp: now,
            confidence: 93,
            impactForceG: 3.8,
          },
          unit: 'State',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 76,
        source: 'demo',
      };

    case 'multiple_abnormal':
      return {
        pulse: {
          value: 142,
          unit: 'BPM',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Irregular',
          unit: 'Status',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 84,
          unit: '%',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 39.6,
          unit: '°C',
          status: 'critical',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 0.1,
            activityLevel: 'Resting',
            inactivityDurationMinutes: 22,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'possible_fall',
            timestamp: now,
            confidence: 68,
            impactForceG: 2.3,
          },
          unit: 'State',
          status: 'warning',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 74,
        source: 'demo',
      };

    case 'normal':
    default:
      return {
        pulse: {
          value: 76,
          unit: 'BPM',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Optical BLE',
        },
        rhythm: {
          value: 'Normal',
          unit: 'Status',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Rhythm Screener',
        },
        spo2: {
          value: 98,
          unit: '%',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated LifePatch Pulse Oximeter',
        },
        temperature: {
          value: 36.8,
          unit: '°C',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Thermistor',
        },
        activity: {
          value: {
            movementG: 0.8,
            activityLevel: 'Active',
            inactivityDurationMinutes: 1,
            sensorStatus: 'online',
          },
          unit: 'G',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated 6-Axis IMU',
        },
        fall: {
          value: {
            state: 'no_fall',
            timestamp: now,
            confidence: 0,
            impactForceG: 1.0,
          },
          unit: 'State',
          status: 'normal',
          lastUpdated: now,
          isDemo: true,
          isSensorConnected: false,
          sensorName: 'Simulated Impact Model',
        },
        battery: 78,
        source: 'demo',
      };
  }
}

// Internal phase accumulator for realistic continuous physiological oscillations
let simulationTickCount = 0;

/**
 * Calculates vital trend ('rising', 'falling', 'stable') and delta
 */
export function calculateVitalTrend(
  newValue: number,
  prevValue: number,
  epsilon: number = 0.05
): { trend: VitalTrend; delta: number } {
  const diff = newValue - prevValue;
  if (Math.abs(diff) <= epsilon) {
    return { trend: 'stable', delta: 0 };
  }
  return {
    trend: diff > 0 ? 'rising' : 'falling',
    delta: parseFloat(diff.toFixed(1)),
  };
}

/**
 * Generate physiologically authentic telemetry waves for real monitoring sensors.
 *
 * Simulates:
 * 1. Respiratory Sinus Arrhythmia (RSA): Heart rate gently rises during inhalation
 *    and falls during exhalation (~4s sinusoidal breathing cycle).
 * 2. Traube-Hering-Mayer autonomic vasomotion (~16-24s period): Mean heart rate
 *    drifts up by 6-10 BPM over 12 seconds, then descends down over 12 seconds ("it raises and comes down").
 * 3. Oxygen saturation perfusion dynamics (SpO2 naturally drifts between 97% and 99%).
 * 4. Micro-thermal skin variance (36.6°C to 37.1°C gradual undulating cycle).
 * 5. Accelerometer IMU micro-vibrations & dynamic activity.
 */
export function tickDemoVitals(
  current: VitalsDataset,
  scenario: DemoScenarioId
): VitalsDataset {
  const now = new Date().toISOString();
  simulationTickCount += 1;
  const t = simulationTickCount * 1.8; // Time parameter in simulated seconds

  const base = createInitialDemoVitals(scenario);
  const prevPulse = current.pulse.value;
  const prevSpo2 = current.spo2.value;
  const prevTemp = current.temperature.value;

  let newPulse: number;
  let newSpo2: number;
  let newTemp: number;
  let newMovementG = current.activity.value.movementG;

  switch (scenario) {
    case 'high_pulse': {
      // Tachycardic oscillation: 130 to 148 BPM wave
      const wave = Math.sin(t / 2.5) * 4.5 + Math.sin(t / 8.0) * 5.5;
      const noise = (Math.sin(t * 1.3) + Math.cos(t * 2.7)) * 1.5;
      newPulse = Math.round(138 + wave + noise);
      newSpo2 = Math.min(100, Math.max(90, Math.round(97 + Math.sin(t / 6.0) * 1.2)));
      newTemp = parseFloat((37.2 + Math.sin(t / 14.0) * 0.25).toFixed(1));
      newMovementG = parseFloat((1.1 + Math.abs(Math.sin(t / 3.0) * 0.4)).toFixed(2));
      break;
    }

    case 'irregular_rhythm': {
      // Arrhythmia with ectopic beats & sudden rhythm shifts
      const isEctopicBeat = simulationTickCount % 5 === 0;
      const wave = Math.sin(t / 3.0) * 6.0 + Math.sin(t / 12.0) * 8.0;
      const jump = isEctopicBeat ? (simulationTickCount % 10 === 0 ? 18 : -14) : 0;
      newPulse = Math.round(88 + wave + jump);
      newSpo2 = Math.min(100, Math.max(92, Math.round(96 + Math.sin(t / 5.0) * 1.5)));
      newTemp = parseFloat((36.8 + Math.sin(t / 15.0) * 0.2).toFixed(1));
      newMovementG = parseFloat((0.4 + Math.abs(Math.sin(t / 4.0) * 0.3)).toFixed(2));
      break;
    }

    case 'low_oxygen': {
      // Critical hypoxemia: 80% to 88% wave, compensatory tachycardia
      const waveSpo2 = Math.sin(t / 4.0) * 2.5 + Math.sin(t / 10.0) * 1.5;
      newSpo2 = Math.min(89, Math.max(78, Math.round(84 + waveSpo2)));
      const wavePulse = Math.sin(t / 3.0) * 4.0 + Math.sin(t / 9.0) * 6.0;
      newPulse = Math.round(108 + wavePulse);
      newTemp = parseFloat((36.9 + Math.sin(t / 16.0) * 0.2).toFixed(1));
      newMovementG = parseFloat((0.2 + Math.abs(Math.sin(t / 5.0) * 0.15)).toFixed(2));
      break;
    }

    case 'high_temperature': {
      // Febrile hyperthermia: 39.1°C to 39.8°C wave with tachycardia
      const waveTemp = Math.sin(t / 12.0) * 0.35 + Math.sin(t / 28.0) * 0.2;
      newTemp = parseFloat((39.4 + waveTemp).toFixed(1));
      const wavePulse = Math.sin(t / 2.8) * 4.0 + Math.sin(t / 10.0) * 5.0;
      newPulse = Math.round(116 + wavePulse);
      newSpo2 = Math.min(100, Math.max(93, Math.round(96 + Math.sin(t / 7.0) * 1.0)));
      newMovementG = parseFloat((0.25 + Math.abs(Math.sin(t / 6.0) * 0.15)).toFixed(2));
      break;
    }

    case 'fall_detected': {
      // Fall impact: elevated pulse from shock/stress, low movement
      const wave = Math.sin(t / 2.6) * 3.5 + Math.sin(t / 9.0) * 4.5;
      newPulse = Math.round(102 + wave);
      newSpo2 = Math.min(100, Math.max(93, Math.round(96 + Math.sin(t / 6.0) * 1.0)));
      newTemp = parseFloat((36.7 + Math.sin(t / 18.0) * 0.15).toFixed(1));
      newMovementG = 0.08; // Still on floor
      break;
    }

    case 'multiple_abnormal': {
      // Multi-system crisis: tachycardia + severe hypoxemia + high fever
      const wavePulse = Math.sin(t / 2.2) * 5.0 + Math.sin(t / 7.0) * 6.0;
      newPulse = Math.round(144 + wavePulse);
      const waveSpo2 = Math.sin(t / 3.5) * 2.5 + Math.sin(t / 11.0) * 2.0;
      newSpo2 = Math.min(88, Math.max(76, Math.round(82 + waveSpo2)));
      const waveTemp = Math.sin(t / 10.0) * 0.3 + Math.sin(t / 24.0) * 0.2;
      newTemp = parseFloat((39.5 + waveTemp).toFixed(1));
      newMovementG = parseFloat((0.12 + Math.abs(Math.sin(t / 5.0) * 0.08)).toFixed(2));
      break;
    }

    case 'normal':
    default: {
      // Normal healthy living heart:
      // Sinusoidal RSA (~3.5s cycle) + Mayer wave (~16s cycle) + subtle noise
      // Pulses naturally rise to ~80-83 BPM, peak, then descend down to ~69-72 BPM!
      const rsaWave = Math.sin(t / 2.6) * 3.8; // Inhale / Exhale modulation
      const mayerWave = Math.sin(t / 14.0) * 5.4; // Vasomotion / autonomic wander
      const microNoise = (Math.sin(t * 1.7) + Math.cos(t * 3.1)) * 1.2;
      newPulse = Math.round(75 + rsaWave + mayerWave + microNoise);

      // SpO2 gently undulates between 97% and 99%
      const spo2Wave = Math.sin(t / 7.5) * 1.2 + Math.cos(t / 19.0) * 0.8;
      newSpo2 = Math.min(100, Math.max(96, Math.round(98 + spo2Wave)));

      // Skin temperature gently undulates between 36.6°C and 37.0°C
      const tempWave = Math.sin(t / 22.0) * 0.22 + Math.cos(t / 45.0) * 0.12;
      newTemp = parseFloat((36.8 + tempWave).toFixed(1));

      // Dynamic IMU micro-motion (breathing and subtle posture shift)
      newMovementG = parseFloat((0.35 + Math.abs(Math.sin(t / 3.2) * 0.45) + (Math.sin(t * 2.1) * 0.1)).toFixed(2));
      break;
    }
  }

  // Calculate trends for dynamic medical monitoring
  const pulseTrend = calculateVitalTrend(newPulse, prevPulse, 0);
  const spo2Trend = calculateVitalTrend(newSpo2, prevSpo2, 0);
  const tempTrend = calculateVitalTrend(newTemp, prevTemp, 0.05);

  return {
    ...base,
    pulse: {
      ...base.pulse,
      value: newPulse,
      previousValue: prevPulse,
      trend: pulseTrend.trend,
      delta: pulseTrend.delta,
      lastUpdated: now,
    },
    rhythm: {
      ...base.rhythm,
      lastUpdated: now,
    },
    spo2: {
      ...base.spo2,
      value: newSpo2,
      previousValue: prevSpo2,
      trend: spo2Trend.trend,
      delta: spo2Trend.delta,
      lastUpdated: now,
    },
    temperature: {
      ...base.temperature,
      value: newTemp,
      previousValue: prevTemp,
      trend: tempTrend.trend,
      delta: tempTrend.delta,
      lastUpdated: now,
    },
    activity: {
      ...base.activity,
      value: {
        ...base.activity.value,
        movementG: newMovementG,
      },
      lastUpdated: now,
    },
    fall: {
      ...base.fall,
      lastUpdated: now,
    },
  };
}
