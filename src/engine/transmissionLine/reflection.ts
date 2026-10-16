import { ComplexNumber } from '../../types/common';
import { ReflectionResult } from '../../types/transmissionLine';
import { complexMagnitude, complexPhase, complexDivide } from '../wave/propagation';

/**
 * Calculate the load reflection coefficient.
 * Gamma = (ZL - Z0) / (ZL + Z0)
 * 
 * For a lossless line with real Z0.
 */
export function calculateReflectionCoefficient(
  Z0: number,
  ZL_real: number,
  ZL_imag: number
): ReflectionResult {
  const ZL: ComplexNumber = { real: ZL_real, imag: ZL_imag };
  
  // Gamma = (ZL - Z0) / (ZL + Z0)
  const numerator: ComplexNumber = { real: ZL.real - Z0, imag: ZL.imag };
  const denominator: ComplexNumber = { real: ZL.real + Z0, imag: ZL.imag };
  
  const gamma = complexDivide(numerator, denominator);
  const gammaMagnitude = complexMagnitude(gamma);
  const gammaPhaseRad = complexPhase(gamma);
  const gammaPhaseDeg = gammaPhaseRad * (180 / Math.PI);
  
  // VSWR = (1 + |Gamma|) / (1 - |Gamma|)
  let vswr: number;
  if (gammaMagnitude >= 1.0 - 1e-10) {
    vswr = Infinity;
  } else {
    vswr = (1 + gammaMagnitude) / (1 - gammaMagnitude);
  }
  
  // Return loss = -20 * log10(|Gamma|) in dB
  const returnLoss = gammaMagnitude > 0
    ? -20 * Math.log10(gammaMagnitude)
    : Infinity;
  
  // Mismatch loss = -10 * log10(1 - |Gamma|^2) in dB
  const mismatchLoss = gammaMagnitude < 1.0
    ? -10 * Math.log10(1 - gammaMagnitude * gammaMagnitude)
    : Infinity;
  
  return {
    gamma,
    gammaMagnitude,
    gammaPhase: gammaPhaseRad,
    gammaPhaseDeg,
    vswr,
    returnLoss,
    mismatchLoss,
  };
}

/**
 * Handle special load cases.
 */
export function getSpecialCaseDescription(
  Z0: number,
  ZL_real: number,
  ZL_imag: number
): string | null {
  // Matched load
  if (Math.abs(ZL_real - Z0) < 1e-10 && Math.abs(ZL_imag) < 1e-10) {
    return 'Matched Load: ZL = Z0, no reflection';
  }
  // Open circuit
  if (ZL_real > 1e15 || (ZL_real > 1e10 && Math.abs(ZL_imag) < ZL_real * 0.01)) {
    return 'Open Circuit: ZL → ∞, total reflection with 0° phase';
  }
  // Short circuit
  if (Math.abs(ZL_real) < 1e-10 && Math.abs(ZL_imag) < 1e-10) {
    return 'Short Circuit: ZL = 0, total reflection with 180° phase';
  }
  return null;
}
