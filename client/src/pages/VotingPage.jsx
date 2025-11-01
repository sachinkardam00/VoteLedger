import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { ElectionStatus } from '@config';
import { eventBus, EVENTS } from '@/utils/eventBus';

const VotingPage = ({ electionState, contractMethods, account }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [message, setMessage] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const publicClient = usePublicClient();

  // Update countdown timer
  useEffect(() => {
    if (electionState.status !== ElectionStatus.Voting) return;

    const updateTimer = () => {
      const remaining = electionState.getTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [electionState]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    setIsVoting(true);
    setMessage(null);

    try {
      await contractMethods.vote(selectedCandidate.address);
      setMessage({
        type: 'success',
        text: 'Vote submitted! Waiting for confirmation...',
      });

      // Wait for transaction confirmation
      if (contractMethods.hash && publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: contractMethods.hash });
        setMessage({
          type: 'success',
          text: `Successfully voted for ${selectedCandidate.name}! ✅`,
        });
        await electionState.refresh();
        // Emit event to update all other pages in real-time
        eventBus.emit(EVENTS.VOTE_CAST);
        eventBus.emit(EVENTS.ELECTION_UPDATED);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsVoting(false);
    }
  };

  // Check if voting is active
  if (electionState.status !== ElectionStatus.Voting) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting Not Active</h2>
          <p className="text-gray-600">Voting is not currently in progress.</p>
          <p className="mt-4 text-sm text-gray-500">
            Current status: <span className="font-medium">{electionState.statusText}</span>
          </p>
          {electionState.status === ElectionStatus.Ended && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">🏆 Election Completed</p>
              <p className="text-sm text-green-700">
                The election has ended. Click on the{' '}
                <span className="font-semibold">Results</span> tab to view the final results and winner.
              </p>
            </div>
          )}
          {electionState.isOwner && electionState.status === ElectionStatus.Ended && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-left">
              <p className="text-sm font-medium text-indigo-900 mb-2">📝 Start New Election</p>
              <p className="text-sm text-indigo-700">
                To run another election, go to the{' '}
                <span className="font-semibold">Admin Dashboard</span> and click{' '}
                <span className="font-semibold">"Start New Election"</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if user is registered
  if (!electionState.currentVoter) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Registered</h2>
          <p className="text-gray-600">You must be registered as a voter to participate.</p>
        </div>
      </div>
    );
  }

  // Check if already voted
  if (electionState.currentVoter.hasVoted) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Recorded</h2>
          <p className="text-gray-600">You have already cast your vote in this election.</p>
          <p className="mt-4 text-sm text-gray-500">Thank you for participating!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cast Your Vote</h2>
        
        {timeRemaining && !timeRemaining.expired && (
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
            <span className="text-sm font-medium text-indigo-900">Time Remaining:</span>
            <span className="text-2xl font-bold text-indigo-600">
              {String(timeRemaining.hours).padStart(2, '0')}:
              {String(timeRemaining.minutes).padStart(2, '0')}:
              {String(timeRemaining.seconds).padStart(2, '0')}
            </span>
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {electionState.candidates.map((candidate) => {
          console.log('Rendering candidate:', candidate.name, 'profilePic:', candidate.profilePic);
          return (
          <div
            key={candidate.address}
            onClick={() => setSelectedCandidate(candidate)}
            className={`card cursor-pointer transition-all ${
              selectedCandidate?.address === candidate.address
                ? 'ring-2 ring-indigo-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
          >
            {/* Profile Picture */}
            {candidate.profilePic ? (
              <img
                src={`https://gateway.pinata.cloud/ipfs/${candidate.profilePic}`}
                alt={candidate.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dy=".3em" text-anchor="middle" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
                onLoad={() => console.log('Image loaded successfully:', candidate.name)}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Candidate Info */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-600">{candidate.address.slice(0, 10)}...{candidate.address.slice(-8)}</p>
              
              {/* Vote Count */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Votes:</span>
                  <span className="text-lg font-bold text-gray-900">{candidate.voteCount}</span>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedCandidate?.address === candidate.address && (
              <div className="mt-4 p-2 bg-indigo-50 text-indigo-700 text-center rounded-md font-medium">
                Selected
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* No candidates message */}
      {electionState.candidates.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-600">No candidates have registered yet.</p>
        </div>
      )}

      {/* Vote Button */}
      {electionState.candidates.length > 0 && (
        <div className="card">
          <button
            onClick={handleVote}
            disabled={!selectedCandidate || isVoting}
            className="w-full btn-primary text-lg py-3"
          >
            {isVoting ? 'Submitting Vote...' : selectedCandidate ? `Vote for ${selectedCandidate.name}` : 'Select a Candidate'}
          </button>

          {isVoting && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Submitting your vote...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VotingPage;
