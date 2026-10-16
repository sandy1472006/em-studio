import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { Play, Pause, RotateCcw, Settings, FileText, HelpCircle, Layers } from 'lucide-react';

interface TopBarProps {
  onOpenReport: () => void;
  onOpenSettings: () => void;
  onOpenTutor: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenReport,
  onOpenSettings,
  onOpenTutor,
}) => {
  const { activeModule, experimentName } = useAppStore();
  
  // Wave & TLine playback states
  const waveIsPlaying = useWaveStore((s) => s.isPlaying);
  const setWavePlaying = useWaveStore((s) => s.setIsPlaying);
  const resetWave = useWaveStore((s) => s.reset);

  const tlineIsPlaying = useTransmissionLineStore((s) => s.isPlaying);
  const setTLinePlaying = useTransmissionLineStore((s) => s.setIsPlaying);
  const resetTLine = useTransmissionLineStore((s) => s.reset);

  const resetElectrostatics = useElectrostaticsStore((s) => s.reset);

  const isTimeDependent = activeModule !== 'electrostatics';
  const isPlaying = activeModule === 'wave-propagation' ? waveIsPlaying : tlineIsPlaying;

  const handleTogglePlay = () => {
    if (activeModule === 'wave-propagation') {
      setWavePlaying(!waveIsPlaying);
    } else if (activeModule === 'transmission-line') {
      setTLinePlaying(!tlineIsPlaying);
    }
  };

  const handleReset = () => {
    if (activeModule === 'electrostatics') {
      resetElectrostatics();
    } else if (activeModule === 'wave-propagation') {
      resetWave();
    } else if (activeModule === 'transmission-line') {
      resetTLine();
    }
  };

  const moduleNames = {
    'electrostatics': 'Electrostatics Laboratory',
    'wave-propagation': 'Wave Propagation Laboratory',
    'transmission-line': 'Transmission Line Laboratory',
  };

  return (
    <header className="h-12 border-b border-em-border bg-em-surface flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-em-accent/15 border border-em-accent/40 flex items-center justify-center">
            <span className="text-em-accent font-mono font-bold text-xs">EM</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-em-text-primary">
            EM Studio
          </span>
        </div>
        <span className="text-em-border">/</span>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-em-accent">
            {moduleNames[activeModule]}
          </span>
          <span className="text-2xs text-em-text-muted hidden md:inline">
            • {experimentName}
          </span>
        </div>
      </div>

      {/* Center Controls (Simulation Execution) */}
      <div className="flex items-center gap-2">
        {isTimeDependent ? (
          <div className="flex items-center gap-1.5 bg-em-surface-light px-2 py-1 rounded border border-em-border">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium text-em-text-primary hover:bg-em-border transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Simulation' : 'Run Simulation'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-em-accent" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-em-accent fill-em-accent" />
                  <span>Play</span>
                </>
              )}
            </button>
            <div className="h-3 w-px bg-em-border" />
            <button
              onClick={handleReset}
              className="p-1 rounded text-em-text-secondary hover:text-em-text-primary hover:bg-em-border transition-colors cursor-pointer"
              title="Reset Parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-em-border">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-em-success animate-pulse' : 'bg-em-warning'}`} />
              <span className="text-2xs font-mono text-em-text-muted">
                {isPlaying ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-em-surface-light px-2.5 py-1 rounded border border-em-border">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded text-em-text-secondary hover:text-em-text-primary hover:bg-em-border transition-colors cursor-pointer"
              title="Reset Charges to Dipole"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-em-border">
              <span className="w-1.5 h-1.5 rounded-full bg-em-success" />
              <span className="text-2xs font-mono text-em-text-muted">SOLVER READY</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Utilities */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenTutor}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium text-em-accent bg-em-accent/10 border border-em-accent/30 hover:bg-em-accent/20 transition-colors cursor-pointer"
          title="AI Physics Tutor & Theory Assistant"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Physics Tutor</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light border border-em-border transition-colors cursor-pointer"
          title="Generate Engineering Laboratory Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lab Report</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-em-text-secondary hover:text-em-text-primary hover:bg-em-surface-light border border-transparent hover:border-em-border transition-colors cursor-pointer"
          title="Application Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
