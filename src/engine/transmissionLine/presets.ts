import { ExperimentPreset } from '../../types/common';

export const transmissionLinePresets: ExperimentPreset[] = [
  {
    id: 'matched-load',
    name: 'Matched Load',
    description: 'ZL = Z0 = 50Ω — No reflection, VSWR = 1',
    module: 'transmission-line',
    parameters: {
      characteristicImpedance: 50,
      loadResistance: 50,
      loadReactance: 0,
      frequency: 1e9,
      lineLength: 0.5,
    },
  },
  {
    id: 'open-circuit',
    name: 'Open Circuit',
    description: 'ZL → ∞ — Total reflection, |Γ| = 1',
    module: 'transmission-line',
    parameters: {
      characteristicImpedance: 50,
      loadResistance: 1e15,
      loadReactance: 0,
      frequency: 1e9,
      lineLength: 0.5,
    },
  },
  {
    id: 'short-circuit',
    name: 'Short Circuit',
    description: 'ZL = 0 — Total reflection, |Γ| = 1, 180° phase',
    module: 'transmission-line',
    parameters: {
      characteristicImpedance: 50,
      loadResistance: 0,
      loadReactance: 0,
      frequency: 1e9,
      lineLength: 0.5,
    },
  },
  {
    id: 'resistive-mismatch',
    name: 'Resistive Mismatch (100Ω)',
    description: 'ZL = 100Ω on 50Ω line — Γ = 1/3, VSWR = 2',
    module: 'transmission-line',
    parameters: {
      characteristicImpedance: 50,
      loadResistance: 100,
      loadReactance: 0,
      frequency: 1e9,
      lineLength: 0.5,
    },
  },
  {
    id: 'complex-load',
    name: 'Complex Load',
    description: 'ZL = 75 + j50 Ω on 50Ω line',
    module: 'transmission-line',
    parameters: {
      characteristicImpedance: 50,
      loadResistance: 75,
      loadReactance: 50,
      frequency: 1e9,
      lineLength: 0.5,
    },
  },
];
