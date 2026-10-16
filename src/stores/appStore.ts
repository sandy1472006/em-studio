import { create } from 'zustand';
import { ModuleId, SimulationStatus } from '../types/common';

interface AppState {
  activeModule: ModuleId;
  simulationStatus: SimulationStatus;
  sidebarCollapsed: boolean;
  activeTab: string;
  showSettings: boolean;
  experimentName: string;
  // Actions
  setActiveModule: (module: ModuleId) => void;
  setSimulationStatus: (status: SimulationStatus) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setShowSettings: (show: boolean) => void;
  setExperimentName: (name: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'electrostatics',
  simulationStatus: 'idle',
  sidebarCollapsed: false,
  activeTab: 'results',
  showSettings: false,
  experimentName: 'Electric Dipole',
  setActiveModule: (module) => set({ activeModule: module }),
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowSettings: (show) => set({ showSettings: show }),
  setExperimentName: (name) => set({ experimentName: name }),
}));
