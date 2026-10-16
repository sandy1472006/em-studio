import { create } from 'zustand';
import { Experiment, ModuleId } from '../types/common';

interface ExperimentStore {
  savedExperiments: Experiment[];
  activeExperiment: Experiment | null;
  comparisonExperiment: Experiment | null;
  saveCurrentExperiment: (
    title: string,
    module: ModuleId,
    description: string,
    parameters: Record<string, unknown>,
    results: Record<string, unknown>,
    observations: string
  ) => Experiment;
  deleteExperiment: (id: string) => void;
  loadExperiment: (id: string) => Experiment | undefined;
  setComparisonExperiment: (id: string | null) => void;
  updateObservations: (id: string, observations: string) => void;
  exportExperimentJSON: (id: string) => void;
  exportExperimentCSV: (id: string) => void;
}

const STORAGE_KEY = 'em_studio_saved_experiments';

const loadFromLocalStorage = (): Experiment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load experiments from localStorage', e);
  }
  return [];
};

const saveToLocalStorage = (experiments: Experiment[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
  } catch (e) {
    console.error('Failed to save experiments to localStorage', e);
  }
};

export const useExperimentStore = create<ExperimentStore>((set, get) => ({
  savedExperiments: typeof window !== 'undefined' ? loadFromLocalStorage() : [],
  activeExperiment: null,
  comparisonExperiment: null,

  saveCurrentExperiment: (title, module, description, parameters, results, observations) => {
    const now = new Date().toISOString();
    const newExp: Experiment = {
      id: `exp-${Date.now()}`,
      title,
      module,
      description,
      createdAt: now,
      updatedAt: now,
      parameters,
      results,
      observations,
    };

    const updated = [newExp, ...get().savedExperiments];
    saveToLocalStorage(updated);
    set({ savedExperiments: updated, activeExperiment: newExp });
    return newExp;
  },

  deleteExperiment: (id) => {
    const updated = get().savedExperiments.filter((exp) => exp.id !== id);
    saveToLocalStorage(updated);
    set({
      savedExperiments: updated,
      activeExperiment: get().activeExperiment?.id === id ? null : get().activeExperiment,
      comparisonExperiment: get().comparisonExperiment?.id === id ? null : get().comparisonExperiment,
    });
  },

  loadExperiment: (id) => {
    const exp = get().savedExperiments.find((e) => e.id === id);
    if (exp) {
      set({ activeExperiment: exp });
    }
    return exp;
  },

  setComparisonExperiment: (id) => {
    if (!id) {
      set({ comparisonExperiment: null });
      return;
    }
    const exp = get().savedExperiments.find((e) => e.id === id) || null;
    set({ comparisonExperiment: exp });
  },

  updateObservations: (id, observations) => {
    const updated = get().savedExperiments.map((e) =>
      e.id === id ? { ...e, observations, updatedAt: new Date().toISOString() } : e
    );
    saveToLocalStorage(updated);
    set({
      savedExperiments: updated,
      activeExperiment: get().activeExperiment?.id === id ? { ...get().activeExperiment!, observations } : get().activeExperiment,
    });
  },

  exportExperimentJSON: (id) => {
    const exp = get().savedExperiments.find((e) => e.id === id) || get().activeExperiment;
    if (!exp) return;
    const jsonStr = JSON.stringify(exp, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EM_Studio_${exp.module}_${exp.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportExperimentCSV: (id) => {
    const exp = get().savedExperiments.find((e) => e.id === id) || get().activeExperiment;
    if (!exp) return;
    let csv = `EM Studio - Engineering Simulation Record\n`;
    csv += `Title,${exp.title}\n`;
    csv += `Module,${exp.module}\n`;
    csv += `Date,${exp.createdAt}\n`;
    csv += `Observations,"${exp.observations.replace(/"/g, '""')}"\n\n`;
    csv += `PARAMETER,VALUE\n`;
    for (const [key, value] of Object.entries(exp.parameters)) {
      csv += `${key},"${JSON.stringify(value).replace(/"/g, '""')}"\n`;
    }
    csv += `\nRESULT,VALUE\n`;
    for (const [key, value] of Object.entries(exp.results)) {
      csv += `${key},"${JSON.stringify(value).replace(/"/g, '""')}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EM_Studio_${exp.module}_${exp.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
