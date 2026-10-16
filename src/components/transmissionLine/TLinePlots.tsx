import React, { useState } from 'react';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { findExtrema } from '../../engine/transmissionLine/standingWave';
import { X, Activity } from 'lucide-react';

interface TLinePlotsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TLinePlots: React.FC<TLinePlotsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'standing-wave' | 'sweep'>('standing-wave');

  const {
    standingWaveData,
    frequencySweepData,
    lineLength,
    frequency,
    characteristicImpedance,
    reflectionResult,
  } = useTransmissionLineStore();

  if (!isOpen) return null;

  const extrema = findExtrema(standingWaveData);
  const maxV = Math.max(...standingWaveData.map((d) => d.voltageMagnitude), 1);
  const maxI = Math.max(...standingWaveData.map((d) => d.currentMagnitude), 0.01);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-em-text-primary">
              Transmission Line Standing Wave & Frequency Response
            </span>
            <span className="text-2xs font-mono text-em-accent bg-em-accent/10 px-2 py-0.5 rounded border border-em-accent/30">
              Analytical Graphs
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-em-border bg-em-surface-light/40">
          <button
            onClick={() => setActiveTab('standing-wave')}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'standing-wave'
                ? 'bg-em-accent/15 border-em-accent text-em-accent'
                : 'bg-em-surface border-em-border text-em-text-secondary hover:text-em-text-primary'
            }`}
          >
            Standing Wave Envelopes |V(d)| & |I(d)|
          </button>
          <button
            onClick={() => setActiveTab('sweep')}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'sweep'
                ? 'bg-em-accent/15 border-em-accent text-em-accent'
                : 'bg-em-surface border-em-border text-em-text-secondary hover:text-em-text-primary'
            }`}
          >
            Frequency Sweep Analysis (|Γ|, VSWR, Zin)
          </button>
        </div>

        {/* Plot Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[350px]">
          {activeTab === 'standing-wave' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-2xs text-em-text-muted mb-2 font-mono">
                <span>Voltage Envelope |V(d)| & Current Envelope |I(d)| from Load (d=0) to Source (d=l)</span>
                <span className="text-em-accent">
                  V_max = {extrema.Vmax.toFixed(2)}V | V_min = {extrema.Vmin.toFixed(2)}V | VSWR = {reflectionResult?.vswr === Infinity ? '∞' : reflectionResult?.vswr.toFixed(3)}
                </span>
              </div>

              <div className="w-full h-64 bg-em-surface-light border border-em-border rounded p-3 relative flex items-center justify-center">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#354559" strokeWidth="1.5" />
                  <line x1="50" y1="180" x2="480" y2="180" stroke="#354559" strokeWidth="1.5" />

                  {/* Voltage curve |V(d)| (Cyan) */}
                  <polyline
                    fill="none"
                    stroke="#55C8DD"
                    strokeWidth="2.5"
                    points={standingWaveData
                      .map((p, idx) => {
                        const x = 50 + (idx / (standingWaveData.length - 1)) * 430;
                        const y = 180 - (p.voltageMagnitude / (maxV * 1.1)) * 150;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Current curve |I(d)| * Z0 (Amber) */}
                  <polyline
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                    points={standingWaveData
                      .map((p, idx) => {
                        const x = 50 + (idx / (standingWaveData.length - 1)) * 430;
                        const y = 180 - (p.currentMagnitude / (maxI * 1.1)) * 150;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Labels */}
                  <text x="45" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">d = 0 (Load)</text>
                  <text x="420" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">d = {lineLength.toFixed(2)}m (Source)</text>
                  <text x="15" y="25" fill="#55C8DD" fontSize="10" fontFamily="monospace">V_max</text>
                  <text x="25" y="185" fill="#98A6B7" fontSize="10" fontFamily="monospace">0</text>
                </svg>
              </div>

              <div className="flex items-center gap-6 mt-3 text-2xs text-em-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#55C8DD] inline-block rounded-xs" />
                  <span>Voltage Magnitude |V(d)| [V]</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-[#D4A843] inline-block" />
                  <span>Current Magnitude |I(d)| [A] (scaled)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sweep' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-2xs text-em-text-muted mb-2 font-mono">
                <span>Frequency Sweep: Reflection Coefficient |Γ| and VSWR (100 MHz – 3 GHz)</span>
                <span className="text-em-accent">Marker at f = {(frequency / 1e9).toFixed(2)} GHz</span>
              </div>

              <div className="w-full h-64 bg-em-surface-light border border-em-border rounded p-3 relative flex items-center justify-center">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#354559" strokeWidth="1.5" />
                  <line x1="50" y1="180" x2="480" y2="180" stroke="#354559" strokeWidth="1.5" />

                  {/* Reflection coefficient |Γ| curve */}
                  <polyline
                    fill="none"
                    stroke="#55C8DD"
                    strokeWidth="2.5"
                    points={frequencySweepData
                      .map((p, idx) => {
                        const x = 50 + (idx / (frequencySweepData.length - 1)) * 430;
                        const y = 180 - Math.min(1, p.gammaMagnitude) * 150;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Marker for current frequency */}
                  {(() => {
                    const startF = 100e6;
                    const endF = 3e9;
                    const frac = Math.max(0, Math.min(1, (frequency - startF) / (endF - startF)));
                    const mx = 50 + frac * 430;
                    return (
                      <g>
                        <line x1={mx} y1="20" x2={mx} y2="180" stroke="#D4A843" strokeDasharray="3,3" />
                        <circle cx={mx} cy="100" r="4" fill="#D4A843" />
                        <text x={mx - 20} y="15" fill="#D4A843" fontSize="9" fontFamily="monospace">
                          {(frequency / 1e9).toFixed(2)} GHz
                        </text>
                      </g>
                    );
                  })()}

                  {/* Labels */}
                  <text x="45" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">100 MHz</text>
                  <text x="440" y="195" fill="#98A6B7" fontSize="10" fontFamily="monospace">3.0 GHz</text>
                  <text x="15" y="35" fill="#55C8DD" fontSize="10" fontFamily="monospace">|Γ|=1.0</text>
                  <text x="15" y="105" fill="#98A6B7" fontSize="10" fontFamily="monospace">|Γ|=0.5</text>
                  <text x="25" y="185" fill="#98A6B7" fontSize="10" fontFamily="monospace">0.0</text>
                </svg>
              </div>

              <div className="flex items-center gap-6 mt-3 text-2xs text-em-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#55C8DD] inline-block rounded-xs" />
                  <span>Reflection Coefficient |Γ(f)|</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-[#D4A843] inline-block" />
                  <span>Current Operating Frequency Marker</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
