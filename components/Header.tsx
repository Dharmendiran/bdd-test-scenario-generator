
import React from 'react';
import { AppIcon, HistoryIcon, SettingsIcon } from './icons';

interface HeaderProps {
    onToggleHistory: () => void;
    onToggleSettings: () => void;
    historyCount: number;
    isHistoryVisible: boolean;
    isSettingsVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    onToggleHistory, 
    onToggleSettings, 
    historyCount, 
    isHistoryVisible,
    isSettingsVisible,
}) => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-20 border-b border-base-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
            <div className="bg-brand-primary p-2 rounded-lg flex-shrink-0">
              <AppIcon className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-content-strong truncate">GenAI BDD Scenario Generator</h1>
                <p className="text-sm text-content-200 hidden sm:block">From design docs to Gherkin tests in seconds.</p>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <button
                onClick={onToggleHistory}
                className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary ${
                    isHistoryVisible ? 'bg-base-300 text-content-strong' : 'text-content-200 hover:text-content-strong hover:bg-base-300'
                }`}
                aria-label="Toggle history panel"
                >
                <HistoryIcon className="w-6 h-6" />
                {historyCount > 0 && !isHistoryVisible && (
                    <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-brand-primary text-white text-[10px] font-bold ring-2 ring-base-200 flex items-center justify-center">
                        {historyCount > 9 ? '9+' : historyCount}
                    </span>
                )}
            </button>
            <button
              onClick={onToggleSettings}
              className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary ${
                isSettingsVisible ? 'bg-base-300 text-content-strong' : 'text-content-200 hover:text-content-strong hover:bg-base-300'
              }`}
              aria-label="Toggle settings panel"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};
