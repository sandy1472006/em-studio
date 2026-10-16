import { Vector3D, FieldResult } from '../../types/common';
import { PointCharge } from '../../types/electrostatics';

const EPSILON_0 = 8.854187817e-12; // F/m
const K_COULOMB = 1 / (4 * Math.PI * EPSILON_0); // ~8.9875e9 N⋅m²/C²
const SINGULARITY_THRESHOLD = 1e-10; // meters

export function vectorSubtract(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vectorAdd(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vectorScale(v: Vector3D, s: number): Vector3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vectorMagnitude(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vectorNormalize(v: Vector3D): Vector3D {
  const mag = vectorMagnitude(v);
  if (mag < 1e-30) return { x: 0, y: 0, z: 0 };
  return vectorScale(v, 1 / mag);
}

export function vectorCross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vectorDot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Check if the observation point is too close to any charge (singularity).
 */
export function checkSingularity(point: Vector3D, charges: PointCharge[]): { isSingular: boolean; nearChargeId?: string } {
  for (const charge of charges) {
    const r = vectorSubtract(point, charge.position);
    const dist = vectorMagnitude(r);
    if (dist < SINGULARITY_THRESHOLD) {
      return { isSingular: true, nearChargeId: charge.id };
    }
  }
  return { isSingular: false };
}

/**
 * Calculate electric field at a point due to a single point charge.
 * E = (q / 4πε) × (r - ri) / |r - ri|³
 */
export function electricFieldSingleCharge(
  point: Vector3D,
  charge: PointCharge,
  relativePermittivity: number = 1.0
): Vector3D {
  const epsilon = EPSILON_0 * relativePermittivity;
  const k = 1 / (4 * Math.PI * epsilon);
  const r = vectorSubtract(point, charge.position);
  const dist = vectorMagnitude(r);
  
  if (dist < SINGULARITY_THRESHOLD) {
    return { x: NaN, y: NaN, z: NaN };
  }
  
  const factor = k * charge.charge / (dist * dist * dist);
  return vectorScale(r, factor);
}

/**
 * Calculate electric potential at a point due to a single point charge.
 * V = q / (4πε|r - ri|)
 */
export function electricPotentialSingleCharge(
  point: Vector3D,
  charge: PointCharge,
  relativePermittivity: number = 1.0
): number {
  const epsilon = EPSILON_0 * relativePermittivity;
  const k = 1 / (4 * Math.PI * epsilon);
  const r = vectorSubtract(point, charge.position);
  const dist = vectorMagnitude(r);
  
  if (dist < SINGULARITY_THRESHOLD) {
    return NaN;
  }
  
  return k * charge.charge / dist;
}

/**
 * Calculate total electric field at a point due to all charges (superposition).
 * E(r) = Σ [qi / (4πε)] × (r - ri) / |r - ri|³
 */
export function electricFieldSuperposition(
  point: Vector3D,
  charges: PointCharge[],
  relativePermittivity: number = 1.0
): Vector3D {
  const singularity = checkSingularity(point, charges);
  if (singularity.isSingular) {
    return { x: NaN, y: NaN, z: NaN };
  }
  
  let E: Vector3D = { x: 0, y: 0, z: 0 };
  for (const charge of charges) {
    const Ei = electricFieldSingleCharge(point, charge, relativePermittivity);
    E = vectorAdd(E, Ei);
  }
  return E;
}

/**
 * Calculate total electric potential at a point due to all charges (superposition).
 * V(r) = Σ qi / (4πε|r - ri|)
 */
export function electricPotentialSuperposition(
  point: Vector3D,
  charges: PointCharge[],
  relativePermittivity: number = 1.0
): number {
  const singularity = checkSingularity(point, charges);
  if (singularity.isSingular) {
    return NaN;
  }
  
  let V = 0;
  for (const charge of charges) {
    V += electricPotentialSingleCharge(point, charge, relativePermittivity);
  }
  return V;
}

/**
 * Calculate complete field result at a point.
 */
export function calculateFieldAtPoint(
  point: Vector3D,
  charges: PointCharge[],
  relativePermittivity: number = 1.0
): FieldResult {
  const E = electricFieldSuperposition(point, charges, relativePermittivity);
  const V = electricPotentialSuperposition(point, charges, relativePermittivity);
  const epsilon = EPSILON_0 * relativePermittivity;
  const D = vectorScale(E, epsilon);
  const magnitude = vectorMagnitude(E);
  
  return { E, V, D, magnitude };
}

export { EPSILON_0, K_COULOMB, SINGULARITY_THRESHOLD };
