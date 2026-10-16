import { Vector3D } from '../../types/common';
import { PointCharge, FieldLine, FieldLinePoint } from '../../types/electrostatics';
import { electricFieldSuperposition, vectorMagnitude, vectorNormalize, vectorSubtract, vectorAdd, vectorScale } from './coulomb';

const DEFAULT_STEP_SIZE = 0.02;
const DEFAULT_MAX_STEPS = 500;
const MIN_FIELD_THRESHOLD = 1e-6;
const CHARGE_PROXIMITY_THRESHOLD = 0.05;
const DOMAIN_BOUNDARY = 5.0;

interface FieldLineConfig {
  stepSize?: number;
  maxSteps?: number;
  relativePermittivity?: number;
  domainBoundary?: number;
}

/**
 * Check if a position is near any charge (used to terminate field lines).
 */
function isNearCharge(pos: Vector3D, charges: PointCharge[], threshold: number): boolean {
  for (const charge of charges) {
    const dist = vectorMagnitude(vectorSubtract(pos, charge.position));
    if (dist < threshold) return true;
  }
  return false;
}

/**
 * Check if position is outside the simulation domain.
 */
function isOutOfBounds(pos: Vector3D, boundary: number): boolean {
  return Math.abs(pos.x) > boundary || Math.abs(pos.y) > boundary || Math.abs(pos.z) > boundary;
}

/**
 * RK4 integration step for field-line tracing.
 * Integrates along the normalized electric field direction.
 */
function rk4Step(
  pos: Vector3D,
  charges: PointCharge[],
  relativePermittivity: number,
  stepSize: number,
  direction: number // +1 for positive charges, -1 for negative
): Vector3D {
  const getDirection = (p: Vector3D): Vector3D => {
    const E = electricFieldSuperposition(p, charges, relativePermittivity);
    const mag = vectorMagnitude(E);
    if (mag < MIN_FIELD_THRESHOLD) return { x: 0, y: 0, z: 0 };
    return vectorScale(vectorNormalize(E), direction);
  };
  
  const k1 = getDirection(pos);
  const k2 = getDirection(vectorAdd(pos, vectorScale(k1, stepSize * 0.5)));
  const k3 = getDirection(vectorAdd(pos, vectorScale(k2, stepSize * 0.5)));
  const k4 = getDirection(vectorAdd(pos, vectorScale(k3, stepSize)));
  
  return vectorAdd(pos, vectorScale(
    vectorAdd(vectorAdd(k1, vectorScale(k2, 2)), vectorAdd(vectorScale(k3, 2), k4)),
    stepSize / 6
  ));
}

/**
 * Generate seed points around a charge for field-line starting positions.
 * Seeds are distributed evenly in the xy-plane around the charge.
 */
export function generateSeedPoints(
  charge: PointCharge,
  count: number,
  seedRadius: number = 0.08
): Vector3D[] {
  const seeds: Vector3D[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    seeds.push({
      x: charge.position.x + seedRadius * Math.cos(angle),
      y: charge.position.y + seedRadius * Math.sin(angle),
      z: charge.position.z,
    });
  }
  return seeds;
}

/**
 * Trace a single field line from a starting position.
 */
export function traceFieldLine(
  start: Vector3D,
  charges: PointCharge[],
  direction: number,
  config: FieldLineConfig = {}
): FieldLine {
  const stepSize = config.stepSize ?? DEFAULT_STEP_SIZE;
  const maxSteps = config.maxSteps ?? DEFAULT_MAX_STEPS;
  const relativePermittivity = config.relativePermittivity ?? 1.0;
  const boundary = config.domainBoundary ?? DOMAIN_BOUNDARY;
  
  const line: FieldLine = [];
  let pos = { ...start };
  
  for (let i = 0; i < maxSteps; i++) {
    const E = electricFieldSuperposition(pos, charges, relativePermittivity);
    const mag = vectorMagnitude(E);
    
    // Terminate if field is too weak
    if (mag < MIN_FIELD_THRESHOLD) break;
    
    line.push({ position: { ...pos }, fieldMagnitude: mag });
    
    // RK4 step
    const nextPos = rk4Step(pos, charges, relativePermittivity, stepSize, direction);
    
    // Terminate if near a charge (opposite sign attracts lines)
    if (i > 2 && isNearCharge(nextPos, charges, CHARGE_PROXIMITY_THRESHOLD)) {
      line.push({ position: nextPos, fieldMagnitude: mag });
      break;
    }
    
    // Terminate if out of bounds
    if (isOutOfBounds(nextPos, boundary)) break;
    
    pos = nextPos;
  }
  
  return line;
}

/**
 * Generate all field lines for a set of charges.
 * Lines originate from positive charges (outward) and terminate at negative charges.
 */
export function generateFieldLines(
  charges: PointCharge[],
  linesPerCharge: number = 12,
  config: FieldLineConfig = {}
): FieldLine[] {
  const lines: FieldLine[] = [];
  
  for (const charge of charges) {
    if (Math.abs(charge.charge) < 1e-30) continue;
    
    // Field lines start from positive charges going outward
    // and from negative charges going inward (traced backward)
    const direction = charge.charge > 0 ? 1 : -1;
    const scaledCount = Math.max(4, Math.round(linesPerCharge * Math.sqrt(Math.abs(charge.charge) / 1e-9)));
    const actualCount = Math.min(scaledCount, 24); // cap at 24 lines per charge
    
    const seeds = generateSeedPoints(charge, actualCount);
    
    for (const seed of seeds) {
      const line = traceFieldLine(seed, charges, direction, config);
      if (line.length > 2) {
        lines.push(line);
      }
    }
  }
  
  return lines;
}
