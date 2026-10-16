import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useExperimentStore } from '../../stores/experimentStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { Experiment } from '../../types/common';
import { X, Save, Trash2, Download, Eye, GitCompare, Bookmark, FileText } from 'lucide-react';

interface ExperimentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExperimentManager: React.FC<ExperimentManagerProps> = ({ isOpen, onClose }) => {
  const { activeModule, experimentName, setExperimentName } = useAppStore();
  const {
    savedExperiments,
    saveCurrentExperiment,
    deleteExperiment,
    exportExperimentJSON,
    exportExperimentCSV,
  } = useExperimentStore();

  const [title, setTitle] = useState(experimentName);
  const [description, setDescription] = useState('Bench simulation test run');
  const [observations, setObservations] = useState('');
  const [compareIdA, setCompareIdA] = useState<string>('');
  const [compareIdB, setCompareIdB] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);

  // States from modules
  const esState = useElectrostaticsStore();
  const waveState = useWaveStore();
  const tlineState = useTransmissionLineStore();

  if (!isOpen) return null;

  const handleSave = () => {
    let params: Record<string, unknown> = {};
    let results: Record<string, unknown> = {};

    if (activeModule === 'electrostatics') {
      params = {
        charges: esState.charges,
        observationPoint: esState.observationPoint,
        relativePermittivity: esState.relativePermittivity,
      };
      results = {
        magnitude: esState.fieldResult?.magnitude,
        V: esState.fieldResult?.V,
        E: esState.fieldResult?.E,
      };
    } else if (activeModule === 'wave-propagation') {
      params = {
        frequency: waveState.frequency,
        amplitude: waveState.amplitude,
        polarisation: waveState.polarisation,
        material: waveState.material,
      };
      results = {
        wavelength: waveState.propagation?.wavelength,
        phaseVelocity: waveState.propagation?.phaseVelocity,
        intrinsicImpedance: waveState.propagation?.intrinsicImpedance,
        alpha: waveState.propagation?.alpha,
      };
    } else if (activeModule === 'transmission-line') {
      params = {
        Z0: tlineState.characteristicImpedance,
        RL: tlineState.loadResistance,
        XL: tlineState.loadReactance,
        frequency: tlineState.frequency,
        lineLength: tlineState.lineLength,
      };
      results = {
        gammaMagnitude: tlineState.reflectionResult?.gammaMagnitude,
        gammaPhaseDeg: tlineState.reflectionResult?.gammaPhaseDeg,
        vswr: tlineState.reflectionResult?.vswr,
        returnLoss: tlineState.reflectionResult?.returnLoss,
      };
    }

    saveCurrentExperiment(title, activeModule, description, params, results, observations);
    setObservations('');
    alert(`Experiment "${title}" saved successfully to local storage.`);
  };

  const handleRestore = (exp: Experiment) => {
    setExperimentName(exp.title);
    if (exp.module === 'electrostatics') {
      if (exp.parameters.charges) {
        esState.reset();
        // apply charges
        (exp.parameters.charges as any[]).forEach((c, idx) => {
          if (idx === 0) esState.updateCharge(esState.charges[0].id, c);
          else esState.addCharge(c);
        });
      }
    } else if (exp.module === 'wave-propagation') {
      if (exp.parameters.frequency) waveState.setFrequency(exp.parameters.frequency as number);
      if (exp.parameters.amplitude) waveState.setAmplitude(exp.parameters.amplitude as number);
      if (exp.parameters.polarisation) waveState.setPolarisation(exp.parameters.polarisation as any);
      if (exp.parameters.material) waveState.setMaterial(exp.parameters.material as any);
    } else if (exp.module === 'transmission-line') {
      if (exp.parameters.Z0) tlineState.setCharacteristicImpedance(exp.parameters.Z0 as number);
      if (exp.parameters.RL !== undefined) tlineState.setLoadResistance(exp.parameters.RL as number);
      if (exp.parameters.XL !== undefined) tlineState.setLoadReactance(exp.parameters.XL as number);
      if (exp.parameters.frequency) tlineState.setFrequency(exp.parameters.frequency as number);
      if (exp.parameters.lineLength) tlineState.setLineLength(exp.parameters.lineLength as number);
    }
    onClose();
  };

  const expA = savedExperiments.find((e) => e.id === compareIdA);
  const expB = savedExperiments.find((e) => e.id === compareIdB);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-em-accent" />
            <span className="font-semibold text-sm text-em-text-primary">
              Experiment Manager & Record Archive
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Save Current Section */}
          <div className="p-3.5 rounded bg-em-surface-light border border-em-border space-y-3 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-xs text-em-text-primary uppercase tracking-wider mb-2">
                Save Active Setup ({activeModule})
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-2xs text-em-text-muted block mb-0.5">Experiment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                    placeholder="e.g. Resistive Mismatch 100 Ohm Test"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block mb-0.5">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block mb-0.5">Engineering Observations / Notes</label>
                  <textarea
                    rows={3}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-em-surface border border-em-border rounded p-2 text-xs font-sans text-em-text-primary focus:border-em-accent outline-none"
                    placeholder="Record physical notes, VSWR observations, field cancellations..."
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold bg-em-accent text-em-bg hover:bg-em-accent-hover transition-colors cursor-pointer mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Record to Browser Storage</span>
            </button>
          </div>

          {/* Saved List Section */}
          <div className="p-3.5 rounded bg-em-surface-light border border-em-border flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-em-text-primary uppercase tracking-wider">
                Saved Experiments ({savedExperiments.length})
              </span>
              {savedExperiments.length >= 2 && (
                <button
                  onClick={() => setIsComparing(!isComparing)}
                  className="flex items-center gap-1 text-2xs text-em-accent hover:underline cursor-pointer"
                >
                  <GitCompare className="w-3 h-3" />
                  <span>{isComparing ? 'Exit Comparison' : 'Compare Experiments'}</span>
                </button>
              )}
            </div>

            {/* Comparison Mode */}
            {isComparing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={compareIdA}
                    onChange={(e) => setCompareIdA(e.target.value)}
                    className="w-full text-2xs"
                  >
                    <option value="">Select Experiment A</option>
                    {savedExperiments.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                  <select
                    value={compareIdB}
                    onChange={(e) => setCompareIdB(e.target.value)}
                    className="w-full text-2xs"
                  >
                    <option value="">Select Experiment B</option>
                    {savedExperiments.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                {expA && expB && (
                  <div className="p-2 bg-em-surface rounded border border-em-border text-2xs space-y-2">
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div>
                        <div className="font-semibold text-em-accent">{expA.title}</div>
                        <div>Module: {expA.module}</div>
                        <div className="mt-1 text-em-text-muted">Parameters:</div>
                        <pre className="text-2xs overflow-x-auto text-em-text-secondary">{JSON.stringify(expA.parameters, null, 1)}</pre>
                      </div>
                      <div>
                        <div className="font-semibold text-em-warning">{expB.title}</div>
                        <div>Module: {expB.module}</div>
                        <div className="mt-1 text-em-text-muted">Parameters:</div>
                        <pre className="text-2xs overflow-x-auto text-em-text-secondary">{JSON.stringify(expB.parameters, null, 1)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 max-h-60 pr-1">
                {savedExperiments.length === 0 ? (
                  <div className="text-center text-em-text-muted py-8 text-2xs">
                    No experiments saved yet. Configure parameters and save your bench setup.
                  </div>
                ) : (
                  savedExperiments.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-2 rounded bg-em-surface border border-em-border flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-xs text-em-text-primary truncate">
                          {exp.title}
                        </div>
                        <div className="text-2xs text-em-text-muted font-mono truncate">
                          {exp.module} • {new Date(exp.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleRestore(exp)}
                          className="p-1 rounded text-em-text-secondary hover:text-em-accent hover:bg-em-surface-light transition-colors cursor-pointer"
                          title="Restore Experiment"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportExperimentCSV(exp.id)}
                          className="p-1 rounded text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
                          title="Export CSV Table"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteExperiment(exp.id)}
                          className="p-1 rounded text-em-text-muted hover:text-em-error hover:bg-em-surface-light transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
