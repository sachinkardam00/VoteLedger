import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { ElectionStatus } from '@config';
import { eventBus, EVENTS } from '@/utils/eventBus';

const AdminDashboard = ({ electionState, contractMethods }) => {
  const [votingDuration, setVotingDuration] = useState(24);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const publicClient = usePublicClient();

  const handleAction = async (action, actionName) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      await action();
      setMessage({ type: 'success', text: `${actionName} submitted! Waiting for confirmation...` });
      
      // Wait for transaction confirmation
      if (contractMethods.hash && publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: contractMethods.hash });
        setMessage({ type: 'success', text: `${actionName} confirmed! ✅` });
        await electionState.refresh();
        // Emit event to update all other pages in real-time
        eventBus.emit(EVENTS.STATUS_CHANGED);
        eventBus.emit(EVENTS.ELECTION_UPDATED);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Election Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Voters</p>
            <p className="text-2xl font-bold text-blue-900">{electionState.totalVoters}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Candidates</p>
            <p className="text-2xl font-bold text-green-900">{electionState.totalCandidates}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Votes Cast</p>
            <p className="text-2xl font-bold text-purple-900">{electionState.totalVotesCast}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Status</p>
            <p className="text-lg font-bold text-indigo-900">{electionState.statusText}</p>
          </div>
        </div>

        {/* Voting Duration Configuration */}
        {electionState.status === ElectionStatus.RegistrationClosed && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Voting Duration</h3>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="720"
                value={votingDuration}
                onChange={(e) => setVotingDuration(Number(e.target.value))}
                className="input w-32"
                disabled={isProcessing}
              />
              <span className="text-gray-600">hours (required before starting voting)</span>
            </div>
          </div>
        )}

        {/* Election Controls */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Election Controls</h3>

          {/* Restart Election Warning */}
          {electionState.status === ElectionStatus.Ended && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Election Ended</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Previous election data (candidates, voters, votes) will remain visible but inactive. 
                    Opening new registration will start a fresh election cycle while keeping old data stored.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Open Registration */}
          {(electionState.status === ElectionStatus.RegistrationClosed ||
            electionState.status === ElectionStatus.Ended ||
            electionState.status === null) && (
            <button
              onClick={() =>
                handleAction(contractMethods.openRegistration, 'Open registration')
              }
              disabled={isProcessing}
              className="w-full btn-primary"
            >
              {electionState.status === ElectionStatus.Ended ? 'Start New Election' : 'Open Registration'}
            </button>
          )}

          {/* Close Registration */}
          {electionState.status === ElectionStatus.RegistrationOpen && (
            <button
              onClick={() =>
                handleAction(contractMethods.closeRegistration, 'Close registration')
              }
              disabled={isProcessing}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              Close Registration
            </button>
          )}

          {/* Start Voting */}
          {electionState.status === ElectionStatus.RegistrationClosed && (
            <button
              onClick={() => handleAction(
                () => contractMethods.startVoting(votingDuration),
                'Start voting'
              )}
              disabled={isProcessing || electionState.totalCandidates === 0 || votingDuration < 1}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              Start Voting ({votingDuration}h)
            </button>
          )}

          {/* Pause Election */}
          {electionState.status === ElectionStatus.Voting && (
            <button
              onClick={() => handleAction(contractMethods.pauseElection, 'Pause election')}
              disabled={isProcessing}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              Pause Election
            </button>
          )}

          {/* Resume Election */}
          {electionState.status === ElectionStatus.Paused && (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remaining Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={votingDuration}
                  onChange={(e) => setVotingDuration(Number(e.target.value))}
                  className="input w-32"
                  disabled={isProcessing}
                />
              </div>
              <button
                onClick={() => handleAction(
                  () => contractMethods.resumeElection(votingDuration),
                  'Resume election'
                )}
                disabled={isProcessing || votingDuration < 1}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
              >
                Resume Election ({votingDuration}h)
              </button>
            </>
          )}

          {/* End Election */}
          {(electionState.status === ElectionStatus.Voting ||
            electionState.status === ElectionStatus.Paused) && (
            <button
              onClick={() => handleAction(contractMethods.endElection, 'End election')}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              End Election
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Candidates List */}
      {electionState.candidates.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Registered Candidates</h3>
          <div className="space-y-3">
            {electionState.candidates.map((candidate) => (
              <div
                key={candidate.address}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
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
                    <p className="font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-sm text-gray-600">{candidate.address.slice(0, 10)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{candidate.voteCount}</p>
                  <p className="text-xs text-gray-500">votes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
