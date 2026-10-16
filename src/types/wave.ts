import { Vector3D, ComplexNumber, VerificationTest } from './common';

export type PolarisationType = 'linear' | 'circular-rh' | 'circular-lh' | 'elliptical';

export interface MaterialProperties {
  name: string;
  relativePermittivity: number; // εr
  relativePermeability: number; // μr
  conductivity: number; // σ (S/m)
  type: 'free-space' | 'lossless-dielectric' | 'lossy-dielectric' | 'good-conductor';
}

export interface WaveParams {
  frequency: number; // Hz
  amplitude: number; // V/m (E-field amplitude)
  phase: number; // radians
  polarisation: PolarisationType;
  axRatio: number; // Ey/Ex amplitude ratio for elliptical
  phaseDifference: number; // radians, phase difference for elliptical
  material: MaterialProperties;
  propagationDistance: number; // meters
  observationZ: number; // observation position along z
  animationSpeed: number; // multiplier
  isPlaying: boolean;
}

export interface PropagationResult {
  gamma: ComplexNumber; // propagation constant
  alpha: number; // attenuation constant (Np/m)
  beta: number; // phase constant (rad/m)
  phaseVelocity: number; // m/s
  wavelength: number; // meters
  intrinsicImpedance: ComplexNumber; // η (Ohms)
  skinDepth: number; // meters (1/α)
  skinDepthGoodConductor: number; // approximate formula
  attenuationDb: number; // attenuation over propagationDistance in dB
  amplitudeAtDistance: number; // |E| at observationZ
}

export interface PolarisationPoint {
  Ex: number;
  Ey: number;
  t: number;
}

export interface WaveState extends WaveParams {
  propagation: PropagationResult | null;
  polarisationTrajectory: PolarisationPoint[];
  showGrid: boolean;
  showAxes: boolean;
  showLegend: boolean;
  showPoynting: boolean;
  verificationResults: VerificationTest[];
  // Actions
  setFrequency: (f: number) => void;
  setAmplitude: (a: number) => void;
  setPhase: (p: number) => void;
  setPolarisation: (p: PolarisationType) => void;
  setAxRatio: (r: number) => void;
  setPhaseDifference: (d: number) => void;
  setMaterial: (m: MaterialProperties) => void;
  setMaterialProperty: (key: keyof MaterialProperties, value: number | string) => void;
  setPropagationDistance: (d: number) => void;
  setObservationZ: (z: number) => void;
  setAnimationSpeed: (s: number) => void;
  setIsPlaying: (p: boolean) => void;
  setShowPoynting: (s: boolean) => void;
  computePropagation: () => void;
  computePolarisationTrajectory: () => void;
  runVerification: () => void;
  loadPreset: (presetId: string) => void;
  reset: () => void;
  setShowGrid: (show: boolean) => void;
  setShowAxes: (show: boolean) => void;
  setShowLegend: (show: boolean) => void;
}
