import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { ElectionStatus } from '@config';
import PinataService from '@/services/pinataService';
import { eventBus, EVENTS } from '@/utils/eventBus';

const RegistrationPage = ({ electionState, contractMethods, account, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('voter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const publicClient = usePublicClient();

  // Voter registration state
  const [voterName, setVoterName] = useState('');
  const [voterImage, setVoterImage] = useState(null);
  const [voterImagePreview, setVoterImagePreview] = useState(null);

  // Candidate registration state
  const [candidateName, setCandidateName] = useState('');
  const [candidateImage, setCandidateImage] = useState(null);
  const [candidateImagePreview, setCandidateImagePreview] = useState(null);

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    const validation = PinataService.validateImageFile(file, 5);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.error });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'voter') {
        setVoterImage(file);
        setVoterImagePreview(reader.result);
      } else {
        setCandidateImage(file);
        setCandidateImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVoterRegistration = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    try {
      // Upload image to IPFS
      let ipfsHash = '';
      if (voterImage) {
        const uploadResult = await PinataService.uploadFile(voterImage, {
          name: `voter-${account}-profile`,
          keyvalues: {
            type: 'voter-profile',
            address: account,
          },
        });
        ipfsHash = uploadResult.ipfsHash;
      }

      // Register voter on blockchain
      await contractMethods.registerVoter(voterName, ipfsHash);
      
      setMessage({ type: 'success', text: 'Transaction submitted! Waiting for confirmation...' });
      
      // Wait for transaction confirmation
      if (contractMethods.hash && publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: contractMethods.hash });
        setMessage({ type: 'success', text: 'Successfully registered as voter! ✅' });
        await electionState.refresh();
        // Emit event to update all other pages in real-time
        eventBus.emit(EVENTS.VOTER_REGISTERED);
        eventBus.emit(EVENTS.ELECTION_UPDATED);
      }
      
      // Reset form
      setVoterName('');
      setVoterImage(null);
      setVoterImagePreview(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCandidateRegistration = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    try {
      // Upload image to IPFS
      let ipfsHash = '';
      if (candidateImage) {
        console.log('Uploading candidate image to IPFS...');
        const uploadResult = await PinataService.uploadFile(candidateImage, {
          name: `candidate-${account}-profile`,
          keyvalues: {
            type: 'candidate-profile',
            address: account,
          },
        });
        ipfsHash = uploadResult.ipfsHash;
        console.log('IPFS hash generated:', ipfsHash);
      } else {
        console.log('No candidate image selected, registering without profile picture');
      }

      // Register candidate on blockchain
      console.log('Registering candidate with name:', candidateName, 'ipfsHash:', ipfsHash);
      await contractMethods.registerCandidate(candidateName, ipfsHash);
      
      setMessage({ type: 'success', text: 'Transaction submitted! Waiting for confirmation...' });
      
      // Wait for transaction confirmation
      if (contractMethods.hash && publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: contractMethods.hash });
        setMessage({ type: 'success', text: 'Successfully registered as candidate! ✅' });
        await electionState.refresh();
        // Emit event to update all other pages in real-time
        eventBus.emit(EVENTS.CANDIDATE_REGISTERED);
        eventBus.emit(EVENTS.ELECTION_UPDATED);
      }
      
      // Reset form
      setCandidateName('');
      setCandidateImage(null);
      setCandidateImagePreview(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if registration is open
  if (electionState.status !== ElectionStatus.RegistrationOpen) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Closed</h2>
          <p className="text-gray-600">
            Registration is not currently open.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Current status: <span className="font-medium">{electionState.statusText}</span>
          </p>
          {electionState.isOwner && electionState.status === ElectionStatus.Ended && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-left">
              <p className="text-sm font-medium text-indigo-900 mb-2">📝 Admin Action Required</p>
              <p className="text-sm text-indigo-700">
                The election has ended. To start a new election cycle, go to the{' '}
                <span className="font-semibold">Admin Dashboard</span> and click{' '}
                <span className="font-semibold">"Start New Election"</span> to reopen registration.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check registration status
  const isVoterRegistered = electionState.currentVoter?.isRegistered || false;
  const isCandidateRegistered = electionState.currentVoter?.isCandidate || false;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration</h2>

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

        {!PinataService.isConfigured() && (
          <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md">
            <p className="text-sm">
              ⚠️ Pinata is not configured. Profile pictures won't be uploaded to IPFS.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('voter')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'voter'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register as Voter
          </button>
          <button
            onClick={() => setActiveTab('candidate')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'candidate'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register as Candidate
          </button>
        </div>

        {/* Voter Registration Form */}
        {activeTab === 'voter' && (
          <>
            {isVoterRegistered ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Already Registered as Voter</h3>
                <p className="text-gray-600 mb-4">
                  Registered as: <span className="font-medium">{electionState.currentVoter.name}</span>
                </p>
                {electionState.currentVoter.profilePic && (
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${electionState.currentVoter.profilePic}`}
                    alt="Your profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto mt-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ) : (
              <form onSubmit={handleVoterRegistration} className="space-y-4">
                <div>
                  <label htmlFor="voterName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="voterName"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="input w-full"
                    placeholder="Enter your full name"
                    required
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label htmlFor="voterImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture (Optional)
                  </label>
                  <input
                    type="file"
                    id="voterImage"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'voter')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={isProcessing}
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 5MB, JPEG/PNG/GIF/WebP</p>
                  {voterImagePreview && (
                    <img
                      src={voterImagePreview}
                      alt="Preview"
                      className="mt-2 w-32 h-32 rounded-full object-cover"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !voterName.trim()}
                  className="w-full btn-primary"
                >
                  {isProcessing ? 'Registering...' : 'Register as Voter'}
                </button>
              </form>
            )}
          </>
        )}

        {/* Candidate Registration Form */}
        {activeTab === 'candidate' && (
          <>
            {isCandidateRegistered ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Already Registered as Candidate</h3>
                <p className="text-gray-600 mb-4">
                  Registered as: <span className="font-medium">{electionState.currentVoter.name}</span>
                </p>
                {electionState.currentVoter.profilePic && (
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${electionState.currentVoter.profilePic}`}
                    alt="Your profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto mt-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ) : (
              <form onSubmit={handleCandidateRegistration} className="space-y-4">
                <div>
                  <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="candidateName"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="input w-full"
                    placeholder="Enter your full name"
                    required
                    disabled={isProcessing}
                  />
                </div>



                <div>
                  <label htmlFor="candidateImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture (Optional)
                  </label>
                  <input
                    type="file"
                    id="candidateImage"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'candidate')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={isProcessing}
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 5MB, JPEG/PNG/GIF/WebP</p>
                  {candidateImagePreview && (
                    <img
                      src={candidateImagePreview}
                      alt="Preview"
                      className="mt-2 w-32 h-32 rounded-full object-cover"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !candidateName.trim()}
                  className="w-full btn-primary"
                >
                  {isProcessing ? 'Registering...' : 'Register as Candidate'}
                </button>
              </form>
            )}
          </>
        )}

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">
              {voterImage || candidateImage ? 'Uploading to IPFS...' : 'Processing...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
