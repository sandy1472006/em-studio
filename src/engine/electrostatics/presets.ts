import { PointCharge, ElectrostaticsParams, LaplaceConfig } from '../../types/electrostatics';
import { ExperimentPreset } from '../../types/common';

const nC = 1e-9; // nanocoulomb

export const defaultLaplaceConfig: LaplaceConfig = {
  width: 1.0,
  height: 1.0,
  gridResolution: 50,
  boundaryTop: 100,
  boundaryBottom: 0,
  boundaryLeft: 0,
  boundaryRight: 0,
  maxIterations: 5000,
  convergenceTolerance: 1e-5,
  solverMethod: 'sor',
  sorOmega: 1.5,
};

export const chargePresets: Record<string, PointCharge[]> = {
  'single-positive': [
    { id: 'q1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC, label: 'Q₁' },
  ],
  'electric-dipole': [
    { id: 'q1', position: { x: -0.8, y: 0, z: 0 }, charge: 1 * nC, label: 'Q₊' },
    { id: 'q2', position: { x: 0.8, y: 0, z: 0 }, charge: -1 * nC, label: 'Q₋' },
  ],
  'symmetric-quadrupole': [
    { id: 'q1', position: { x: -0.8, y: 0.8, z: 0 }, charge: 1 * nC, label: 'Q₁' },
    { id: 'q2', position: { x: 0.8, y: 0.8, z: 0 }, charge: -1 * nC, label: 'Q₂' },
    { id: 'q3', position: { x: -0.8, y: -0.8, z: 0 }, charge: -1 * nC, label: 'Q₃' },
    { id: 'q4', position: { x: 0.8, y: -0.8, z: 0 }, charge: 1 * nC, label: 'Q₄' },
  ],
  'three-charge-asymmetric': [
    { id: 'q1', position: { x: -1.0, y: 0, z: 0 }, charge: 2 * nC, label: 'Q₁' },
    { id: 'q2', position: { x: 0.5, y: 0.8, z: 0 }, charge: -1 * nC, label: 'Q₂' },
    { id: 'q3', position: { x: 0.5, y: -0.8, z: 0 }, charge: 1.5 * nC, label: 'Q₃' },
  ],
};

export const electrostaticsPresets: ExperimentPreset[] = [
  {
    id: 'single-positive',
    name: 'Single Positive Charge',
    description: 'A single positive point charge showing radial electric field',
    module: 'electrostatics',
    parameters: { charges: chargePresets['single-positive'] },
  },
  {
    id: 'electric-dipole',
    name: 'Electric Dipole',
    description: 'Equal and opposite charges demonstrating field superposition',
    module: 'electrostatics',
    parameters: { charges: chargePresets['electric-dipole'] },
  },
  {
    id: 'symmetric-quadrupole',
    name: 'Symmetric Quadrupole',
    description: 'Four charges in a symmetric arrangement showing complex field patterns',
    module: 'electrostatics',
    parameters: { charges: chargePresets['symmetric-quadrupole'] },
  },
  {
    id: 'three-charge-asymmetric',
    name: 'Three-Charge Asymmetric',
    description: 'Three charges in an asymmetric configuration',
    module: 'electrostatics',
    parameters: { charges: chargePresets['three-charge-asymmetric'] },
  },
];
