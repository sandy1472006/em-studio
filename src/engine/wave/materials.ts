import { MaterialProperties } from '../../types/wave';

export const materialPresets: Record<string, MaterialProperties> = {
  'free-space': {
    name: 'Free Space (Vacuum)',
    relativePermittivity: 1.0,
    relativePermeability: 1.0,
    conductivity: 0,
    type: 'free-space',
  },
  'lossless-dielectric': {
    name: 'Lossless Dielectric (Glass)',
    relativePermittivity: 4.0,
    relativePermeability: 1.0,
    conductivity: 0,
    type: 'lossless-dielectric',
  },
  'lossy-dielectric': {
    name: 'Lossy Dielectric (Wet Earth)',
    relativePermittivity: 10.0,
    relativePermeability: 1.0,
    conductivity: 0.01,
    type: 'lossy-dielectric',
  },
  'good-conductor': {
    name: 'Good Conductor (Copper)',
    relativePermittivity: 1.0,
    relativePermeability: 1.0,
    conductivity: 5.8e7,
    type: 'good-conductor',
  },
};

export const wavePresets = [
  {
    id: 'free-space-linear',
    name: 'Free-Space Sinusoidal Wave',
    description: 'Linear polarisation in vacuum at 1 GHz',
    module: 'wave-propagation' as const,
    parameters: {
      frequency: 1e9,
      amplitude: 1.0,
      phase: 0,
      polarisation: 'linear',
      material: materialPresets['free-space'],
    },
  },
  {
    id: 'linear-pol',
    name: 'Linear Polarisation',
    description: 'Linearly polarised plane wave in free space',
    module: 'wave-propagation' as const,
    parameters: {
      frequency: 1e9,
      amplitude: 1.0,
      phase: 0,
      polarisation: 'linear',
      material: materialPresets['free-space'],
    },
  },
  {
    id: 'circular-pol',
    name: 'Circular Polarisation (RH)',
    description: 'Right-hand circular polarisation in free space',
    module: 'wave-propagation' as const,
    parameters: {
      frequency: 1e9,
      amplitude: 1.0,
      phase: 0,
      polarisation: 'circular-rh',
      material: materialPresets['free-space'],
    },
  },
  {
    id: 'lossy-dielectric',
    name: 'Lossy Dielectric',
    description: 'Wave attenuation in wet earth',
    module: 'wave-propagation' as const,
    parameters: {
      frequency: 1e9,
      amplitude: 1.0,
      phase: 0,
      polarisation: 'linear',
      material: materialPresets['lossy-dielectric'],
    },
  },
  {
    id: 'good-conductor',
    name: 'Good Conductor Attenuation',
    description: 'Rapid attenuation and skin-depth effect in copper',
    module: 'wave-propagation' as const,
    parameters: {
      frequency: 1e9,
      amplitude: 1.0,
      phase: 0,
      polarisation: 'linear',
      material: materialPresets['good-conductor'],
    },
  },
];
