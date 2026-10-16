import React, { useRef, useEffect, useState } from 'react';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { complexMagnitude } from '../../engine/wave/propagation';
import { reflectionCoefficientAtPosition } from '../../engine/transmissionLine/impedance';

export const TLineCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    characteristicImpedance,
    loadResistance,
    loadReactance,
    frequency,
    lineLength,
    incidentAmplitude,
    propagationVelocity,
    observationPosition,
    setObservationPosition,
    reflectionResult,
    inputImpedance,
    isPlaying,
    animationSpeed,
  } = useTransmissionLineStore();

  const [time, setTime] = useState(0);

  // Animation frame loop for standing wave interference
  useEffect(() => {
    let animId: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;
      if (isPlaying) {
        setTime((prev) => prev + dt * animationSpeed * 2.5);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, animationSpeed]);

  // Render on 2D instrument canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Padding
    const padX = 70;
    const lineY = height * 0.45;
    const lineWidth = width - 2 * padX;

    const beta = (2 * Math.PI * frequency) / propagationVelocity;
    const gamma = reflectionResult?.gamma ?? { real: 0, imag: 0 };
    const gammaMag = reflectionResult?.gammaMagnitude ?? 0;

    // 1. Draw Transmission Line Rails (Two-wire / coaxial model)
    const railSep = 50;
    const topRailY = lineY - railSep / 2;
    const botRailY = lineY + railSep / 2;

    ctx.strokeStyle = '#283341';
    ctx.lineWidth = 3;
    // Top conductor
    ctx.beginPath();
    ctx.moveTo(padX, topRailY);
    ctx.lineTo(padX + lineWidth, topRailY);
    ctx.stroke();

    // Bottom conductor
    ctx.beginPath();
    ctx.moveTo(padX, botRailY);
    ctx.lineTo(padX + lineWidth, botRailY);
    ctx.stroke();

    // 2. Generator / Source Block (Left)
    ctx.fillStyle = '#141B24';
    ctx.strokeStyle = '#354559';
    ctx.lineWidth = 1.5;
    ctx.fillRect(padX - 55, lineY - 45, 55, 90);
    ctx.strokeRect(padX - 55, lineY - 45, 55, 90);

    ctx.fillStyle = '#55C8DD';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RF GEN', padX - 27, lineY - 15);
    ctx.fillStyle = '#98A6B7';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`${incidentAmplitude}V CW`, padX - 27, lineY + 5);
    ctx.fillText(`${characteristicImpedance}Ω`, padX - 27, lineY + 22);

    // 3. Load Termination Block (Right)
    const loadX = padX + lineWidth;
    ctx.fillStyle = '#141B24';
    ctx.strokeStyle = gammaMag > 0.8 ? '#D4A843' : '#354559';
    ctx.lineWidth = 1.5;
    ctx.fillRect(loadX, lineY - 45, 55, 90);
    ctx.strokeRect(loadX, lineY - 45, 55, 90);

    ctx.fillStyle = '#D4A843';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOAD Z_L', loadX + 27, lineY - 15);
    ctx.fillStyle = '#98A6B7';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(
      loadResistance > 1e10
        ? 'OPEN (∞)'
        : loadResistance === 0 && loadReactance === 0
        ? 'SHORT (0)'
        : `${loadResistance}Ω`,
      loadX + 27,
      lineY + 5
    );
    if (loadReactance !== 0 && loadResistance < 1e10) {
      ctx.fillText(`${loadReactance >= 0 ? '+' : ''}${loadReactance}j`, loadX + 27, lineY + 20);
    }

    // 4. Wave Direction Flow Arrows
    // Incident wave arrow (top, going right)
    ctx.strokeStyle = '#55C8DD';
    ctx.fillStyle = '#55C8DD';
    ctx.lineWidth = 1.5;
    const arrowY1 = topRailY - 18;
    ctx.beginPath();
    ctx.moveTo(padX + 20, arrowY1);
    ctx.lineTo(padX + lineWidth * 0.4, arrowY1);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(padX + lineWidth * 0.4, arrowY1);
    ctx.lineTo(padX + lineWidth * 0.4 - 6, arrowY1 - 4);
    ctx.lineTo(padX + lineWidth * 0.4 - 6, arrowY1 + 4);
    ctx.fill();
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Incident Wave V⁺ →', padX + lineWidth * 0.2, arrowY1 - 5);

    // Reflected wave arrow (bottom, going left if |Gamma| > 0)
    if (gammaMag > 0.01) {
      ctx.strokeStyle = '#D4A843';
      ctx.fillStyle = '#D4A843';
      const arrowY2 = botRailY + 22;
      ctx.beginPath();
      ctx.moveTo(loadX - 20, arrowY2);
      ctx.lineTo(loadX - lineWidth * 0.4, arrowY2);
      ctx.stroke();
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(loadX - lineWidth * 0.4, arrowY2);
      ctx.lineTo(loadX - lineWidth * 0.4 + 6, arrowY2 - 4);
      ctx.lineTo(loadX - lineWidth * 0.4 + 6, arrowY2 + 4);
      ctx.fill();
      ctx.fillText(`← Reflected Wave V⁻ (|Γ|=${gammaMag.toFixed(2)})`, loadX - lineWidth * 0.2, arrowY2 + 14);
    }

    // 5. Draw Dynamic Standing Wave Voltage Envelope & Instantaneous Wave
    const numPoints = 250;
    const vMaxVisual = incidentAmplitude * (1 + gammaMag) || 1;
    const envScale = 45 / (vMaxVisual || 1);

    // Upper and lower envelope lines (dashed)
    ctx.strokeStyle = '#354559';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const frac = i / numPoints;
      const d = (1 - frac) * lineLength; // d is distance from load
      const px = padX + frac * lineWidth;

      const gammaD = reflectionCoefficientAtPosition(gamma.real, gamma.imag, beta, d);
      const vMag = incidentAmplitude * complexMagnitude({ real: 1 + gammaD.real, imag: gammaD.imag });

      const py = lineY - vMag * envScale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const frac = i / numPoints;
      const d = (1 - frac) * lineLength;
      const px = padX + frac * lineWidth;

      const gammaD = reflectionCoefficientAtPosition(gamma.real, gamma.imag, beta, d);
      const vMag = incidentAmplitude * complexMagnitude({ real: 1 + gammaD.real, imag: gammaD.imag });

      const py = lineY + vMag * envScale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Instantaneous voltage curve V(d, t) (Solid Cyan Wave)
    ctx.strokeStyle = '#55C8DD';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const frac = i / numPoints;
      const d = (1 - frac) * lineLength;
      const px = padX + frac * lineWidth;

      // Incident: cos(wt + beta*d)
      // Reflected: |Gamma|*cos(wt - beta*d + theta_gamma)
      const wt = time * 3.0;
      const vInst =
        incidentAmplitude * Math.cos(wt + beta * d) +
        incidentAmplitude * gammaMag * Math.cos(wt - beta * d + (reflectionResult?.gammaPhase ?? 0));

      const py = lineY - vInst * envScale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 6. Observation Probe Marker (Interactive)
    const probeFrac = 1 - observationPosition / (lineLength || 1);
    const probeX = padX + Math.max(0, Math.min(1, probeFrac)) * lineWidth;

    ctx.strokeStyle = '#D4A843';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(probeX, lineY - 60);
    ctx.lineTo(probeX, lineY + 60);
    ctx.stroke();

    // Probe handle indicator
    ctx.fillStyle = '#D4A843';
    ctx.beginPath();
    ctx.arc(probeX, lineY - 60, 5, 0, Math.PI * 2);
    ctx.fill();

    // Probe readout box
    ctx.fillStyle = '#141B24';
    ctx.strokeStyle = '#D4A843';
    ctx.lineWidth = 1;
    ctx.fillRect(probeX - 45, lineY - 95, 90, 28);
    ctx.strokeRect(probeX - 45, lineY - 95, 90, 28);

    ctx.fillStyle = '#E7EDF5';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`d = ${observationPosition.toFixed(2)} m`, probeX, lineY - 82);
    ctx.fillStyle = '#D4A843';
    ctx.fillText(`Z_in: ${inputImpedance ? inputImpedance.Zin.real.toFixed(0) + 'Ω' : ''}`, probeX, lineY - 70);

    // 7. Distance Scale Axis along bottom
    ctx.fillStyle = '#98A6B7';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('d = l (Source)', padX, height - 15);
    ctx.fillText(`Length l = ${lineLength.toFixed(2)} m`, padX + lineWidth / 2, height - 15);
    ctx.fillText('d = 0 (Load)', loadX, height - 15);
  }, [
    characteristicImpedance,
    loadResistance,
    loadReactance,
    frequency,
    lineLength,
    incidentAmplitude,
    propagationVelocity,
    observationPosition,
    reflectionResult,
    inputImpedance,
    time,
  ]);

  // Handle click on canvas to reposition observation probe
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const x = clickX * scaleX;

    const padX = 70;
    const lineWidth = canvas.width - 2 * padX;
    if (x >= padX && x <= padX + lineWidth) {
      const frac = (x - padX) / lineWidth;
      const d = (1 - frac) * lineLength;
      setObservationPosition(Math.max(0, Math.min(lineLength, parseFloat(d.toFixed(3)))));
    }
  };

  return (
    <div className="relative w-full h-full bg-em-bg flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl h-80 bg-em-surface border border-em-border rounded-lg shadow-xl relative overflow-hidden flex flex-col">
        {/* Instrument Title Bar */}
        <div className="h-8 border-b border-em-border px-3 flex items-center justify-between text-2xs text-em-text-muted bg-em-surface-light/40">
          <span className="font-semibold uppercase tracking-wider text-em-text-secondary">
            1D Transmission Line Standing Wave Interferometer
          </span>
          <span className="font-mono text-em-accent">
            Click line to position probe
          </span>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={280}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair"
        />
      </div>

      {/* Legend below */}
      <div className="flex items-center gap-6 mt-3 text-2xs text-em-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#55C8DD] inline-block rounded-xs" />
          <span>Instantaneous Voltage V(d, t)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-[#98A6B7] inline-block" />
          <span>Standing Wave Envelope |V(d)|</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4A843] inline-block" />
          <span>Adjustable Impedance Probe</span>
        </div>
      </div>
    </div>
  );
};
