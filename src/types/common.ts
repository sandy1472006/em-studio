export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface ComplexNumber {
  real: number;
  imag: number;
}

export type ModuleId = 'electrostatics' | 'wave-propagation' | 'transmission-line';

export interface Experiment {
  id: string;
  title: string;
  module: ModuleId;
  description: string;
  createdAt: string;
  updatedAt: string;
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
  observations: string;
}

export interface ExperimentPreset {
  id: string;
  name: string;
  description: string;
  module: ModuleId;
  parameters: Record<string, unknown>;
}

export type SimulationStatus = 'running' | 'paused' | 'idle' | 'converging';

export interface FieldResult {
  E: Vector3D;
  V: number;
  D: Vector3D;
  magnitude: number;
}

export interface VerificationTest {
  id: string;
  name: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
  tolerance?: number;
  error?: number;
}

export interface ExportConfig {
  format: 'csv' | 'json' | 'pdf';
  filename: string;
  includeParameters: boolean;
  includeResults: boolean;
  includeEquations: boolean;
}
