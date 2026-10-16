import React, { useState } from 'react';
import { TLineCanvas } from './TLineCanvas';
import { TLineControls } from './TLineControls';
import { TLinePlots } from './TLinePlots';

export const TransmissionLineLab: React.FC = () => {
  const [isPlotsOpen, setIsPlotsOpen] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 relative h-full">
        <TLineCanvas />
      </div>
      <TLineControls onOpenPlots={() => setIsPlotsOpen(true)} />
      <TLinePlots isOpen={isPlotsOpen} onClose={() => setIsPlotsOpen(false)} />
    </div>
  );
};
