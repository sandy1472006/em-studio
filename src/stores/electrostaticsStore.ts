import { create } from 'zustand';
import { ElectrostaticsState, PointCharge, ElectrostaticsViewMode, LaplaceConfig } from '../types/electrostatics';
import { Vector3D } from '../types/common';
import {
  calculateFieldAtPoint,
  generateFieldLines,
  generatePotentialMap,
  solveLaplace,
  runElectrostaticsVerification,
  chargePresets,
  defaultLaplaceConfig,
} from '../engine/electrostatics';

const defaultCharges: PointCharge[] = [
  { id: 'q1', position: { x: -0.8, y: 0, z: 0 }, charge: 1e-9, label: 'Q₊ (+1 nC)' },
  { id: 'q2', position: { x: 0.8, y: 0, z: 0 }, charge: -1e-9, label: 'Q₋ (-1 nC)' },
];

const defaultObservationPoint: Vector3D = { x: 0, y: 0.8, z: 0 };

export const useElectrostaticsStore = create<ElectrostaticsState>((set, get) => ({
  fieldType: 'electric',
  charges: defaultCharges,
  observationPoint: defaultObservationPoint,
  relativePermittivity: 1.0,
  mediumName: 'Vacuum / Air',
  viewMode: 'combined',
  showGrid: true,
  showAxes: true,
  showLegend: true,
  fieldLineCount: 16,
  fieldLineStepSize: 0.02,
  fieldLineMaxSteps: 300,
  potentialMapResolution: 40,
  potentialMapPlane: 'xy',
  potentialMapZ: 0,

  fieldResult: calculateFieldAtPoint(defaultObservationPoint, defaultCharges, 1.0),
  fieldLines: generateFieldLines(defaultCharges, 16, { stepSize: 0.02, maxSteps: 300, relativePermittivity: 1.0 }),
  potentialMap: generatePotentialMap(defaultCharges, 1.0, 40, 2.5, 'xy', 0),
  laplaceConfig: defaultLaplaceConfig,
  laplaceResult: null,
  selectedChargeId: 'q1',
  verificationResults: runElectrostaticsVerification(),

  addCharge: (charge) => {
    set((state) => {
      const charges = [...state.charges, charge];
      return { charges, selectedChargeId: charge.id };
    });
    get().computeField();
    get().computeFieldLines();
    get().computePotentialMap();
  },

  removeCharge: (id) => {
    set((state) => {
      const charges = state.charges.filter((c) => c.id !== id);
      return {
        charges,
        selectedChargeId: state.selectedChargeId === id ? (charges[0]?.id || null) : state.selectedChargeId,
      };
    });
    get().computeField();
    get().computeFieldLines();
    get().computePotentialMap();
  },

  updateCharge: (id, updates) => {
    set((state) => ({
      charges: state.charges.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().computeField();
    get().computeFieldLines();
    get().computePotentialMap();
  },

  selectCharge: (id) => set({ selectedChargeId: id }),

  setObservationPoint: (point) => {
    set({ observationPoint: point });
    get().computeField();
  },

  setRelativePermittivity: (er) => {
    let mediumName = 'Custom Medium';
    if (Math.abs(er - 1.0) < 1e-4) mediumName = 'Vacuum / Air (εᵣ=1.0)';
    else if (Math.abs(er - 2.25) < 0.1) mediumName = 'Polyethylene (εᵣ=2.25)';
    else if (Math.abs(er - 4.0) < 0.1) mediumName = 'Glass / Quartz (εᵣ=4.0)';
    else if (Math.abs(er - 80) < 1) mediumName = 'Deionized Water (εᵣ=80.0)';
    
    set({ relativePermittivity: er, mediumName });
    get().computeField();
    get().computeFieldLines();
    get().computePotentialMap();
  },

  setViewMode: (mode: ElectrostaticsViewMode) => set({ viewMode: mode }),
  setFieldLineCount: (count) => {
    set({ fieldLineCount: count });
    get().computeFieldLines();
  },
  setPotentialMapResolution: (res) => {
    set({ potentialMapResolution: res });
    get().computePotentialMap();
  },
  setLaplaceConfig: (config) => {
    set((state) => ({ laplaceConfig: { ...state.laplaceConfig, ...config } }));
  },

  computeField: () => {
    const { observationPoint, charges, relativePermittivity } = get();
    const result = calculateFieldAtPoint(observationPoint, charges, relativePermittivity);
    set({ fieldResult: result });
  },

  computeFieldLines: () => {
    const { charges, fieldLineCount, fieldLineStepSize, fieldLineMaxSteps, relativePermittivity } = get();
    const lines = generateFieldLines(charges, fieldLineCount, {
      stepSize: fieldLineStepSize,
      maxSteps: fieldLineMaxSteps,
      relativePermittivity,
    });
    set({ fieldLines: lines });
  },

  computePotentialMap: () => {
    const { charges, relativePermittivity, potentialMapResolution, potentialMapPlane, potentialMapZ } = get();
    const mapData = generatePotentialMap(
      charges,
      relativePermittivity,
      potentialMapResolution,
      2.5,
      potentialMapPlane,
      potentialMapZ
    );
    set({ potentialMap: mapData });
  },

  solveLaplace: () => {
    const { laplaceConfig } = get();
    const result = solveLaplace(laplaceConfig);
    set({ laplaceResult: result });
  },

  runVerification: () => {
    const results = runElectrostaticsVerification();
    set({ verificationResults: results });
  },

  loadPreset: (presetId: string) => {
    const preset = chargePresets[presetId];
    if (preset) {
      set({
        charges: JSON.parse(JSON.stringify(preset)),
        selectedChargeId: preset[0]?.id || null,
      });
      get().computeField();
      get().computeFieldLines();
      get().computePotentialMap();
    }
  },

  reset: () => {
    set({
      charges: defaultCharges,
      observationPoint: defaultObservationPoint,
      relativePermittivity: 1.0,
      mediumName: 'Vacuum / Air',
      viewMode: 'combined',
      selectedChargeId: 'q1',
    });
    get().computeField();
    get().computeFieldLines();
    get().computePotentialMap();
  },

  setFieldType: (type) => {
    set({ fieldType: type });
    get().computeField();
    get().computeFieldLines();
    get().computePotentialMap();
  },

  setShowGrid: (show) => set({ showGrid: show }),
  setShowAxes: (show) => set({ showAxes: show }),
  setShowLegend: (show) => set({ showLegend: show }),
}));
