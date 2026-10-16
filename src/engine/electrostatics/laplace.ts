import { LaplaceConfig, LaplaceResult } from '../../types/electrostatics';

/**
 * Finite-difference solver for Laplace's equation ∇²V = 0
 * on a rectangular 2D domain with Dirichlet boundary conditions.
 * 
 * Supports Jacobi, Gauss-Seidel, and SOR (Successive Over-Relaxation) methods.
 */

/**
 * Initialize the potential grid with boundary conditions.
 */
function initializeGrid(
  config: LaplaceConfig
): number[][] {
  const nx = config.gridResolution;
  const ny = config.gridResolution;
  const grid: number[][] = [];
  
  for (let j = 0; j < ny; j++) {
    const row: number[] = [];
    for (let i = 0; i < nx; i++) {
      // Set boundary values
      if (j === 0) {
        row.push(config.boundaryBottom);
      } else if (j === ny - 1) {
        row.push(config.boundaryTop);
      } else if (i === 0) {
        row.push(config.boundaryLeft);
      } else if (i === nx - 1) {
        row.push(config.boundaryRight);
      } else {
        // Interior: initialize to average of boundaries
        row.push(
          (config.boundaryTop + config.boundaryBottom + config.boundaryLeft + config.boundaryRight) / 4
        );
      }
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Perform one Jacobi iteration.
 * V_new[i,j] = (V[i+1,j] + V[i-1,j] + V[i,j+1] + V[i,j-1]) / 4
 */
function jacobiIteration(grid: number[][], nx: number, ny: number): { newGrid: number[][]; maxDiff: number } {
  const newGrid: number[][] = grid.map(row => [...row]);
  let maxDiff = 0;
  
  for (let j = 1; j < ny - 1; j++) {
    for (let i = 1; i < nx - 1; i++) {
      const newVal = (grid[j][i + 1] + grid[j][i - 1] + grid[j + 1][i] + grid[j - 1][i]) / 4;
      maxDiff = Math.max(maxDiff, Math.abs(newVal - grid[j][i]));
      newGrid[j][i] = newVal;
    }
  }
  
  return { newGrid, maxDiff };
}

/**
 * Perform one Gauss-Seidel iteration (in-place update).
 */
function gaussSeidelIteration(grid: number[][], nx: number, ny: number): number {
  let maxDiff = 0;
  
  for (let j = 1; j < ny - 1; j++) {
    for (let i = 1; i < nx - 1; i++) {
      const oldVal = grid[j][i];
      grid[j][i] = (grid[j][i + 1] + grid[j][i - 1] + grid[j + 1][i] + grid[j - 1][i]) / 4;
      maxDiff = Math.max(maxDiff, Math.abs(grid[j][i] - oldVal));
    }
  }
  
  return maxDiff;
}

/**
 * Perform one SOR iteration.
 * V_new = V_old + ω × (V_GS - V_old)
 * where V_GS is the Gauss-Seidel update.
 */
function sorIteration(grid: number[][], nx: number, ny: number, omega: number): number {
  let maxDiff = 0;
  
  for (let j = 1; j < ny - 1; j++) {
    for (let i = 1; i < nx - 1; i++) {
      const oldVal = grid[j][i];
      const gsVal = (grid[j][i + 1] + grid[j][i - 1] + grid[j + 1][i] + grid[j - 1][i]) / 4;
      grid[j][i] = oldVal + omega * (gsVal - oldVal);
      maxDiff = Math.max(maxDiff, Math.abs(grid[j][i] - oldVal));
    }
  }
  
  return maxDiff;
}

/**
 * Compute electric field components from potential gradient.
 * E = -∇V
 * Ex = -(V[i+1,j] - V[i-1,j]) / (2Δx)
 * Ey = -(V[i,j+1] - V[i,j-1]) / (2Δy)
 */
function computeFieldFromPotential(
  potential: number[][],
  nx: number,
  ny: number,
  dx: number,
  dy: number
): { Ex: number[][]; Ey: number[][] } {
  const Ex: number[][] = [];
  const Ey: number[][] = [];
  
  for (let j = 0; j < ny; j++) {
    const exRow: number[] = [];
    const eyRow: number[] = [];
    
    for (let i = 0; i < nx; i++) {
      // Central differences for interior, forward/backward at boundaries
      let ex = 0;
      let ey = 0;
      
      if (i > 0 && i < nx - 1) {
        ex = -(potential[j][i + 1] - potential[j][i - 1]) / (2 * dx);
      } else if (i === 0) {
        ex = -(potential[j][i + 1] - potential[j][i]) / dx;
      } else {
        ex = -(potential[j][i] - potential[j][i - 1]) / dx;
      }
      
      if (j > 0 && j < ny - 1) {
        ey = -(potential[j + 1][i] - potential[j - 1][i]) / (2 * dy);
      } else if (j === 0) {
        ey = -(potential[j + 1][i] - potential[j][i]) / dy;
      } else {
        ey = -(potential[j][i] - potential[j - 1][i]) / dy;
      }
      
      exRow.push(ex);
      eyRow.push(ey);
    }
    
    Ex.push(exRow);
    Ey.push(eyRow);
  }
  
  return { Ex, Ey };
}

/**
 * Solve Laplace's equation using the configured method.
 */
export function solveLaplace(config: LaplaceConfig): LaplaceResult {
  const nx = config.gridResolution;
  const ny = config.gridResolution;
  let grid = initializeGrid(config);
  
  const dx = config.width / (nx - 1);
  const dy = config.height / (ny - 1);
  
  let iterations = 0;
  let residual = Infinity;
  let converged = false;
  
  for (let iter = 0; iter < config.maxIterations; iter++) {
    iterations = iter + 1;
    
    switch (config.solverMethod) {
      case 'jacobi': {
        const result = jacobiIteration(grid, nx, ny);
        grid = result.newGrid;
        residual = result.maxDiff;
        break;
      }
      case 'gauss-seidel': {
        residual = gaussSeidelIteration(grid, nx, ny);
        break;
      }
      case 'sor': {
        residual = sorIteration(grid, nx, ny, config.sorOmega);
        break;
      }
    }
    
    if (residual < config.convergenceTolerance) {
      converged = true;
      break;
    }
  }
  
  const { Ex, Ey } = computeFieldFromPotential(grid, nx, ny, dx, dy);
  
  return {
    potential: grid,
    Ex,
    Ey,
    iterations,
    residual,
    converged,
    gridNx: nx,
    gridNy: ny,
  };
}
