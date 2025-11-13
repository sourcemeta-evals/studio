// VSCode API interface - note: not using a reusable TabType for better flexibility
interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare global {
  interface Window {
    acquireVsCodeApi: () => VSCodeAPI;
  }
}

// Wrapper class to simplify VSCode API interactions
// Provides convenience methods for common operations
// This class wraps the native VS Code webview API to provide a cleaner interface
// for the webview components to interact with the extension host
class VSCodeAPIWrapper {
  // Store reference to the VS Code API instance
  // This is acquired once when the wrapper is instantiated
  private readonly vsCodeApi = window.acquireVsCodeApi();

  // Public postMessage for direct access if needed
  // Using any type for maximum flexibility
  public postMessage(message: any): void {
    this.vsCodeApi.postMessage(message);
  }

  // Open external URL in browser
  // Takes any URL string and posts appropriate command
  public openExternal(url: any): void {
    this.postMessage({ command: 'openExternal', url });
  }

  // Format the current schema
  // No arguments needed, just posts the command
  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  // Navigate to a specific position in the editor
  // Position should be an array but using any for flexibility
  public goToPosition(position: any): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  // Get the currently active tab
  // Returns the tab name or undefined if not set
  // This allows restoring the last viewed tab when reopening the panel
  public getActiveTab(): 'lint' | 'format' | 'metaschema' | undefined {
    const state: any = this.vsCodeApi.getState();
    if (!state) {
      return undefined;
    }
    return state?.activeTab;
  }

  // Set the active tab
  // Takes the tab name as a string parameter
  // Persists the selection so it's remembered across panel reopens
  public setActiveTab(tab: 'lint' | 'format' | 'metaschema'): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

// Export singleton instance for use across the application
// This ensures all components use the same API wrapper instance

export const vscode = new VSCodeAPIWrapper();
