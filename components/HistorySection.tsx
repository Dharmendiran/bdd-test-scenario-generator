import React from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon, TrashIcon, FileTextIcon, CloseIcon, ExportIcon } from './icons';

interface HistorySectionProps {
  isVisible: boolean;
  history: HistoryItem[];
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onClear: () => void;
  activeId: number | null;
  onClose: () => void;
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

export const HistorySection: React.FC<HistorySectionProps> = ({ isVisible, history, onSelect, onDelete, onClear, activeId, onClose }) => {
  const escapeCsvField = (field: string | number | null | undefined): string => {
    if (field === null || field === undefined) {
      return '';
    }
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      const escapedField = stringField.replace(/"/g, '""');
      return `"${escapedField}"`;
    }
    return stringField;
  };

  const handleExportCsv = () => {
    if (history.length === 0) return;

    const headers = [
      'id',
      'timestamp',
      'fileName',
      'documentContent',
      'scenario',
      'steps',
    ];

    const csvRows = history.flatMap(item =>
      (item.scenarios || []).map(scenario => {
        const row = [
          escapeCsvField(item.id),
          escapeCsvField(item.timestamp),
          escapeCsvField(item.fileName),
          escapeCsvField(item.documentContent),
          escapeCsvField(scenario.scenario),
          escapeCsvField((scenario.steps || []).join('\n')),
        ];
        return row.join(',');
      })
    );
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bdd-scenarios-history-${getTimestamp()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-base-200/95 backdrop-blur-lg border-l border-base-300 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-base-300 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <HistoryIcon className="w-6 h-6 text-content-200" />
                    <h2 className="text-lg font-semibold text-content-strong">History</h2>
                </div>
                <div className="flex items-center gap-3">
                    {history.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleExportCsv}
                          className="flex items-center gap-1 text-sm text-content-200 hover:text-brand-primary transition-colors"
                          aria-label="Export history as CSV"
                        >
                          <ExportIcon className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                        <button
                          onClick={onClear}
                          className="text-sm text-content-200 hover:text-red-400 transition-colors"
                          aria-label="Clear all history"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300" aria-label="Close history">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div className="flex-grow p-2 overflow-y-auto bg-base-100">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-content-200 p-4">
                    <p>Your generation history will appear here.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {history.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => onSelect(item.id)}
                          className={`w-full text-left p-3 rounded-md transition-colors duration-200 flex items-start gap-3 group ${
                            activeId === item.id ? 'bg-brand-primary/20' : 'hover:bg-base-200'
                          }`}
                        >
                          <div className="flex-shrink-0 pt-1">
                              <FileTextIcon className="w-5 h-5 text-content-200"/>
                          </div>
                          <div className="flex-grow overflow-hidden">
                            <p className="text-sm font-semibold text-content-strong truncate">
                                {item.fileName || 'Pasted Text'}
                            </p>
                            <p className="text-xs text-content-200 truncate">
                                {item.documentContent.substring(0, 50)}...
                            </p>
                            <p className="text-xs text-content-200/80 mt-1">
                              {item.scenarios.length} scenarios &bull; {item.timestamp}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                            className="p-1 text-content-200 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                            aria-label={`Delete history item from ${item.timestamp}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
        </div>
    </div>
  );
};