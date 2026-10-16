import React, { useState } from 'react';
import { X, Settings, Check, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [precision, setPrecision] = useState('4');
  const [graphicsQuality, setGraphicsQuality] = useState('high');
  const [autoRunVerification, setAutoRunVerification] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
      <div className="bg-em-surface border border-em-border rounded-lg w-full max-w-md flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-12 border-b border-em-border px-4 flex items-center justify-between shrink-0 bg-em-surface-light/40">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-em-accent" />
            <span className="font-semibold text-sm text-em-text-primary">
              Workbench Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-em-text-muted hover:text-em-text-primary hover:bg-em-surface-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          <div>
            <label className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider block mb-1.5">
              Numerical Readout Precision
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['3', '4', '5'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`py-1.5 rounded text-center border font-mono transition-colors cursor-pointer ${
                    precision === p
                      ? 'bg-em-accent/20 border-em-accent text-em-accent font-semibold'
                      : 'bg-em-surface-light border-em-border text-em-text-secondary hover:text-em-text-primary'
                  }`}
                >
                  {p} Decimals
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold text-em-text-muted uppercase tracking-wider block mb-1.5">
              3D Rendering Fidelity
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'high', label: 'High Fidelity (Antialias On)' },
                { id: 'performance', label: 'Battery Saver (Optimized)' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => setGraphicsQuality(q.id)}
                  className={`py-1.5 px-2 rounded text-center border text-2xs transition-colors cursor-pointer ${
                    graphicsQuality === q.id
                      ? 'bg-em-accent/20 border-em-accent text-em-accent font-semibold'
                      : 'bg-em-surface-light border-em-border text-em-text-secondary hover:text-em-text-primary'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-em-border space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-2xs text-em-text-secondary hover:text-em-text-primary">
              <input
                type="checkbox"
                checked={autoRunVerification}
                onChange={(e) => setAutoRunVerification(e.target.checked)}
                className="rounded bg-em-surface-light border-em-border text-em-accent"
              />
              <span>Automatically update analytical benchmarks on parameter shift</span>
            </label>
          </div>

          <div className="p-3 bg-em-surface-light rounded border border-em-border text-2xs text-em-text-muted space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-em-text-primary">
              <Info className="w-3.5 h-3.5 text-em-accent" />
              <span>EM Studio Architecture</span>
            </div>
            <div>Engineering simulation client v1.0.0 (TS strict build).</div>
            <div>Designed for Electronics & Telecommunication Engineering (EME).</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-em-border flex justify-end bg-em-surface-light/40">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs rounded bg-em-accent text-em-bg font-semibold hover:bg-em-accent-hover transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
