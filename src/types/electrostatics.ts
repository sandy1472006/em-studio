import { Vector3D, FieldResult, VerificationTest } from './common';

export interface PointCharge {
  id: string;
  position: Vector3D;
  charge: number; // Coulombs
  label?: string;
}

export interface ElectrostaticsParams {
  fieldType?: 'electric' | 'magnetic';
  charges: PointCharge[];
  observationPoint: Vector3D;
  relativePermittivity: number;
  mediumName: string;
  viewMode: ElectrostaticsViewMode;
  showGrid: boolean;
  showAxes: boolean;
  showLegend: boolean;
  fieldLineCount: number;
  fieldLineStepSize: number;
  fieldLineMaxSteps: number;
  potentialMapResolution: number;
  potentialMapPlane: 'xy' | 'xz' | 'yz';
  potentialMapZ: number; // z-coordinate for xy plane slice
}

export type ElectrostaticsViewMode = 'field-lines' | 'field-vectors' | 'potential-map' | 'equipotential' | 'combined';

export interface FieldLinePoint {
  position: Vector3D;
  fieldMagnitude: number;
}

export type FieldLine = FieldLinePoint[];

export interface PotentialGridPoint {
  x: number;
  y: number;
  potential: number;
  Ex: number;
  Ey: number;
}

export interface PotentialMapData {
  xValues: number[];
  yValues: number[];
  potentials: number[][]; // 2D grid
  ExField: number[][];
  EyField: number[][];
}

export interface LaplaceConfig {
  width: number;
  height: number;
  gridResolution: number;
  boundaryTop: number;
  boundaryBottom: number;
  boundaryLeft: number;
  boundaryRight: number;
  maxIterations: number;
  convergenceTolerance: number;
  solverMethod: 'jacobi' | 'gauss-seidel' | 'sor';
  sorOmega: number;
}

export interface LaplaceResult {
  potential: number[][];
  Ex: number[][];
  Ey: number[][];
  iterations: number;
  residual: number;
  converged: boolean;
  gridNx: number;
  gridNy: number;
}

export interface ElectrostaticsState extends ElectrostaticsParams {
  fieldResult: FieldResult | null;
  fieldLines: FieldLine[];
  potentialMap: PotentialMapData | null;
  laplaceConfig: LaplaceConfig;
  laplaceResult: LaplaceResult | null;
  selectedChargeId: string | null;
  verificationResults: VerificationTest[];
  // Actions
  addCharge: (charge: PointCharge) => void;
  removeCharge: (id: string) => void;
  updateCharge: (id: string, updates: Partial<PointCharge>) => void;
  selectCharge: (id: string | null) => void;
  setObservationPoint: (point: Vector3D) => void;
  setRelativePermittivity: (er: number) => void;
  setViewMode: (mode: ElectrostaticsViewMode) => void;
  setFieldLineCount: (count: number) => void;
  setPotentialMapResolution: (res: number) => void;
  setLaplaceConfig: (config: Partial<LaplaceConfig>) => void;
  computeField: () => void;
  computeFieldLines: () => void;
  computePotentialMap: () => void;
  solveLaplace: () => void;
  runVerification: () => void;
  setFieldType?: (type: 'electric' | 'magnetic') => void;
  loadPreset: (presetId: string) => void;
  reset: () => void;
  setShowGrid: (show: boolean) => void;
  setShowAxes: (show: boolean) => void;
  setShowLegend: (show: boolean) => void;
}
