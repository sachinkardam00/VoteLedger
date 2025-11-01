import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useElectionStateWagmi, useContractWrite } from '@/hooks';
import { ElectionStatus, validateConfig } from '@/config';
import { Navigation } from '@/components';
import { 
  LandingPage, 
  HomePage,
  AdminDashboard, 
  RegistrationPage, 
  VotingPage, 
  ResultsPage 
} from '@/pages';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [configError, setConfigError] = useState(null);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

  console.log('App component rendering (Wagmi)...');

  // Wagmi hooks
  const { address: account, isConnected, chain } = useAccount();

  // Initialize contract methods and election state
  const contractMethods = useContractWrite();
  const electionState = useElectionStateWagmi();

  console.log('App state (Wagmi):', {
    account,
    isConnected,
    chain: chain?.name,
    configError,
    status: electionState.status,
    isOwner: electionState.isOwner,
    activeView,
  });

  // Validate configuration on mount
  useEffect(() => {
    const errors = validateConfig();
    if (errors.length > 0) {
      setConfigError(errors.join(', '));
    }
  }, []);

  // Auto-select view based on election status (only on initial load, not after manual navigation)
  useEffect(() => {
    if (showLanding) return; // Don't run when landing page is shown
    if (!electionState.status && electionState.status !== 0) return;
    if (hasManuallyNavigated) return; // Don't auto-redirect if user manually navigated

    if (electionState.isOwner && activeView === 'home') {
      setActiveView('admin');
    } else if (electionState.status === ElectionStatus.Ended && activeView === 'home') {
      setActiveView('results');
    } else if (electionState.status === ElectionStatus.Voting && activeView === 'home') {
      if (electionState.currentVoter && !electionState.currentVoter.hasVoted) {
        setActiveView('voting');
      }
    }
  }, [showLanding, electionState.status, electionState.isOwner, electionState.currentVoter, activeView, hasManuallyNavigated]);

  // Show landing page first (after all hooks have been called)
  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }



  // Render errors
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Configuration Error</h3>
            <p className="mt-1 text-sm text-gray-500">{configError}</p>
            <p className="mt-4 text-xs text-gray-400">
              Please check your .env file and ensure all required variables are set.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeView={activeView}
        setActiveView={setActiveView}
        setHasManuallyNavigated={setHasManuallyNavigated}
        electionState={electionState}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'admin' && (
          <>
            {electionState.isOwner ? (
              <AdminDashboard
                electionState={electionState}
                contractMethods={contractMethods}
              />
            ) : (
              <div className="card max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                  <p className="text-gray-600">Only the contract owner can access the Admin Dashboard.</p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Your wallet:</span><br/>
                      {account}
                    </p>
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">isOwner status:</span> {electionState.isOwner ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {activeView === 'registration' && (
          <RegistrationPage
            electionState={electionState}
            contractMethods={contractMethods}
            account={account}
            onNavigate={(view) => {
              setActiveView(view);
              setHasManuallyNavigated(true);
            }}
          />
        )}
        {activeView === 'voting' && (
          <VotingPage
            electionState={electionState}
            contractMethods={contractMethods}
            account={account}
          />
        )}
        {activeView === 'results' && (
          <ResultsPage electionState={electionState} />
        )}
        {activeView === 'home' && (
          <HomePage electionState={electionState} />
        )}
      </main>
    </div>
  );
}

export default App;
