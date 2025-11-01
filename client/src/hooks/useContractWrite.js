import { useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@config';

export const useContractWrite = () => {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const executeTransaction = useCallback(
    async (functionName, args = []) => {
      try {
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName,
          args,
        });
        return { success: true, hash };
      } catch (err) {
        console.error(`Error executing ${functionName}:`, err);
        throw err;
      }
    },
    [writeContract, hash]
  );

  // Owner functions
  const openRegistration = useCallback(
    () => executeTransaction('startRegistration'),
    [executeTransaction]
  );

  const closeRegistration = useCallback(
    () => executeTransaction('closeRegistration'),
    [executeTransaction]
  );

  const startVoting = useCallback(
    (durationInHours) => {
      const durationInSeconds = durationInHours * 3600;
      return executeTransaction('startVoting', [durationInSeconds]);
    },
    [executeTransaction]
  );

  const pauseElection = useCallback(
    () => executeTransaction('pauseElection'),
    [executeTransaction]
  );

  const resumeElection = useCallback(
    (durationInHours) => {
      const durationInSeconds = durationInHours * 3600;
      return executeTransaction('restartVoting', [durationInSeconds]);
    },
    [executeTransaction]
  );

  const endElection = useCallback(
    () => executeTransaction('endElection'),
    [executeTransaction]
  );

  const registerVoter = useCallback(
    (name, profilePictureHash) =>
      executeTransaction('registerAsVoter', [name, profilePictureHash]),
    [executeTransaction]
  );

  const registerCandidate = useCallback(
    (name, profilePictureHash) =>
      executeTransaction('registerAsCandidate', [name, profilePictureHash]),
    [executeTransaction]
  );

  const vote = useCallback(
    (candidateAddress) => executeTransaction('vote', [candidateAddress]),
    [executeTransaction]
  );

  return {
    // State
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    // Owner functions
    openRegistration,
    closeRegistration,
    startVoting,
    pauseElection,
    resumeElection,
    endElection,
    // User functions
    registerVoter,
    registerCandidate,
    vote,
  };
};
