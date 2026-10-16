import { create } from 'zustand';
import { WaveState, PolarisationType, MaterialProperties } from '../types/wave';
import {
  calculatePropagation,
  generatePolarisationTrajectory,
  materialPresets,
  wavePresets,
  runWaveVerification,
} from '../engine/wave';

const defaultMaterial: MaterialProperties = materialPresets['free-space'];

const initialParams = {
  frequency: 1e9, // 1 GHz
  amplitude: 1.0, // 1 V/m
  phase: 0,
  polarisation: 'linear' as PolarisationType,
  axRatio: 0.5,
  phaseDifference: Math.PI / 4,
  material: defaultMaterial,
  propagationDistance: 1.0,
  observationZ: 0.3,
  animationSpeed: 1.0,
  isPlaying: true,
};

export const useWaveStore = create<WaveState>((set, get) => ({
  ...initialParams,
  propagation: calculatePropagation(initialParams),
  polarisationTrajectory: generatePolarisationTrajectory('linear', 1.0, 0.5, Math.PI / 4, 100),
  showGrid: true,
  showAxes: true,
  showLegend: true,
  showPoynting: true,
  verificationResults: runWaveVerification(),

  setFrequency: (f) => {
    set({ frequency: f });
    get().computePropagation();
  },

  setAmplitude: (a) => {
    set({ amplitude: a });
    get().computePropagation();
    get().computePolarisationTrajectory();
  },

  setPhase: (p) => {
    set({ phase: p });
  },

  setPolarisation: (p) => {
    set({ polarisation: p });
    get().computePolarisationTrajectory();
  },

  setAxRatio: (r) => {
    set({ axRatio: r });
    get().computePolarisationTrajectory();
  },

  setPhaseDifference: (d) => {
    set({ phaseDifference: d });
    get().computePolarisationTrajectory();
  },

  setMaterial: (m) => {
    set({ material: m });
    get().computePropagation();
  },

  setMaterialProperty: (key, value) => {
    set((state) => ({
      material: { ...state.material, [key]: value },
    }));
    get().computePropagation();
  },

  setPropagationDistance: (d) => {
    set({ propagationDistance: d });
    get().computePropagation();
  },

  setObservationZ: (z) => {
    set({ observationZ: z });
    get().computePropagation();
  },

  setAnimationSpeed: (s) => set({ animationSpeed: s }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  setShowPoynting: (s) => set({ showPoynting: s }),

  computePropagation: () => {
    const state = get();
    const result = calculatePropagation({
      frequency: state.frequency,
      amplitude: state.amplitude,
      phase: state.phase,
      polarisation: state.polarisation,
      axRatio: state.axRatio,
      phaseDifference: state.phaseDifference,
      material: state.material,
      propagationDistance: state.propagationDistance,
      observationZ: state.observationZ,
      animationSpeed: state.animationSpeed,
      isPlaying: state.isPlaying,
    });
    set({ propagation: result });
  },

  computePolarisationTrajectory: () => {
    const { polarisation, amplitude, axRatio, phaseDifference } = get();
    const traj = generatePolarisationTrajectory(polarisation, amplitude, axRatio, phaseDifference, 100);
    set({ polarisationTrajectory: traj });
  },

  runVerification: () => {
    const results = runWaveVerification();
    set({ verificationResults: results });
  },

  loadPreset: (presetId) => {
    const preset = wavePresets.find((p) => p.id === presetId);
    if (preset) {
      set({
        frequency: (preset.parameters.frequency as number) || 1e9,
        amplitude: (preset.parameters.amplitude as number) || 1.0,
        phase: (preset.parameters.phase as number) || 0,
        polarisation: (preset.parameters.polarisation as PolarisationType) || 'linear',
        material: (preset.parameters.material as MaterialProperties) || defaultMaterial,
      });
      get().computePropagation();
      get().computePolarisationTrajectory();
    }
  },

  reset: () => {
    set({ ...initialParams });
    get().computePropagation();
    get().computePolarisationTrajectory();
  },

  setShowGrid: (show) => set({ showGrid: show }),
  setShowAxes: (show) => set({ showAxes: show }),
  setShowLegend: (show) => set({ showLegend: show }),
}));
