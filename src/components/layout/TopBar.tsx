import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { electrostaticsPresets } from '../../engine/electrostatics/presets';
import { wavePresets } from '../../engine/wave/materials';
import { transmissionLinePresets } from '../../engine/transmissionLine/presets';
import { ModuleId } from '../../types/common';
import { Play, Pause, RotateCcw, Settings, HelpCircle, Camera } from 'lucide-react';

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
  const { activeModule, setActiveModule, experimentName, setExperimentName } = useAppStore();

  const waveIsPlaying = useWaveStore((s) => s.isPlaying);
  const setWavePlaying = useWaveStore((s) => s.setIsPlaying);

  const tlineIsPlaying = useTransmissionLineStore((s) => s.isPlaying);
  const setTLinePlaying = useTransmissionLineStore((s) => s.setIsPlaying);

  const loadEsPreset = useElectrostaticsStore((s) => s.loadPreset);
  const loadWavePreset = useWaveStore((s) => s.loadPreset);
  const loadTlPreset = useTransmissionLineStore((s) => s.loadPreset);

  const isPlaying =
    activeModule === 'electrostatics'
      ? true
      : activeModule === 'wave-propagation'
      ? waveIsPlaying
      : tlineIsPlaying;

  const handleTogglePlay = () => {
    if (activeModule === 'wave-propagation') {
      setWavePlaying(!waveIsPlaying);
    } else if (activeModule === 'transmission-line') {
      setTLinePlaying(!tlineIsPlaying);
    }
  };

  const currentPresets = {
    'electrostatics': electrostaticsPresets,
    'wave-propagation': wavePresets,
    'transmission-line': transmissionLinePresets,
  }[activeModule];

  const handlePresetChange = (presetId: string) => {
    const found = currentPresets.find((p) => p.id === presetId);
    if (found) {
      setExperimentName(found.name);
      if (activeModule === 'electrostatics') {
        loadEsPreset(found.id);
      } else if (activeModule === 'wave-propagation') {
        loadWavePreset(found.id);
      } else if (activeModule === 'transmission-line') {
        loadTlPreset(found.id);
      }
    }
  };

  const handleCaptureScreen = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `em-studio-${activeModule}-capture.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <header className="h-14 border-b border-[#1E293B] bg-[#070A0F] flex items-center justify-between px-5 select-none shrink-0 z-30">
      {/* 1. Left Brand Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-base">
          <span className="text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">EM</span>
          <span className="text-white">Studio</span>
        </div>
        <span className="text-[#334155] font-light text-sm">|</span>
        <span className="text-xs text-[#94A3B8] font-normal tracking-wide hidden sm:inline">
          Interactive Electromagnetic Laboratory
        </span>
      </div>

      {/* 2. Center / Right Navigation Selectors & Simulation Status */}
      <div className="flex items-center gap-3">
        {/* Module Selector Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#64748B] text-2xs uppercase tracking-wider font-medium">Module:</span>
          <select
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value as ModuleId)}
            className="bg-[#0E1522] border border-[#1E293B] hover:border-[#334155] rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:border-em-accent transition-colors cursor-pointer"
          >
            <option value="electrostatics">Electrostatics</option>
            <option value="wave-propagation">Wave Propagation</option>
            <option value="transmission-line">Transmission Lines</option>
          </select>
        </div>

        {/* Experiment Selector Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#64748B] text-2xs uppercase tracking-wider font-medium">Experiment:</span>
          <select
            value={currentPresets.find((p) => p.name === experimentName)?.id ?? currentPresets[0]?.id}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-[#0E1522] border border-[#1E293B] hover:border-[#334155] rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:border-em-accent transition-colors cursor-pointer max-w-[150px] truncate"
          >
            {currentPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Simulation Execution Status Pill */}
        <button
          onClick={handleTogglePlay}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1522] border border-[#1E293B] hover:border-[#334155] transition-all cursor-pointer shadow-xs"
          title="Toggle Simulation Run / Pause"
        >
          <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
          <span className="text-2xs font-semibold text-white tracking-wide">
            {isPlaying ? 'Running' : 'Paused'}
          </span>
        </button>

        {/* Header Action Icons */}
        <div className="flex items-center gap-1 border-l border-[#1E293B] pl-2">
          <button
            onClick={handleCaptureScreen}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="Snapshot Canvas"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenTutor}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="AI Physics Tutor & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
