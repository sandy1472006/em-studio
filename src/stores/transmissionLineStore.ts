import { create } from 'zustand';
import { TLineState } from '../types/transmissionLine';
import {
  calculateReflectionCoefficient,
  calculateInputImpedance,
  calculateStandingWaveDistribution,
  calculateFrequencySweep,
  transmissionLinePresets,
  runTransmissionLineVerification,
} from '../engine/transmissionLine';
import { C_LIGHT } from '../engine/wave/propagation';

const initialParams = {
  characteristicImpedance: 50,
  loadResistance: 100, // 100 Ohm resistive load => Gamma = 1/3, VSWR = 2
  loadReactance: 0,
  frequency: 1e9, // 1 GHz
  lineLength: 0.5, // 0.5 m
  incidentAmplitude: 10, // 10 V
  propagationVelocity: 0.66 * C_LIGHT, // typical coax cable ~ 2e8 m/s
  isLossy: false,
  attenuationConstant: 0,
  observationPosition: 0.25, // 0.25 m from load
  isPlaying: true,
  animationSpeed: 1.0,
  sweepStartFreq: 100e6, // 100 MHz
  sweepEndFreq: 3e9, // 3 GHz
  sweepPoints: 100,
};

const initialReflection = calculateReflectionCoefficient(
  initialParams.characteristicImpedance,
  initialParams.loadResistance,
  initialParams.loadReactance
);

const initialBeta = (2 * Math.PI * initialParams.frequency) / initialParams.propagationVelocity;

const initialInputZ = calculateInputImpedance(
  initialParams.characteristicImpedance,
  initialParams.loadResistance,
  initialParams.loadReactance,
  initialBeta,
  initialParams.observationPosition
);

const initialStandingWave = calculateStandingWaveDistribution(
  initialParams.incidentAmplitude,
  initialParams.characteristicImpedance,
  initialReflection.gamma,
  initialBeta,
  initialParams.lineLength,
  200
);

const initialSweep = calculateFrequencySweep(
  initialParams.characteristicImpedance,
  initialParams.loadResistance,
  initialParams.loadReactance,
  initialParams.lineLength,
  initialParams.propagationVelocity,
  initialParams.sweepStartFreq,
  initialParams.sweepEndFreq,
  initialParams.sweepPoints
);

export const useTransmissionLineStore = create<TLineState>((set, get) => ({
  ...initialParams,
  reflectionResult: initialReflection,
  inputImpedance: initialInputZ,
  standingWaveData: initialStandingWave,
  frequencySweepData: initialSweep,
  showGrid: true,
  showAxes: true,
  showLegend: true,
  verificationResults: runTransmissionLineVerification(),

  setCharacteristicImpedance: (z0) => {
    set({ characteristicImpedance: z0 });
    get().computeReflection();
    get().computeInputImpedance();
    get().computeStandingWave();
    get().computeFrequencySweep();
  },

  setLoadResistance: (rl) => {
    set({ loadResistance: rl });
    get().computeReflection();
    get().computeInputImpedance();
    get().computeStandingWave();
    get().computeFrequencySweep();
  },

  setLoadReactance: (xl) => {
    set({ loadReactance: xl });
    get().computeReflection();
    get().computeInputImpedance();
    get().computeStandingWave();
    get().computeFrequencySweep();
  },

  setFrequency: (f) => {
    set({ frequency: f });
    get().computeInputImpedance();
    get().computeStandingWave();
  },

  setLineLength: (l) => {
    set({ lineLength: l });
    get().computeInputImpedance();
    get().computeStandingWave();
    get().computeFrequencySweep();
  },

  setIncidentAmplitude: (a) => {
    set({ incidentAmplitude: a });
    get().computeStandingWave();
  },

  setPropagationVelocity: (v) => {
    set({ propagationVelocity: v });
    get().computeInputImpedance();
    get().computeStandingWave();
    get().computeFrequencySweep();
  },

  setObservationPosition: (d) => {
    set({ observationPosition: d });
    get().computeInputImpedance();
  },

  setIsPlaying: (p) => set({ isPlaying: p }),
  setAnimationSpeed: (s) => set({ animationSpeed: s }),

  setSweepRange: (start, end, points) => {
    set({ sweepStartFreq: start, sweepEndFreq: end, sweepPoints: points });
    get().computeFrequencySweep();
  },

  computeReflection: () => {
    const { characteristicImpedance, loadResistance, loadReactance } = get();
    const result = calculateReflectionCoefficient(characteristicImpedance, loadResistance, loadReactance);
    set({ reflectionResult: result });
  },

  computeInputImpedance: () => {
    const { characteristicImpedance, loadResistance, loadReactance, frequency, propagationVelocity, observationPosition } = get();
    const beta = (2 * Math.PI * frequency) / propagationVelocity;
    const result = calculateInputImpedance(characteristicImpedance, loadResistance, loadReactance, beta, observationPosition);
    set({ inputImpedance: result });
  },

  computeStandingWave: () => {
    const { incidentAmplitude, characteristicImpedance, reflectionResult, frequency, propagationVelocity, lineLength } = get();
    if (!reflectionResult) return;
    const beta = (2 * Math.PI * frequency) / propagationVelocity;
    const data = calculateStandingWaveDistribution(
      incidentAmplitude,
      characteristicImpedance,
      reflectionResult.gamma,
      beta,
      lineLength,
      200
    );
    set({ standingWaveData: data });
  },

  computeFrequencySweep: () => {
    const {
      characteristicImpedance,
      loadResistance,
      loadReactance,
      lineLength,
      propagationVelocity,
      sweepStartFreq,
      sweepEndFreq,
      sweepPoints,
    } = get();
    const data = calculateFrequencySweep(
      characteristicImpedance,
      loadResistance,
      loadReactance,
      lineLength,
      propagationVelocity,
      sweepStartFreq,
      sweepEndFreq,
      sweepPoints
    );
    set({ frequencySweepData: data });
  },

  runVerification: () => {
    const results = runTransmissionLineVerification();
    set({ verificationResults: results });
  },

  loadPreset: (presetId) => {
    const preset = transmissionLinePresets.find((p) => p.id === presetId);
    if (preset) {
      const p = preset.parameters;
      set({
        characteristicImpedance: (p.characteristicImpedance as number) ?? 50,
        loadResistance: (p.loadResistance as number) ?? 50,
        loadReactance: (p.loadReactance as number) ?? 0,
        frequency: (p.frequency as number) ?? 1e9,
        lineLength: (p.lineLength as number) ?? 0.5,
      });
      get().computeReflection();
      get().computeInputImpedance();
      get().computeStandingWave();
      get().computeFrequencySweep();
    }
  },

  reset: () => {
    set({ ...initialParams });
    get().computeReflection();
    get().computeInputImpedance();
    get().computeStandingWave();
    get().computeFrequencySweep();
  },

  setShowGrid: (show) => set({ showGrid: show }),
  setShowAxes: (show) => set({ showAxes: show }),
  setShowLegend: (show) => set({ showLegend: show }),
}));
