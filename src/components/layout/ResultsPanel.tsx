import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { theoryDatabase } from '../../data/theoryContent';
import { EquationDisplay } from '../shared/EquationDisplay';
import { CheckCircle2, ChevronUp, ChevronDown, Check, Maximize2, Minimize2 } from 'lucide-react';
import { electricFieldSuperposition, electricPotentialSuperposition, vectorMagnitude } from '../../engine/electrostatics/coulomb';

// 1. Interactive 2D Line Plot: |E| along z-axis (Logarithmic 10^2 to 10^6 V/m)
const FieldZPlot: React.FC = () => {
  const charges = useElectrostaticsStore((s) => s.charges);
  const relativePermittivity = useElectrostaticsStore((s) => s.relativePermittivity);
  const fieldType = useElectrostaticsStore((s) => s.fieldType ?? 'electric');

  const width = 280;
  const height = 120;
  const padL = 36;
  const padR = 12;
  const padT = 10;
  const padB = 22;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const points = useMemo(() => {
    const list: { z: number; mag: number; xPix: number; yPix: number }[] = [];
    const minZ = -2;
    const maxZ = 2;
    const minLog = 2;
    const maxLog = 6;

    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const z = minZ + (i / steps) * (maxZ - minZ);
      const E = electricFieldSuperposition({ x: 0, y: 0, z }, charges, relativePermittivity);
      const mag = Math.min(1e6, Math.max(100, vectorMagnitude(E)));

      const xFrac = (z - minZ) / (maxZ - minZ);
      const logVal = Math.log10(mag);
      const yFrac = Math.max(0, Math.min(1, (logVal - minLog) / (maxLog - minLog)));

      const xPix = padL + xFrac * plotW;
      const yPix = padT + (1 - yFrac) * plotH;

      list.push({ z, mag, xPix, yPix });
    }
    return list;
  }, [charges, relativePermittivity, plotW, plotH, padL, padT]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.xPix.toFixed(1)} ${p.yPix.toFixed(1)}`, '');
  }, [points]);

  return (
    <div className="flex flex-col h-full bg-[#0E1522] border border-[#1E293B] rounded-lg p-2.5">
      <div className="text-2xs font-semibold text-white mb-1 tracking-wide">
        {fieldType === 'electric'
          ? 'Electric Field Magnitude Along z-axis (x = 0, y = 0)'
          : 'Magnetic Flux Magnitude Along z-axis (x = 0, y = 0)'}
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-28 overflow-visible">
          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const y = padT + (1 - frac) * plotH;
            return (
              <line
                key={`h-${idx}`}
                x1={padL}
                y1={y}
                x2={padL + plotW}
                y2={y}
                stroke="#1E293B"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            );
          })}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const x = padL + frac * plotW;
            return (
              <line
                key={`v-${idx}`}
                x1={x}
                y1={padT}
                x2={x}
                y2={padT + plotH}
                stroke="#1E293B"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Y Axis Ticks & Labels */}
          {['10²', '10³', '10⁴', '10⁵', '10⁶'].map((label, idx) => {
            const y = padT + (1 - idx / 4) * plotH;
            return (
              <text
                key={label}
                x={padL - 4}
                y={y + 3}
                fill="#64748B"
                fontSize={8}
                fontFamily="monospace"
                textAnchor="end"
              >
                {label}
              </text>
            );
          })}

          {/* X Axis Ticks & Labels */}
          {['-2', '-1', '0', '1', '2'].map((label, idx) => {
            const x = padL + (idx / 4) * plotW;
            return (
              <text
                key={label}
                x={x}
                y={padT + plotH + 13}
                fill="#64748B"
                fontSize={8}
                fontFamily="monospace"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* X Axis Label */}
          <text
            x={padL + plotW / 2}
            y={height - 1}
            fill="#94A3B8"
            fontSize={8}
            fontFamily="monospace"
            textAnchor="middle"
          >
            z (m)
          </text>

          {/* Y Axis Label */}
          <text
            x={-height / 2 + 5}
            y={10}
            transform="rotate(-90)"
            fill="#94A3B8"
            fontSize={8}
            fontFamily="monospace"
            textAnchor="middle"
          >
            {fieldType === 'electric' ? '|E| (V/m)' : '|B| (T)'}
          </text>

          {/* The Glowing Cyan Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#55C8DD"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 3px #55C8DD)' }}
          />
        </svg>
      </div>
    </div>
  );
};

// 2. 2D Scalar Potential Heatmap in x-y Plane (z = 0) with V(V) Colorbar
const PotentialHeatmap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const charges = useElectrostaticsStore((s) => s.charges);
  const relativePermittivity = useElectrostaticsStore((s) => s.relativePermittivity);
  const fieldType = useElectrostaticsStore((s) => s.fieldType ?? 'electric');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const minX = -2;
    const maxX = 2;
    const minY = -1.0;
    const maxY = 1.0;
    const maxV = 350;

    for (let py = 0; py < h; py++) {
      const y = maxY - (py / h) * (maxY - minY);
      for (let px = 0; px < w; px++) {
        const x = minX + (px / w) * (maxX - minX);
        const V = electricPotentialSuperposition({ x, y, z: 0 }, charges, relativePermittivity);

        const norm = Math.max(-1, Math.min(1, V / maxV));
        const idx = (py * w + px) * 4;

        if (norm >= 0) {
          // Warm colormap (Red/Orange/Yellow to Cyan)
          data[idx] = Math.round(239 * norm + 20 * (1 - norm));
          data[idx + 1] = Math.round(68 * norm + 140 * (1 - norm));
          data[idx + 2] = Math.round(68 * (1 - norm) + 210 * (1 - norm));
          data[idx + 3] = 255;
        } else {
          // Cool colormap (Cyan to Deep Blue)
          const neg = Math.abs(norm);
          data[idx] = Math.round(20 * (1 - neg));
          data[idx + 1] = Math.round(140 * (1 - neg) + 20 * neg);
          data[idx + 2] = Math.round(210 * (1 - neg) + 246 * neg);
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [charges, relativePermittivity]);

  return (
    <div className="flex flex-col h-full bg-[#0E1522] border border-[#1E293B] rounded-lg p-2.5">
      <div className="text-2xs font-semibold text-white mb-1 tracking-wide">
        {fieldType === 'electric'
          ? 'Electric Potential in x–y Plane (z = 0)'
          : 'Magnetic Scalar Potential in x–y Plane (z = 0)'}
      </div>

      <div className="flex-1 flex items-center gap-3 justify-center">
        {/* Heatmap with Axis Labels */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={160}
            height={75}
            className="rounded border border-[#1E293B] shadow-inner"
          />
          {/* Axis Labels */}
          <div className="flex justify-between font-mono text-3xs text-[#64748B] mt-0.5">
            <span>-2</span>
            <span>-1</span>
            <span>x (m)</span>
            <span>1</span>
            <span>2</span>
          </div>
          <div className="absolute -left-5 top-0 bottom-4 flex flex-col justify-between font-mono text-3xs text-[#64748B]">
            <span>1.0</span>
            <span>0.0</span>
            <span>-1.0</span>
          </div>
        </div>

        {/* Vertical Colorbar Legend */}
        <div className="flex items-center gap-1.5 h-20">
          <div
            className="w-2.5 h-full rounded-xs border border-white/10"
            style={{
              background: 'linear-gradient(to bottom, #EF4444 0%, #EAB308 30%, #06B6D4 50%, #1D4ED8 100%)',
            }}
          />
          <div className="flex flex-col justify-between h-full font-mono text-3xs text-[#94A3B8] leading-none py-0.5">
            <span className="text-white font-semibold">V (V)</span>
            <span>400</span>
            <span>200</span>
            <span>0</span>
            <span>-200</span>
            <span>-400</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Key Results Summary Table
const KeyResultsSummary: React.FC = () => {
  const charges = useElectrostaticsStore((s) => s.charges);
  const relativePermittivity = useElectrostaticsStore((s) => s.relativePermittivity);
  const fieldResult = useElectrostaticsStore((s) => s.fieldResult);
  const mediumName = useElectrostaticsStore((s) => s.mediumName);
  const fieldType = useElectrostaticsStore((s) => s.fieldType ?? 'electric');

  const distanceBetweenCharges = useMemo(() => {
    if (charges.length < 2) return 'N/A';
    const c1 = charges[0].position;
    const c2 = charges[1].position;
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dz = c1.z - c2.z;
    return `${Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2)} m`;
  }, [charges]);

  return (
    <div className="flex flex-col h-full bg-[#0E1522] border border-[#1E293B] rounded-lg p-2.5">
      <div className="text-2xs font-semibold text-white mb-1.5 tracking-wide">
        Key Results
      </div>

      <div className="flex-1 flex flex-col justify-between text-2xs font-mono space-y-1">
        <div className="flex items-center justify-between py-0.5 border-b border-[#1E293B]">
          <span className="text-[#94A3B8]">
            {fieldType === 'electric' ? '|E| at Point P' : '|B| at Point P'}
          </span>
          <span className="text-white font-semibold">
            {fieldResult
              ? `${(fieldResult.magnitude).toExponential(2).replace('e+', ' × 10^')} ${
                  fieldType === 'electric' ? 'V/m' : 'T'
                }`
              : '0.00'}
          </span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-[#1E293B]">
          <span className="text-[#94A3B8]">
            {fieldType === 'electric' ? 'V at Point P' : '|A| at Point P'}
          </span>
          <span className="text-white font-semibold">
            {fieldResult ? `${fieldResult.V.toFixed(2)} ${fieldType === 'electric' ? 'V' : 'Wb/m'}` : '0.00'}
          </span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-[#1E293B]">
          <span className="text-[#94A3B8]">
            {fieldType === 'electric' ? 'D at Point P' : 'H at Point P'}
          </span>
          <span className="text-white font-semibold">
            {fieldResult
              ? `${(fieldResult.magnitude * 8.854e-12 * relativePermittivity).toExponential(2).replace('e+', ' × 10^')} ${
                  fieldType === 'electric' ? 'C/m²' : 'A/m'
                }`
              : '0.00'}
          </span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-[#1E293B]">
          <span className="text-[#94A3B8]">Distance between charges</span>
          <span className="text-white font-semibold">{distanceBetweenCharges}</span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-[#1E293B]">
          <span className="text-[#94A3B8]">Medium</span>
          <span className="text-white font-semibold truncate max-w-[120px]">
            {mediumName} (εᵣ = {relativePermittivity.toFixed(2)})
          </span>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <span className="text-[#94A3B8]">Number of charges</span>
          <span className="text-white font-semibold">{charges.length}</span>
        </div>
      </div>
    </div>
  );
};

export const ResultsPanel: React.FC = () => {
  const { activeModule, activeTab, setActiveTab } = useAppStore();
  const [isMinimized, setIsMinimized] = useState(false);

  // Stores
  const esResult = useElectrostaticsStore((s) => s.fieldResult);
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
    { id: 'results', label: 'Results' },
    { id: 'equations', label: 'Equations' },
    { id: 'verification', label: `Verification (${tests.filter((t) => t.passed).length}/${tests.length})` },
    { id: 'theory', label: 'Experiment Data' },
  ];

  if (isMinimized) {
    return (
      <div className="h-8 border-t border-[#1E293B] bg-[#0B0F17] flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="text-2xs font-semibold text-[#64748B] uppercase tracking-wider">
            Results & Measurements
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
          className="flex items-center gap-1 text-2xs text-[#94A3B8] hover:text-white cursor-pointer"
        >
          <span>Expand Panel</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-56 border-t border-[#1E293B] bg-[#070A0F] flex flex-col shrink-0 select-none z-10">
      {/* Tab Header Bar */}
      <div className="h-9 border-b border-[#1E293B] flex items-center justify-between px-4 shrink-0 bg-[#0B0F17]">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-em-accent/20 text-em-accent border border-em-accent/50'
                  : 'text-[#94A3B8] hover:text-white border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] cursor-pointer"
            title="Minimize Panel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-hidden p-3 text-xs">
        {activeTab === 'results' && (
          <div className="h-full">
            {activeModule === 'electrostatics' ? (
              /* 3-Column Layout Matching Reference Mockup */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
                <FieldZPlot />
                <PotentialHeatmap />
                <KeyResultsSummary />
              </div>
            ) : activeModule === 'wave-propagation' && waveProp ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Wavelength λ</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {(waveProp.wavelength * 100).toFixed(2)}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">cm</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5 font-mono">
                    {waveProp.wavelength.toExponential(3)} m
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Phase Velocity v_p</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {(waveProp.phaseVelocity / 1e8).toFixed(2)}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">×10⁸ m/s</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    {(waveProp.phaseVelocity / 2.9979e8 * 100).toFixed(1)}% of c
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Intrinsic Impedance η</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {waveProp.intrinsicImpedance.real.toFixed(1)}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">Ω</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    |E| / |H| ratio
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Attenuation α</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {waveProp.alpha.toExponential(2)}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">Np/m</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    β = {waveProp.beta.toFixed(2)} rad/m
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Skin Depth δ</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {waveProp.skinDepth === Infinity
                      ? '∞'
                      : waveProp.skinDepth > 1
                      ? `${waveProp.skinDepth.toFixed(2)} m`
                      : `${(waveProp.skinDepth * 1e3).toFixed(2)} mm`}
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    1/e decay depth
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Obs. |E({waveObsZ.toFixed(2)}m)|</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {waveProp.amplitudeAtDistance.toFixed(3)}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">V/m</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    Loss: {waveProp.attenuationDb.toFixed(2)} dB
                  </div>
                </div>
              </div>
            ) : tlineRefl ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Reflection Coeff. |Γ|</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {tlineRefl.gammaMagnitude.toFixed(4)}
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    ∠Γ = {tlineRefl.gammaPhaseDeg.toFixed(1)}°
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Standing Wave Ratio</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {tlineRefl.vswr === Infinity ? '∞' : tlineRefl.vswr.toFixed(3)}
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    VSWR = (1+|Γ|)/(1-|Γ|)
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Return Loss</div>
                  <div className="text-base font-semibold text-white mt-0.5">
                    {tlineRefl.returnLoss === Infinity ? '∞' : tlineRefl.returnLoss.toFixed(2)}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">dB</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    Mismatch: {tlineRefl.mismatchLoss.toFixed(2)} dB
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Input Impedance Zin</div>
                  <div className="text-sm font-mono text-white mt-0.5">
                    {tlineZin ? `${tlineZin.Zin.real.toFixed(1)} + j${tlineZin.Zin.imag.toFixed(1)}` : 'N/A'}
                    <span className="text-2xs text-[#94A3B8] font-normal ml-1">Ω</span>
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    At d = {tlineObs.toFixed(3)} m
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Characteristic Z₀</div>
                  <div className="font-mono text-sm text-white mt-0.5">
                    {tlineZ0} Ω
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    Line standard
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B]">
                  <div className="readout-label text-[#64748B]">Load Termination Z_L</div>
                  <div className="font-mono text-sm text-white mt-0.5">
                    {tlineRL} {tlineXL >= 0 ? '+' : '-'} j{Math.abs(tlineXL)} Ω
                  </div>
                  <div className="text-2xs text-[#64748B] mt-0.5">
                    Termination state
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'equations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-40">
            {theory.equations.map((eq, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B] space-y-1">
                <div className="text-xs font-semibold text-white">{eq.name}</div>
                <div className="py-1 px-2 rounded bg-black/40 overflow-x-auto">
                  <EquationDisplay latex={eq.latex} displayMode />
                </div>
                <div className="text-2xs text-[#94A3B8]">{eq.description}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto max-h-40">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-2.5 rounded bg-[#0E1522] border border-[#1E293B] flex items-start gap-2.5"
              >
                <div className="mt-0.5">
                  {test.passed ? (
                    <Check className="w-4 h-4 text-[#22C55E]" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-3xs font-bold">
                      ✕
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white truncate">{test.name}</div>
                  <div className="text-3xs text-[#94A3B8] mt-0.5">{test.description}</div>
                  <div className="font-mono text-3xs text-[#64748B] mt-1">
                    Expected: {test.expected} | Actual: {test.actual}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'theory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-40 text-[#94A3B8]">
            <div className="p-3 rounded bg-[#0E1522] border border-[#1E293B]">
              <div className="font-semibold text-xs text-white mb-1.5">Model Scope & Limitations</div>
              <ul className="list-disc list-inside space-y-1 text-2xs">
                {theory.limitations.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded bg-[#0E1522] border border-[#1E293B]">
              <div className="font-semibold text-xs text-white mb-1.5">Physical Assumptions</div>
              <ul className="list-disc list-inside space-y-1 text-2xs">
                {theory.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
