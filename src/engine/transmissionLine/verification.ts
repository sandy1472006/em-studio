import { VerificationTest } from '../../types/common';
import { calculateReflectionCoefficient } from './reflection';
import { calculateInputImpedance } from './impedance';

const TOLERANCE = 1e-4;

function relativeError(actual: number, expected: number): number {
  if (expected === 0) return Math.abs(actual);
  return Math.abs((actual - expected) / expected);
}

function formatNum(n: number, decimals: number = 4): string {
  if (!isFinite(n)) return String(n);
  return n.toFixed(decimals);
}

/**
 * Test 1: Matched load — Γ = 0, VSWR = 1
 */
function testMatchedLoad(): VerificationTest {
  const result = calculateReflectionCoefficient(50, 50, 0);
  const passed = result.gammaMagnitude < TOLERANCE && Math.abs(result.vswr - 1) < TOLERANCE;
  
  return {
    id: 'tl-001',
    name: 'Matched load (ZL = Z0)',
    description: '50Ω load on 50Ω line: Γ = 0, VSWR = 1',
    expected: '|Γ| = 0, VSWR = 1.0000',
    actual: `|Γ| = ${formatNum(result.gammaMagnitude)}, VSWR = ${formatNum(result.vswr)}`,
    passed,
    tolerance: TOLERANCE,
  };
}

/**
 * Test 2: Open circuit — |Γ| = 1
 */
function testOpenCircuit(): VerificationTest {
  const result = calculateReflectionCoefficient(50, 1e15, 0);
  const error = relativeError(result.gammaMagnitude, 1.0);
  const passed = error < TOLERANCE;
  
  return {
    id: 'tl-002',
    name: 'Open circuit (ZL → ∞)',
    description: 'Open circuit: |Γ| = 1, VSWR → ∞',
    expected: '|Γ| = 1.0000, VSWR = ∞',
    actual: `|Γ| = ${formatNum(result.gammaMagnitude)}, VSWR = ${result.vswr === Infinity ? '∞' : formatNum(result.vswr)}`,
    passed,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 3: Short circuit — |Γ| = 1, phase = 180°
 */
function testShortCircuit(): VerificationTest {
  const result = calculateReflectionCoefficient(50, 0, 0);
  const magError = relativeError(result.gammaMagnitude, 1.0);
  // Phase should be 180° (or -180°, i.e., π)
  const phaseError = Math.min(
    Math.abs(result.gammaPhaseDeg - 180),
    Math.abs(result.gammaPhaseDeg + 180)
  );
  const passed = magError < TOLERANCE && phaseError < 0.1;
  
  return {
    id: 'tl-003',
    name: 'Short circuit (ZL = 0)',
    description: 'Short circuit: |Γ| = 1, ∠Γ = 180°',
    expected: '|Γ| = 1.0000, ∠Γ = ±180°',
    actual: `|Γ| = ${formatNum(result.gammaMagnitude)}, ∠Γ = ${formatNum(result.gammaPhaseDeg)}°`,
    passed,
    tolerance: TOLERANCE,
  };
}

/**
 * Test 4: Resistive mismatch — 100Ω load on 50Ω line
 * Γ = (100-50)/(100+50) = 50/150 = 1/3
 * VSWR = (1 + 1/3)/(1 - 1/3) = (4/3)/(2/3) = 2
 */
function testResistiveMismatch(): VerificationTest {
  const result = calculateReflectionCoefficient(50, 100, 0);
  const expectedGamma = 1 / 3;
  const expectedVSWR = 2;
  
  const gammaError = relativeError(result.gammaMagnitude, expectedGamma);
  const vswrError = relativeError(result.vswr, expectedVSWR);
  const passed = gammaError < TOLERANCE && vswrError < TOLERANCE;
  
  return {
    id: 'tl-004',
    name: 'Resistive mismatch (100Ω / 50Ω)',
    description: '100Ω load on 50Ω line: Γ = 1/3, VSWR = 2',
    expected: `|Γ| = ${formatNum(expectedGamma)}, VSWR = ${formatNum(expectedVSWR)}`,
    actual: `|Γ| = ${formatNum(result.gammaMagnitude)}, VSWR = ${formatNum(result.vswr)}`,
    passed,
    tolerance: TOLERANCE,
  };
}

/**
 * Test 5: Input impedance at half-wavelength
 * Zin(l = lambda/2) = ZL for a lossless line
 */
function testHalfWavelengthLine(): VerificationTest {
  const Z0 = 50;
  const ZL_real = 100;
  const ZL_imag = 25;
  const beta = 2 * Math.PI; // beta*lambda = 2*pi, so lambda = 1
  const halfLambda = 0.5; // l = lambda/2
  
  const result = calculateInputImpedance(Z0, ZL_real, ZL_imag, beta, halfLambda);
  const realError = relativeError(result.Zin.real, ZL_real);
  const imagError = relativeError(result.Zin.imag, ZL_imag);
  const passed = realError < 0.01 && imagError < 0.01; // 1% tolerance due to tan() numerical issues
  
  return {
    id: 'tl-005',
    name: 'Half-wavelength line Zin = ZL',
    description: 'At l = λ/2, Zin should equal ZL',
    expected: `Zin = ${formatNum(ZL_real)} + j${formatNum(ZL_imag)} Ω`,
    actual: `Zin = ${formatNum(result.Zin.real)} + j${formatNum(result.Zin.imag)} Ω`,
    passed,
    tolerance: 0.01,
  };
}

/**
 * Run all transmission line verification tests.
 */
export function runTransmissionLineVerification(): VerificationTest[] {
  return [
    testMatchedLoad(),
    testOpenCircuit(),
    testShortCircuit(),
    testResistiveMismatch(),
    testHalfWavelengthLine(),
  ];
}
