import {
  VitalsDataset,
  RiskEvaluation,
  RiskEngineConfig,
  PulseRhythm,
  FallDetectionState,
} from '../types';

/**
 * Standard Clinically-Reviewed Default Thresholds
 * (Derived from standard adult physiological triage parameters)
 */
export const DEFAULT_RISK_CONFIG: RiskEngineConfig = {
  pulseHigh: 110, // Moderate Tachycardia warning (>110 BPM)
  pulseLow: 50, // Moderate Bradycardia warning (<50 BPM)
  pulseCriticalHigh: 135, // Severe Tachycardia critical alert (>135 BPM)
  pulseCriticalLow: 40, // Severe Bradycardia critical alert (<40 BPM)
  spo2Warning: 92, // Mild-to-moderate Hypoxia warning (<92%)
  spo2Critical: 88, // Severe Hypoxia critical emergency (<88%)
  tempHigh: 38.3, // Pyrexia / Fever warning (>38.3°C)
  tempCriticalHigh: 39.4, // Hyperpyrexia critical emergency (>39.4°C)
  tempLow: 35.0, // Hypothermia warning (<35.0°C)
  inactivityMaxMinutes: 45, // Prolonged stationary inactivity warning
  fallConfidenceThreshold: 75, // Credible fall confidence threshold (%)
  staleTimeoutSeconds: 90, // Readings older than 90s marked stale
};

/**
 * Checks whether a timestamp is stale
 */
export function isReadingStale(timestamp: string, thresholdSeconds: number = 90): boolean {
  if (!timestamp) return true;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return isNaN(ageMs) || ageMs > thresholdSeconds * 1000;
}

/**
 * Combined Multi-Parameter Health Risk Engine
 * Evaluates pulse, rhythm, SpO₂, temperature, activity, and fall telemetry.
 * Distinguishes single abnormal readings from multiple simultaneous hazards.
 */
export function evaluateRisk(
  vitals: VitalsDataset,
  config: RiskEngineConfig = DEFAULT_RISK_CONFIG
): RiskEvaluation {
  const triggerReasons: string[] = [];
  const abnormalMetrics: string[] = [];
  let score = 0;
  let isMultipleAbnormal = false;
  let isFallTriggered = false;

  // 1. Evaluate Fall Detection
  const fallReading = vitals.fall.value;
  const fallStale = isReadingStale(vitals.fall.lastUpdated, config.staleTimeoutSeconds);

  if (fallStale) {
    vitals.fall.status = 'stale';
    triggerReasons.push('Fall detection accelerometer data is stale (>90s).');
  } else if (fallReading.state === 'fall_detected') {
    if (fallReading.confidence >= config.fallConfidenceThreshold) {
      isFallTriggered = true;
      abnormalMetrics.push('Fall Sensor');
      vitals.fall.status = 'critical';
      score += 45;
      triggerReasons.push(
        `High-impact fall detected with ${Math.round(fallReading.confidence)}% confidence${
          fallReading.impactForceG ? ` (${fallReading.impactForceG.toFixed(1)}G impact)` : ''
        }.`
      );
    } else {
      abnormalMetrics.push('Fall Sensor');
      vitals.fall.status = 'warning';
      score += 20;
      triggerReasons.push(`Possible fall incident detected (${Math.round(fallReading.confidence)}% confidence).`);
    }
  } else if (fallReading.state === 'possible_fall') {
    abnormalMetrics.push('Fall Sensor');
    vitals.fall.status = 'warning';
    score += 15;
    triggerReasons.push('Possible sudden impact or orientation change registered.');
  } else {
    vitals.fall.status = 'normal';
  }

  // 2. Evaluate Pulse Rate (BPM)
  const pulseVal = vitals.pulse.value;
  const pulseStale = isReadingStale(vitals.pulse.lastUpdated, config.staleTimeoutSeconds);

  if (pulseStale) {
    vitals.pulse.status = 'stale';
    triggerReasons.push('Pulse rate telemetry is stale.');
  } else if (isNaN(pulseVal) || pulseVal <= 0) {
    vitals.pulse.status = 'invalid';
    triggerReasons.push('Invalid pulse rate sensor reading.');
  } else if (pulseVal >= config.pulseCriticalHigh) {
    abnormalMetrics.push('Pulse Rate');
    vitals.pulse.status = 'critical';
    score += 35;
    triggerReasons.push(`Critical Tachycardia: Heart rate ${pulseVal} BPM exceeds critical threshold (${config.pulseCriticalHigh} BPM).`);
  } else if (pulseVal <= config.pulseCriticalLow) {
    abnormalMetrics.push('Pulse Rate');
    vitals.pulse.status = 'critical';
    score += 35;
    triggerReasons.push(`Critical Bradycardia: Heart rate ${pulseVal} BPM is dangerously low (<${config.pulseCriticalLow} BPM).`);
  } else if (pulseVal > config.pulseHigh) {
    abnormalMetrics.push('Pulse Rate');
    vitals.pulse.status = 'warning';
    score += 15;
    triggerReasons.push(`Elevated Heart Rate: ${pulseVal} BPM above normal threshold (${config.pulseHigh} BPM).`);
  } else if (pulseVal < config.pulseLow) {
    abnormalMetrics.push('Pulse Rate');
    vitals.pulse.status = 'warning';
    score += 15;
    triggerReasons.push(`Low Heart Rate: ${pulseVal} BPM below resting threshold (${config.pulseLow} BPM).`);
  } else {
    vitals.pulse.status = 'normal';
  }

  // 3. Evaluate Pulse Rhythm Regularity (Screening metric, not ECG diagnosis)
  const rhythmVal: PulseRhythm = vitals.rhythm.value;
  const rhythmStale = isReadingStale(vitals.rhythm.lastUpdated, config.staleTimeoutSeconds);

  if (rhythmStale || rhythmVal === 'Not Available') {
    vitals.rhythm.status = rhythmVal === 'Not Available' ? 'warning' : 'stale';
    if (rhythmVal === 'Not Available') {
      triggerReasons.push('Pulse rhythm analysis currently unavailable (sensor motion artifact).');
    }
  } else if (rhythmVal === 'Irregular') {
    abnormalMetrics.push('Heart Rhythm');
    vitals.rhythm.status = 'warning';
    score += 20;
    triggerReasons.push(
      'Irregular pulse intervals detected (screening flag — please sit calmly and breathe normally).'
    );
  } else {
    vitals.rhythm.status = 'normal';
  }

  // 4. Evaluate Blood Oxygen (SpO2 %)
  const spo2Val = vitals.spo2.value;
  const spo2Stale = isReadingStale(vitals.spo2.lastUpdated, config.staleTimeoutSeconds);

  if (spo2Stale) {
    vitals.spo2.status = 'stale';
    triggerReasons.push('SpO₂ saturation telemetry is stale.');
  } else if (isNaN(spo2Val) || spo2Val <= 0 || spo2Val > 100) {
    vitals.spo2.status = 'invalid';
    triggerReasons.push('Invalid SpO₂ saturation sensor reading.');
  } else if (spo2Val <= config.spo2Critical) {
    abnormalMetrics.push('Blood Oxygen');
    vitals.spo2.status = 'critical';
    score += 40;
    triggerReasons.push(`Critical Hypoxia: Blood oxygen ${spo2Val}% is severely depressed (<${config.spo2Critical}%).`);
  } else if (spo2Val < config.spo2Warning) {
    abnormalMetrics.push('Blood Oxygen');
    vitals.spo2.status = 'warning';
    score += 20;
    triggerReasons.push(`Sub-optimal Oxygen Saturation: SpO₂ is ${spo2Val}% (warning <${config.spo2Warning}%).`);
  } else {
    vitals.spo2.status = 'normal';
  }

  // 5. Evaluate Body / Skin Temperature (°C)
  const tempVal = vitals.temperature.value;
  const tempStale = isReadingStale(vitals.temperature.lastUpdated, config.staleTimeoutSeconds);

  if (tempStale) {
    vitals.temperature.status = 'stale';
    triggerReasons.push('Skin temperature telemetry is stale.');
  } else if (isNaN(tempVal) || tempVal <= 10) {
    vitals.temperature.status = 'invalid';
    triggerReasons.push('Invalid temperature sensor reading.');
  } else if (tempVal >= config.tempCriticalHigh) {
    abnormalMetrics.push('Body Temperature');
    vitals.temperature.status = 'critical';
    score += 35;
    triggerReasons.push(`Severe Hyperpyrexia: Temperature ${tempVal.toFixed(1)}°C exceeds critical threshold (${config.tempCriticalHigh}°C).`);
  } else if (tempVal > config.tempHigh) {
    abnormalMetrics.push('Body Temperature');
    vitals.temperature.status = 'warning';
    score += 15;
    triggerReasons.push(`Elevated Temperature: ${tempVal.toFixed(1)}°C indicates pyrexia (>${config.tempHigh}°C).`);
  } else if (tempVal < config.tempLow) {
    abnormalMetrics.push('Body Temperature');
    vitals.temperature.status = 'warning';
    score += 20;
    triggerReasons.push(`Low Temperature: ${tempVal.toFixed(1)}°C indicates possible hypothermia (<${config.tempLow}°C).`);
  } else {
    vitals.temperature.status = 'normal';
  }

  // 6. Evaluate Activity & Inactivity Duration
  const activityReading = vitals.activity.value;
  if (activityReading.sensorStatus === 'offline') {
    vitals.activity.status = 'invalid';
    triggerReasons.push('Motion activity accelerometer is currently offline.');
  } else if (activityReading.inactivityDurationMinutes >= config.inactivityMaxMinutes) {
    abnormalMetrics.push('Activity Monitor');
    vitals.activity.status = 'warning';
    score += 15;
    triggerReasons.push(`Prolonged motionless inactivity: ${activityReading.inactivityDurationMinutes} minutes without movement.`);
  } else {
    vitals.activity.status = 'normal';
  }

  // 7. Combined Risk Calculation
  // Count how many physiological parameters are abnormal
  const abnormalCount = abnormalMetrics.length;
  if (abnormalCount >= 2) {
    isMultipleAbnormal = true;
    score += 20; // Multiplicative compound risk factor
  }

  // Determine Overall Risk Level
  let level: 'normal' | 'low' | 'moderate' | 'high_priority' = 'normal';
  let recommendation = 'All monitored biometrics and motion parameters are within safe ranges.';

  if (
    isFallTriggered ||
    vitals.pulse.status === 'critical' ||
    vitals.spo2.status === 'critical' ||
    vitals.temperature.status === 'critical' ||
    abnormalCount >= 2 ||
    score >= 45
  ) {
    level = 'high_priority';
    if (isMultipleAbnormal) {
      recommendation = `CRITICAL ALERT: ${abnormalCount} simultaneous abnormal readings detected (${abnormalMetrics.join(
        ', '
      )}). Immediate guardian notification and emergency verification recommended.`;
    } else if (isFallTriggered) {
      recommendation =
        'CRITICAL ALERT: Credible fall incident detected. Verify user consciousness and dispatch emergency assistance.';
    } else {
      recommendation = `HIGH PRIORITY: Critical parameter alert for ${abnormalMetrics.join(
        ', '
      )}. Emergency alarm triggered.`;
    }
  } else if (abnormalCount === 1 || score >= 20) {
    level = 'moderate';
    recommendation = `MODERATE RISK: Single abnormal metric detected (${abnormalMetrics[0]}). Maintain observation and recheck sensor placement.`;
  } else if (score > 0) {
    level = 'low';
    recommendation = 'LOW RISK: Mild sensor variance or telemetry latency noted.';
  }

  return {
    level,
    score: Math.min(100, score),
    triggerReasons,
    abnormalMetrics,
    isMultipleAbnormal,
    isFallTriggered,
    evaluatedAt: new Date().toISOString(),
    recommendation,
  };
}
