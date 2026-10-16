import React, { useState } from 'react';
import { ElectrostaticsCanvas } from './ElectrostaticsCanvas';
import { ElectrostaticsControls } from './ElectrostaticsControls';
import { LaplaceSolverPanel } from './LaplaceSolverPanel';

export const ElectrostaticsLab: React.FC = () => {
  const [isLaplaceOpen, setIsLaplaceOpen] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 relative h-full">
        <ElectrostaticsCanvas />
      </div>
      <ElectrostaticsControls onOpenLaplace={() => setIsLaplaceOpen(true)} />
      <LaplaceSolverPanel isOpen={isLaplaceOpen} onClose={() => setIsLaplaceOpen(false)} />
    </div>
  );
};
