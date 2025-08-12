import React from 'react';
import type { ThemeSettings, ThemeMode, AccentColor, VantaAnimation } from '../types';
import { CloseIcon, MoonIcon, SunIcon } from './icons';

interface SettingsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onSettingsChange: (newSettings: ThemeSettings) => void;
}

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-base-300">
        <p className="text-content-100">{label}</p>
        <div className="flex items-center gap-2">{children}</div>
    </div>
);

const ThemeButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
            isActive ? 'bg-brand-primary text-white' : 'bg-base-100 hover:bg-base-300'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ColorButton: React.FC<{ color: string, isActive: boolean, onClick: () => void }> = ({ color, isActive, onClick }) => (
  <button onClick={onClick} className={`w-6 h-6 rounded-full transition-all ${color} ${isActive ? 'ring-2 ring-offset-2 ring-offset-base-200 ring-brand-primary' : ''}`}></button>
);

const ACCENT_COLORS: AccentColor[] = ['teal', 'blue', 'rose', 'amber'];
const ANIMATIONS: {id: VantaAnimation, name: string}[] = [
    { id: 'waves', name: 'Waves' },
    { id: 'birds', name: 'Birds' },
    { id: 'net', name: 'Net' },
    { id: 'halo', name: 'Halo' },
    { id: 'rings', name: 'Rings' },
    { id: 'none', name: 'None' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isVisible, onClose, settings, onSettingsChange }) => {

  const handleSettingChange = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
      onSettingsChange({ ...settings, [key]: value });
  };
  
  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-base-200/95 backdrop-blur-lg border-l border-base-300 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
                <h2 className="text-lg font-semibold text-content-strong">Settings</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300" aria-label="Close settings">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
                <SettingRow label="Theme">
                    <ThemeButton label="Light" icon={<SunIcon className="w-5 h-5" />} isActive={settings.theme === 'light'} onClick={() => handleSettingChange('theme', 'light')} />
                    <ThemeButton label="Dark" icon={<MoonIcon className="w-5 h-5" />} isActive={settings.theme === 'dark'} onClick={() => handleSettingChange('theme', 'dark')} />
                </SettingRow>
                <SettingRow label="Color">
                    {ACCENT_COLORS.map(color => (
                        <ColorButton 
                            key={color}
                            color={`bg-${color}-500`} 
                            isActive={settings.color === color}
                            onClick={() => handleSettingChange('color', color)} 
                        />
                    ))}
                </SettingRow>
                 <SettingRow label="Animation">
                    <select
                        value={settings.animation}
                        onChange={(e) => handleSettingChange('animation', e.target.value as VantaAnimation)}
                        className="bg-base-100 border border-base-300 rounded-md px-3 py-1.5 text-sm w-full focus:ring-2 focus:ring-brand-primary"
                    >
                        {ANIMATIONS.map(anim => (
                           <option key={anim.id} value={anim.id}>{anim.name}</option> 
                        ))}
                    </select>
                </SettingRow>
            </div>
        </div>
    </div>
  );
};
