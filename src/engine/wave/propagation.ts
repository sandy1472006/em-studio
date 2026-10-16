import { ComplexNumber } from '../../types/common';
import { MaterialProperties, PropagationResult, WaveParams } from '../../types/wave';

const EPSILON_0 = 8.854187817e-12; // F/m
const MU_0 = 4 * Math.PI * 1e-7; // H/m
const C_LIGHT = 2.99792458e8; // m/s

export { EPSILON_0, MU_0, C_LIGHT };

export function complexMultiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}

export function complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

export function complexSqrt(z: ComplexNumber): ComplexNumber {
  const mag = Math.sqrt(z.real * z.real + z.imag * z.imag);
  const angle = Math.atan2(z.imag, z.real);
  const sqrtMag = Math.sqrt(mag);
  const halfAngle = angle / 2;
  return {
    real: sqrtMag * Math.cos(halfAngle),
    imag: sqrtMag * Math.sin(halfAngle),
  };
}

export function complexDivide(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const denom = b.real * b.real + b.imag * b.imag;
  if (denom < 1e-40) return { real: 0, imag: 0 };
  return {
    real: (a.real * b.real + a.imag * b.imag) / denom,
    imag: (a.imag * b.real - a.real * b.imag) / denom,
  };
}

export function complexMagnitude(z: ComplexNumber): number {
  return Math.sqrt(z.real * z.real + z.imag * z.imag);
}

export function complexPhase(z: ComplexNumber): number {
  return Math.atan2(z.imag, z.real);
}

/**
 * Calculate the propagation constant gamma for a general medium.
 * gamma = sqrt[(j*omega*mu)*(sigma + j*omega*epsilon)]
 * 
 * Using e^(jwt) time convention (engineering convention).
 * gamma = alpha + j*beta where alpha >= 0.
 */
export function calculatePropagationConstant(
  frequency: number,
  material: MaterialProperties
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  const epsilon = EPSILON_0 * material.relativePermittivity;
  const mu = MU_0 * material.relativePermeability;
  const sigma = material.conductivity;
  
  // j*omega*mu
  const jwmu: ComplexNumber = { real: 0, imag: omega * mu };
  
  // sigma + j*omega*epsilon
  const sigmaJwEps: ComplexNumber = { real: sigma, imag: omega * epsilon };
  
  // gamma^2 = (j*omega*mu)(sigma + j*omega*epsilon)
  const gammaSq = complexMultiply(jwmu, sigmaJwEps);
  
  // gamma = sqrt(gamma^2)
  const gamma = complexSqrt(gammaSq);
  
  // Ensure alpha (real part) is non-negative
  if (gamma.real < 0) {
    return { real: -gamma.real, imag: -gamma.imag };
  }
  
  return gamma;
}

/**
 * Calculate intrinsic impedance of the medium.
 * eta = sqrt(j*omega*mu / (sigma + j*omega*epsilon))
 */
export function calculateIntrinsicImpedance(
  frequency: number,
  material: MaterialProperties
): ComplexNumber {
  const omega = 2 * Math.PI * frequency;
  const epsilon = EPSILON_0 * material.relativePermittivity;
  const mu = MU_0 * material.relativePermeability;
  const sigma = material.conductivity;
  
  const numerator: ComplexNumber = { real: 0, imag: omega * mu };
  const denominator: ComplexNumber = { real: sigma, imag: omega * epsilon };
  
  const ratio = complexDivide(numerator, denominator);
  return complexSqrt(ratio);
}

/**
 * Calculate all propagation parameters for given wave parameters.
 */
export function calculatePropagation(params: WaveParams): PropagationResult {
  const { frequency, amplitude, material, propagationDistance, observationZ } = params;
  
  const omega = 2 * Math.PI * frequency;
  
  // Propagation constant
  const gamma = calculatePropagationConstant(frequency, material);
  const alpha = gamma.real; // Attenuation constant (Np/m)
  const beta = gamma.imag; // Phase constant (rad/m)
  
  // Phase velocity
  const phaseVelocity = beta > 0 ? omega / beta : C_LIGHT;
  
  // Wavelength
  const wavelength = beta > 0 ? (2 * Math.PI) / beta : C_LIGHT / frequency;
  
  // Intrinsic impedance
  const intrinsicImpedance = calculateIntrinsicImpedance(frequency, material);
  
  // Skin depth (general)
  const skinDepth = alpha > 0 ? 1 / alpha : Infinity;
  
  // Skin depth (good conductor approximation)
  const mu = MU_0 * material.relativePermeability;
  const skinDepthGoodConductor = material.conductivity > 0
    ? Math.sqrt(2 / (omega * mu * material.conductivity))
    : Infinity;
  
  // Attenuation over propagation distance
  const attenuationDb = alpha > 0
    ? 20 * Math.log10(Math.exp(1)) * alpha * propagationDistance
    : 0;
  
  // Amplitude at observation distance
  const amplitudeAtDistance = amplitude * Math.exp(-alpha * observationZ);
  
  return {
    gamma,
    alpha,
    beta,
    phaseVelocity,
    wavelength,
    intrinsicImpedance,
    skinDepth,
    skinDepthGoodConductor,
    attenuationDb,
    amplitudeAtDistance,
  };
}
