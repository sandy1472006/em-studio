import React, { useState, useMemo } from 'react';
import { useWaveStore } from '../../stores/waveStore';
import { getEFieldComponents, getHFieldComponents } from '../../engine/wave/polarisation';
import { X, Activity, Maximize2, Download } from 'lucide-react';

interface WavePlotsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WavePlots: React.FC<WavePlotsProps> = ({ isOpen, onClose }) => {
  const [selectedPlot, setSelectedPlot] = useState<'spatial' | 'polarisation' | 'attenuation'>('spatial');

  const {
    frequency,
    amplitude,
    polarisation,
    axRatio,
    phaseDifference,
    propagation,
    material,
    observationZ,
  } = useWaveStore();

  if (!isOpen) return null;

  const alpha = propagation?.alpha ?? 0;
  const beta = propagation?.beta ?? 1;
  const omega = 2 * Math.PI * frequency;

  // 1. Spatial profile data: E(z) at t=0
  const spatialPoints = useMemo(() => {
    const pts = [];
    const num = 100;
    const zMax = 1.0; // 1 meter
    for (let i = 0; i <= num; i++) {
      const z = (i / num) * zMax;
      const { Ex, Ey } = getEFieldComponents(
        polarisation,
        amplitude,
        axRatio,
        phaseDifference,
        0,
        beta,
        0,
        z,
        alpha
      );
      pts.push({ z, Ex, Ey, total: Math.hypot(Ex, Ey) });
    }
    return pts;
  }, [polarisation, amplitude, axRatio, phaseDifference, beta, alpha]);

  // 2. Polarisation hodograph data: Ex vs Ey over one full optical cycle
  const polarisationPoints = useMemo(() => {
    const pts = [];
    const num = 72;
    for (let i = 0; i <= num; i++) {
      const t = (i / num) * (2 * Math.PI / omega);
      const { Ex, Ey } = getEFieldComponents(
        polarisation,
        amplitude,
        axRatio,
        phaseDifference,
        omega,
        beta,
        t,
        observationZ,
        alpha
      );
      pts.push({ Ex, Ey });
    }
    return pts;
  }, [polarisation, amplitude, axRatio, phaseDifference, omega, beta, observationZ, alpha]);

  // 3. Attenuation profile data: |E(z)| = E0 * exp(-alpha * z)
  const attenuationPoints = useMemo(() => {
    const pts = [];
    const num = 80;
    const zMax = Math.max(1.0, (propagation?.skinDepth ?? 1) * 3);
    for (let i = 0; i <= num; i++) {
      const z = (i / num) * zMax;
      const mag = amplitude * Math.exp(-alpha * z);
      pts.push({ z, mag });
    }
    return pts;
  }, [amplitude, alpha, propagation]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-em-text-primary">
              Scientific Waveform & Polarisation Analysis
            </span>
            <span className="text-2xs font-mono text-em-accent bg-em-accent/10 px-2 py-0.5 rounded border border-em-accent/30">
              Analytical Curves
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plot Selector Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-em-border bg-em-surface-light/40">
          {[
            { id: 'spatial', label: 'E(z) Spatial Distribution' },
            { id: 'polarisation', label: 'Polarisation Trajectory (Ex vs Ey)' },
            { id: 'attenuation', label: 'Attenuation & Skin Depth Envelope' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPlot(tab.id as any)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                selectedPlot === tab.id
                  ? 'bg-em-accent/15 border-em-accent text-em-accent'
                  : 'bg-em-surface border-em-border text-em-text-secondary hover:text-em-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plot View Area */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[350px]">
          {selectedPlot === 'spatial' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-2xs text-em-text-muted mb-2 font-mono">
                <span>E-field Components vs Distance z [m] at t = 0</span>
                <span className="text-em-accent">λ = {(propagation?.wavelength ? propagation.wavelength * 100 : 30).toFixed(2)} cm</span>
              </div>
              <div className="w-full h-64 bg-em-surface-light border border-em-border rounded p-3 relative flex items-center justify-center">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#283341" strokeDasharray="3,3" />
                  <line x1="50" y1="100" x2="480" y2="100" stroke="#354559" strokeWidth="1.5" />
                  <line x1="480" y1="20" x2="480" y2="180" stroke="#283341" strokeDasharray="3,3" />

                  {/* Ex curve (Cyan) */}
                  <polyline
                    fill="none"
                    stroke="#55C8DD"
                    strokeWidth="2"
                    points={spatialPoints
                      .map((p) => {
                        const x = 50 + p.z * 430;
                        const y = 100 - (p.Ex / (amplitude || 1)) * 70;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Ey curve (Violet) if active */}
                  {polarisation !== 'linear' && (
                    <polyline
                      fill="none"
                      stroke="#9B7FD4"
                      strokeWidth="2"
                      points={spatialPoints
                        .map((p) => {
                          const x = 50 + p.z * 430;
                          const y = 100 - (p.Ey / (amplitude || 1)) * 70;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Axis labels */}
                  <text x="50" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">z = 0 m</text>
                  <text x="450" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">z = 1.0 m</text>
                  <text x="15" y="105" fill="#98A6B7" fontSize="10" fontFamily="monospace">0 V/m</text>
                  <text x="10" y="30" fill="#55C8DD" fontSize="10" fontFamily="monospace">+E₀</text>
                  <text x="10" y="175" fill="#55C8DD" fontSize="10" fontFamily="monospace">-E₀</text>
                </svg>
              </div>
              <div className="flex items-center gap-6 mt-3 text-2xs text-em-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#55C8DD] inline-block" />
                  <span>Ex component (Transverse X)</span>
                </div>
                {polarisation !== 'linear' && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#9B7FD4] inline-block" />
                    <span>Ey component (Transverse Y)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedPlot === 'polarisation' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-2xs text-em-text-muted mb-2 font-mono">
                <span>Polarisation Hodograph (Electric Field Vector Tip Trajectory in XY Plane)</span>
                <span className="text-em-accent uppercase font-semibold">{polarisation}</span>
              </div>
              <div className="w-72 h-72 bg-em-surface-light border border-em-border rounded p-3 relative flex items-center justify-center">
                <svg viewBox="0 0 240 240" className="w-full h-full">
                  {/* Coordinate Axes */}
                  <line x1="20" y1="120" x2="220" y2="120" stroke="#354559" strokeWidth="1.5" />
                  <line x1="120" y1="20" x2="120" y2="220" stroke="#354559" strokeWidth="1.5" />

                  {/* Concentric reference circles */}
                  <circle cx="120" cy="120" r="40" fill="none" stroke="#283341" strokeDasharray="3,3" />
                  <circle cx="120" cy="120" r="80" fill="none" stroke="#283341" strokeDasharray="3,3" />

                  {/* Polarisation hodograph path */}
                  <polyline
                    fill="none"
                    stroke="#55C8DD"
                    strokeWidth="2.5"
                    points={polarisationPoints
                      .map((p) => {
                        const x = 120 + (p.Ex / (amplitude || 1)) * 80;
                        const y = 120 - (p.Ey / (amplitude || 1)) * 80;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Axis labels */}
                  <text x="215" y="115" fill="#98A6B7" fontSize="10" fontFamily="monospace">+Ex</text>
                  <text x="125" y="30" fill="#98A6B7" fontSize="10" fontFamily="monospace">+Ey</text>
                </svg>
              </div>
              <p className="text-2xs text-em-text-muted mt-2 text-center max-w-md">
                Looking down the z-axis (wave propagating toward viewer). The trajectory traces the vector tip of E(t) over one complete period T = 1/f.
              </p>
            </div>
          )}

          {selectedPlot === 'attenuation' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-2xs text-em-text-muted mb-2 font-mono">
                <span>Field Magnitude |E(z)| vs Propagation Distance</span>
                <span className="text-em-accent">
                  {alpha > 0 ? `Skin Depth δ = ${(1 / alpha).toExponential(3)} m` : 'Lossless Medium (α = 0)'}
                </span>
              </div>
              <div className="w-full h-64 bg-em-surface-light border border-em-border rounded p-3 relative flex items-center justify-center">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#354559" strokeWidth="1.5" />
                  <line x1="50" y1="180" x2="480" y2="180" stroke="#354559" strokeWidth="1.5" />

                  {/* 1/e line (36.8%) */}
                  <line x1="50" y1="121" x2="480" y2="121" stroke="#D4A843" strokeDasharray="4,4" opacity="0.6" />
                  <text x="420" y="117" fill="#D4A843" fontSize="9" fontFamily="monospace">1/e (36.8%)</text>

                  {/* Attenuation curve */}
                  <polyline
                    fill="none"
                    stroke="#55C8DD"
                    strokeWidth="2.5"
                    points={attenuationPoints
                      .map((p, idx) => {
                        const x = 50 + (idx / attenuationPoints.length) * 430;
                        const y = 180 - (p.mag / (amplitude || 1)) * 150;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Labels */}
                  <text x="50" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">z = 0</text>
                  <text x="15" y="35" fill="#55C8DD" fontSize="10" fontFamily="monospace">|E₀|</text>
                  <text x="25" y="185" fill="#98A6B7" fontSize="10" fontFamily="monospace">0</text>
                </svg>
              </div>
              <p className="text-2xs text-em-text-muted mt-2">
                Exponential decay envelope |E(z)| = |E₀| exp(-αz) governed by attenuation constant α = {alpha.toExponential(3)} Np/m.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
