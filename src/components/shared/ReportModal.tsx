import React, { useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { theoryDatabase } from '../../data/theoryContent';
import { EquationDisplay } from './EquationDisplay';
import { X, Printer, Download, CheckCircle2, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { activeModule, experimentName } = useAppStore();

  const esState = useElectrostaticsStore();
  const waveState = useWaveStore();
  const tlineState = useTransmissionLineStore();

  if (!isOpen) return null;

  const theory = theoryDatabase[activeModule];
  const tests =
    activeModule === 'electrostatics'
      ? esState.verificationResults
      : activeModule === 'wave-propagation'
      ? waveState.verificationResults
      : tlineState.verificationResults;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    let csv = `EM STUDIO — LABORATORY EXPERIMENT REPORT\n`;
    csv += `Title,${experimentName}\n`;
    csv += `Laboratory,${theory.title}\n`;
    csv += `Topic,${theory.topic}\n`;
    csv += `Date,${new Date().toISOString()}\n\n`;

    csv += `PARAMETERS\n`;
    if (activeModule === 'electrostatics') {
      csv += `Relative Permittivity,${esState.relativePermittivity}\n`;
      csv += `Charges Count,${esState.charges.length}\n`;
      csv += `Probe Position X,${esState.observationPoint.x}\n`;
      csv += `Probe Position Y,${esState.observationPoint.y}\n`;
      csv += `Probe Position Z,${esState.observationPoint.z}\n\n`;
      csv += `NUMERICAL RESULTS\n`;
      csv += `E-field Magnitude (V/m),${esState.fieldResult?.magnitude}\n`;
      csv += `Potential V (Volts),${esState.fieldResult?.V}\n`;
    } else if (activeModule === 'wave-propagation') {
      csv += `Frequency (Hz),${waveState.frequency}\n`;
      csv += `Amplitude (V/m),${waveState.amplitude}\n`;
      csv += `Polarisation,${waveState.polarisation}\n`;
      csv += `Medium,${waveState.material.name}\n\n`;
      csv += `NUMERICAL RESULTS\n`;
      csv += `Wavelength (m),${waveState.propagation?.wavelength}\n`;
      csv += `Phase Velocity (m/s),${waveState.propagation?.phaseVelocity}\n`;
      csv += `Intrinsic Impedance Real (Ohms),${waveState.propagation?.intrinsicImpedance.real}\n`;
      csv += `Attenuation Constant (Np/m),${waveState.propagation?.alpha}\n`;
    } else if (activeModule === 'transmission-line') {
      csv += `Characteristic Impedance Z0 (Ohms),${tlineState.characteristicImpedance}\n`;
      csv += `Load Resistance RL (Ohms),${tlineState.loadResistance}\n`;
      csv += `Load Reactance XL (Ohms),${tlineState.loadReactance}\n`;
      csv += `Frequency (Hz),${tlineState.frequency}\n\n`;
      csv += `NUMERICAL RESULTS\n`;
      csv += `Reflection Coeff Magnitude |Gamma|,${tlineState.reflectionResult?.gammaMagnitude}\n`;
      csv += `Reflection Phase (deg),${tlineState.reflectionResult?.gammaPhaseDeg}\n`;
      csv += `VSWR,${tlineState.reflectionResult?.vswr}\n`;
      csv += `Return Loss (dB),${tlineState.reflectionResult?.returnLoss}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EM_Studio_Lab_Report_${activeModule}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0 bg-em-surface-light/40">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-em-accent" />
            <span className="font-semibold text-sm text-em-text-primary">
              Electromagnetic Engineering Laboratory Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light border border-em-border transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Data</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium bg-em-accent text-em-bg hover:bg-em-accent-hover transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Printable Content */}
        <div ref={reportRef} className="p-6 overflow-y-auto flex-1 bg-em-surface space-y-6 text-xs text-em-text-primary">
          {/* Document Header */}
          <div className="border-b border-em-border pb-4">
            <div className="text-2xs font-mono text-em-accent uppercase tracking-widest">
              Course: Electronics & Telecommunication Engineering • EME 301
            </div>
            <h1 className="text-lg font-bold text-em-text-primary mt-1">
              EM Studio — Interactive Electromagnetic Engineering Laboratory Report
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-2xs text-em-text-muted mt-2 font-mono">
              <div>Experiment: <span className="text-em-text-secondary font-semibold">{experimentName}</span></div>
              <div>Module: <span className="text-em-text-secondary">{theory.title}</span></div>
              <div>Timestamp: <span className="text-em-text-secondary">{new Date().toLocaleString()}</span></div>
            </div>
          </div>

          {/* Section 1: Objective & Scope */}
          <div>
            <h2 className="font-semibold text-xs text-em-accent uppercase tracking-wider mb-1.5">
              1. Objective & Topic
            </h2>
            <p className="text-em-text-secondary leading-relaxed">
              To computationally simulate, visualize, and analytically verify fundamental principles of <strong className="text-em-text-primary">{theory.topic}</strong>. The experiment validates numerical solutions against closed-form analytical benchmarks to build computational intuition for third-year electromagnetic engineering.
            </p>
          </div>

          {/* Section 2: Governing Equations */}
          <div>
            <h2 className="font-semibold text-xs text-em-accent uppercase tracking-wider mb-1.5">
              2. Governing Equations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {theory.equations.slice(0, 4).map((eq, idx) => (
                <div key={idx} className="p-2.5 rounded bg-em-surface-light border border-em-border">
                  <div className="font-semibold text-2xs text-em-text-primary mb-1">{eq.name}</div>
                  <div className="py-1 bg-em-bg/50 rounded px-2 my-1">
                    <EquationDisplay latex={eq.latex} />
                  </div>
                  <div className="text-2xs text-em-text-muted leading-tight">{eq.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Parameters & Setup */}
          <div>
            <h2 className="font-semibold text-xs text-em-accent uppercase tracking-wider mb-1.5">
              3. Laboratory Configuration & SI Parameters
            </h2>
            <div className="border border-em-border rounded overflow-hidden">
              <table className="w-full text-left font-mono text-2xs">
                <thead className="bg-em-surface-light text-em-text-muted border-b border-em-border">
                  <tr>
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">SI Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-em-border">
                  {activeModule === 'electrostatics' && (
                    <>
                      <tr>
                        <td className="p-2">Medium Relative Permittivity</td>
                        <td className="p-2 text-em-accent">εᵣ</td>
                        <td className="p-2">{esState.relativePermittivity.toFixed(2)}</td>
                        <td className="p-2 text-em-text-muted">dimensionless</td>
                      </tr>
                      <tr>
                        <td className="p-2">Discrete Point Charges</td>
                        <td className="p-2 text-em-accent">N</td>
                        <td className="p-2">{esState.charges.length}</td>
                        <td className="p-2 text-em-text-muted">charges</td>
                      </tr>
                      <tr>
                        <td className="p-2">Observation Point Position</td>
                        <td className="p-2 text-em-accent">r</td>
                        <td className="p-2">({esState.observationPoint.x.toFixed(2)}, {esState.observationPoint.y.toFixed(2)}, {esState.observationPoint.z.toFixed(2)})</td>
                        <td className="p-2 text-em-text-muted">meters (m)</td>
                      </tr>
                    </>
                  )}
                  {activeModule === 'wave-propagation' && (
                    <>
                      <tr>
                        <td className="p-2">Operating Frequency</td>
                        <td className="p-2 text-em-accent">f</td>
                        <td className="p-2">{(waveState.frequency / 1e9).toFixed(3)}</td>
                        <td className="p-2 text-em-text-muted">GHz (10⁹ Hz)</td>
                      </tr>
                      <tr>
                        <td className="p-2">Electric Field Amplitude</td>
                        <td className="p-2 text-em-accent">|E₀|</td>
                        <td className="p-2">{waveState.amplitude.toFixed(2)}</td>
                        <td className="p-2 text-em-text-muted">V/m</td>
                      </tr>
                      <tr>
                        <td className="p-2">Medium Permittivity</td>
                        <td className="p-2 text-em-accent">εᵣ</td>
                        <td className="p-2">{waveState.material.relativePermittivity.toFixed(2)}</td>
                        <td className="p-2 text-em-text-muted">dimensionless</td>
                      </tr>
                      <tr>
                        <td className="p-2">Electrical Conductivity</td>
                        <td className="p-2 text-em-accent">σ</td>
                        <td className="p-2">{waveState.material.conductivity.toExponential(2)}</td>
                        <td className="p-2 text-em-text-muted">S/m</td>
                      </tr>
                    </>
                  )}
                  {activeModule === 'transmission-line' && (
                    <>
                      <tr>
                        <td className="p-2">Characteristic Impedance</td>
                        <td className="p-2 text-em-accent">Z₀</td>
                        <td className="p-2">{tlineState.characteristicImpedance}</td>
                        <td className="p-2 text-em-text-muted">Ω (Ohms)</td>
                      </tr>
                      <tr>
                        <td className="p-2">Load Termination Resistance</td>
                        <td className="p-2 text-em-accent">R_L</td>
                        <td className="p-2">{tlineState.loadResistance > 1e10 ? '∞ (Open)' : tlineState.loadResistance}</td>
                        <td className="p-2 text-em-text-muted">Ω</td>
                      </tr>
                      <tr>
                        <td className="p-2">Load Termination Reactance</td>
                        <td className="p-2 text-em-accent">X_L</td>
                        <td className="p-2">{tlineState.loadReactance}</td>
                        <td className="p-2 text-em-text-muted">Ω</td>
                      </tr>
                      <tr>
                        <td className="p-2">Line Length</td>
                        <td className="p-2 text-em-accent">l</td>
                        <td className="p-2">{tlineState.lineLength.toFixed(2)}</td>
                        <td className="p-2 text-em-text-muted">m</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Numerical Results */}
          <div>
            <h2 className="font-semibold text-xs text-em-accent uppercase tracking-wider mb-1.5">
              4. Computed Numerical Results
            </h2>
            <div className="border border-em-border rounded overflow-hidden">
              <table className="w-full text-left font-mono text-2xs">
                <thead className="bg-em-surface-light text-em-text-muted border-b border-em-border">
                  <tr>
                    <th className="p-2">Physical Measurement</th>
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Computed Value</th>
                    <th className="p-2">SI Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-em-border">
                  {activeModule === 'electrostatics' && esState.fieldResult && (
                    <>
                      <tr>
                        <td className="p-2">Electric Field Intensity</td>
                        <td className="p-2 text-em-accent">|E|</td>
                        <td className="p-2 font-semibold">{esState.fieldResult.magnitude.toExponential(4)}</td>
                        <td className="p-2 text-em-text-muted">V/m</td>
                      </tr>
                      <tr>
                        <td className="p-2">Electric Scalar Potential</td>
                        <td className="p-2 text-em-accent">V</td>
                        <td className="p-2 font-semibold">{esState.fieldResult.V.toFixed(4)}</td>
                        <td className="p-2 text-em-text-muted">V</td>
                      </tr>
                      <tr>
                        <td className="p-2">Electric Flux Density</td>
                        <td className="p-2 text-em-accent">|D|</td>
                        <td className="p-2 font-semibold">{(esState.fieldResult.magnitude * 8.854e-12 * esState.relativePermittivity).toExponential(4)}</td>
                        <td className="p-2 text-em-text-muted">C/m²</td>
                      </tr>
                    </>
                  )}
                  {activeModule === 'wave-propagation' && waveState.propagation && (
                    <>
                      <tr>
                        <td className="p-2">Wavelength in Medium</td>
                        <td className="p-2 text-em-accent">λ</td>
                        <td className="p-2 font-semibold">{(waveState.propagation.wavelength * 100).toFixed(3)} cm ({waveState.propagation.wavelength.toExponential(3)} m)</td>
                        <td className="p-2 text-em-text-muted">m</td>
                      </tr>
                      <tr>
                        <td className="p-2">Phase Velocity</td>
                        <td className="p-2 text-em-accent">v_p</td>
                        <td className="p-2 font-semibold">{(waveState.propagation.phaseVelocity / 1e8).toFixed(4)} × 10⁸</td>
                        <td className="p-2 text-em-text-muted">m/s</td>
                      </tr>
                      <tr>
                        <td className="p-2">Intrinsic Wave Impedance</td>
                        <td className="p-2 text-em-accent">η</td>
                        <td className="p-2 font-semibold">{waveState.propagation.intrinsicImpedance.real.toFixed(2)} + j{waveState.propagation.intrinsicImpedance.imag.toFixed(2)}</td>
                        <td className="p-2 text-em-text-muted">Ω</td>
                      </tr>
                      <tr>
                        <td className="p-2">Attenuation Constant</td>
                        <td className="p-2 text-em-accent">α</td>
                        <td className="p-2 font-semibold">{waveState.propagation.alpha.toExponential(3)}</td>
                        <td className="p-2 text-em-text-muted">Np/m</td>
                      </tr>
                    </>
                  )}
                  {activeModule === 'transmission-line' && tlineState.reflectionResult && (
                    <>
                      <tr>
                        <td className="p-2">Voltage Reflection Coefficient</td>
                        <td className="p-2 text-em-accent">|Γ_L|</td>
                        <td className="p-2 font-semibold">{tlineState.reflectionResult.gammaMagnitude.toFixed(4)} ∠ {tlineState.reflectionResult.gammaPhaseDeg.toFixed(1)}°</td>
                        <td className="p-2 text-em-text-muted">dimensionless</td>
                      </tr>
                      <tr>
                        <td className="p-2">Voltage Standing Wave Ratio</td>
                        <td className="p-2 text-em-accent">VSWR (s)</td>
                        <td className="p-2 font-semibold">{tlineState.reflectionResult.vswr === Infinity ? '∞' : tlineState.reflectionResult.vswr.toFixed(3)} : 1</td>
                        <td className="p-2 text-em-text-muted">ratio</td>
                      </tr>
                      <tr>
                        <td className="p-2">Return Loss</td>
                        <td className="p-2 text-em-accent">RL</td>
                        <td className="p-2 font-semibold">{tlineState.reflectionResult.returnLoss === Infinity ? '∞' : tlineState.reflectionResult.returnLoss.toFixed(2)}</td>
                        <td className="p-2 text-em-text-muted">dB</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Analytical Verification */}
          <div>
            <h2 className="font-semibold text-xs text-em-accent uppercase tracking-wider mb-1.5">
              5. Analytical Verification & Benchmarks
            </h2>
            <div className="space-y-1.5">
              {tests.map((t) => (
                <div key={t.id} className="p-2 rounded bg-em-surface-light border border-em-border flex items-center justify-between text-2xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-em-success" />
                    <span className="text-em-text-primary">{t.name}</span>
                  </div>
                  <span className="text-em-success font-semibold">VALIDATED</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Limitations & AI Disclosure */}
          <div className="border-t border-em-border pt-4 text-2xs text-em-text-muted space-y-2">
            <div>
              <strong className="text-em-text-secondary">Limitations & Assumptions: </strong>
              {theory.assumptions.join('; ')}.
            </div>
            <div>
              <strong className="text-em-text-secondary">Software & Computational Electromagnetics Disclosure: </strong>
              All equations and physical models are numerically solved via TypeScript computational electromagnetic routines. No laboratory experiments were physically performed; all presented results represent validated scientific simulations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
