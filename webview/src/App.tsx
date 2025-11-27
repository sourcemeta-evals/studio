// Main application component
// This is the root component of the webview panel
import { useState, useEffect } from 'react';
import type { PanelState, TabType } from '../../protocol/types';
import { getActiveTab, setActiveTab as setActiveTabInState } from './message';
import { FileInfo } from './components/FileInfo';
import { HealthBar } from './components/HealthBar';
import { Tabs } from './components/Tabs';
import { LintTab } from './components/LintTab';
import { FormatTab } from './components/FormatTab';
import { MetaschemaTab } from './components/MetaschemaTab';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';

// App component manages the main state and tab navigation
// It coordinates between the extension and the webview UI
function App() {
  // State to hold the panel data from the extension
  const [state, setState] = useState<PanelState | null>(null);
  // Track which tab is currently active (lint, format, or metaschema)
  const [activeTab, setActiveTab] = useState<TabType>('lint');

  // Initialize the component and restore saved state
  useEffect(() => {
    // Try to restore the previously active tab from VS Code state
    const savedTab = getActiveTab();
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // Listen for messages from the extension
    // The extension sends updates when the panel state changes
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'update') {
        setState(message.state);
      }
    };

    // Register the message listener to receive updates from the extension
    window.addEventListener('message', handleMessage);

    // Cleanup function to remove the listener when component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Automatically switch to metaschema tab if there are blocking errors
  useEffect(() => {
    if (state?.blockedByMetaschema) {
      // Force switch to metaschema tab to show critical errors
      setActiveTab('metaschema');
      // Also persist this tab selection to VS Code state
      setActiveTabInState('metaschema');
    }
  }, [state?.blockedByMetaschema]);

  // Handle tab change events from the Tabs component
  const handleTabChange = (tab: TabType) => {
    // Update local React state
    setActiveTab(tab);
    // Persist the tab selection to VS Code state for restoration
    setActiveTabInState(tab);
  };

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
