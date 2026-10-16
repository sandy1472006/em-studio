import React, { useState } from 'react';
import { WaveCanvas } from './WaveCanvas';
import { WaveControls } from './WaveControls';
import { WavePlots } from './WavePlots';

export const WaveLab: React.FC = () => {
  const [isPlotsOpen, setIsPlotsOpen] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 relative h-full">
        <WaveCanvas />
      </div>
      <WaveControls onOpenPlots={() => setIsPlotsOpen(true)} />
      <WavePlots isOpen={isPlotsOpen} onClose={() => setIsPlotsOpen(false)} />
    </div>
  );
};
