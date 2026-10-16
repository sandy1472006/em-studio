import React, { useState } from 'react';
import { theoryDatabase } from '../../data/theoryContent';
import { EquationDisplay } from './EquationDisplay';
import { X, BookOpen, Layers } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: string;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  defaultModule = 'electrostatics',
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultModule);

  if (!isOpen) return null;

  const theory = theoryDatabase[activeTab] || theoryDatabase['electrostatics'];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0 bg-em-surface-light/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-em-accent" />
            <span className="font-semibold text-sm text-em-text-primary">
              Electromagnetic Engineering Theory & Formulations
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-em-border bg-em-surface-light/20">
          {[
            { id: 'electrostatics', label: 'Electrostatics' },
            { id: 'wave-propagation', label: 'Wave Propagation' },
            { id: 'transmission-line', label: 'Transmission Lines' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-em-accent/15 border-em-accent text-em-accent'
                  : 'bg-em-surface border-em-border text-em-text-secondary hover:text-em-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-em-text-primary">
          <div>
            <div className="text-2xs font-mono text-em-accent uppercase tracking-wider">
              {theory.topic}
            </div>
            <h2 className="text-base font-bold mt-1 text-em-text-primary">{theory.title}</h2>
          </div>

          {/* Equations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xs text-em-accent uppercase tracking-wider">
              Governing Mathematical Relations
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {theory.equations.map((eq, idx) => (
                <div key={idx} className="p-3.5 rounded bg-em-surface-light border border-em-border">
                  <div className="font-semibold text-xs text-em-text-primary mb-1">{eq.name}</div>
                  <div className="py-2 bg-em-bg/60 rounded px-3 my-2">
                    <EquationDisplay latex={eq.latex} />
                  </div>
                  <p className="text-2xs text-em-text-secondary leading-relaxed mb-2">{eq.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 border-t border-em-border/70 pt-2 text-2xs">
                    {eq.variables.map((v, vidx) => (
                      <div key={vidx} className="flex items-baseline justify-between text-em-text-muted">
                        <span className="font-mono text-em-accent mr-2">{v.symbol}</span>
                        <span className="truncate">{v.meaning} [{v.unit}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-em-border">
            <div className="p-3 rounded bg-em-surface-light border border-em-border">
              <div className="font-semibold text-2xs text-em-accent uppercase tracking-wider mb-2">
                Physical Assumptions
              </div>
              <ul className="space-y-1 text-2xs text-em-text-secondary list-disc pl-4">
                {theory.assumptions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded bg-em-surface-light border border-em-border">
              <div className="font-semibold text-2xs text-em-warning uppercase tracking-wider mb-2">
                Numerical Methodology & Limits
              </div>
              <ul className="space-y-1 text-2xs text-em-text-secondary list-disc pl-4 mb-2">
                {theory.limitations.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
              <div className="text-2xs text-em-text-muted italic border-t border-em-border pt-1.5">
                {theory.methodNotes}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
