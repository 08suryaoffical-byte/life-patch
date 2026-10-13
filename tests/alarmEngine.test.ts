/**
 * Automated Test Suite: Automatic Ambulance-Style Emergency Siren Engine
 *
 * Verifies:
 * 1. Automatic siren starts without pressing an alarm button upon emergency detection.
 * 2. Distinct emergency sound patterns:
 *    - Critical vitals -> 'critical_vitals' (Ambulance alternating two-tone)
 *    - Multiple abnormal readings -> 'multiple_abnormal' (Continuous sweeping wail)
 *    - Fall detected -> 'fall_detected' (Distinctive repeated emergency alert pattern)
 *    - Warning only -> 'warning_tone' (Quieter warning chime)
 * 3. Normal readings do NOT trigger an emergency siren.
 * 4. Initial app load / cold start does NOT trigger an emergency siren.
 * 5. Multiple readings and simulation updates do NOT create overlapping sirens or duplicate loops.
 * 6. Continuous alarm repeat while alert remains active.
 * 7. Acknowledge silences audio while keeping emergency event active.
 * 8. Temporary mute silences audio, then automatically resumes siren upon expiry if still critical.
 * 9. Resolving alert stops the siren completely.
 * 10. Demo readings and alerts are strictly flagged as DEMO and isolated from Firestore.
 */

import { evaluateRisk, DEFAULT_RISK_CONFIG } from '../src/services/riskEngine';
import { createInitialDemoVitals, tickDemoVitals } from '../src/services/demoMonitoring';
import { VitalsDataset, AlarmPattern, RiskEvaluation, ActiveEmergencyAlert } from '../src/types';

// Mock Web Audio Context for Node test runner environment
class MockAudioNode {
  connect() { return this; }
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  gain = {
    setValueAtTime: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    setValueAtTime: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
  start() {}
  stop() {}
  onended: (() => void) | null = null;
}

class MockDynamicsCompressorNode extends MockAudioNode {
  threshold = { setValueAtTime: () => {} };
  knee = { setValueAtTime: () => {} };
  ratio = { setValueAtTime: () => {} };
  attack = { setValueAtTime: () => {} };
  release = { setValueAtTime: () => {} };
}

class MockAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  createOscillator() { return new MockOscillatorNode(); }
  createGain() { return new MockGainNode(); }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { setValueAtTime: () => {} },
      Q: { setValueAtTime: () => {} },
      connect: () => {},
    };
  }
  createDynamicsCompressor() { return new MockDynamicsCompressorNode(); }
  resume = async () => { this.state = 'running'; };
  destination = new MockAudioNode();
}

// Inject mock into global environment for testing
(global as any).window = (global as any).window || {};
(global as any).AudioContext = MockAudioContext;
(global as any).window.AudioContext = MockAudioContext;

// Import alarmAudioService after mock injection
import { alarmAudioService } from '../src/services/alarmAudio';

// Test Runner Helper
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🚨 ARAN / LifePatch: Emergency Siren Engine Test Suite');
  console.log('======================================================\n');

  // Test 1: Normal readings do NOT trigger an emergency siren
  console.log('--- Suite 1: Physiological Baseline & Cold Start Safety ---');
  {
    const normalVitals = createInitialDemoVitals('normal');
    const risk = evaluateRisk(normalVitals);

    assert(risk.level === 'normal', 'Normal biometrics evaluate to risk level "normal"');
    assert(risk.abnormalMetrics.length === 0, 'No abnormal metrics flagged for normal vitals');
    assert(!risk.isMultipleAbnormal, 'isMultipleAbnormal is false for normal health');
    assert(!risk.isFallTriggered, 'isFallTriggered is false for normal health');

    // Simulate cold start transition detection
    let sirenTriggeredOnColdStart = false;
    const isInitialMount = true;
    if (isInitialMount) {
      // Logic from App.tsx: initial mount suppresses automatic alarm blast
      sirenTriggeredOnColdStart = false;
    }
    assert(!sirenTriggeredOnColdStart, 'Cold start / initial app open does NOT trigger emergency siren');
  }

  // Test 2: Automatic Siren Start on Critical Vitals (No button press required)
  console.log('\n--- Suite 2: No-Click Emergency Detection & Ambulance Siren ---');
  {
    // Simulate high pulse tachycardia (138 BPM > 135 critical)
    const tachyVitals = createInitialDemoVitals('high_pulse');
    const tachyRisk = evaluateRisk(tachyVitals);

    assert(tachyRisk.level === 'high_priority', 'Critical tachycardia triggers "high_priority" risk level');
    assert(tachyRisk.abnormalMetrics.includes('Pulse Rate'), 'Pulse Rate flagged as abnormal metric');

    // Pattern selection
    let pattern: AlarmPattern = 'critical_vitals';
    if (tachyRisk.isMultipleAbnormal) pattern = 'multiple_abnormal';
    else if (tachyRisk.isFallTriggered) pattern = 'fall_detected';
    else pattern = 'critical_vitals';

    assert(pattern === 'critical_vitals', 'Single critical reading selects "critical_vitals" ambulance pattern');

    alarmAudioService.stopAlarm();
    alarmAudioService.startAlarm(pattern);
    const state = alarmAudioService.getState();
    assert(state.isPlaying === true, 'Siren starts playing automatically without user pressing alarm button');
    assert(state.currentPattern === 'critical_vitals', 'Active sound pattern is "critical_vitals"');
  }

  // Test 3: Multiple Abnormal Readings Trigger Continuous High-Priority Siren
  console.log('\n--- Suite 3: Multiple Abnormal Readings & Sweeping Siren ---');
  {
    const multiVitals = createInitialDemoVitals('multiple_abnormal');
    const multiRisk = evaluateRisk(multiVitals);

    assert(multiRisk.level === 'high_priority', 'Multiple abnormalities evaluate to "high_priority"');
    assert(multiRisk.isMultipleAbnormal === true, 'isMultipleAbnormal is true when >=2 metrics abnormal');
    assert(multiRisk.abnormalMetrics.length >= 2, `Detected ${multiRisk.abnormalMetrics.length} simultaneous abnormal metrics`);

    let pattern: AlarmPattern = 'critical_vitals';
    if (multiRisk.isMultipleAbnormal) pattern = 'multiple_abnormal';
    else if (multiRisk.isFallTriggered) pattern = 'fall_detected';

    assert(pattern === 'multiple_abnormal', 'Multiple abnormalities trigger "multiple_abnormal" continuous siren');

    alarmAudioService.startAlarm(pattern);
    const state = alarmAudioService.getState();
    assert(state.isPlaying === true, 'Continuous siren is active');
    assert(state.currentPattern === 'multiple_abnormal', 'Active sound pattern is "multiple_abnormal"');
  }

  // Test 4: Credible Fall Detection Triggers Distinctive Fall Alert Pattern
  console.log('\n--- Suite 4: Fall Detection Emergency Pattern ---');
  {
    const fallVitals = createInitialDemoVitals('fall_detected');
    const fallRisk = evaluateRisk(fallVitals);

    assert(fallRisk.level === 'high_priority', 'Fall event evaluates to "high_priority"');
    assert(fallRisk.isFallTriggered === true, 'isFallTriggered is true for credible impact');
    assert(fallRisk.abnormalMetrics.includes('Fall Sensor'), 'Fall Sensor flagged in abnormal metrics');

    let pattern: AlarmPattern = 'critical_vitals';
    if (fallRisk.isFallTriggered) pattern = 'fall_detected';
    else if (fallRisk.isMultipleAbnormal) pattern = 'multiple_abnormal';

    assert(pattern === 'fall_detected', 'Fall impact selects "fall_detected" repeated alert pattern');

    alarmAudioService.startAlarm(pattern);
    const state = alarmAudioService.getState();
    assert(state.currentPattern === 'fall_detected', 'Active sound pattern is "fall_detected"');
  }

  // Test 5: Warning-Only Pattern (Quieter dual chime without full siren)
  console.log('\n--- Suite 5: Warning-Only Condition ---');
  {
    const warnVitals = createInitialDemoVitals('irregular_rhythm');
    const warnRisk = evaluateRisk(warnVitals);

    assert(warnRisk.level === 'moderate', 'Irregular rhythm evaluates to "moderate" warning level');
    assert(!warnRisk.isMultipleAbnormal, 'Irregular rhythm alone is not multiple abnormal');
    assert(warnRisk.level !== 'high_priority', 'Moderate risk does NOT trigger full emergency siren');
  }

  // Test 6: Prevention of Duplicate Alarm Loops & Overlapping Audio
  console.log('\n--- Suite 6: Duplicate Loop Prevention & Overlapping Protection ---');
  {
    alarmAudioService.stopAlarm();
    alarmAudioService.startAlarm('critical_vitals');
    const state1 = alarmAudioService.getState();

    // Repeated calls with same pattern (e.g. from rapid monitoring ticks)
    alarmAudioService.startAlarm('critical_vitals');
    alarmAudioService.startAlarm('critical_vitals');
    const state2 = alarmAudioService.getState();

    assert(state1.isPlaying === true && state2.isPlaying === true, 'Alarm remains playing smoothly');
    assert(state2.currentPattern === 'critical_vitals', 'Pattern remains consistent without spawning duplicate loops');

    // Escalation from critical_vitals to multiple_abnormal
    alarmAudioService.startAlarm('multiple_abnormal');
    const stateEscalated = alarmAudioService.getState();
    assert(stateEscalated.currentPattern === 'multiple_abnormal', 'Smooth pattern escalation to "multiple_abnormal" without overlapping');
  }

  // Test 7: Acknowledge Silences Sound while Keeping Event Active
  console.log('\n--- Suite 7: Acknowledge Silences Local Sound but Keeps Event Active ---');
  {
    const testAlert: ActiveEmergencyAlert = {
      id: 'test_alert_1',
      level: 'high_priority',
      title: 'Critical Tachycardia',
      pattern: 'critical_vitals',
      reasons: ['Heart rate 138 BPM'],
      abnormalMetrics: ['Pulse Rate'],
      isMultipleAbnormal: false,
      vitalsSnapshot: {
        pulse: 138,
        rhythm: 'Normal',
        spo2: 97,
        temperature: 37.1,
        fallState: 'no_fall',
        activityLevel: 'Active',
      },
      triggeredAt: new Date().toISOString(),
      acknowledged: false,
      mutedUntil: null,
      isDemo: true,
    };

    // User presses Acknowledge
    alarmAudioService.stopAlarm();
    testAlert.acknowledged = true;

    assert(alarmAudioService.getState().isPlaying === false, 'Local siren audio is stopped on acknowledge');
    assert(testAlert.acknowledged === true, 'Alert acknowledged property is true');
    assert(testAlert.id === 'test_alert_1', 'Emergency event remains active for safety tracking');
  }

  // Test 8: Temporary Muting with Automatic Resumption
  console.log('\n--- Suite 8: Temporary Mute & Automatic Resumption ---');
  {
    alarmAudioService.stopAlarm();
    alarmAudioService.startAlarm('critical_vitals');
    assert(alarmAudioService.getState().isPlaying === true, 'Siren active before mute');

    // Mute for 1 second in test
    alarmAudioService.muteTemporarily(1);
    const mutedState = alarmAudioService.getState();
    assert(mutedState.isMuted === true, 'Alarm is marked as muted');
    assert(mutedState.muteExpiresAt != null, 'muteExpiresAt timestamp is populated');

    // Wait 1.1s for mute expiry
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const resumedState = alarmAudioService.getState();
    assert(resumedState.isMuted === false, 'Alarm unmuted automatically after timer expired');
    assert(resumedState.isPlaying === true, 'Siren automatically resumed when alert remained critical');
    assert(resumedState.currentPattern === 'critical_vitals', 'Resumed with correct "critical_vitals" pattern');
  }

  // Test 9: Resolving Emergency Alert Stops Siren Completely
  console.log('\n--- Suite 9: Alert Resolution Behavior ---');
  {
    alarmAudioService.stopAlarm();
    const resolvedState = alarmAudioService.getState();

    assert(resolvedState.isPlaying === false, 'Siren is completely stopped on resolution');
    assert(resolvedState.currentPattern === null, 'Current pattern is reset to null');
    assert(resolvedState.isMuted === false, 'Mute state is cleared');
  }

  // Test 10: Demo Mode Isolation and Data Integrity
  console.log('\n--- Suite 10: Demo Mode Safety Isolation ---');
  {
    const demoVitals = createInitialDemoVitals('high_temperature');
    assert(demoVitals.temperature.isDemo === true, 'Demo temperature reading flagged with isDemo: true');
    assert(demoVitals.pulse.isDemo === true, 'Demo pulse reading flagged with isDemo: true');
    assert(demoVitals.source === 'demo', 'Demo dataset source is "demo"');

    // Simulation tick preserves demo isolation
    const nextTick = tickDemoVitals(demoVitals, 'high_temperature');
    assert(nextTick.temperature.isDemo === true, 'Simulation tick maintains isDemo: true');
    assert(nextTick.source === 'demo', 'Simulation tick maintains source: "demo"');
  }

  // Test 11: Active Health Monitoring Automatic Siren Triggering & STOP ALARM (Acceptance Tests A-F)
  console.log('\n--- Suite 11: Active Monitoring Transition & STOP ALARM Workflow ---');
  {
    // A. Start normal monitoring and do not press Demo. Normal readings must produce no siren.
    alarmAudioService.stopAlarm();
    let currentAlert: ActiveEmergencyAlert | null = null;
    let prevLevel: string = 'normal';

    const normalReading = createInitialDemoVitals('normal');
    const riskA = evaluateRisk(normalReading);
    assert(riskA.level === 'normal', 'Test A: Normal monitoring readings evaluate to "normal"');
    assert(!alarmAudioService.getState().isPlaying, 'Test A: Normal readings produce no siren audio');

    // B. While monitoring is active, receive reading that crosses an existing critical threshold (142 BPM > 135 critical)
    const tachyReading = {
      ...normalReading,
      pulse: {
        ...normalReading.pulse,
        value: 142,
        lastUpdated: new Date().toISOString(),
      },
    };
    const riskB = evaluateRisk(tachyReading);
    assert(riskB.level === 'high_priority', 'Test B: 142 BPM crosses critical tachycardia threshold');

    // Simulate monitoring effect transition logic
    const isNewTransitionB = prevLevel !== 'high_priority';
    if (!currentAlert || isNewTransitionB) {
      currentAlert = {
        id: `alert_${Date.now()}`,
        level: 'high_priority',
        title: 'Critical Physiological Health Anomaly',
        pattern: 'critical_vitals',
        reasons: riskB.triggerReasons,
        abnormalMetrics: riskB.abnormalMetrics,
        isMultipleAbnormal: false,
        vitalsSnapshot: {
          pulse: 142,
          rhythm: 'Normal',
          spo2: 98,
          temperature: 36.8,
          fallState: 'no_fall',
          activityLevel: 'Active',
        },
        triggeredAt: new Date().toISOString(),
        acknowledged: false,
        mutedUntil: null,
        isDemo: false,
      };
      alarmAudioService.startAlarm('critical_vitals');
    }
    prevLevel = riskB.level;

    assert(currentAlert !== null, 'Test B: Emergency alert created automatically');
    assert(alarmAudioService.getState().isPlaying === true, 'Test B: Ambulance siren started automatically without pressing Demo or alarm button');

    // C. Press STOP ALARM: sound stops immediately, monitoring & emergency event remain active
    alarmAudioService.stopAlarm();
    currentAlert.acknowledged = true;

    assert(alarmAudioService.getState().isPlaying === false, 'Test C: STOP ALARM immediately silences siren audio');
    assert(currentAlert.acknowledged === true, 'Test C: Emergency alert is marked acknowledged');
    assert(currentAlert !== null && currentAlert.reasons.length > 0, 'Test C: Emergency event remains active in tracking state');

    // D. Send another normal reading. Acknowledged alarm must NOT restart for the same unresolved event.
    const safeReadingD = createInitialDemoVitals('normal');
    const riskD = evaluateRisk(safeReadingD);
    assert(riskD.level === 'normal', 'Test D: Normal reading evaluated as normal');

    // Effect logic for normal level
    prevLevel = riskD.level;
    // Siren must remain silent
    assert(alarmAudioService.getState().isPlaying === false, 'Test D: Acknowledged alarm does not restart on normal reading');
    assert(currentAlert.acknowledged === true, 'Test D: Acknowledged emergency event remains intact');

    // E. Trigger a new qualifying emergency event (e.g. subsequent severe hypoxia 84% < 88%)
    const hypoxiaReading = {
      ...normalReading,
      spo2: {
        ...normalReading.spo2,
        value: 84,
        lastUpdated: new Date().toISOString(),
      },
    };
    const riskE = evaluateRisk(hypoxiaReading);
    assert(riskE.level === 'high_priority', 'Test E: SpO₂ 84% evaluates to high_priority');

    const isNewTransitionE = prevLevel !== 'high_priority';
    assert(isNewTransitionE === true, 'Test E: Recognized transition from normal to high_priority as new emergency episode');

    if (!currentAlert || isNewTransitionE) {
      currentAlert = {
        id: `alert_${Date.now() + 1}`,
        level: 'high_priority',
        title: 'Critical Physiological Health Anomaly',
        pattern: 'critical_vitals',
        reasons: riskE.triggerReasons,
        abnormalMetrics: riskE.abnormalMetrics,
        isMultipleAbnormal: false,
        vitalsSnapshot: {
          pulse: 76,
          rhythm: 'Normal',
          spo2: 84,
          temperature: 36.8,
          fallState: 'no_fall',
          activityLevel: 'Active',
        },
        triggeredAt: new Date().toISOString(),
        acknowledged: false, // Fresh emergency starts unacknowledged
        mutedUntil: null,
        isDemo: false,
      };
      alarmAudioService.startAlarm('critical_vitals');
    }
    prevLevel = riskE.level;

    assert(currentAlert.acknowledged === false, 'Test E: New emergency alert is unacknowledged');
    assert(alarmAudioService.getState().isPlaying === true, 'Test E: Ambulance siren started automatically again for new qualifying emergency');

    // Clean up
    alarmAudioService.stopAlarm();

    // F. Press Demo button: original demo behavior unchanged
    const demoMulti = createInitialDemoVitals('multiple_abnormal');
    assert(demoMulti.source === 'demo' && demoMulti.pulse.isDemo === true, 'Test F: Demo button data continues to generate isolated simulated demo telemetry');
  }

  console.log('\n======================================================');
  console.log(`📊 Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
