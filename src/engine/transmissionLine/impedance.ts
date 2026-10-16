import { ComplexNumber } from '../../types/common';
import { InputImpedanceResult } from '../../types/transmissionLine';
import { complexMultiply, complexAdd, complexDivide } from '../wave/propagation';

/**
 * Calculate input impedance of a lossless transmission line.
 * Zin = Z0 * (ZL + jZ0*tan(beta*l)) / (Z0 + jZL*tan(beta*l))
 * 
 * Distance l is measured from the load toward the source.
 */
export function calculateInputImpedance(
  Z0: number,
  ZL_real: number,
  ZL_imag: number,
  beta: number,
  distance: number
): InputImpedanceResult {
  const bl = beta * distance;
  const tanBl = Math.tan(bl);
  
  // Handle special cases near lambda/4 where tan(bl) -> infinity
  // tan(bl) is very large when bl is near (2n+1)*pi/2
  if (Math.abs(tanBl) > 1e10) {
    // Quarter-wave transformer behavior: Zin = Z0^2 / ZL
    const ZL: ComplexNumber = { real: ZL_real, imag: ZL_imag };
    const Z0sq: ComplexNumber = { real: Z0 * Z0, imag: 0 };
    const Zin = complexDivide(Z0sq, ZL);
    return { Zin, position: distance };
  }
  
  // General case
  // Numerator: ZL + jZ0*tan(bl)
  const numerator: ComplexNumber = {
    real: ZL_real,
    imag: ZL_imag + Z0 * tanBl,
  };
  
  // Denominator: Z0 + jZL*tan(bl)
  const denominator: ComplexNumber = {
    real: Z0 - ZL_imag * tanBl,
    imag: ZL_real * tanBl,
  };
  
  const ratio = complexDivide(numerator, denominator);
  const Zin: ComplexNumber = {
    real: Z0 * ratio.real,
    imag: Z0 * ratio.imag,
  };
  
  return { Zin, position: distance };
}

/**
 * Calculate reflection coefficient at a position along the line.
 * Gamma(d) = Gamma_L * exp(-j2*beta*d)
 * where d is distance from the load.
 */
export function reflectionCoefficientAtPosition(
  gammaL_real: number,
  gammaL_imag: number,
  beta: number,
  distance: number
): ComplexNumber {
  const phase = -2 * beta * distance;
  const cosPhase = Math.cos(phase);
  const sinPhase = Math.sin(phase);
  
  // Gamma(d) = Gamma_L * exp(j*phase)
  return {
    real: gammaL_real * cosPhase - gammaL_imag * sinPhase,
    imag: gammaL_real * sinPhase + gammaL_imag * cosPhase,
  };
}
