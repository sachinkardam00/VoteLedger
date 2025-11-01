const HomePage = ({ electionState }) => {
  return (
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
        {electionState?.statusText && (
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Current Status</p>
            <p className="text-2xl font-bold text-indigo-900">{electionState.statusText}</p>
          </div>
        )}
        {electionState?.totalCandidates > 0 && (
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
  );
};

export default HomePage;
