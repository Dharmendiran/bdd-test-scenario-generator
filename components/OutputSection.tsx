import React, { useCallback } from 'react';
import type { BddScenario } from '../types';
import { ScenarioCard } from './ScenarioCard';
import { LoadingSpinner, TestTubeIcon, PdfIcon, TxtIcon } from './icons';
import jsPDF from 'jspdf';

interface OutputSectionProps {
  scenarios: BddScenario[];
  isLoading: boolean;
  error: string | null;
}

const getTimestamp = () => {
    const now = new Date();
    const Y = now.getFullYear();
    const M = String(now.getMonth() + 1).padStart(2, '0');
    const D = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${Y}${M}${D}-${h}${m}${s}`;
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-content-200 p-8">
    <TestTubeIcon className="w-20 h-20 mb-4 text-base-300" />
    <h3 className="text-lg font-semibold text-content-strong">Ready to Generate</h3>
    <p>Your BDD test scenarios will appear here once generated.</p>
  </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-content-200 p-8">
        <LoadingSpinner className="w-16 h-16 mb-4 text-brand-primary" />
        <h3 className="text-lg font-semibold text-content-strong">Generating Scenarios...</h3>
        <p>The AI is analyzing your document. Please wait a moment.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 border-2 border-dashed border-red-400/50 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-red-300">An Error Occurred</h3>
        <p>{message}</p>
    </div>
);

export const OutputSection: React.FC<OutputSectionProps> = ({ scenarios, isLoading, error }) => {
  const getFullText = useCallback(() => {
    return scenarios.map(s => `${s.scenario}\n${s.steps.map(step => `  ${step}`).join('\n')}`).join('\n\n');
  }, [scenarios]);

  const handleDownloadTxt = useCallback(() => {
    const text = getFullText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bdd-scenarios-${getTimestamp()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [getFullText]);

  const handleDownloadPdf = useCallback(() => {
    const text = getFullText();
    const doc = new jsPDF();
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text(text, 10, 10, {
        maxWidth: 190
    });
    doc.save(`bdd-scenarios-${getTimestamp()}.pdf`);
  }, [getFullText]);
  
  const hasScenarios = scenarios.length > 0;

  return (
    <div className="flex flex-col gap-4 bg-base-200 p-4 md:p-6 rounded-xl border border-base-300 shadow-lg h-full">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-content-strong">2. Generated BDD Scenarios</h2>
        <div className="flex items-center gap-2">
            <button
                onClick={handleDownloadTxt}
                disabled={!hasScenarios || isLoading}
                className="flex items-center gap-1.5 p-2 text-xs rounded-md bg-base-300 hover:bg-brand-primary text-content-100 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-base-300"
                aria-label="Download as TXT"
            >
                <TxtIcon className="w-4 h-4" />
                <span>TXT</span>
            </button>
             <button
                onClick={handleDownloadPdf}
                disabled={!hasScenarios || isLoading}
                className="flex items-center gap-1.5 p-2 text-xs rounded-md bg-base-300 hover:bg-brand-primary text-content-100 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-base-300"
                aria-label="Download as PDF"
            >
                <PdfIcon className="w-4 h-4" />
                <span>PDF</span>
            </button>
        </div>
      </div>
      <div className="flex-grow bg-base-100 border border-base-300 rounded-lg overflow-y-auto min-h-[400px]">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
            <ErrorState message={error} />
        ) : hasScenarios ? (
          <div className="p-4 space-y-4">
            {scenarios.map((scenario, index) => (
              <ScenarioCard key={index} scenario={scenario} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};