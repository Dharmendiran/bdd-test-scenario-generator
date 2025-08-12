
import React, { useState, useCallback, useRef } from 'react';
import { GenerateIcon, LoadingSpinner, UploadIcon, LinkIcon, FileTextIcon, ClearIcon } from './icons';
import mammoth from 'mammoth';

type InputTab = 'paste' | 'upload' | 'link';

interface InputSectionProps {
  documentContent: string;
  setDocumentContent: (value: string, fileName?: string | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
  fileName: string | null;
  onClear: () => void;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    aria-label={label}
    className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary ${
      isActive
        ? 'border-brand-primary text-content-strong'
        : 'border-transparent text-content-200 hover:text-content-strong hover:border-base-300'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);


export const InputSection: React.FC<InputSectionProps> = ({
  documentContent,
  setDocumentContent,
  onGenerate,
  isLoading,
  fileName,
  onClear,
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>('paste');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentContent(e.target?.result as string, file.name);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.docx')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            try {
                const result = await mammoth.extractRawText({ arrayBuffer });
                setDocumentContent(result.value, file.name);
            } catch (error) {
                console.error("Error reading docx file:", error);
                setUploadError("Could not read the .docx file. It might be corrupted or in an unsupported format.");
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
      setUploadError('Unsupported file type. Please upload a .txt or .docx file.');
      setDocumentContent('', null);
    }
  }, [setDocumentContent]);

  const hasContent = !!documentContent || !!fileName;

  return (
    <div className="flex flex-col gap-4 bg-base-200 p-4 md:p-6 rounded-xl border border-base-300 shadow-lg h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-content-strong">1. Provide Your Source Document</h2>
        {hasContent && (
           <button
             onClick={onClear}
             className="flex items-center gap-1.5 text-sm text-content-200 hover:text-brand-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary rounded-md p-1"
             aria-label="Clear input"
           >
             <ClearIcon className="w-4 h-4" />
             Clear
           </button>
        )}
      </div>
      
      <div className="border-b border-base-300">
        <div className="flex -mb-px" role="tablist" aria-label="Input method">
            <TabButton label="Paste Text" icon={<FileTextIcon className="w-5 h-5"/>} isActive={activeTab === 'paste'} onClick={() => setActiveTab('paste')} />
            <TabButton label="Upload File" icon={<UploadIcon className="w-5 h-5"/>} isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
            <TabButton label="Confluence" icon={<LinkIcon className="w-5 h-5"/>} isActive={activeTab === 'link'} onClick={() => setActiveTab('link')} />
        </div>
      </div>
      
      <div className="flex-grow flex flex-col min-h-[300px] md:min-h-[400px]">
        {activeTab === 'paste' && (
            <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value, null)}
                placeholder="e.g., As a user, I want to log in with my email and password so I can access my account..."
                className="w-full h-full flex-grow bg-base-100 border border-base-300 rounded-lg p-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-300 resize-none"
                aria-label="Design document content"
            />
        )}
        {activeTab === 'upload' && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-base-100 border-2 border-dashed border-base-300 rounded-lg p-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.docx" className="hidden" />
                <UploadIcon className="w-12 h-12 text-content-200 mb-2" />
                <button onClick={() => fileInputRef.current?.click()} className="font-semibold text-brand-secondary hover:text-brand-primary">
                    Click to upload
                </button>
                <p className="text-xs text-content-200 mt-1">TXT or DOCX</p>
                {fileName && <p className="mt-4 text-sm text-center text-content-100">File selected: <span className="font-semibold">{fileName}</span></p>}
                {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}
            </div>
        )}
        {activeTab === 'link' && (
             <div className="w-full h-full flex flex-col items-center justify-center bg-base-100 border border-base-300 rounded-lg p-8 text-center">
                <LinkIcon className="w-12 h-12 text-content-200 mb-4" />
                <h3 className="font-semibold text-content-strong">Confluence Integration</h3>
                <p className="text-sm text-content-200 max-w-sm mt-2">
                    Directly fetching from Confluence isn't possible in this client-side app due to security policies (CORS).
                </p>
                 <p className="text-sm text-content-200 max-w-sm mt-2">
                    Please <button className="font-semibold text-brand-secondary hover:text-brand-primary" onClick={() => setActiveTab('paste')}>paste the content</button> from your page manually.
                </p>
            </div>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !documentContent}
        className="flex items-center justify-center gap-2 w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-base-300 disabled:cursor-not-allowed disabled:text-content-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-secondary"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-5 h-5" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <GenerateIcon className="w-5 h-5" />
            <span>Generate Scenarios</span>
          </>
        )}
      </button>
    </div>
  );
};
