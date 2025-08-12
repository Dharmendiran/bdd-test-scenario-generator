import React, { useState, useCallback } from 'react';
import type { BddScenario } from '../types';
import { CopyIcon, CheckIcon } from './icons';

interface ScenarioCardProps {
  scenario: BddScenario;
}

const GherkinKeyword: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-brand-secondary font-semibold">{children}</span>
);

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario }) => {
  const [copied, setCopied] = useState(false);

  const formatStep = (step: string) => {
    const keywords = ['Given', 'When', 'Then', 'And', 'But'];
    const keyword = keywords.find(kw => step.trim().startsWith(kw));
    if (keyword) {
      return (
        <>
          <GherkinKeyword>{keyword}</GherkinKeyword>
          {step.substring(keyword.length)}
        </>
      );
    }
    return step;
  };

  const getFullText = useCallback(() => {
    return `${scenario.scenario}\n${scenario.steps.map(s => `  ${s}`).join('\n')}`;
  }, [scenario]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(getFullText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [getFullText]);

  return (
    <div className="bg-base-200/80 p-4 rounded-lg border border-base-300 group relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-base-300 hover:bg-brand-primary text-content-100 hover:text-white transition-all duration-200 opacity-50 group-hover:opacity-100"
        aria-label="Copy scenario"
      >
        {copied ? (
          <CheckIcon className="w-4 h-4 text-green-400" />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </button>

      <div className="font-mono text-sm text-content-100 space-y-1">
        <p className="font-bold text-content-strong">{scenario.scenario}</p>
        {scenario.steps.map((step, index) => (
          <p key={index} className="pl-2">{formatStep(step)}</p>
        ))}
      </div>
    </div>
  );
};