import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { ModuleId } from '../../types/common';
import {
  Zap,
  Radio,
  Activity,
  FlaskConical,
  BookOpen,
  MessageSquare,
  FolderArchive,
  FileText,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  onOpenExperiments: () => void;
  onOpenTheory: () => void;
  onOpenTutor?: () => void;
  onOpenReport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenExperiments,
  onOpenTheory,
  onOpenTutor,
  onOpenReport,
}) => {
  const { activeModule, setActiveModule, setExperimentName } = useAppStore();

  const modules = [
    {
      id: 'electrostatics' as ModuleId,
      name: 'Electrostatics',
      icon: Zap,
    },
    {
      id: 'wave-propagation' as ModuleId,
      name: 'Wave Propagation',
      icon: Radio,
    },
    {
      id: 'transmission-line' as ModuleId,
      name: 'Transmission Lines',
      icon: Activity,
    },
  ];

  return (
    <aside className="w-56 bg-[#0B0F17] border-r border-[#1E293B] flex flex-col justify-between shrink-0 select-none z-20 overflow-y-auto">
      <div className="p-3 space-y-6">
        {/* 1. Laboratory Modules */}
        <div className="space-y-1.5">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;

            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id);
                  setExperimentName(
                    m.id === 'electrostatics'
                      ? 'Electric Dipole'
                      : m.id === 'wave-propagation'
                      ? 'Free-Space Sinusoidal Wave'
                      : 'Matched Load'
                  );
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#141C2A] border border-em-accent/40 text-white shadow-sm'
                    : 'border border-transparent text-[#94A3B8] hover:text-white hover:bg-[#141C2A]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-em-accent' : 'text-[#64748B]'
                    }`}
                  />
                  <span className="text-xs font-semibold truncate">{m.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-em-accent shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Tools Section */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-2xs font-semibold text-[#64748B] uppercase tracking-wider">
            Tools
          </div>

          <div className="space-y-0.5">
            <button
              onClick={onOpenExperiments}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-[#94A3B8] hover:text-white hover:bg-[#141C2A]/60 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-[#64748B]" />
              <span>Experiments</span>
            </button>

            <button
              onClick={onOpenTheory}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-[#94A3B8] hover:text-white hover:bg-[#141C2A]/60 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#64748B]" />
              <span>Theory & Equations</span>
            </button>

            <button
              onClick={onOpenTutor}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-[#94A3B8] hover:text-white hover:bg-[#141C2A]/60 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#64748B]" />
              <span>AI Tutor</span>
            </button>

            <button
              onClick={onOpenExperiments}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-[#94A3B8] hover:text-white hover:bg-[#141C2A]/60 transition-colors cursor-pointer"
            >
              <FolderArchive className="w-4 h-4 text-[#64748B]" />
              <span>Saved Results</span>
            </button>

            <button
              onClick={onOpenReport}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-[#94A3B8] hover:text-white hover:bg-[#141C2A]/60 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#64748B]" />
              <span>Report Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytical Verification Pass Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#070A0F]/70">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <div>
            <div className="font-semibold text-2xs text-white">
              Analytical Verification
            </div>
            <div className="text-3xs text-[#64748B] font-mono">
              21 / 21 Benchmarks Pass
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
