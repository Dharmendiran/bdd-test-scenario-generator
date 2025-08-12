
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { HistorySection } from './components/HistorySection';
import { SettingsPanel } from './components/SettingsPanel';
import type { BddScenario, HistoryItem, ThemeSettings, ThemeMode, AccentColor } from './types';
import { generateBddScenarios } from './services/geminiService';
import { AppIcon } from './components/icons';
import * as THREE from 'three';

const HISTORY_STORAGE_KEY = 'bdd-gen-history';
const SETTINGS_STORAGE_KEY = 'bdd-gen-settings';

const initialSettings: ThemeSettings = {
  theme: 'dark',
  color: 'blue',
  animation: 'waves',
};

const accentHexColors: Record<ThemeMode, Record<AccentColor, number>> = {
  dark: {
    teal: 0x0d9488, // tailwind teal-600
    blue: 0x4f46e5, // tailwind indigo-600
    rose: 0xe11d48, // tailwind rose-600
    amber: 0xd97706, // tailwind amber-600
  },
  light: {
    teal: 0x0f766e, // tailwind teal-700
    blue: 0x4338ca, // tailwind indigo-700
    rose: 0xbe123c, // tailwind rose-700
    amber: 0xb45309, // tailwind amber-700
  }
};

const loadSettings = (): ThemeSettings => {
  try {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
  } catch (e) {
    console.error("Failed to load settings, using defaults.", e);
    return initialSettings;
  }
};


export default function App(): React.ReactNode {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<BddScenario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings);

  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);
    root.dataset.color = settings.color;

    try {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings.", e);
    }
    
    if (vantaEffect) {
        vantaEffect.destroy();
    }
    
    if (settings.animation !== 'none') {
        import(`vanta/dist/vanta.${settings.animation}.min.js`)
        .then(vantaModule => {
            const VantaEffect = vantaModule.default;
            if (VantaEffect && vantaRef.current) {
                try {
                    const newEffect = VantaEffect({
                        el: vantaRef.current,
                        THREE,
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: false,
                        minHeight: 200.00,
                        minWidth: 200.00,
                        scale: 1.00,
                        scaleMobile: 1.00,
                        color: accentHexColors[settings.theme][settings.color],
                    });
                    setVantaEffect(newEffect);
                } catch (e) {
                    console.error("Vanta.js (WebGL) initialization failed. Disabling animations.", e);
                    setSettings(s => ({ ...s, animation: 'none' }));
                }
            }
        }).catch(err => {
            console.error(`Failed to load Vanta.js module for "${settings.animation}". Disabling animations.`, err);
            setSettings(s => ({ ...s, animation: 'none' }));
        });
    } else {
      setVantaEffect(null);
    }

    return () => {
        if (vantaEffect) {
            vantaEffect.destroy();
        }
    };

  }, [settings]);


  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleToggleHistory = useCallback(() => {
    setIsHistoryVisible(prev => !prev);
    if(isSettingsVisible) setIsSettingsVisible(false);
  }, [isSettingsVisible]);

  const handleToggleSettings = useCallback(() => {
    setIsSettingsVisible(prev => !prev);
    if(isHistoryVisible) setIsHistoryVisible(false);
  }, [isHistoryVisible]);

  const handleGenerate = useCallback(async () => {
    if (!documentContent.trim()) {
      setError('Please provide content from a document, file, or link before generating.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setScenarios([]);
    setActiveHistoryId(null);

    try {
      const result = await generateBddScenarios(documentContent);
      setScenarios(result);

      const newHistoryItem: HistoryItem = {
          id: Date.now(),
          documentContent,
          fileName,
          scenarios: result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      setActiveHistoryId(newHistoryItem.id);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate scenarios. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [documentContent, fileName]);
  
  const handleSetContent = (content: string, name: string | null = null) => {
    setDocumentContent(content);
    setFileName(name);
    setScenarios([]);
    setError(null);
    setActiveHistoryId(null);
  };

  const handleClearInput = () => {
      handleSetContent('', null);
  }

  const handleSelectHistory = (id: number) => {
      const item = history.find(h => h.id === id);
      if (item) {
          setDocumentContent(item.documentContent);
          setFileName(item.fileName);
          setScenarios(item.scenarios);
          setError(null);
          setActiveHistoryId(id);
          setIsHistoryVisible(false);
      }
  };

  const handleDeleteHistory = (id: number) => {
      setHistory(prev => prev.filter(h => h.id !== id));
      if(activeHistoryId === id) {
          handleClearInput();
      }
  };

  const handleClearHistory = () => {
      setHistory([]);
      handleClearInput();
  };

  return (
    <>
      <div ref={vantaRef} className="fixed top-0 left-0 w-full h-full -z-10"></div>
      <div className="min-h-screen text-content-100 flex flex-col bg-base-100/80 backdrop-blur-sm">
        <Header 
          onToggleHistory={handleToggleHistory}
          onToggleSettings={handleToggleSettings}
          historyCount={history.length}
          isHistoryVisible={isHistoryVisible}
          isSettingsVisible={isSettingsVisible}
        />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="lg:w-1/2 flex flex-col">
                <InputSection
                  documentContent={documentContent}
                  setDocumentContent={handleSetContent}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  fileName={fileName}
                  onClear={handleClearInput}
                />
            </div>
            <div className="lg:w-1/2 flex flex-col">
                <OutputSection
                  scenarios={scenarios}
                  isLoading={isLoading}
                  error={error}
                />
            </div>
        </main>

        <HistorySection 
            isVisible={isHistoryVisible}
            history={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            activeId={activeHistoryId}
            onClose={handleToggleHistory}
        />

        <SettingsPanel
            isVisible={isSettingsVisible}
            onClose={handleToggleSettings}
            settings={settings}
            onSettingsChange={setSettings}
        />
        <footer className="text-center p-4 text-content-200 text-sm border-t border-base-300/50">
          <div className="flex items-center justify-center gap-2">
              <AppIcon className="w-5 h-5" />
              <p>Powered by GenAI</p>
          </div>
        </footer>
      </div>
    </>
  );
}
