import { describe, it, expect } from 'vitest';
import {
  calculateReflectionCoefficient,
  calculateInputImpedance,
  calculateStandingWaveDistribution,
  findExtrema,
} from '../engine/transmissionLine';
import { runTransmissionLineVerification } from '../engine/transmissionLine/verification';

describe('Transmission Line Physics Engine', () => {
  it('correctly calculates matched load condition (ZL = Z0)', () => {
    const result = calculateReflectionCoefficient(50, 50, 0);
    expect(result.gammaMagnitude).toBeCloseTo(0, 6);
    expect(result.vswr).toBeCloseTo(1.0, 6);
    expect(result.returnLoss).toBe(Infinity);
    expect(result.mismatchLoss).toBeCloseTo(0, 6);
  });

  it('correctly calculates open-circuit condition (ZL -> infinity)', () => {
    const result = calculateReflectionCoefficient(50, 1e15, 0);
    expect(result.gammaMagnitude).toBeCloseTo(1.0, 6);
    expect(result.vswr).toBe(Infinity);
    expect(result.gammaPhaseDeg).toBeCloseTo(0, 4);
  });

  it('correctly calculates short-circuit condition (ZL = 0)', () => {
    const result = calculateReflectionCoefficient(50, 0, 0);
    expect(result.gammaMagnitude).toBeCloseTo(1.0, 6);
    expect(result.vswr).toBe(Infinity);
    // Phase is 180 degrees
    expect(Math.abs(result.gammaPhaseDeg)).toBeCloseTo(180, 4);
  });

  it('correctly handles 100 Ohm load on 50 Ohm line: Gamma = 1/3, VSWR = 2', () => {
    const result = calculateReflectionCoefficient(50, 100, 0);
    expect(result.gammaMagnitude).toBeCloseTo(1 / 3, 5);
    expect(result.vswr).toBeCloseTo(2.0, 5);
  });

  it('correctly computes input impedance for quarter-wave line (Zin = Z0^2 / ZL)', () => {
    const Z0 = 50;
    const ZL = 100;
    const beta = Math.PI * 2; // wavelength = 1m
    const l = 0.25; // lambda / 4
    const result = calculateInputImpedance(Z0, ZL, 0, beta, l);

    // Zin = 50^2 / 100 = 2500 / 100 = 25 Ohms
    expect(result.Zin.real).toBeCloseTo(25, 1);
    expect(result.Zin.imag).toBeCloseTo(0, 1);
  });

  it('computes standing wave distribution and verifies Vmax / Vmin = VSWR', () => {
    const Z0 = 50;
    const ZL = 100;
    const V_inc = 10;
    const refl = calculateReflectionCoefficient(Z0, ZL, 0);
    const beta = 2 * Math.PI; // lambda = 1m
    const lineLength = 1.0;

    const data = calculateStandingWaveDistribution(V_inc, Z0, refl.gamma, beta, lineLength, 400);
    const extrema = findExtrema(data);

    // Vmax = V_inc * (1 + |Gamma|) = 10 * (1 + 1/3) = 13.333 V
    // Vmin = V_inc * (1 - |Gamma|) = 10 * (1 - 1/3) = 6.666 V
    expect(extrema.Vmax).toBeCloseTo(13.333, 2);
    expect(extrema.Vmin).toBeCloseTo(6.666, 2);
    expect(extrema.Vmax / extrema.Vmin).toBeCloseTo(refl.vswr, 2);
  });

  it('passes all 5 transmission line verification benchmark checks', () => {
    const tests = runTransmissionLineVerification();
    expect(tests.length).toBe(5);
    for (const test of tests) {
      expect(test.passed).toBe(true);
    }
  });
});
