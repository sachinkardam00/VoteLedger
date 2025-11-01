import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navigation = ({ 
  activeView, 
  setActiveView, 
  setHasManuallyNavigated, 
  electionState 
}) => {
  return (
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
};

export default Navigation;
