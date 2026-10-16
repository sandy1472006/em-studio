import { PointCharge, PotentialMapData } from '../../types/electrostatics';
import { electricPotentialSuperposition, electricFieldSuperposition } from './coulomb';

/**
 * Generate a 2D potential map on a selected plane.
 */
export function generatePotentialMap(
  charges: PointCharge[],
  relativePermittivity: number,
  resolution: number = 50,
  range: number = 3.0,
  plane: 'xy' | 'xz' | 'yz' = 'xy',
  sliceCoordinate: number = 0
): PotentialMapData {
  const xValues: number[] = [];
  const yValues: number[] = [];
  const potentials: number[][] = [];
  const ExField: number[][] = [];
  const EyField: number[][] = [];
  
  const step = (2 * range) / (resolution - 1);
  
  // Generate axis values
  for (let i = 0; i < resolution; i++) {
    xValues.push(-range + i * step);
    yValues.push(-range + i * step);
  }
  
  // Calculate potential and field at each grid point
  for (let j = 0; j < resolution; j++) {
    const potRow: number[] = [];
    const ExRow: number[] = [];
    const EyRow: number[] = [];
    
    for (let i = 0; i < resolution; i++) {
      let point = { x: 0, y: 0, z: 0 };
      
      switch (plane) {
        case 'xy':
          point = { x: xValues[i], y: yValues[j], z: sliceCoordinate };
          break;
        case 'xz':
          point = { x: xValues[i], y: sliceCoordinate, z: yValues[j] };
          break;
        case 'yz':
          point = { x: sliceCoordinate, y: xValues[i], z: yValues[j] };
          break;
      }
      
      const V = electricPotentialSuperposition(point, charges, relativePermittivity);
      const E = electricFieldSuperposition(point, charges, relativePermittivity);
      
      // Clamp extreme values for visualization (near singularities)
      const clampedV = isNaN(V) ? 0 : Math.max(-1e6, Math.min(1e6, V));
      
      potRow.push(clampedV);
      ExRow.push(isNaN(E.x) ? 0 : E.x);
      EyRow.push(isNaN(E.y) ? 0 : E.y);
    }
    
    potentials.push(potRow);
    ExField.push(ExRow);
    EyField.push(EyRow);
  }
  
  return { xValues, yValues, potentials, ExField, EyField };
}
