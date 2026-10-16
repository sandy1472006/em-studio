import { describe, it, expect } from 'vitest';
import App from '../App';
import { useAppStore } from '../stores/appStore';
import { useElectrostaticsStore } from '../stores/electrostaticsStore';
import { useWaveStore } from '../stores/waveStore';
import { useTransmissionLineStore } from '../stores/transmissionLineStore';

describe('App & Component Imports', () => {
  it('imports App and stores without throwing', () => {
    expect(App).toBeDefined();
    expect(useAppStore).toBeDefined();
    expect(useElectrostaticsStore).toBeDefined();
    expect(useWaveStore).toBeDefined();
    expect(useTransmissionLineStore).toBeDefined();
  });
});
