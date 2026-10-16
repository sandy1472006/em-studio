import { VerificationTest } from '../../types/common';
import { MaterialProperties } from '../../types/wave';
import { calculatePropagation } from './propagation';
import { C_LIGHT, EPSILON_0, MU_0 } from './propagation';
import { getEFieldComponents, getHFieldComponents } from './polarisation';

const TOLERANCE = 1e-3;

function relativeError(actual: number, expected: number): number {
  if (expected === 0) return Math.abs(actual);
  return Math.abs((actual - expected) / expected);
}

function formatSci(n: number): string {
  if (!isFinite(n)) return String(n);
  return n.toExponential(4);
}

/**
 * Test 1: Free-space wavelength lambda = c / f
 */
function testFreeSpaceWavelength(): VerificationTest {
  const f = 1e9; // 1 GHz
  const material: MaterialProperties = {
    name: 'Free Space', relativePermittivity: 1, relativePermeability: 1, conductivity: 0, type: 'free-space',
  };
  const result = calculatePropagation({
    frequency: f, amplitude: 1, phase: 0, polarisation: 'linear',
    axRatio: 0, phaseDifference: 0, material,
    propagationDistance: 1, observationZ: 0, animationSpeed: 1, isPlaying: false,
  });
  
  const expected = C_LIGHT / f;
  const error = relativeError(result.wavelength, expected);
  
  return {
    id: 'wave-001',
    name: 'Free-space wavelength',
    description: 'lambda = c/f at 1 GHz in free space',
    expected: `lambda = ${formatSci(expected)} m`,
    actual: `lambda = ${formatSci(result.wavelength)} m`,
    passed: error < TOLERANCE,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 2: Zero attenuation in lossless medium
 */
function testLosslessAttenuation(): VerificationTest {
  const material: MaterialProperties = {
    name: 'Lossless', relativePermittivity: 4, relativePermeability: 1, conductivity: 0, type: 'lossless-dielectric',
  };
  const result = calculatePropagation({
    frequency: 1e9, amplitude: 1, phase: 0, polarisation: 'linear',
    axRatio: 0, phaseDifference: 0, material,
    propagationDistance: 1, observationZ: 0, animationSpeed: 1, isPlaying: false,
  });
  
  return {
    id: 'wave-002',
    name: 'Zero attenuation in lossless medium',
    description: 'alpha should be 0 for sigma = 0',
    expected: 'alpha = 0 Np/m',
    actual: `alpha = ${formatSci(result.alpha)} Np/m`,
    passed: Math.abs(result.alpha) < 1e-10,
  };
}

/**
 * Test 3: Phase velocity in lossless dielectric
 * vp = c / sqrt(er * ur)
 */
function testPhaseVelocity(): VerificationTest {
  const er = 4;
  const material: MaterialProperties = {
    name: 'Dielectric', relativePermittivity: er, relativePermeability: 1, conductivity: 0, type: 'lossless-dielectric',
  };
  const result = calculatePropagation({
    frequency: 1e9, amplitude: 1, phase: 0, polarisation: 'linear',
    axRatio: 0, phaseDifference: 0, material,
    propagationDistance: 1, observationZ: 0, animationSpeed: 1, isPlaying: false,
  });
  
  const expected = C_LIGHT / Math.sqrt(er);
  const error = relativeError(result.phaseVelocity, expected);
  
  return {
    id: 'wave-003',
    name: 'Phase velocity in dielectric',
    description: 'vp = c/sqrt(er) for lossless dielectric with er=4',
    expected: `vp = ${formatSci(expected)} m/s`,
    actual: `vp = ${formatSci(result.phaseVelocity)} m/s`,
    passed: error < TOLERANCE,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 4: Exponential attenuation in lossy medium
 */
function testLossyAttenuation(): VerificationTest {
  const material: MaterialProperties = {
    name: 'Lossy', relativePermittivity: 10, relativePermeability: 1, conductivity: 0.01, type: 'lossy-dielectric',
  };
  const z = 1.0;
  const result = calculatePropagation({
    frequency: 1e9, amplitude: 1, phase: 0, polarisation: 'linear',
    axRatio: 0, phaseDifference: 0, material,
    propagationDistance: z, observationZ: z, animationSpeed: 1, isPlaying: false,
  });
  
  // |E(z)| = |E(0)| * exp(-alpha * z)
  const expectedAmplitude = 1.0 * Math.exp(-result.alpha * z);
  const error = relativeError(result.amplitudeAtDistance, expectedAmplitude);
  
  return {
    id: 'wave-004',
    name: 'Exponential attenuation',
    description: 'E(z) = E(0)*exp(-alpha*z) in lossy medium',
    expected: `|E(${z}m)| = ${formatSci(expectedAmplitude)} V/m`,
    actual: `|E(${z}m)| = ${formatSci(result.amplitudeAtDistance)} V/m`,
    passed: error < TOLERANCE && result.alpha > 0,
    tolerance: TOLERANCE,
    error,
  };
}

/**
 * Test 5: Good conductor skin depth approximation
 */
function testSkinDepth(): VerificationTest {
  const sigma = 5.8e7;
  const f = 1e9;
  const material: MaterialProperties = {
    name: 'Copper', relativePermittivity: 1, relativePermeability: 1, conductivity: sigma, type: 'good-conductor',
  };
  const result = calculatePropagation({
    frequency: f, amplitude: 1, phase: 0, polarisation: 'linear',
    axRatio: 0, phaseDifference: 0, material,
    propagationDistance: 1, observationZ: 0, animationSpeed: 1, isPlaying: false,
  });
  
  // Good conductor approximation: delta = sqrt(2 / (omega * mu * sigma))
  const omega = 2 * Math.PI * f;
  const mu = MU_0;
  const expectedDelta = Math.sqrt(2 / (omega * mu * sigma));
  const error = relativeError(result.skinDepth, expectedDelta);
  
  return {
    id: 'wave-005',
    name: 'Good conductor skin depth',
    description: 'Skin depth for copper at 1 GHz',
    expected: `delta = ${formatSci(expectedDelta)} m`,
    actual: `delta_general = ${formatSci(result.skinDepth)} m, delta_approx = ${formatSci(result.skinDepthGoodConductor)} m`,
    passed: error < 0.01, // 1% tolerance for good conductor approximation
    tolerance: 0.01,
    error,
  };
}

/**
 * Test 6: Perpendicular E and H orientation
 */
function testPerpendicularFields(): VerificationTest {
  const f = 1e9;
  const omega = 2 * Math.PI * f;
  const beta = omega / C_LIGHT;
  const eta = Math.sqrt(MU_0 / EPSILON_0); // ~377 ohms
  
  const { Ex, Ey } = getEFieldComponents('linear', 1.0, 0, 0, omega, beta, 0, 0);
  const { Hx, Hy } = getHFieldComponents(Ex, Ey, eta);
  
  // For linear polarisation: E along x, H along y
  // Dot product E.H should be zero (perpendicular)
  const dotProduct = Ex * Hx + Ey * Hy;
  
  return {
    id: 'wave-006',
    name: 'Perpendicular E and H',
    description: 'E and H fields should be perpendicular for a plane wave',
    expected: 'E . H = 0',
    actual: `E . H = ${formatSci(dotProduct)}`,
    passed: Math.abs(dotProduct) < 1e-10,
  };
}

/**
 * Run all wave verification tests.
 */
export function runWaveVerification(): VerificationTest[] {
  return [
    testFreeSpaceWavelength(),
    testLosslessAttenuation(),
    testPhaseVelocity(),
    testLossyAttenuation(),
    testSkinDepth(),
    testPerpendicularFields(),
  ];
}
