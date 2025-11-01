import { ElectionStatus } from '@config';

const ResultsPage = ({ electionState }) => {
  // Sort candidates by vote count
  const sortedCandidates = [...electionState.candidates].sort(
    (a, b) => b.voteCount - a.voteCount
  );

  const totalVotes = electionState.totalVotesCast;
  const winner = sortedCandidates[0];

  return (
    <div className="space-y-6">
      {/* Admin Notice for New Election */}
      {electionState.isOwner && electionState.status === ElectionStatus.Ended && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-indigo-900">Ready to Start a New Election?</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  These are the final results. To begin a fresh election cycle, go to the{' '}
                  <span className="font-semibold">Admin Dashboard</span> and click{' '}
                  <span className="font-semibold">"Start New Election"</span>.
                </p>
                <p className="mt-2 text-xs text-indigo-600">
                  Note: Previous election data will remain stored on the blockchain but will be inactive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winner Announcement */}
      {winner && winner.voteCount > 0 && (
        <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 mb-4">
              <svg className="w-10 h-10 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Election Winner</h2>
            {winner.profilePic && (
              <img
                src={`https://gateway.pinata.cloud/ipfs/${winner.profilePic}`}
                alt={winner.name}
                className="w-32 h-32 rounded-full object-cover mx-auto my-4 border-4 border-white"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <h3 className="text-2xl font-bold">{winner.name}</h3>
            <div className="mt-4 inline-flex items-center space-x-2 bg-white bg-opacity-20 px-6 py-3 rounded-full">
              <span className="text-lg">Total Votes:</span>
              <span className="text-3xl font-bold">{winner.voteCount}</span>
            </div>
            {totalVotes > 0 && (
              <p className="mt-2 text-sm opacity-75">
                ({((winner.voteCount / totalVotes) * 100).toFixed(1)}% of total votes)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Election Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50">
          <p className="text-sm text-blue-600 font-medium">Total Voters</p>
          <p className="text-3xl font-bold text-blue-900">{electionState.totalVoters}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600 font-medium">Votes Cast</p>
          <p className="text-3xl font-bold text-green-900">{electionState.totalVotesCast}</p>
        </div>
        <div className="card bg-purple-50">
          <p className="text-sm text-purple-600 font-medium">Turnout</p>
          <p className="text-3xl font-bold text-purple-900">
            {electionState.totalVoters > 0
              ? ((electionState.totalVotesCast / electionState.totalVoters) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Full Results */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Results</h3>
        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
            
            return (
              <div key={candidate.address} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-gray-700">
                      {index + 1}
                    </div>
                    {candidate.profilePic && (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${candidate.profilePic}`}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-600">{candidate.address.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{candidate.voteCount}</p>
                    <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                {/* Vote Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      index === 0
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>


              </div>
            );
          })}
        </div>
      </div>

      {/* No candidates message */}
      {sortedCandidates.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-600">No candidates participated in this election.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
