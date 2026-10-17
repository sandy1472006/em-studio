import React, { useState } from 'react';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { Plus, Trash2, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

interface ElectrostaticsControlsProps {
  onOpenLaplace?: () => void;
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

  const fieldResult = useElectrostaticsStore((s) => s.fieldResult);
  const reset = useElectrostaticsStore((s) => s.reset);
  const fieldType = useElectrostaticsStore((s) => s.fieldType ?? 'electric');
  const setFieldType = useElectrostaticsStore((s) => s.setFieldType);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleAddCharge = () => {
    const id = `q${Date.now()}`;
    const sign = charges.length % 2 === 0 ? 1 : -1;
    const offset = (charges.length * 0.3) % 1.2;
    addCharge({
      id,
      position: { x: (Math.random() - 0.5) * 1.0, y: offset, z: 0 },
      charge: sign * 1e-9,
      label: `Charge ${charges.length + 1} (q${charges.length + 1})`,
    });
  };

  const handleUseCharge1 = () => {
    if (charges[0]) {
      setObservationPoint({
        x: charges[0].position.x,
        y: charges[0].position.y + 0.5,
        z: charges[0].position.z + 0.5,
      });
    }
  };

  const mediaList = [
    { name: 'Free space (vacuum)', er: 1.0 },
    { name: 'Air (STP)', er: 1.0006 },
    { name: 'Teflon (PTFE)', er: 2.1 },
    { name: 'Silicon Dioxide', er: 3.9 },
    { name: 'Distilled Water', er: 80.0 },
  ];

  return (
    <div className="w-80 bg-[#0B0F17] border-l border-[#1E293B] flex flex-col h-full shrink-0 select-none overflow-y-auto text-xs text-[#E2E8F0]">
      {/* Panel Top Header */}
      <div className="h-11 px-4 border-b border-[#1E293B] flex items-center justify-between shrink-0 bg-[#0E1522]/60">
        <span className="font-semibold text-sm text-white tracking-wide">
          Parameters
        </span>
        <button
          onClick={reset}
          className="px-2.5 py-1 rounded text-2xs font-medium text-[#94A3B8] hover:text-white bg-[#1E293B]/60 hover:bg-[#1E293B] border border-[#334155]/60 transition-colors cursor-pointer flex items-center gap-1"
          title="Reset to default electric dipole"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Field Type Selector: Electric vs Magnetic */}
        <div>
          <label className="text-2xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
            Field Type
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-0.5 rounded-lg bg-[#0E1522] border border-[#1E293B]">
            <button
              onClick={() => setFieldType?.('electric')}
              className={`py-1 text-2xs font-medium rounded-md transition-all cursor-pointer ${
                fieldType === 'electric'
                  ? 'bg-em-accent/20 border border-em-accent text-em-accent font-semibold shadow-xs'
                  : 'text-[#94A3B8] hover:text-white border border-transparent'
              }`}
            >
              Electric Field (E)
            </button>
            <button
              onClick={() => setFieldType?.('magnetic')}
              className={`py-1 text-2xs font-medium rounded-md transition-all cursor-pointer ${
                fieldType === 'magnetic'
                  ? 'bg-em-accent/20 border border-em-accent text-em-accent font-semibold shadow-xs'
                  : 'text-[#94A3B8] hover:text-white border border-transparent'
              }`}
            >
              Magnetic Field (B)
            </button>
          </div>
        </div>

        {/* Section 1: Medium */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-2xs font-semibold text-[#64748B] uppercase tracking-wider">
              Medium
            </span>
            <span className="text-2xs font-mono text-em-accent">
              εᵣ = {relativePermittivity.toFixed(2)}
            </span>
          </div>
          <select
            value={mediumName}
            onChange={(e) => {
              const selected = mediaList.find((m) => m.name === e.target.value);
              if (selected) {
                setRelativePermittivity(selected.er);
              }
            }}
            className="w-full bg-[#141C2A] border border-[#283548] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-em-accent cursor-pointer"
          >
            {mediaList.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Section 2: Charges / Sources List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-semibold text-[#64748B] uppercase tracking-wider">
              {fieldType === 'electric' ? 'Charges' : 'Magnetic Poles'}
            </span>
            <button
              onClick={handleAddCharge}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium text-em-accent hover:text-white bg-em-accent/10 hover:bg-em-accent/25 border border-em-accent/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add {fieldType === 'electric' ? 'Charge' : 'Pole'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {charges.map((charge, idx) => {
              const isPos = charge.charge >= 0;
              const isSelected = charge.id === selectedId;
              const chargeNano = charge.charge * 1e9;

              return (
                <div
                  key={charge.id}
                  onClick={() => selectCharge(charge.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141C2A] border-em-accent/50 shadow-md'
                      : 'bg-[#0E1522] border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  {/* Charge Header Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isPos ? 'bg-[#EF4444]' : 'bg-[#3B82F6]'
                        }`}
                      />
                      <span className="text-xs font-medium text-white">
                        {fieldType === 'electric' ? `Charge ${idx + 1} (q${idx + 1})` : `Pole ${idx + 1} (m${idx + 1})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        value={chargeNano}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateCharge(charge.id, { charge: val * 1e-9 });
                        }}
                        className="w-16 bg-[#1A2333] border border-[#2E3C50] rounded px-1.5 py-0.5 text-right font-mono text-xs text-white"
                      />
                      <span className="text-2xs font-mono text-[#94A3B8]">
                        {fieldType === 'electric' ? 'nC' : 'A·m'}
                      </span>

                      {charges.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCharge(charge.id);
                          }}
                          className="p-1 rounded text-[#64748B] hover:text-[#EF4444] transition-colors ml-1 cursor-pointer"
                          title="Remove Charge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Position Coordinates Row */}
                  <div className="flex items-center justify-between text-2xs text-[#94A3B8]">
                    <span>Position (m)</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['x', 'y', 'z'].map((axis) => (
                        <input
                          key={axis}
                          type="number"
                          step="0.05"
                          value={(charge.position as any)[axis]}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateCharge(charge.id, {
                              position: {
                                ...charge.position,
                                [axis]: val,
                              },
                            });
                          }}
                          className="w-13 bg-[#1A2333] border border-[#2E3C50] rounded px-1 py-0.5 text-center font-mono text-2xs text-white"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Observation Point */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
              <span className="text-xs font-semibold text-white">Point P</span>
            </div>
            <button
              onClick={handleUseCharge1}
              className="px-2 py-0.5 rounded text-2xs font-medium text-[#94A3B8] hover:text-white bg-[#141C2A] border border-[#283548] transition-colors cursor-pointer"
            >
              Use Charge 1
            </button>
          </div>

          {/* Position Coordinates */}
          <div className="flex items-center justify-between text-2xs text-[#94A3B8] mb-2.5">
            <span>Position (m)</span>
            <div className="grid grid-cols-3 gap-1">
              {['x', 'y', 'z'].map((axis) => (
                <input
                  key={axis}
                  type="number"
                  step="0.05"
                  value={(observationPoint as any)[axis]}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setObservationPoint({
                      ...observationPoint,
                      [axis]: val,
                    });
                  }}
                  className="w-13 bg-[#141C2A] border border-[#283548] rounded px-1 py-0.5 text-center font-mono text-2xs text-white"
                />
              ))}
            </div>
          </div>

          {/* Live Measurement Summary Box */}
          <div className="p-3 rounded-lg bg-[#0E1522] border border-[#1E293B] space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">
                {fieldType === 'electric' ? 'Electric field |E|' : 'Magnetic flux |B|'}
              </span>
              <div className="flex items-baseline gap-1 text-white font-medium">
                <span>
                  {fieldResult ? (fieldResult.magnitude).toExponential(2).replace('e+', ' × 10^') : '0.00'}
                </span>
                <span className="text-2xs text-[#94A3B8] font-sans">
                  {fieldType === 'electric' ? 'V/m' : 'T'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">
                {fieldType === 'electric' ? 'Electric potential V' : 'Vector potential |A|'}
              </span>
              <div className="flex items-baseline gap-1 text-white font-medium">
                <span>
                  {fieldResult ? fieldResult.V.toFixed(2) : '0.00'}
                </span>
                <span className="text-2xs text-[#94A3B8] font-sans">
                  {fieldType === 'electric' ? 'V' : 'Wb/m'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">
                {fieldType === 'electric' ? 'Flux density D' : 'Magnetic intensity H'}
              </span>
              <div className="flex items-baseline gap-1 text-white font-medium">
                <span>
                  {fieldResult
                    ? (fieldResult.magnitude * 8.854e-12 * relativePermittivity).toExponential(2).replace('e+', ' × 10^')
                    : '0.00'}
                </span>
                <span className="text-2xs text-[#94A3B8] font-sans">
                  {fieldType === 'electric' ? 'C/m²' : 'A/m'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Collapsible Advanced Settings */}
        <div className="pt-1">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-1 text-2xs text-[#64748B] hover:text-white transition-colors cursor-pointer"
          >
            {isAdvancedOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Advanced Settings</span>
          </button>

          {isAdvancedOpen && (
            <div className="mt-2.5 p-3 rounded-lg bg-[#0E1522] border border-[#1E293B] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xs text-[#94A3B8]">2D Dirichlet Laplace Solver</span>
                {onOpenLaplace && (
                  <button
                    onClick={onOpenLaplace}
                    className="px-2 py-0.5 rounded text-2xs font-medium text-em-accent bg-em-accent/10 border border-em-accent/30 hover:bg-em-accent/20 cursor-pointer"
                  >
                    Open Solver
                  </button>
                )}
              </div>
              <div className="text-2xs text-[#64748B] leading-relaxed">
                Calculates finite difference Gauss-Seidel / SOR electrostatic potential solutions on a structured mesh.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
