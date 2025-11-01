import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useElectionStateWagmi } from '@/hooks/useElectionStateWagmi';
import { useContractWrite } from '@/hooks/useContractWrite';
import { ElectionStatus, validateConfig } from '@config';
import LandingPage from '@/pages/LandingPage';
import AdminDashboard from '@/pages/AdminDashboard';
import RegistrationPage from '@/pages/RegistrationPage';
import VotingPage from '@/pages/VotingPage';
import ResultsPage from '@/pages/ResultsPage';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [configError, setConfigError] = useState(null);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

  console.log('App component rendering (Wagmi)...');

  // Wagmi hooks
  const { address: account, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  // Initialize contract methods
  const contractMethods = useContractWrite();

  // Initialize election state
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

  // Render navigation
  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-2xl font-bold text-indigo-600 cursor-pointer hover:text-indigo-700"
              onClick={() => {
                setHasManuallyNavigated(true);
                setActiveView('home');
              }}
            >
              VotingDAO
            </h1>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => {
                  setHasManuallyNavigated(true);
                  setActiveView('home');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'home'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              {electionState.isOwner && (
                <button
                  onClick={() => {
                    console.log('Admin Dashboard clicked, changing view from:', activeView, 'to: admin');
                    setHasManuallyNavigated(true);
                    setActiveView('admin');
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  setHasManuallyNavigated(true);
                  setActiveView('registration');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'registration'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Registration
              </button>
              <button
                onClick={() => {
                  setHasManuallyNavigated(true);
                  setActiveView('voting');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'voting'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Vote
              </button>
              <button
                onClick={() => {
                  setHasManuallyNavigated(true);
                  setActiveView('results');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'results'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Results
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {electionState.statusText && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {electionState.statusText}
              </span>
            )}
            {/* RainbowKit Connect Button */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );

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
      {renderNavigation()}
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
          <div className="card max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to VotingDAO</h2>
            <p className="text-lg text-gray-600 mb-6">
              A decentralized voting platform powered by blockchain technology
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-4xl mb-2">🗳️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent Voting</h3>
                  <p className="text-sm text-gray-600">All votes recorded on blockchain</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-4xl mb-2">🔒</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure & Anonymous</h3>
                  <p className="text-sm text-gray-600">Your vote is private and protected</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-4xl mb-2">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Results</h3>
                  <p className="text-sm text-gray-600">Live vote counting and updates</p>
                </div>
              </div>
              {electionState.statusText && (
                <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium">Current Status</p>
                  <p className="text-2xl font-bold text-indigo-900">{electionState.statusText}</p>
                </div>
              )}
              {electionState.totalCandidates > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{electionState.totalVoters}</p>
                    <p className="text-sm text-gray-600">Registered Voters</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{electionState.totalCandidates}</p>
                    <p className="text-sm text-gray-600">Candidates</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{electionState.totalVotesCast}</p>
                    <p className="text-sm text-gray-600">Votes Cast</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
