import { useState, useEffect } from 'react';
import type { PanelState, TabType } from '../../protocol/types';
import { getActiveTab, setActiveTab as setActiveTabInState, subscribeToStateUpdates } from './vscode-api';
import { FileInfo } from './components/FileInfo';
import { HealthBar } from './components/HealthBar';
import { Tabs } from './components/Tabs';
import { LintTab } from './components/LintTab';
import { FormatTab } from './components/FormatTab';
import { MetaschemaTab } from './components/MetaschemaTab';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const [state, setState] = useState<PanelState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lint');

  useEffect(() => {
    const savedTab = getActiveTab();
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // Subscribe to state updates from the extension
    const unsubscribe = subscribeToStateUpdates((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (state?.blockedByMetaschema) {
      setActiveTab('metaschema');
      setActiveTabInState('metaschema');
    }
  }, [state?.blockedByMetaschema]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
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
