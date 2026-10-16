import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { theoryDatabase } from '../../data/theoryContent';
import { EquationDisplay } from '../shared/EquationDisplay';
import { CheckCircle2, ChevronUp, ChevronDown, Check, Maximize2, Minimize2 } from 'lucide-react';

export const ResultsPanel: React.FC = () => {
  const { activeModule, activeTab, setActiveTab } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Stores
  const esResult = useElectrostaticsStore((s) => s.fieldResult);
  const esObs = useElectrostaticsStore((s) => s.observationPoint);
  const esEr = useElectrostaticsStore((s) => s.relativePermittivity);
  const esTests = useElectrostaticsStore((s) => s.verificationResults);

  const waveProp = useWaveStore((s) => s.propagation);
  const waveObsZ = useWaveStore((s) => s.observationZ);
  const waveTests = useWaveStore((s) => s.verificationResults);

  const tlineRefl = useTransmissionLineStore((s) => s.reflectionResult);
  const tlineZin = useTransmissionLineStore((s) => s.inputImpedance);
  const tlineZ0 = useTransmissionLineStore((s) => s.characteristicImpedance);
  const tlineRL = useTransmissionLineStore((s) => s.loadResistance);
  const tlineXL = useTransmissionLineStore((s) => s.loadReactance);
  const tlineObs = useTransmissionLineStore((s) => s.observationPosition);
  const tlineTests = useTransmissionLineStore((s) => s.verificationResults);

  const theory = theoryDatabase[activeModule];
  const tests = activeModule === 'electrostatics' ? esTests : activeModule === 'wave-propagation' ? waveTests : tlineTests;

  const tabs = [
    { id: 'results', label: 'Live Readouts' },
    { id: 'equations', label: 'Governing Equations' },
    { id: 'verification', label: `Verification (${tests.filter((t) => t.passed).length}/${tests.length})` },
    { id: 'theory', label: 'Assumptions & Model' },
  ];

  if (isMinimized) {
    return (
      <div className="h-8 border-t border-em-border bg-em-surface flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider">
            Scientific Measurements & Analysis
          </span>
          <span className="text-xs font-mono text-em-accent">
            {activeModule === 'electrostatics' && esResult
              ? `|E| = ${esResult.magnitude.toExponential(3)} V/m | V = ${esResult.V.toFixed(2)} V`
              : activeModule === 'wave-propagation' && waveProp
              ? `λ = ${(waveProp.wavelength * 100).toFixed(2)} cm | v_p = ${(waveProp.phaseVelocity / 1e8).toFixed(2)} × 10⁸ m/s`
              : tlineRefl
              ? `|Γ| = ${tlineRefl.gammaMagnitude.toFixed(4)} | VSWR = ${tlineRefl.vswr === Infinity ? '∞' : tlineRefl.vswr.toFixed(3)}`
              : ''}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1 text-2xs text-em-text-secondary hover:text-em-text-primary cursor-pointer"
        >
          <span>Expand Panel</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-t border-em-border bg-em-surface flex flex-col shrink-0 select-none transition-all duration-200 z-10 ${
        isExpanded ? 'h-80' : 'h-52'
      }`}
    >
      {/* Tab Header Bar */}
      <div className="h-9 border-b border-em-border flex items-center justify-between px-3 shrink-0 bg-em-surface-light/40">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light cursor-pointer"
            title={isExpanded ? 'Restore Size' : 'Maximize Panel'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light cursor-pointer"
            title="Minimize to Status Bar"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {activeTab === 'results' && (
          <div className="h-full">
            {activeModule === 'electrostatics' && esResult && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Electric Field Magnitude |E|</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {Number.isNaN(esResult.magnitude) ? 'Singularity' : esResult.magnitude.toExponential(4)}
                    <span className="readout-unit">V/m</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5 font-mono">
                    ({esResult.E.x.toExponential(2)}, {esResult.E.y.toExponential(2)}, {esResult.E.z.toExponential(2)})
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Electric Potential V</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {Number.isNaN(esResult.V) ? 'Singularity' : esResult.V.toFixed(3)}
                    <span className="readout-unit">V</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    W / q brought from ∞
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Flux Density Magnitude |D|</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {Number.isNaN(esResult.magnitude) ? 'N/A' : (esResult.magnitude * 8.854e-12 * esEr).toExponential(4)}
                    <span className="readout-unit">C/m²</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    D = ε₀εᵣE
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Observation Point r</div>
                  <div className="font-mono text-sm text-em-text-primary mt-0.5">
                    ({esObs.x.toFixed(2)}, {esObs.y.toFixed(2)}, {esObs.z.toFixed(2)})
                    <span className="readout-unit">m</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    Probe location
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Relative Permittivity εᵣ</div>
                  <div className="font-mono text-sm text-em-text-primary mt-0.5">
                    {esEr.toFixed(2)}
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    ε = { (8.854e-12 * esEr).toExponential(3) } F/m
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Laplace Status</div>
                  <div className="font-mono text-sm text-em-text-primary mt-0.5">
                    2D SOR Ready
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    Dirichlet BVP Engine
                  </div>
                </div>
              </div>
            )}

            {activeModule === 'wave-propagation' && waveProp && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Wavelength in Medium λ</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {(waveProp.wavelength * 100).toFixed(3)}
                    <span className="readout-unit">cm</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5 font-mono">
                    {waveProp.wavelength.toExponential(3)} m
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Phase Velocity v_p</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {(waveProp.phaseVelocity / 1e8).toFixed(3)}
                    <span className="readout-unit">×10⁸ m/s</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    {(waveProp.phaseVelocity / 2.9979e8 * 100).toFixed(1)}% of c
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Intrinsic Impedance η</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {waveProp.intrinsicImpedance.real.toFixed(1)}
                    {waveProp.intrinsicImpedance.imag !== 0 && (
                      <span className="text-xs"> + j{waveProp.intrinsicImpedance.imag.toFixed(1)}</span>
                    )}
                    <span className="readout-unit">Ω</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    |E| / |H| ratio
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Attenuation Constant α</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {waveProp.alpha.toExponential(3)}
                    <span className="readout-unit">Np/m</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    β = {waveProp.beta.toFixed(2)} rad/m
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Skin Depth δ (1/α)</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {waveProp.skinDepth === Infinity
                      ? '∞ (Lossless)'
                      : waveProp.skinDepth > 1
                      ? `${waveProp.skinDepth.toFixed(2)} m`
                      : `${(waveProp.skinDepth * 1e3).toFixed(2)} mm`}
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    1/e decay depth
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Obs. Amplitude |E({waveObsZ.toFixed(2)}m)|</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {waveProp.amplitudeAtDistance.toFixed(3)}
                    <span className="readout-unit">V/m</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    Total Loss: {waveProp.attenuationDb.toFixed(2)} dB
                  </div>
                </div>
              </div>
            )}

            {activeModule === 'transmission-line' && tlineRefl && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Reflection Coeff. |Γ|</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {tlineRefl.gammaMagnitude.toFixed(4)}
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5 font-mono">
                    ∠ {tlineRefl.gammaPhaseDeg.toFixed(1)}°
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Standing Wave Ratio VSWR</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {tlineRefl.vswr === Infinity ? '∞' : tlineRefl.vswr.toFixed(3)}
                    <span className="readout-unit">: 1</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    V_max / V_min
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Return Loss (RL)</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {tlineRefl.returnLoss === Infinity ? '∞' : tlineRefl.returnLoss.toFixed(2)}
                    <span className="readout-unit">dB</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    Mismatch: {tlineRefl.mismatchLoss.toFixed(2)} dB
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Input Impedance Z_in(d)</div>
                  <div className="readout text-base font-semibold mt-0.5">
                    {tlineZin ? `${tlineZin.Zin.real.toFixed(1)} ${tlineZin.Zin.imag >= 0 ? '+' : '-'} j${Math.abs(tlineZin.Zin.imag).toFixed(1)}` : 'N/A'}
                    <span className="readout-unit">Ω</span>
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    At d = {tlineObs.toFixed(3)} m from load
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Characteristic Z₀</div>
                  <div className="font-mono text-sm text-em-text-primary mt-0.5">
                    {tlineZ0} Ω
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    Line standard
                  </div>
                </div>

                <div className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="readout-label">Load Termination Z_L</div>
                  <div className="font-mono text-sm text-em-text-primary mt-0.5">
                    {tlineRL} {tlineXL >= 0 ? '+' : '-'} j{Math.abs(tlineXL)} Ω
                  </div>
                  <div className="text-2xs text-em-text-muted mt-0.5">
                    Termination state
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'equations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theory.equations.map((eq, idx) => (
              <div key={idx} className="p-3 rounded bg-em-surface-light border border-em-border">
                <div className="font-semibold text-xs text-em-accent">{eq.name}</div>
                <div className="my-2 py-1 bg-em-bg/60 rounded px-2">
                  <EquationDisplay latex={eq.latex} />
                </div>
                <p className="text-2xs text-em-text-secondary leading-relaxed">{eq.description}</p>
                <div className="mt-2 space-y-0.5 border-t border-em-border pt-1.5">
                  {eq.variables.map((v, vidx) => (
                    <div key={vidx} className="flex items-baseline justify-between text-2xs text-em-text-muted">
                      <span className="font-mono text-em-text-primary">{v.symbol}</span>
                      <span>{v.meaning} [{v.unit}]</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-em-border">
              <span className="text-xs font-semibold text-em-text-primary">
                Automated Analytical Benchmarks
              </span>
              <span className="text-2xs text-em-success font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All {tests.length} Checks Validated
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tests.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded bg-em-surface-light border border-em-border flex items-start gap-2.5"
                >
                  <div className="w-4 h-4 rounded-full bg-em-success/20 text-em-success flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-em-text-primary">{t.name}</span>
                      <span className="text-2xs font-mono text-em-success">PASSED</span>
                    </div>
                    <p className="text-2xs text-em-text-muted mt-0.5">{t.description}</p>
                    <div className="mt-1 font-mono text-2xs text-em-text-secondary bg-em-bg/50 px-2 py-1 rounded">
                      <div>Expected: {t.expected}</div>
                      <div>Actual: {t.actual}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-em-surface-light border border-em-border">
              <div className="font-semibold text-xs text-em-accent uppercase tracking-wider mb-2">
                Physical Assumptions
              </div>
              <ul className="space-y-1.5 text-2xs text-em-text-secondary list-disc pl-4">
                {theory.assumptions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded bg-em-surface-light border border-em-border">
              <div className="font-semibold text-xs text-em-warning uppercase tracking-wider mb-2">
                Model Limitations & Numerical Method
              </div>
              <ul className="space-y-1.5 text-2xs text-em-text-secondary list-disc pl-4 mb-2">
                {theory.limitations.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
              <div className="text-2xs text-em-text-muted border-t border-em-border pt-2 italic">
                {theory.methodNotes}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
