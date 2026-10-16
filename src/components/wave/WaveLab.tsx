import React, { useState } from 'react';
import { WaveCanvas } from './WaveCanvas';
import { WaveControls } from './WaveControls';
import { WavePlots } from './WavePlots';
import { ErrorBoundary } from '../shared/ErrorBoundary';

export const WaveLab: React.FC = () => {
  const [isPlotsOpen, setIsPlotsOpen] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 relative h-full">
        <ErrorBoundary fallbackTitle="Wave Propagation 3D Viewport">
          <WaveCanvas />
        </ErrorBoundary>
      </div>
      <WaveControls onOpenPlots={() => setIsPlotsOpen(true)} />
      <WavePlots isOpen={isPlotsOpen} onClose={() => setIsPlotsOpen(false)} />
    </div>
  );
};
