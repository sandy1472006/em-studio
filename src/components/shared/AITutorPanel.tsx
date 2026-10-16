import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useElectrostaticsStore } from '../../stores/electrostaticsStore';
import { useWaveStore } from '../../stores/waveStore';
import { useTransmissionLineStore } from '../../stores/transmissionLineStore';
import { tutorQuestionsDatabase, TutorQuestion } from '../../data/tutorResponses';
import { X, HelpCircle, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({ isOpen, onClose }) => {
  const { activeModule, experimentName } = useAppStore();

  // Active module parameters and results
  const esState = useElectrostaticsStore();
  const waveState = useWaveStore();
  const tlineState = useTransmissionLineStore();

  const [selectedQuestion, setSelectedQuestion] = useState<TutorQuestion | null>(null);

  if (!isOpen) return null;

  // Filter questions for active module + general questions
  const relevantQuestions = tutorQuestionsDatabase.filter(
    (q) => q.module === activeModule || q.module === 'general'
  );

  // Collect current live parameters & results
  let currentParams: Record<string, any> = {};
  let currentResults: Record<string, any> = {};

  if (activeModule === 'electrostatics') {
    currentParams = {
      charges: esState.charges,
      observationPoint: esState.observationPoint,
      relativePermittivity: esState.relativePermittivity,
      mediumName: esState.mediumName,
    };
    currentResults = {
      ...esState.fieldResult,
      iterations: esState.laplaceResult?.iterations,
      residual: esState.laplaceResult?.residual,
    };
  } else if (activeModule === 'wave-propagation') {
    currentParams = {
      frequency: waveState.frequency,
      amplitude: waveState.amplitude,
      polarisation: waveState.polarisation,
      material: waveState.material,
    };
    currentResults = {
      ...waveState.propagation,
    };
  } else if (activeModule === 'transmission-line') {
    currentParams = {
      characteristicImpedance: tlineState.characteristicImpedance,
      loadResistance: tlineState.loadResistance,
      loadReactance: tlineState.loadReactance,
      lineLength: tlineState.lineLength,
    };
    currentResults = {
      ...tlineState.reflectionResult,
      inputImpedance: tlineState.inputImpedance,
    };
  }

  const generatedAnswer = selectedQuestion
    ? selectedQuestion.generateAnswer(currentParams, currentResults)
    : null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-em-surface border-l border-em-border shadow-2xl z-50 flex flex-col select-none text-xs backdrop-blur-md">
      {/* Header */}
      <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0 bg-em-surface-light/40">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-em-accent/15 border border-em-accent/40 flex items-center justify-center text-em-accent">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <div className="font-semibold text-xs text-em-text-primary">
              AI Physics Tutor & Theory Assistant
            </div>
            <div className="text-2xs text-em-text-muted font-mono">
              Offline Verified Theory Reference
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Verified Notice */}
      <div className="p-3 bg-em-bg/50 border-b border-em-border flex items-start gap-2 text-2xs text-em-text-secondary">
        <CheckCircle2 className="w-3.5 h-3.5 text-em-accent shrink-0 mt-0.5" />
        <div>
          <span>This assistant explains physical phenomena using your current experiment's </span>
          <span className="text-em-accent font-mono font-medium">actual calculated numbers</span>
          <span> without hallucinating physics.</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedQuestion ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="text-2xs text-em-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Back to Questions
            </button>

            <div className="p-3 rounded bg-em-surface-light border border-em-border">
              <span className="text-2xs font-semibold text-em-accent uppercase tracking-wider block mb-1">
                {selectedQuestion.category}
              </span>
              <div className="font-semibold text-sm text-em-text-primary">
                {selectedQuestion.question}
              </div>
            </div>

            <div className="p-3.5 rounded bg-em-bg/80 border border-em-border text-xs text-em-text-primary whitespace-pre-wrap leading-relaxed font-sans">
              {generatedAnswer}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider mb-2">
              Frequently Asked Electromagnetic Questions
            </div>
            {relevantQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className="w-full p-2.5 rounded bg-em-surface-light border border-em-border text-left hover:border-em-accent/50 hover:bg-em-surface transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-em-text-muted">{q.category}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-em-text-muted group-hover:text-em-accent transition-colors" />
                </div>
                <div className="font-medium text-xs text-em-text-primary mt-1">
                  {q.question}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-em-border bg-em-surface-light/40 text-2xs text-em-text-muted text-center">
        Formulas derived from Electromagnetics Engineering (EME) curricula.
      </div>
    </div>
  );
};
