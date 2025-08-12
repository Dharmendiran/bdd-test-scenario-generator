export interface BddScenario {
  scenario: string;
  steps: string[];
}

export interface HistoryItem {
  id: number;
  documentContent: string;
  fileName: string | null;
  scenarios: BddScenario[];
  timestamp: string;
}

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'teal' | 'blue' | 'rose' | 'amber';
export type VantaAnimation = 'waves' | 'birds' | 'net' | 'halo' | 'rings' | 'none';

export interface ThemeSettings {
    theme: ThemeMode;
    color: AccentColor;
    animation: VantaAnimation;
}