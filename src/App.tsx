import React, { useState } from 'react';
import { useAppStore } from './stores/appStore';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { ResultsPanel } from './components/layout/ResultsPanel';
import { ElectrostaticsLab } from './components/electrostatics/ElectrostaticsLab';
import { WaveLab } from './components/wave/WaveLab';
import { TransmissionLineLab } from './components/transmissionLine/TransmissionLineLab';
import { AITutorPanel } from './components/shared/AITutorPanel';
import { ExperimentManager } from './components/shared/ExperimentManager';
import { ReportModal } from './components/shared/ReportModal';
import { TheoryModal } from './components/shared/TheoryModal';
import { SettingsModal } from './components/shared/SettingsModal';

export const App: React.FC = () => {
  const { activeModule } = useAppStore();

  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isExperimentsOpen, setIsExperimentsOpen] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-em-bg text-em-text-primary">
      {/* 1. Global Instrumentation Top Bar */}
      <TopBar
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTutor={() => setIsTutorOpen(true)}
      />

      {/* 2. Main Workspace Split: Sidebar | Laboratory Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          onOpenExperiments={() => setIsExperimentsOpen(true)}
          onOpenTheory={() => setIsTheoryOpen(true)}
          onOpenTutor={() => setIsTutorOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
        />

        {/* Central Scientific Laboratory Canvas & Controls */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeModule === 'electrostatics' && <ElectrostaticsLab />}
          {activeModule === 'wave-propagation' && <WaveLab />}
          {activeModule === 'transmission-line' && <TransmissionLineLab />}

          {/* Bottom Results & Analysis Panel */}
          <ResultsPanel />
        </main>
      </div>

      {/* 3. Modal & Drawer Utilities */}
      <AITutorPanel isOpen={isTutorOpen} onClose={() => setIsTutorOpen(false)} />
      <ExperimentManager isOpen={isExperimentsOpen} onClose={() => setIsExperimentsOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
        defaultModule={activeModule}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
