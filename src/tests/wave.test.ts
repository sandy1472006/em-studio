import { describe, it, expect } from 'vitest';
import {
  calculatePropagation,
  calculatePropagationConstant,
  calculateIntrinsicImpedance,
  C_LIGHT,
  EPSILON_0,
  MU_0,
} from '../engine/wave/propagation';
import { getEFieldComponents, getHFieldComponents } from '../engine/wave/polarisation';
import { calculatePoyntingVector, calculateTimeAveragedPower } from '../engine/wave/poynting';
import { materialPresets } from '../engine/wave/materials';
import { runWaveVerification } from '../engine/wave/verification';

describe('Wave Propagation Physics Engine', () => {
  it('correctly calculates free-space propagation parameters', () => {
    const f = 1e9; // 1 GHz
    const result = calculatePropagation({
      frequency: f,
      amplitude: 10,
      phase: 0,
      polarisation: 'linear',
      axRatio: 0,
      phaseDifference: 0,
      material: materialPresets['free-space'],
      propagationDistance: 1.0,
      observationZ: 0.5,
      animationSpeed: 1,
      isPlaying: false,
    });

    const expectedWavelength = C_LIGHT / f;
    const expectedBeta = (2 * Math.PI) / expectedWavelength;

    expect(result.alpha).toBeCloseTo(0, 5);
    expect(result.beta).toBeCloseTo(expectedBeta, 3);
    expect(result.wavelength).toBeCloseTo(expectedWavelength, 3);
    expect(result.phaseVelocity).toBeCloseTo(C_LIGHT, -2);
    expect(result.intrinsicImpedance.real).toBeCloseTo(376.73, 1);
    expect(result.intrinsicImpedance.imag).toBeCloseTo(0, 1);
  });

  it('correctly computes wave velocity and impedance in lossless dielectric', () => {
    const f = 2.4e9; // 2.4 GHz
    const er = 4.0;
    const result = calculatePropagation({
      frequency: f,
      amplitude: 1.0,
      phase: 0,
      polarisation: 'linear',
      axRatio: 0,
      phaseDifference: 0,
      material: materialPresets['lossless-dielectric'],
      propagationDistance: 1.0,
      observationZ: 0,
      animationSpeed: 1,
      isPlaying: false,
    });

    // vp = c / sqrt(er) = c / 2
    expect(result.phaseVelocity).toBeCloseTo(C_LIGHT / 2, -2);
    // eta = 377 / sqrt(er) = 377 / 2 = 188.36
    expect(result.intrinsicImpedance.real).toBeCloseTo(376.73 / 2, 1);
    expect(result.alpha).toBeCloseTo(0, 5);
  });

  it('verifies exponential decay and skin depth in lossy dielectric', () => {
    const f = 1e9;
    const result = calculatePropagation({
      frequency: f,
      amplitude: 10,
      phase: 0,
      polarisation: 'linear',
      axRatio: 0,
      phaseDifference: 0,
      material: materialPresets['lossy-dielectric'],
      propagationDistance: 2.0,
      observationZ: 1.0,
      animationSpeed: 1,
      isPlaying: false,
    });

    expect(result.alpha).toBeGreaterThan(0);
    expect(result.skinDepth).toBeCloseTo(1 / result.alpha, 4);
    // Amplitude at 1m should equal 10 * exp(-alpha * 1)
    expect(result.amplitudeAtDistance).toBeCloseTo(10 * Math.exp(-result.alpha * 1.0), 3);
  });

  it('evaluates circular polarisation orthogonality', () => {
    const omega = 2 * Math.PI * 1e9;
    const beta = omega / C_LIGHT;
    
    // At t=0, z=0: RH circular wave
    // Ex = Ax * cos(0) = 1
    // Ey = Ay * cos(-pi/2) = 0
    const pt0 = getEFieldComponents('circular-rh', 1.0, 1.0, 0, omega, beta, 0, 0);
    expect(pt0.Ex).toBeCloseTo(1.0, 4);
    expect(pt0.Ey).toBeCloseTo(0.0, 4);

    // At phase = pi/2:
    // Ex = Ax * cos(pi/2) = 0
    // Ey = Ay * cos(0) = 1
    const tQuarter = 0.25 / 1e9;
    const ptQuarter = getEFieldComponents('circular-rh', 1.0, 1.0, 0, omega, beta, tQuarter, 0);
    expect(ptQuarter.Ex).toBeCloseTo(0.0, 4);
    expect(ptQuarter.Ey).toBeCloseTo(1.0, 4);
  });

  it('verifies Poynting vector calculation', () => {
    const E = { x: 10, y: 0, z: 0 };
    const H = { x: 0, y: 10 / 377, z: 0 };
    const S = calculatePoyntingVector(E, H);

    // S = E x H = (10 * 10/377) z_hat
    expect(S.x).toBeCloseTo(0, 5);
    expect(S.y).toBeCloseTo(0, 5);
    expect(S.z).toBeCloseTo(100 / 377, 3);

    const timeAvg = calculateTimeAveragedPower(10, 377);
    expect(timeAvg).toBeCloseTo(100 / (2 * 377), 3);
  });

  it('passes all 6 wave verification benchmark checks', () => {
    const tests = runWaveVerification();
    expect(tests.length).toBe(6);
    for (const test of tests) {
      expect(test.passed).toBe(true);
    }
  });
});
