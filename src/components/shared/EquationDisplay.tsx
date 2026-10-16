import React, { useMemo } from 'react';
import katex from 'katex';

interface EquationDisplayProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const EquationDisplay: React.FC<EquationDisplayProps> = ({
  latex,
  displayMode = true,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      return `<code class="text-red-400">${latex}</code>`;
    }
  }, [latex, displayMode]);

  return (
    <div
      className={`overflow-x-auto text-em-text-primary ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
