import { VerificationTest } from '../../types/common';
import { PointCharge } from '../../types/electrostatics';
import {
  electricFieldSuperposition,
  electricPotentialSuperposition,
  vectorMagnitude,
  vectorNormalize,
  vectorSubtract,
  EPSILON_0,
} from './coulomb';

const nC = 1e-9;
const TOLERANCE = 1e-3; // 0.1% relative tolerance

function relativeError(actual: number, expected: number): number {
  if (expected === 0) return Math.abs(actual);
  return Math.abs((actual - expected) / expected);
}

function formatSci(n: number): string {
  return n.toExponential(4);
}

/**
 * Test 1: Single positive charge produces field directed away
 */
function testFieldDirection(): VerificationTest {
  const charge: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC };
  const point = { x: 1, y: 0, z: 0 };
  const E = electricFieldSuperposition(point, [charge]);
  const direction = vectorNormalize(E);
  
  // For a positive charge at origin, field at (1,0,0) should point in +x direction
  const passed = direction.x > 0.99 && Math.abs(direction.y) < 0.01 && Math.abs(direction.z) < 0.01;
  
  return {
    id: 'es-001',
    name: 'Field direction from positive charge',
    description: 'E-field from +1nC at origin should point radially outward at (1,0,0)',
    expected: 'Direction: (+1, 0, 0)',
    actual: `Direction: (${direction.x.toFixed(4)}, ${direction.y.toFixed(4)}, ${direction.z.toFixed(4)})`,
    passed,
  };
}

/**
 * Test 2: Reversing charge reverses field direction
 */
function testFieldReversal(): VerificationTest {
  const posCharge: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC };
  const negCharge: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: -1 * nC };
  const point = { x: 1, y: 0, z: 0 };
  
  const Epos = electricFieldSuperposition(point, [posCharge]);
  const Eneg = electricFieldSuperposition(point, [negCharge]);
  
  // Fields should be exactly opposite
  const sumX = Math.abs(Epos.x + Eneg.x);
  const sumY = Math.abs(Epos.y + Eneg.y);
  const sumZ = Math.abs(Epos.z + Eneg.z);
  const passed = sumX < 1e-10 && sumY < 1e-10 && sumZ < 1e-10;
  
  return {
    id: 'es-002',
    name: 'Field reversal with charge sign',
    description: 'Reversing charge sign should reverse E-field direction exactly',
    expected: 'E(+q) = -E(-q)',
    actual: `Residual: (${formatSci(sumX)}, ${formatSci(sumY)}, ${formatSci(sumZ)})`,
    passed,
  };
}

/**
 * Test 3: Doubling charge doubles field magnitude
 */
function testFieldProportionality(): VerificationTest {
  const q1: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC };
  const q2: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: 2 * nC };
  const point = { x: 1, y: 0, z: 0 };
  
  const E1 = vectorMagnitude(electricFieldSuperposition(point, [q1]));
  const E2 = vectorMagnitude(electricFieldSuperposition(point, [q2]));
  const ratio = E2 / E1;
  const error = relativeError(ratio, 2.0);
  const passed = error < TOLERANCE;
  
  return {
    id: 'es-003',
    name: 'Field proportionality to charge',
    description: 'Doubling charge should double field magnitude at fixed point',
    expected: '|E(2q)| / |E(q)| = 2.0000',
    actual: `|E(2q)| / |E(q)| = ${ratio.toFixed(4)}`,
    passed,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 4: Inverse-square law — doubling distance reduces field by factor of 4
 */
function testInverseSquare(): VerificationTest {
  const charge: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC };
  const p1 = { x: 1, y: 0, z: 0 };
  const p2 = { x: 2, y: 0, z: 0 };
  
  const E1 = vectorMagnitude(electricFieldSuperposition(p1, [charge]));
  const E2 = vectorMagnitude(electricFieldSuperposition(p2, [charge]));
  const ratio = E1 / E2;
  const error = relativeError(ratio, 4.0);
  const passed = error < TOLERANCE;
  
  return {
    id: 'es-004',
    name: 'Inverse-square law',
    description: 'Doubling distance should reduce field by factor of 4',
    expected: '|E(r)| / |E(2r)| = 4.0000',
    actual: `|E(r)| / |E(2r)| = ${ratio.toFixed(4)}`,
    passed,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 5: Dipole superposition — field at midpoint of equal/opposite charges
 */
function testDipoleSuperposition(): VerificationTest {
  const charges: PointCharge[] = [
    { id: 'q1', position: { x: -1, y: 0, z: 0 }, charge: 1 * nC },
    { id: 'q2', position: { x: 1, y: 0, z: 0 }, charge: -1 * nC },
  ];
  // At the midpoint (0,0,0), both fields point in -x direction
  const E = electricFieldSuperposition({ x: 0, y: 0, z: 0 }, charges);
  
  // Both charges create field in +x direction at origin (positive charge at -1 pushes +x, negative at +1 attracts +x)
  const passed = E.x > 0 && Math.abs(E.y) < 1e-10 && Math.abs(E.z) < 1e-10;
  
  return {
    id: 'es-005',
    name: 'Dipole field superposition',
    description: 'At the midpoint of a dipole, fields from both charges reinforce in +x direction',
    expected: 'E points in +x direction, Ey = Ez = 0',
    actual: `E = (${formatSci(E.x)}, ${formatSci(E.y)}, ${formatSci(E.z)}) V/m`,
    passed,
  };
}

/**
 * Test 6: Symmetry check — quadrupole E-field magnitude at symmetric points
 */
function testSymmetry(): VerificationTest {
  const charges: PointCharge[] = [
    { id: 'q1', position: { x: -1, y: 1, z: 0 }, charge: 1 * nC },
    { id: 'q2', position: { x: 1, y: 1, z: 0 }, charge: -1 * nC },
    { id: 'q3', position: { x: -1, y: -1, z: 0 }, charge: -1 * nC },
    { id: 'q4', position: { x: 1, y: -1, z: 0 }, charge: 1 * nC },
  ];
  
  // At (0, 2, 0) and (0, -2, 0), by symmetry, |E| should be equal
  const E_top = vectorMagnitude(electricFieldSuperposition({ x: 0, y: 2, z: 0 }, charges));
  const E_bottom = vectorMagnitude(electricFieldSuperposition({ x: 0, y: -2, z: 0 }, charges));
  
  const error = relativeError(E_top, E_bottom);
  const passed = error < TOLERANCE;
  
  return {
    id: 'es-006',
    name: 'Quadrupole symmetry',
    description: 'Symmetric quadrupole should produce equal |E| at symmetric observation points',
    expected: `|E(0,2,0)| = |E(0,-2,0)|`,
    actual: `|E_top| = ${formatSci(E_top)}, |E_bottom| = ${formatSci(E_bottom)}`,
    passed,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 7: Analytical field value check for single charge
 * E = q / (4πε₀r²) for a charge q at distance r
 */
function testAnalyticalValue(): VerificationTest {
  const q = 1e-9; // 1 nC
  const r = 1.0; // 1 m
  const charge: PointCharge = { id: 't1', position: { x: 0, y: 0, z: 0 }, charge: q };
  const point = { x: r, y: 0, z: 0 };
  
  const E_calculated = vectorMagnitude(electricFieldSuperposition(point, [charge]));
  const E_analytical = q / (4 * Math.PI * EPSILON_0 * r * r);
  
  const error = relativeError(E_calculated, E_analytical);
  const passed = error < TOLERANCE;
  
  return {
    id: 'es-007',
    name: 'Analytical field value',
    description: 'Computed |E| should match analytical E = q/(4πε₀r²) for 1nC at 1m',
    expected: `E = ${formatSci(E_analytical)} V/m`,
    actual: `E = ${formatSci(E_calculated)} V/m`,
    passed,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Run all electrostatics verification tests.
 */
export function runElectrostaticsVerification(): VerificationTest[] {
  return [
    testFieldDirection(),
    testFieldReversal(),
    testFieldProportionality(),
    testInverseSquare(),
    testDipoleSuperposition(),
    testSymmetry(),
    testAnalyticalValue(),
  ];
}
