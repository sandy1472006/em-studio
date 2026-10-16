import React from 'react';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { ElectrostaticsViewMode } from '../../types/electrostatics';
import { Plus, Trash2, Sliders, Layers, Eye, Grid, Globe } from 'lucide-react';

interface ElectrostaticsControlsProps {
  onOpenLaplace: () => void;
}

export const ElectrostaticsControls: React.FC<ElectrostaticsControlsProps> = ({
  onOpenLaplace,
}) => {
  const charges = useElectrostaticsStore((s) => s.charges);
  const selectedId = useElectrostaticsStore((s) => s.selectedChargeId);
  const addCharge = useElectrostaticsStore((s) => s.addCharge);
  const removeCharge = useElectrostaticsStore((s) => s.removeCharge);
  const updateCharge = useElectrostaticsStore((s) => s.updateCharge);
  const selectCharge = useElectrostaticsStore((s) => s.selectCharge);

  const observationPoint = useElectrostaticsStore((s) => s.observationPoint);
  const setObservationPoint = useElectrostaticsStore((s) => s.setObservationPoint);

  const relativePermittivity = useElectrostaticsStore((s) => s.relativePermittivity);
  const setRelativePermittivity = useElectrostaticsStore((s) => s.setRelativePermittivity);
  const mediumName = useElectrostaticsStore((s) => s.mediumName);

  const viewMode = useElectrostaticsStore((s) => s.viewMode);
  const setViewMode = useElectrostaticsStore((s) => s.setViewMode);

  const fieldLineCount = useElectrostaticsStore((s) => s.fieldLineCount);
  const setFieldLineCount = useElectrostaticsStore((s) => s.setFieldLineCount);

  const showGrid = useElectrostaticsStore((s) => s.showGrid);
  const setShowGrid = useElectrostaticsStore((s) => s.setShowGrid);
  const showAxes = useElectrostaticsStore((s) => s.showAxes);
  const setShowAxes = useElectrostaticsStore((s) => s.setShowAxes);
  const showLegend = useElectrostaticsStore((s) => s.showLegend);
  const setShowLegend = useElectrostaticsStore((s) => s.setShowLegend);

  const selectedCharge = charges.find((c) => c.id === selectedId) || charges[0];

  const handleAddCharge = (sign: number) => {
    const id = `q${Date.now()}`;
    const newCharge = {
      id,
      position: { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5, z: 0 },
      charge: sign * 1e-9,
      label: `Q_${charges.length + 1} (${sign > 0 ? '+1' : '-1'} nC)`,
    };
    addCharge(newCharge);
  };

  return (
    <div className="w-80 bg-em-surface border-l border-em-border flex flex-col h-full shrink-0 select-none overflow-y-auto text-xs">
      {/* Panel Header */}
      <div className="p-3 border-b border-em-border flex items-center justify-between">
        <span className="font-semibold text-xs text-em-text-primary uppercase tracking-wider">
          Parameters & Controls
        </span>
        <button
          onClick={onOpenLaplace}
          className="px-2 py-0.5 rounded text-2xs font-medium text-em-accent bg-em-accent/10 border border-em-accent/30 hover:bg-em-accent/20 transition-colors cursor-pointer"
        >
          Laplace Solver
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* View Mode Selector */}
        <div>
          <label className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider block mb-1.5">
            Scientific Visualisation Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'combined' as ElectrostaticsViewMode, label: 'Combined View' },
              { id: 'field-lines' as ElectrostaticsViewMode, label: 'Field Lines' },
              { id: 'potential-map' as ElectrostaticsViewMode, label: 'Potential Map' },
              { id: 'field-vectors' as ElectrostaticsViewMode, label: 'Charge Topology' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`py-1.5 px-2 rounded text-2xs font-medium text-center border transition-all cursor-pointer ${
                  viewMode === mode.id
                    ? 'bg-em-accent/15 border-em-accent text-em-accent'
                    : 'bg-em-surface-light border-em-border text-em-text-secondary hover:text-em-text-primary'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Charge Management */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
              Point Charges ({charges.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAddCharge(1)}
                className="px-1.5 py-0.5 rounded text-2xs font-medium bg-[#E57373]/20 text-[#E57373] border border-[#E57373]/40 hover:bg-[#E57373]/30 transition-colors cursor-pointer"
                title="Add Positive Charge"
              >
                + Q
              </button>
              <button
                onClick={() => handleAddCharge(-1)}
                className="px-1.5 py-0.5 rounded text-2xs font-medium bg-[#64B5F6]/20 text-[#64B5F6] border border-[#64B5F6]/40 hover:bg-[#64B5F6]/30 transition-colors cursor-pointer"
                title="Add Negative Charge"
              >
                − Q
              </button>
            </div>
          </div>

          {/* Charge selector tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {charges.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCharge(c.id)}
                className={`px-2 py-0.5 rounded text-2xs font-mono border whitespace-nowrap cursor-pointer transition-colors ${
                  c.id === selectedId
                    ? 'bg-em-accent/20 border-em-accent text-em-accent font-semibold'
                    : 'bg-em-surface border-em-border text-em-text-muted hover:text-em-text-primary'
                }`}
              >
                {c.charge > 0 ? '+' : '−'}
                {(Math.abs(c.charge) * 1e9).toFixed(1)} nC
              </button>
            ))}
          </div>

          {selectedCharge && (
            <div className="space-y-2 pt-1 border-t border-em-border/70">
              <div className="flex items-center justify-between">
                <span className="text-2xs text-em-text-secondary">Charge Magnitude</span>
                <span className="font-mono text-2xs text-em-accent">
                  {(selectedCharge.charge * 1e9).toFixed(2)} nC
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={selectedCharge.charge * 1e9}
                onChange={(e) =>
                  updateCharge(selectedCharge.id, { charge: parseFloat(e.target.value) * 1e-9 })
                }
                className="w-full"
              />

              {/* Position Inputs */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div>
                  <label className="text-2xs text-em-text-muted block">X (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedCharge.position.x}
                    onChange={(e) =>
                      updateCharge(selectedCharge.id, {
                        position: { ...selectedCharge.position, x: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block">Y (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedCharge.position.y}
                    onChange={(e) =>
                      updateCharge(selectedCharge.id, {
                        position: { ...selectedCharge.position, y: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block">Z (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedCharge.position.z}
                    onChange={(e) =>
                      updateCharge(selectedCharge.id, {
                        position: { ...selectedCharge.position, z: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full text-center"
                  />
                </div>
              </div>

              {charges.length > 1 && (
                <button
                  onClick={() => removeCharge(selectedCharge.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-2xs text-em-error hover:bg-em-error/10 border border-em-error/30 rounded transition-colors cursor-pointer mt-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Selected Charge</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Observation Probe Coordinates */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-warning uppercase tracking-wider">
              Observation Probe (r)
            </span>
            <span className="text-2xs font-mono text-em-text-muted">Field Inspection</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-2xs text-em-text-muted block">X (m)</label>
              <input
                type="number"
                step="0.05"
                value={observationPoint.x}
                onChange={(e) =>
                  setObservationPoint({ ...observationPoint, x: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-center"
              />
            </div>
            <div>
              <label className="text-2xs text-em-text-muted block">Y (m)</label>
              <input
                type="number"
                step="0.05"
                value={observationPoint.y}
                onChange={(e) =>
                  setObservationPoint({ ...observationPoint, y: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-center"
              />
            </div>
            <div>
              <label className="text-2xs text-em-text-muted block">Z (m)</label>
              <input
                type="number"
                step="0.05"
                value={observationPoint.z}
                onChange={(e) =>
                  setObservationPoint({ ...observationPoint, z: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-center"
              />
            </div>
          </div>
        </div>

        {/* Relative Permittivity (Dielectric Medium) */}
        <div className="p-2.5 rounded bg-em-surface-light border border-em-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
              Dielectric Medium
            </span>
            <span className="font-mono text-2xs text-em-accent">
              εᵣ = {relativePermittivity.toFixed(2)}
            </span>
          </div>
          <div className="text-2xs text-em-text-muted">{mediumName}</div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.1"
            value={relativePermittivity}
            onChange={(e) => setRelativePermittivity(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex items-center gap-1">
            {[
              { name: 'Vacuum (1.0)', val: 1.0 },
              { name: 'Poly (2.25)', val: 2.25 },
              { name: 'Glass (4.0)', val: 4.0 },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => setRelativePermittivity(p.val)}
                className="flex-1 py-0.5 rounded text-2xs bg-em-surface border border-em-border text-em-text-secondary hover:text-em-text-primary hover:border-em-accent/40 cursor-pointer transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Numerical Field Line Resolution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-em-text-secondary">Field Lines per Charge</span>
            <span className="font-mono text-2xs text-em-text-primary">{fieldLineCount}</span>
          </div>
          <input
            type="range"
            min="8"
            max="24"
            step="2"
            value={fieldLineCount}
            onChange={(e) => setFieldLineCount(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Display Toggles */}
        <div className="pt-2 border-t border-em-border space-y-1.5">
          <div className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider mb-1">
            Display Elements
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Coordinate Ground Grid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Reference Coordinate Axes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
            <input
              type="checkbox"
              checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)}
              className="rounded bg-em-surface-light border-em-border text-em-accent"
            />
            <span>Scientific Physical Legend</span>
          </label>
        </div>
      </div>
    </div>
  );
};
