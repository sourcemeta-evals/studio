// Main application component
// Manages the state and rendering of the VS Code webview panel
import { useState, useEffect } from 'react';
import type { PanelState } from '../../shared/types.ts';
import { vscode } from './vscode-api';
import { FileInfo } from './components/FileInfo';
import { HealthBar } from './components/HealthBar';
import { Tabs } from './components/Tabs';
import { LintTab } from './components/LintTab';
import { FormatTab } from './components/FormatTab';
import { MetaschemaTab } from './components/MetaschemaTab';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  // Main application state from the extension
  const [state, setState] = useState<PanelState | null>(null);
  // Track which tab is currently active (lint, format, or metaschema)
  const [activeTab, setActiveTab] = useState<'lint' | 'format' | 'metaschema'>('lint');

  // Initialize component and restore saved tab preference
  useEffect(() => {
    // Try to restore the previously active tab from VS Code state
    const savedTab = vscode.getActiveTab();
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // Listen for messages from the extension
    // The extension will send updates when the panel state changes
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'update') {
        setState(message.state);
      }
    };

    // Register the message listener
    window.addEventListener('message', handleMessage);

    // Cleanup function to remove listener when component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Automatically switch to metaschema tab if there are blocking metaschema errors
  useEffect(() => {
    if (state?.blockedByMetaschema) {
      // Force switch to metaschema tab to show critical errors
      setActiveTab('metaschema');
      // Persist the tab change to VS Code state
      vscode.setActiveTab('metaschema');
    }
  }, [state?.blockedByMetaschema]);

  // Handle tab change events from the Tabs component
  // Updates both local React state and persists to VS Code state
  const handleTabChange = (tab: 'lint' | 'format' | 'metaschema') => {
    // Update local state
    setActiveTab(tab);
    // Persist to VS Code state so it's remembered across panel opens
    vscode.setActiveTab(tab);
  };

  // Show loading state while waiting for initial state from extension
  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen text-(--vscode-muted) text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-5">
      <FileInfo fileInfo={state.fileInfo} />
      <HealthBar 
        lintResult={state.lintResult} 
        isLoading={state.isLoading} 
        blockedByMetaschema={state.blockedByMetaschema}
        noFileSelected={state.noFileSelected}
      />
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} state={state} />
      
      <div className="flex-1 overflow-y-auto">
        {state.isLoading ? (
          <LoadingSpinner fileInfo={state.fileInfo} />
        ) : state.formatLoading && activeTab === 'format' ? (
          <LoadingSpinner fileInfo={state.fileInfo} />
        ) : (
          <>
            {activeTab === 'lint' && <LintTab lintResult={state.lintResult} blocked={!!state.blockedByMetaschema} noFileSelected={state.noFileSelected} />}
            {activeTab === 'format' && <FormatTab formatResult={state.formatResult} fileInfo={state.fileInfo} hasParseErrors={state.hasParseErrors} blocked={!!state.blockedByMetaschema} noFileSelected={state.noFileSelected} />}
            {activeTab === 'metaschema' && <MetaschemaTab metaschemaResult={state.metaschemaResult} noFileSelected={state.noFileSelected} />}
          </>
        )}
      </div>

      <Footer cliVersion={state.cliVersion} extensionVersion={state.extensionVersion} />
    </div>
  );
}

export default App;
