import { FrequencySweepPoint } from '../../types/transmissionLine';
import { calculateReflectionCoefficient } from './reflection';
import { calculateInputImpedance } from './impedance';

/**
 * Perform a frequency sweep analysis.
 */
export function calculateFrequencySweep(
  Z0: number,
  ZL_real: number,
  ZL_imag: number,
  lineLength: number,
  propagationVelocity: number,
  startFreq: number,
  endFreq: number,
  numPoints: number = 200
): FrequencySweepPoint[] {
  const points: FrequencySweepPoint[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const freq = startFreq + (i / numPoints) * (endFreq - startFreq);
    const beta = (2 * Math.PI * freq) / propagationVelocity;
    
    const reflection = calculateReflectionCoefficient(Z0, ZL_real, ZL_imag);
    const inputZ = calculateInputImpedance(Z0, ZL_real, ZL_imag, beta, lineLength);
    
    points.push({
      frequency: freq,
      gammaMagnitude: reflection.gammaMagnitude,
      vswr: reflection.vswr,
      ZinReal: inputZ.Zin.real,
      ZinImag: inputZ.Zin.imag,
      gammaPhase: reflection.gammaPhase,
    });
  }
  
  return points;
}
