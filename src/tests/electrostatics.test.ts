import { describe, it, expect } from 'vitest';
import {
  electricFieldSingleCharge,
  electricPotentialSingleCharge,
  electricFieldSuperposition,
  electricPotentialSuperposition,
  calculateFieldAtPoint,
  vectorMagnitude,
  checkSingularity,
  EPSILON_0,
} from '../engine/electrostatics/coulomb';
import { solveLaplace } from '../engine/electrostatics/laplace';
import { runElectrostaticsVerification } from '../engine/electrostatics/verification';
import { PointCharge } from '../types/electrostatics';

describe('Electrostatics Physics Engine', () => {
  const nC = 1e-9;

  it('calculates electric field of a single point charge with correct magnitude and direction', () => {
    const charge: PointCharge = { id: 'q1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC };
    const point = { x: 1, y: 0, z: 0 };
    const E = electricFieldSingleCharge(point, charge, 1.0);

    const expectedE = (1 * nC) / (4 * Math.PI * EPSILON_0 * 1.0 * 1.0);
    expect(E.x).toBeCloseTo(expectedE, 3);
    expect(E.y).toBeCloseTo(0, 5);
    expect(E.z).toBeCloseTo(0, 5);
  });

  it('detects singularity when observation point matches charge position', () => {
    const charge: PointCharge = { id: 'q1', position: { x: 0.5, y: 0.5, z: 0 }, charge: 1 * nC };
    const singularity = checkSingularity({ x: 0.5, y: 0.5, z: 0 }, [charge]);
    expect(singularity.isSingular).toBe(true);
    expect(singularity.nearChargeId).toBe('q1');

    const E = electricFieldSingleCharge({ x: 0.5, y: 0.5, z: 0 }, charge);
    expect(Number.isNaN(E.x)).toBe(true);
  });

  it('verifies electric potential V = q / (4πεr)', () => {
    const charge: PointCharge = { id: 'q1', position: { x: 0, y: 0, z: 0 }, charge: 2 * nC };
    const point = { x: 0, y: 2, z: 0 };
    const V = electricPotentialSingleCharge(point, charge, 1.0);

    const expectedV = (2 * nC) / (4 * Math.PI * EPSILON_0 * 2.0);
    expect(V).toBeCloseTo(expectedV, 3);
  });

  it('demonstrates superposition with an electric dipole', () => {
    const charges: PointCharge[] = [
      { id: 'q1', position: { x: -1, y: 0, z: 0 }, charge: 1 * nC },
      { id: 'q2', position: { x: 1, y: 0, z: 0 }, charge: -1 * nC },
    ];
    // At the origin (0,0,0), potential should be exactly zero by anti-symmetry
    const V_origin = electricPotentialSuperposition({ x: 0, y: 0, z: 0 }, charges, 1.0);
    expect(V_origin).toBeCloseTo(0, 5);

    // E-field at origin should point in +x direction
    const E_origin = electricFieldSuperposition({ x: 0, y: 0, z: 0 }, charges, 1.0);
    expect(E_origin.x).toBeGreaterThan(0);
    expect(Math.abs(E_origin.y)).toBeCloseTo(0, 5);
  });

  it('scales electric field correctly with relative permittivity', () => {
    const charge: PointCharge = { id: 'q1', position: { x: 0, y: 0, z: 0 }, charge: 1 * nC };
    const point = { x: 1, y: 0, z: 0 };

    const E_vac = calculateFieldAtPoint(point, [charge], 1.0);
    const E_diel = calculateFieldAtPoint(point, [charge], 4.0);

    expect(E_vac.magnitude / E_diel.magnitude).toBeCloseTo(4.0, 4);
    // D field should be identical (D = eps * E = eps0 * er * (E / er) = eps0 * E)
    expect(vectorMagnitude(E_vac.D)).toBeCloseTo(vectorMagnitude(E_diel.D), 8);
  });

  it('solves Laplace equation on 2D rectangular grid with SOR', () => {
    const result = solveLaplace({
      width: 1.0,
      height: 1.0,
      gridResolution: 25,
      boundaryTop: 100,
      boundaryBottom: 0,
      boundaryLeft: 0,
      boundaryRight: 0,
      maxIterations: 2000,
      convergenceTolerance: 1e-4,
      solverMethod: 'sor',
      sorOmega: 1.4,
    });

    expect(result.converged).toBe(true);
    expect(result.residual).toBeLessThan(1e-4);
    // Top boundary is 100, bottom is 0; center potential should be ~25 V for standard Dirichlet problem
    const midX = Math.floor(result.gridNx / 2);
    const midY = Math.floor(result.gridNy / 2);
    const centerV = result.potential[midY][midX];
    expect(centerV).toBeGreaterThan(15);
    expect(centerV).toBeLessThan(40);
  });

  it('passes all 7 analytical verification benchmark tests', () => {
    const tests = runElectrostaticsVerification();
    expect(tests.length).toBe(7);
    for (const test of tests) {
      expect(test.passed).toBe(true);
    }
  });
});
