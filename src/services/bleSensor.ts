/**
 * Web Bluetooth Low Energy (BLE) Wearable Sensor Interface
 * Connects to standard Bluetooth Smart Heart Rate monitors and LifePatch BLE prototypes.
 */

export interface BleConnectionStatus {
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  errorMessage: string | null;
  lastHeartRate: number | null;
  batteryLevel: number | null;
}

class BleSensorManager {
  private device: any = null;
  private server: any = null;
  private heartRateCharacteristic: any = null;
  private batteryCharacteristic: any = null;
  private status: BleConnectionStatus = {
    isSupported: false,
    isConnected: false,
    isConnecting: false,
    deviceName: null,
    errorMessage: null,
    lastHeartRate: null,
    batteryLevel: null,
  };
  private listeners: Set<(status: BleConnectionStatus) => void> = new Set();
  private onHeartRateCallback: ((bpm: number) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'bluetooth' in navigator) {
      this.status.isSupported = true;
    }
  }

  public subscribe(listener: (status: BleConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  public setOnHeartRate(callback: (bpm: number) => void) {
    this.onHeartRateCallback = callback;
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.status }));
  }

  public async connect(): Promise<boolean> {
    if (!('bluetooth' in navigator)) {
      this.status.errorMessage =
        'Web Bluetooth API is not supported in this browser. Please use Google Chrome, Edge, or an Android browser on HTTPS.';
      this.notify();
      return false;
    }

    this.status.isConnecting = true;
    this.status.errorMessage = null;
    this.notify();

    try {
      // Request standard Heart Rate Service (0x180D) and Battery Service (0x180F)
      const bluetooth = (navigator as any).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      this.device = device;
      this.status.deviceName = device.name || 'Bluetooth Wearable';

      device.addEventListener('gattserverdisconnected', () => {
        this.status.isConnected = false;
        this.status.isConnecting = false;
        this.status.errorMessage = 'Bluetooth device disconnected.';
        this.notify();
      });

      const server = await device.gatt.connect();
      this.server = server;

      // Access Heart Rate service
      const hrService = await server.getPrimaryService('heart_rate');
      const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
      this.heartRateCharacteristic = hrChar;

      await hrChar.startNotifications();
      hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const bpm = this.parseHeartRate(value);
        this.status.lastHeartRate = bpm;
        this.notify();
        if (this.onHeartRateCallback) {
          this.onHeartRateCallback(bpm);
        }
      });

      // Try optional battery service
      try {
        const battService = await server.getPrimaryService('battery_service');
        const battChar = await battService.getCharacteristic('battery_level');
        this.batteryCharacteristic = battChar;
        const battVal = await battChar.readValue();
        this.status.batteryLevel = battVal.getUint8(0);
      } catch {
        // Battery service optional
      }

      this.status.isConnected = true;
      this.status.isConnecting = false;
      this.notify();
      return true;
    } catch (err: any) {
      this.status.isConnecting = false;
      this.status.isConnected = false;
      if (err.name === 'NotFoundError') {
        this.status.errorMessage = 'No Bluetooth sensor selected.';
      } else {
        this.status.errorMessage = err.message || 'Bluetooth connection failed.';
      }
      this.notify();
      return false;
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.status.isConnected = false;
    this.status.isConnecting = false;
    this.status.deviceName = null;
    this.notify();
  }

  private parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    if (rate16Bits) {
      return value.getUint16(1, /*littleEndian=*/ true);
    } else {
      return value.getUint8(1);
    }
  }
}

export const bleSensorManager = new BleSensorManager();
