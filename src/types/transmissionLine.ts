import { ComplexNumber, VerificationTest } from './common';

export interface TLineParams {
  characteristicImpedance: number; // Z0 (Ohms, real for lossless)
  loadResistance: number; // RL (Ohms)
  loadReactance: number; // XL (Ohms)
  frequency: number; // Hz
  lineLength: number; // meters
  incidentAmplitude: number; // V
  propagationVelocity: number; // m/s (for lossless, fraction of c)
  isLossy: boolean;
  attenuationConstant: number; // α (Np/m) for lossy lines
  observationPosition: number; // distance from load (meters)
  isPlaying: boolean;
  animationSpeed: number;
}

export interface ReflectionResult {
  gamma: ComplexNumber; // reflection coefficient Γ
  gammaMagnitude: number; // |Γ|
  gammaPhase: number; // ∠Γ in radians
  gammaPhaseDeg: number; // ∠Γ in degrees
  vswr: number; // VSWR
  returnLoss: number; // dB
  mismatchLoss: number; // dB
}

export interface InputImpedanceResult {
  Zin: ComplexNumber;
  position: number; // distance from load
}

export interface StandingWavePoint {
  position: number; // distance from load
  voltageMagnitude: number;
  currentMagnitude: number;
}

export interface FrequencySweepPoint {
  frequency: number;
  gammaMagnitude: number;
  vswr: number;
  ZinReal: number;
  ZinImag: number;
  gammaPhase: number;
}

export interface TLineState extends TLineParams {
  reflectionResult: ReflectionResult | null;
  inputImpedance: InputImpedanceResult | null;
  standingWaveData: StandingWavePoint[];
  frequencySweepData: FrequencySweepPoint[];
  showGrid: boolean;
  showAxes: boolean;
  showLegend: boolean;
  verificationResults: VerificationTest[];
  sweepStartFreq: number;
  sweepEndFreq: number;
  sweepPoints: number;
  // Actions
  setCharacteristicImpedance: (z0: number) => void;
  setLoadResistance: (rl: number) => void;
  setLoadReactance: (xl: number) => void;
  setFrequency: (f: number) => void;
  setLineLength: (l: number) => void;
  setIncidentAmplitude: (a: number) => void;
  setPropagationVelocity: (v: number) => void;
  setObservationPosition: (d: number) => void;
  setIsPlaying: (p: boolean) => void;
  setAnimationSpeed: (s: number) => void;
  setSweepRange: (start: number, end: number, points: number) => void;
  computeReflection: () => void;
  computeInputImpedance: () => void;
  computeStandingWave: () => void;
  computeFrequencySweep: () => void;
  runVerification: () => void;
  loadPreset: (presetId: string) => void;
  reset: () => void;
  setShowGrid: (show: boolean) => void;
  setShowAxes: (show: boolean) => void;
  setShowLegend: (show: boolean) => void;
}
