import React, { useState } from 'react';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { X, Play, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface LaplaceSolverPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaplaceSolverPanel: React.FC<LaplaceSolverPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const laplaceConfig = useElectrostaticsStore((s) => s.laplaceConfig);
  const setLaplaceConfig = useElectrostaticsStore((s) => s.setLaplaceConfig);
  const laplaceResult = useElectrostaticsStore((s) => s.laplaceResult);
  const solveLaplace = useElectrostaticsStore((s) => s.solveLaplace);

  const [isSolving, setIsSolving] = useState(false);

  if (!isOpen) return null;

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      solveLaplace();
      setIsSolving(false);
    }, 50);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-em-text-primary">
              2D Finite-Difference Laplace Equation Solver
            </span>
            <span className="text-2xs font-mono text-em-accent bg-em-accent/10 px-2 py-0.5 rounded border border-em-accent/30">
              ∇²V = 0 (Dirichlet BVP)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Controls Column */}
          <div className="space-y-4">
            <div className="p-3 rounded bg-em-surface-light border border-em-border space-y-3">
              <div className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
                Boundary Voltages (V)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-2xs text-em-text-muted block">Top Boundary</label>
                  <input
                    type="number"
                    value={laplaceConfig.boundaryTop}
                    onChange={(e) =>
                      setLaplaceConfig({ boundaryTop: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block">Bottom Boundary</label>
                  <input
                    type="number"
                    value={laplaceConfig.boundaryBottom}
                    onChange={(e) =>
                      setLaplaceConfig({ boundaryBottom: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block">Left Boundary</label>
                  <input
                    type="number"
                    value={laplaceConfig.boundaryLeft}
                    onChange={(e) =>
                      setLaplaceConfig({ boundaryLeft: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="text-2xs text-em-text-muted block">Right Boundary</label>
                  <input
                    type="number"
                    value={laplaceConfig.boundaryRight}
                    onChange={(e) =>
                      setLaplaceConfig({ boundaryRight: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-center"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-em-surface-light border border-em-border space-y-3">
              <div className="font-semibold text-2xs text-em-text-primary uppercase tracking-wider">
                Numerical Solver Configuration
              </div>

              <div>
                <label className="text-2xs text-em-text-muted block mb-1">Method</label>
                <select
                  value={laplaceConfig.solverMethod}
                  onChange={(e) =>
                    setLaplaceConfig({
                      solverMethod: e.target.value as 'jacobi' | 'gauss-seidel' | 'sor',
                    })
                  }
                  className="w-full"
                >
                  <option value="sor">SOR (Successive Over-Relaxation)</option>
                  <option value="gauss-seidel">Gauss-Seidel (In-Place)</option>
                  <option value="jacobi">Jacobi Iteration (Simultaneous)</option>
                </select>
              </div>

              {laplaceConfig.solverMethod === 'sor' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xs text-em-text-muted">Relaxation Factor (ω)</span>
                    <span className="font-mono text-2xs text-em-accent">
                      {laplaceConfig.sorOmega.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="1.95"
                    step="0.05"
                    value={laplaceConfig.sorOmega}
                    onChange={(e) =>
                      setLaplaceConfig({ sorOmega: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="text-2xs text-em-text-muted block mb-1">Mesh Resolution</label>
                <select
                  value={laplaceConfig.gridResolution}
                  onChange={(e) =>
                    setLaplaceConfig({ gridResolution: parseInt(e.target.value) })
                  }
                  className="w-full"
                >
                  <option value={20}>20 × 20 Grid (Fastest)</option>
                  <option value={35}>35 × 35 Grid (Standard)</option>
                  <option value={50}>50 × 50 Grid (High Accuracy)</option>
                </select>
              </div>

              <div>
                <label className="text-2xs text-em-text-muted block mb-1">
                  Convergence Tolerance
                </label>
                <select
                  value={laplaceConfig.convergenceTolerance}
                  onChange={(e) =>
                    setLaplaceConfig({ convergenceTolerance: parseFloat(e.target.value) })
                  }
                  className="w-full"
                >
                  <option value={1e-3}>1.0 × 10⁻³</option>
                  <option value={1e-4}>1.0 × 10⁻⁴</option>
                  <option value={1e-5}>1.0 × 10⁻⁵</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSolve}
              disabled={isSolving}
              className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold bg-em-accent text-em-bg hover:bg-em-accent-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-em-bg" />
              <span>{isSolving ? 'Solving Iterations...' : 'Solve Laplace BVP'}</span>
            </button>
          </div>

          {/* Visual Heatmap Column */}
          <div className="md:col-span-2 flex flex-col items-center justify-center p-3 rounded bg-em-surface-light border border-em-border min-h-[300px]">
            {laplaceResult ? (
              <div className="w-full flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    {laplaceResult.converged ? (
                      <span className="flex items-center gap-1 text-em-success text-2xs font-mono font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CONVERGED in {laplaceResult.iterations} iterations
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-em-warning text-2xs font-mono font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        MAX ITER REACHED ({laplaceResult.iterations})
                      </span>
                    )}
                  </div>
                  <span className="text-2xs font-mono text-em-text-muted">
                    Final Residual: {laplaceResult.residual.toExponential(3)}
                  </span>
                </div>

                {/* 2D Grid Canvas Representation */}
                <div className="relative border border-em-border rounded overflow-hidden shadow-inner w-72 h-72">
                  <svg
                    viewBox={`0 0 ${laplaceResult.gridNx} ${laplaceResult.gridNy}`}
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    {laplaceResult.potential.map((row, j) =>
                      row.map((val, i) => {
                        // Normalize 0 to 100
                        const minV = Math.min(
                          laplaceConfig.boundaryTop,
                          laplaceConfig.boundaryBottom,
                          laplaceConfig.boundaryLeft,
                          laplaceConfig.boundaryRight
                        );
                        const maxV = Math.max(
                          laplaceConfig.boundaryTop,
                          laplaceConfig.boundaryBottom,
                          laplaceConfig.boundaryLeft,
                          laplaceConfig.boundaryRight
                        );
                        const span = maxV - minV || 1;
                        const norm = Math.max(0, Math.min(1, (val - minV) / span));

                        // Plasma colormap interpolation
                        const r = Math.round(13 + norm * 200);
                        const g = Math.round(17 + norm * 150);
                        const b = Math.round(40 + (1 - norm) * 180);

                        return (
                          <rect
                            key={`${i}-${j}`}
                            x={i}
                            y={laplaceResult.gridNy - 1 - j}
                            width={1.05}
                            height={1.05}
                            fill={`rgb(${r},${g},${b})`}
                          />
                        );
                      })
                    )}
                  </svg>
                </div>

                {/* Voltage Color Scale Legend */}
                <div className="flex items-center justify-between w-72 mt-2 text-2xs font-mono text-em-text-muted">
                  <span>0 V</span>
                  <div className="h-2 flex-1 mx-2 rounded bg-gradient-to-r from-blue-900 via-indigo-600 to-amber-500 border border-em-border" />
                  <span>{Math.max(laplaceConfig.boundaryTop, 100)} V</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-em-text-muted space-y-2">
                <p>Click "Solve Laplace BVP" to compute voltage distribution.</p>
                <p className="text-2xs">Solves ∇²V = 0 on rectangular domain with prescribed boundaries.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
