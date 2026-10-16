import { ComplexNumber } from '../../types/common';
import { StandingWavePoint } from '../../types/transmissionLine';
import { complexMagnitude } from '../wave/propagation';
import { reflectionCoefficientAtPosition } from './impedance';

/**
 * Calculate voltage and current magnitude distributions along a transmission line.
 * 
 * V(d) = V+ * [1 + Gamma_L * exp(-j2*beta*d)]
 * I(d) = (V+/Z0) * [1 - Gamma_L * exp(-j2*beta*d)]
 * 
 * d = distance from load toward source
 */
export function calculateStandingWaveDistribution(
  V_incident: number,
  Z0: number,
  gammaL: ComplexNumber,
  beta: number,
  lineLength: number,
  numPoints: number = 200
): StandingWavePoint[] {
  const points: StandingWavePoint[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const d = (i / numPoints) * lineLength; // distance from load
    
    // Reflection coefficient at position d from load
    const gammaD = reflectionCoefficientAtPosition(
      gammaL.real, gammaL.imag, beta, d
    );
    
    // V(d) = V+ * |1 + Gamma(d)|
    const voltageComplex: ComplexNumber = {
      real: 1 + gammaD.real,
      imag: gammaD.imag,
    };
    const voltageMagnitude = V_incident * complexMagnitude(voltageComplex);
    
    // I(d) = (V+/Z0) * |1 - Gamma(d)|
    const currentComplex: ComplexNumber = {
      real: 1 - gammaD.real,
      imag: -gammaD.imag,
    };
    const currentMagnitude = (V_incident / Z0) * complexMagnitude(currentComplex);
    
    points.push({
      position: d,
      voltageMagnitude,
      currentMagnitude,
    });
  }
  
  return points;
}

/**
 * Find voltage maxima and minima positions.
 */
export function findExtrema(
  data: StandingWavePoint[]
): { maxPositions: number[]; minPositions: number[]; Vmax: number; Vmin: number } {
  if (data.length < 3) {
    return { maxPositions: [], minPositions: [], Vmax: 0, Vmin: 0 };
  }
  
  const maxPositions: number[] = [];
  const minPositions: number[] = [];
  let Vmax = -Infinity;
  let Vmin = Infinity;
  
  for (let i = 1; i < data.length - 1; i++) {
    const v = data[i].voltageMagnitude;
    const vPrev = data[i - 1].voltageMagnitude;
    const vNext = data[i + 1].voltageMagnitude;
    
    if (v > Vmax) Vmax = v;
    if (v < Vmin) Vmin = v;
    
    if (v >= vPrev && v >= vNext && v > vPrev) {
      maxPositions.push(data[i].position);
    }
    if (v <= vPrev && v <= vNext && v < vPrev) {
      minPositions.push(data[i].position);
    }
  }
  
  // Also check endpoints
  if (data[0].voltageMagnitude > Vmax) Vmax = data[0].voltageMagnitude;
  if (data[0].voltageMagnitude < Vmin) Vmin = data[0].voltageMagnitude;
  const last = data[data.length - 1];
  if (last.voltageMagnitude > Vmax) Vmax = last.voltageMagnitude;
  if (last.voltageMagnitude < Vmin) Vmin = last.voltageMagnitude;
  
  return { maxPositions, minPositions, Vmax, Vmin };
}
