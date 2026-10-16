import { Vector3D } from '../../types/common';
import { vectorCross, vectorMagnitude } from '../electrostatics/coulomb';

/**
 * Calculate the instantaneous Poynting vector S = E x H.
 * 
 * For a plane wave propagating in +z:
 * E = Ex*x_hat + Ey*y_hat
 * H = Hx*x_hat + Hy*y_hat
 * S = (Ex*Hy - Ey*Hx)*z_hat
 */
export function calculatePoyntingVector(
  E: Vector3D,
  H: Vector3D
): Vector3D {
  return vectorCross(E, H);
}

/**
 * Calculate the time-averaged Poynting vector magnitude for a sinusoidal wave.
 * <S> = (1/2) * Re(E x H*) for phasors
 * For a lossless medium: <S> = |E0|^2 / (2*eta)
 */
export function calculateTimeAveragedPower(
  amplitude: number,
  etaMagnitude: number
): number {
  if (etaMagnitude < 1e-20) return 0;
  return (amplitude * amplitude) / (2 * etaMagnitude);
}

/**
 * Calculate instantaneous power density.
 */
export function calculateInstantaneousPower(
  Ex: number,
  Ey: number,
  Hx: number,
  Hy: number
): { Sz: number; magnitude: number } {
  // S = E x H, for plane wave in z-direction:
  // Sz = Ex*Hy - Ey*Hx
  const Sz = Ex * Hy - Ey * Hx;
  return { Sz, magnitude: Math.abs(Sz) };
}
