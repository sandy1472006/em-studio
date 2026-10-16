import { PolarisationType, PolarisationPoint } from '../../types/wave';

/**
 * Generate the polarisation trajectory for the E-field tip.
 * 
 * Ex = Ax * cos(wt - bz)
 * Ey = Ay * cos(wt - bz + phi)
 * 
 * For linear: Ay = 0 (or phi = 0/pi)
 * For circular RH: Ax = Ay, phi = -pi/2
 * For circular LH: Ax = Ay, phi = +pi/2
 * For elliptical: arbitrary Ax, Ay, phi
 * 
 * Convention: looking along -z direction (wave propagating toward viewer)
 */
export function generatePolarisationTrajectory(
  polarisation: PolarisationType,
  amplitude: number,
  axRatio: number, // Ey/Ex amplitude ratio
  phaseDifference: number, // phi in radians
  points: number = 100,
  beta: number = 1, // for spatial variation
  z: number = 0 // observation position
): PolarisationPoint[] {
  const trajectory: PolarisationPoint[] = [];
  
  let Ax = amplitude;
  let Ay: number;
  let phi: number;
  
  switch (polarisation) {
    case 'linear':
      Ay = 0;
      phi = 0;
      break;
    case 'circular-rh':
      Ay = amplitude;
      phi = -Math.PI / 2; // RH: Ey lags Ex by 90 degrees
      break;
    case 'circular-lh':
      Ay = amplitude;
      phi = Math.PI / 2; // LH: Ey leads Ex by 90 degrees
      break;
    case 'elliptical':
      Ay = amplitude * axRatio;
      phi = phaseDifference;
      break;
    default:
      Ay = 0;
      phi = 0;
  }
  
  for (let i = 0; i <= points; i++) {
    const t = (2 * Math.PI * i) / points;
    const phase = t - beta * z;
    const Ex = Ax * Math.cos(phase);
    const Ey = Ay * Math.cos(phase + phi);
    trajectory.push({ Ex, Ey, t });
  }
  
  return trajectory;
}

/**
 * Get E-field components at a specific time and position.
 */
export function getEFieldComponents(
  polarisation: PolarisationType,
  amplitude: number,
  axRatio: number,
  phaseDifference: number,
  omega: number,
  beta: number,
  t: number,
  z: number,
  alpha: number = 0 // attenuation
): { Ex: number; Ey: number } {
  let Ax = amplitude * Math.exp(-alpha * z);
  let Ay: number;
  let phi: number;
  
  switch (polarisation) {
    case 'linear':
      Ay = 0;
      phi = 0;
      break;
    case 'circular-rh':
      Ay = Ax;
      phi = -Math.PI / 2;
      break;
    case 'circular-lh':
      Ay = Ax;
      phi = Math.PI / 2;
      break;
    case 'elliptical':
      Ay = Ax * axRatio;
      phi = phaseDifference;
      break;
    default:
      Ay = 0;
      phi = 0;
  }
  
  const phase = omega * t - beta * z;
  return {
    Ex: Ax * Math.cos(phase),
    Ey: Ay * Math.cos(phase + phi),
  };
}

/**
 * Get H-field components from E-field using intrinsic impedance.
 * For a plane wave: H = (1/eta) * (k_hat x E)
 * With wave in +z: Hx = -Ey/|eta|, Hy = Ex/|eta| (for real eta)
 */
export function getHFieldComponents(
  Ex: number,
  Ey: number,
  etaMagnitude: number
): { Hx: number; Hy: number } {
  if (etaMagnitude < 1e-20) return { Hx: 0, Hy: 0 };
  return {
    Hx: -Ey / etaMagnitude,
    Hy: Ex / etaMagnitude,
  };
}
