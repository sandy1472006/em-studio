import React from 'react';
import { useWaveStore } from '../../stores/waveStore';
import { PolarisationType, MaterialProperties } from '../../types/wave';
import { materialPresets } from '../../engine/wave/materials';
import { Play, Pause, RotateCcw, Sliders, Activity, Eye, Zap } from 'lucide-react';

interface WaveControlsProps {
  onOpenPlots: () => void;
}

export const WaveControls: React.FC<WaveControlsProps> = ({ onOpenPlots }) => {
  const {
    frequency,
    setFrequency,
    amplitude,
    setAmplitude,
    polarisation,
    setPolarisation,
    axRatio,
    setAxRatio,
    phaseDifference,
    setPhaseDifference,
    material,
    setMaterial,
    setMaterialProperty,
    observationZ,
    setObservationZ,
    animationSpeed,
    setAnimationSpeed,
    isPlaying,
    setIsPlaying,
    showPoynting,
    setShowPoynting,
    showGrid,
    setShowGrid,
    showAxes,
    setShowAxes,
    showLegend,
    setShowLegend,
  } = useWaveStore();

  const handleMaterialPreset = (presetKey: string) => {
    const preset = materialPresets[presetKey];
    if (preset) {
      setMaterial(preset);
    }
  };

  return (
    <div className="w-80 bg-em-surface border-l border-em-border flex flex-col h-full shrink-0 select-none overflow-y-auto text-xs">
      {/* Header */}
      <div className="p-3 border-b border-em-border flex items-center justify-between">
        <span className="font-semibold text-xs text-em-text-primary uppercase tracking-wider">
          Wave Parameters
        </span>
        <button
          onClick={onOpenPlots}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium text-em-accent bg-em-accent/10 border border-em-accent/30 hover:bg-em-accent/20 transition-colors cursor-pointer"
        >
          <Activity className="w-3 h-3" />
          <span>Scientific Plots</span>
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Playback & Animation Speed */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
              Time Evolution
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-em-accent text-em-bg hover:bg-em-accent-hover transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-em-bg" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-muted">Animation Speed</span>
              <span className="font-mono text-2xs text-em-accent">{animationSpeed.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Polarisation Selector */}
        <div>
          <label className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider block mb-1.5">
            Polarisation Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'linear' as PolarisationType, label: 'Linear' },
              { id: 'circular-rh' as PolarisationType, label: 'Circular (RH)' },
              { id: 'circular-lh' as PolarisationType, label: 'Circular (LH)' },
              { id: 'elliptical' as PolarisationType, label: 'Elliptical' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPolarisation(p.id)}
                className={`py-1.5 px-2 rounded text-2xs font-medium text-center border transition-all cursor-pointer ${
                  polarisation === p.id
                    ? 'bg-em-accent/15 border-em-accent text-em-accent'
                    : 'bg-em-surface-light border-em-border text-em-text-secondary hover:text-em-text-primary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Elliptical extra controls */}
          {polarisation === 'elliptical' && (
            <div className="p-2.5 rounded bg-em-surface-light border border-em-border mt-2 space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-em-text-secondary">Axial Ratio (Ey / Ex)</span>
                  <span className="font-mono text-2xs text-em-accent">{axRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={axRatio}
                  onChange={(e) => setAxRatio(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-em-text-secondary">Phase Difference (φ)</span>
                  <span className="font-mono text-2xs text-em-accent">
                    {((phaseDifference * 180) / Math.PI).toFixed(0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step={Math.PI / 36}
                  value={phaseDifference}
                  onChange={(e) => setPhaseDifference(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Operating Frequency & Amplitude */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Frequency (f)</span>
              <span className="font-mono text-2xs text-em-accent">
                {frequency >= 1e9
                  ? `${(frequency / 1e9).toFixed(2)} GHz`
                  : `${(frequency / 1e6).toFixed(0)} MHz`}
              </span>
            </div>
            <input
              type="range"
              min="100000000"
              max="5000000000"
              step="100000000"
              value={frequency}
              onChange={(e) => setFrequency(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center gap-1 mt-1">
              {[
                { name: '500 MHz', val: 5e8 },
                { name: '1 GHz', val: 1e9 },
                { name: '2.4 GHz', val: 2.4e9 },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => setFrequency(p.val)}
                  className="flex-1 py-0.5 rounded text-2xs bg-em-surface border border-em-border text-em-text-secondary hover:text-em-text-primary hover:border-em-accent/40 cursor-pointer transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-em-border/70">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-em-text-secondary">Electric Field Amplitude |E₀|</span>
              <span className="font-mono text-2xs text-em-accent">{amplitude.toFixed(1)} V/m</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="10.0"
              step="0.2"
              value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Material Selection */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
              Propagation Medium
            </span>
            <span className="font-mono text-2xs text-em-accent truncate max-w-[120px]">
              {material.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'free-space', name: 'Free Space' },
              { id: 'lossless-dielectric', name: 'Lossless Glass' },
              { id: 'lossy-dielectric', name: 'Wet Earth (Lossy)' },
              { id: 'good-conductor', name: 'Copper (Conductor)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleMaterialPreset(m.id)}
                className={`py-1 px-1.5 rounded text-2xs text-center border transition-colors cursor-pointer truncate ${
                  material.type === m.id
                    ? 'bg-em-accent/15 border-em-accent text-em-accent font-medium'
                    : 'bg-em-surface border-em-border text-em-text-secondary hover:text-em-text-primary'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Advanced Material Properties */}
          <div className="pt-2 border-t border-em-border/70 space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-2xs text-em-text-muted block">εᵣ (Perm.)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={material.relativePermittivity}
                  onChange={(e) =>
                    setMaterialProperty('relativePermittivity', parseFloat(e.target.value) || 1)
                  }
                  className="w-full text-center"
                />
              </div>
              <div>
                <label className="text-2xs text-em-text-muted block">μᵣ (Permeab.)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={material.relativePermeability}
                  onChange={(e) =>
                    setMaterialProperty('relativePermeability', parseFloat(e.target.value) || 1)
                  }
                  className="w-full text-center"
                />
              </div>
              <div>
                <label className="text-2xs text-em-text-muted block">σ (S/m)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={material.conductivity}
                  onChange={(e) =>
                    setMaterialProperty('conductivity', parseFloat(e.target.value) || 0)
                  }
                  className="w-full text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Observation Probe Distance */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-warning uppercase tracking-wider">
              Observation Plane (z)
            </span>
            <span className="font-mono text-2xs text-em-warning">{observationZ.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.02"
            value={observationZ}
            onChange={(e) => setObservationZ(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Display Toggles */}
        <div className="pt-2 border-t border-em-border space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showPoynting}
              onChange={(e) => setShowPoynting(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Poynting Power Vector S = E × H</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Reference Grid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Coordinate Triad (x, y, z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Vector Color Legend</span>
          </label>
        </div>
      </div>
    </div>
  );
};
