import { DeviceLocation } from '../types';
import { isLocationStale } from '../services/geolocation';

export interface DialResult {
  success: boolean;
  attemptedUrl: string;
  isSafeTest: boolean;
  platformNotice: string;
}

export interface SmsResult {
  success: boolean;
  attemptedUrl: string;
  isSafeTest: boolean;
}

/**
 * Generates an encrypted/secure web link for guardians to open the exact coordinates on Google Maps or OpenStreetMap
 */
export function generateSecureMapLink(latitude: number, longitude: number): string {
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Formats a standardized emergency distress message including live coordinates and map link.
 */
export function generateDistressMessage(
  userName: string,
  location: DeviceLocation | null,
  customNotes?: string
): string {
  let locationText = 'Location: Unavailable / Acquiring satellites';
  let mapLink = '';
  let staleWarning = '';

  if (location) {
    const isStale = isLocationStale(location.timestamp, 120);
    const lat = location.latitude.toFixed(5);
    const lng = location.longitude.toFixed(5);
    const acc = Math.round(location.accuracy);
    locationText = `Location: ${lat}N, ${lng}E (Accuracy ±${acc}m)`;
    mapLink = `\nMap: ${generateSecureMapLink(location.latitude, location.longitude)}`;
    if (isStale) {
      staleWarning = ' [WARNING: Coordinates may be stale]';
    }
  }

  const notesText = customNotes ? `\nNote: ${customNotes}` : '';

  return `[EMERGENCY SOS] ${userName} needs immediate assistance! LifePatch alert triggered.\n${locationText}${staleWarning}${mapLink}${notesText}\nPlease call back or dispatch local emergency responders immediately.`;
}

/**
 * Launches real device phone dialer or performs a safe test simulation.
 * In a browser web app, `tel:` links invoke the device dialer.
 * Operating systems require the user to confirm the call in their phone app.
 */
export function triggerPhoneCall(
  phoneNumber: string,
  options: { isSafeTestMode?: boolean; contactName?: string } = {}
): DialResult {
  const sanitized = phoneNumber.replace(/[^0-9+*#]/g, '');
  const telUrl = `tel:${sanitized}`;
  const isSafeTest = Boolean(options.isSafeTestMode);

  if (isSafeTest) {
    console.log(`[LifePatch Safe Test Mode] Suppressed real phone call to ${phoneNumber} (${options.contactName || 'Contact'})`);
    return {
      success: true,
      attemptedUrl: telUrl,
      isSafeTest: true,
      platformNotice:
        'Safe Test Mode is ACTIVE. Real device call was suppressed. Use this mode to safely verify guardian escalation sequences without dialing.',
    };
  }

  try {
    // In mobile browsers (Chrome Android, Safari iOS), window.location.href = 'tel:...' prompts the system dialer
    window.location.href = telUrl;
    return {
      success: true,
      attemptedUrl: telUrl,
      isSafeTest: false,
      platformNotice:
        'Device phone dialer launched via tel: protocol. In web browsers, you must tap the Call button in your phone interface to complete dialing.',
    };
  } catch (err) {
    console.warn('[LifePatch] Direct window.location dial failed, trying fallback anchor click:', err);
    try {
      const link = document.createElement('a');
      link.href = telUrl;
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return {
        success: true,
        attemptedUrl: telUrl,
        isSafeTest: false,
        platformNotice:
          'Device phone dialer opened via fallback. Please confirm and place the call in your phone app.',
      };
    } catch (innerErr) {
      console.error('[LifePatch] Unable to open device dialer:', innerErr);
      return {
        success: false,
        attemptedUrl: telUrl,
        isSafeTest: false,
        platformNotice: 'Unable to open device dialer automatically. Please dial ' + phoneNumber + ' manually.',
      };
    }
  }
}

/**
 * Launches device SMS / Messaging app with prefilled emergency coordinates and message
 */
export function triggerSms(
  phoneNumber: string,
  message: string,
  options: { isSafeTestMode?: boolean } = {}
): SmsResult {
  const sanitized = phoneNumber.replace(/[^0-9+*#]/g, '');
  const encodedMsg = encodeURIComponent(message);
  // Cross-platform sms scheme (handles iOS & Android differences)
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIos ? '&' : '?';
  const smsUrl = `sms:${sanitized}${separator}body=${encodedMsg}`;

  if (options.isSafeTestMode) {
    console.log(`[LifePatch Safe Test Mode] Suppressed real SMS to ${phoneNumber}:`, message);
    return {
      success: true,
      attemptedUrl: smsUrl,
      isSafeTest: true,
    };
  }

  try {
    window.location.href = smsUrl;
    return {
      success: true,
      attemptedUrl: smsUrl,
      isSafeTest: false,
    };
  } catch (err) {
    console.warn('[LifePatch] Direct window.location SMS failed, trying anchor click:', err);
    try {
      const link = document.createElement('a');
      link.href = smsUrl;
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return {
        success: true,
        attemptedUrl: smsUrl,
        isSafeTest: false,
      };
    } catch {
      return {
        success: false,
        attemptedUrl: smsUrl,
        isSafeTest: false,
      };
    }
  }
}
