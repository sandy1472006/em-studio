import React from 'react';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { transmissionLinePresets } from '../../engine/transmissionLine/presets';
import { Sliders, Activity, RefreshCw } from 'lucide-react';

interface TLineControlsProps {
  onOpenPlots: () => void;
}

export const TLineControls: React.FC<TLineControlsProps> = ({ onOpenPlots }) => {
  const {
    characteristicImpedance,
    setCharacteristicImpedance,
    loadResistance,
    setLoadResistance,
    loadReactance,
    setLoadReactance,
    frequency,
    setFrequency,
    lineLength,
    setLineLength,
    incidentAmplitude,
    setIncidentAmplitude,
    observationPosition,
    setObservationPosition,
    loadPreset,
    reflectionResult,
  } = useTransmissionLineStore();

  return (
    <div className="w-80 bg-em-surface border-l border-em-border flex flex-col h-full shrink-0 select-none overflow-y-auto text-xs">
      {/* Header */}
      <div className="p-3 border-b border-em-border flex items-center justify-between">
        <span className="font-semibold text-xs text-em-text-primary uppercase tracking-wider">
          Line & Load Parameters
        </span>
        <button
          onClick={onOpenPlots}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium text-em-accent bg-em-accent/10 border border-em-accent/30 hover:bg-em-accent/20 transition-colors cursor-pointer"
        >
          <Activity className="w-3 h-3" />
          <span>Standing Wave Plots</span>
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Bench Presets */}
        <div>
          <label className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider block mb-1.5">
            Load Termination Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {transmissionLinePresets.map((p) => {
              const isMatched = p.id === 'matched-load' && loadResistance === 50 && loadReactance === 0;
              const isOpen = p.id === 'open-circuit' && loadResistance > 1e10;
              const isShort = p.id === 'short-circuit' && loadResistance === 0 && loadReactance === 0;
              const isMismatch = p.id === 'resistive-mismatch' && loadResistance === 100 && loadReactance === 0;
              const isComplex = p.id === 'complex-load' && loadResistance === 75 && loadReactance === 50;
              const active = isMatched || isOpen || isShort || isMismatch || isComplex;

              return (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p.id)}
                  className={`py-1.5 px-2 rounded text-2xs font-medium text-center border transition-all cursor-pointer truncate ${
                    active
                      ? 'bg-em-accent/15 border-em-accent text-em-accent'
                      : 'bg-em-surface-light border-em-border text-em-text-secondary hover:text-em-text-primary'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Characteristic Impedance Z0 */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
              Line Characteristic Z₀
            </span>
            <span className="font-mono text-2xs text-em-accent">{characteristicImpedance} Ω</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[50, 75, 100].map((val) => (
              <button
                key={val}
                onClick={() => setCharacteristicImpedance(val)}
                className={`py-1 rounded text-2xs font-mono border transition-colors cursor-pointer ${
                  characteristicImpedance === val
                    ? 'bg-em-accent/20 border-em-accent text-em-accent font-semibold'
                    : 'bg-em-surface border-em-border text-em-text-secondary hover:text-em-text-primary'
                }`}
              >
                {val} Ω
              </button>
            ))}
          </div>
        </div>

        {/* Complex Load Impedance ZL = RL + jXL */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
              Load Impedance (Z_L)
            </span>
            <span className="font-mono text-2xs text-em-accent">
              {loadResistance > 1e10 ? '∞' : `${loadResistance.toFixed(0)}Ω`}
              {loadResistance < 1e10 && loadReactance !== 0 && (
                <span> {loadReactance >= 0 ? '+' : '-'} j{Math.abs(loadReactance).toFixed(0)}Ω</span>
              )}
            </span>
          </div>

          {/* Real part R_L */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Resistance (R_L)</span>
              <span className="font-mono text-2xs text-em-text-muted">
                {loadResistance > 1e10 ? 'Open Circuit' : `${loadResistance} Ω`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={loadResistance > 200 ? 200 : loadResistance}
              onChange={(e) => setLoadResistance(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center gap-1 mt-1">
              {[
                { name: 'Short (0Ω)', r: 0 },
                { name: '50Ω', r: 50 },
                { name: '100Ω', r: 100 },
                { name: 'Open (∞)', r: 1e15 },
              ].map((b) => (
                <button
                  key={b.name}
                  onClick={() => setLoadResistance(b.r)}
                  className="flex-1 py-0.5 rounded text-2xs bg-em-surface border border-em-border text-em-text-secondary hover:text-em-text-primary cursor-pointer transition-colors"
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Imaginary part X_L */}
          <div className="space-y-1 pt-2 border-t border-em-border/70">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Reactance (X_L)</span>
              <span className="font-mono text-2xs text-em-text-muted">
                {loadReactance > 0 ? `+j${loadReactance} Ω (Inductive)` : loadReactance < 0 ? `-j${Math.abs(loadReactance)} Ω (Capacitive)` : '0 Ω (Purely Resistive)'}
              </span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={loadReactance}
              onChange={(e) => setLoadReactance(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Operating Frequency & Line Length */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Frequency (f)</span>
              <span className="font-mono text-2xs text-em-accent">
                {frequency >= 1e9 ? `${(frequency / 1e9).toFixed(2)} GHz` : `${(frequency / 1e6).toFixed(0)} MHz`}
              </span>
            </div>
            <input
              type="range"
              min="100000000"
              max="3000000000"
              step="50000000"
              value={frequency}
              onChange={(e) => setFrequency(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1 pt-2 border-t border-em-border/70">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Line Length (l)</span>
              <span className="font-mono text-2xs text-em-accent">{lineLength.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={lineLength}
              onChange={(e) => setLineLength(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1 pt-2 border-t border-em-border/70">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Generator Amplitude (V₀⁺)</span>
              <span className="font-mono text-2xs text-em-accent">{incidentAmplitude.toFixed(0)} V</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={incidentAmplitude}
              onChange={(e) => setIncidentAmplitude(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Observation Probe Position (d from load) */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-warning uppercase tracking-wider">
              Impedance Probe Position (d)
            </span>
            <span className="font-mono text-2xs text-em-warning">
              {observationPosition.toFixed(3)} m
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={lineLength}
            step="0.01"
            value={observationPosition}
            onChange={(e) => setObservationPosition(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-2xs text-em-text-muted">
            Distance from load towards source (d = 0 is load, d = l is generator).
          </div>
        </div>
      </div>
    </div>
  );
};
