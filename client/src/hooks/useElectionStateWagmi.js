import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ElectionStatus } from '@config';
import { eventBus, EVENTS } from '@/utils/eventBus';

export const useElectionStateWagmi = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  
  const [candidates, setCandidates] = useState([]);
  const [currentVoter, setCurrentVoter] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalVotesCast, setTotalVotesCast] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Read contract data
  const { data: status, refetch: refetchStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'currentStatus',
  });

  const { data: votingStartTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'votingStartTime',
  });

  const { data: votingEndTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'votingEndTime',
  });

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: winner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'winner',
  });

  // Calculate voting duration
  const votingDuration =
    votingEndTime && votingStartTime
      ? Number(votingEndTime) - Number(votingStartTime)
      : 0;

  // Check if current account is owner
  useEffect(() => {
    if (ownerAddress && account) {
      const isOwnerResult =
        ownerAddress.toLowerCase() === account.toLowerCase();
      console.log('Owner check (Wagmi):', {
        ownerAddress,
        account,
        isOwnerResult,
      });
      setIsOwner(isOwnerResult);
    } else {
      setIsOwner(false);
    }
  }, [ownerAddress, account]);

  // Fetch candidates and voters
  const fetchElectionData = useCallback(async () => {
    if (!publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching election data (Wagmi)...');

      // Fetch candidates
      const candidatesList = [];
      let candidateIndex = 0;
      let fetchingCandidates = true;

      while (fetchingCandidates) {
        try {
          const candidateAddr = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'candidateAddresses',
            args: [candidateIndex],
          });

          if (
            candidateAddr &&
            candidateAddr !== '0x0000000000000000000000000000000000000000'
          ) {
            // Fetch candidate info using getCandidateInfo function
            const candidateInfo = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getCandidateInfo',
              args: [candidateAddr],
            });

            // getCandidateInfo returns: [isRegistered, voteCount, name, profilePic]
            const candidateData = {
              address: candidateAddr,
              isRegistered: candidateInfo[0],
              voteCount: Number(candidateInfo[1]),
              name: candidateInfo[2],
              profilePic: candidateInfo[3],
            };
            console.log('Fetched candidate:', candidateData);
            candidatesList.push(candidateData);

            candidateIndex++;
          } else {
            fetchingCandidates = false;
          }
        } catch (err) {
          fetchingCandidates = false;
        }
      }

      setCandidates(candidatesList);

      // Calculate total votes
      const totalVotes = candidatesList.reduce(
        (sum, c) => sum + c.voteCount,
        0
      );
      setTotalVotesCast(totalVotes);

      // Fetch current voter info
      let votersCount = 0;
      if (account) {
        try {
          const voter = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getVoterInfo',
            args: [account],
          });

          // Check if account is a candidate
          const candidateMatch = candidatesList.find(
            (c) => c.address.toLowerCase() === account.toLowerCase()
          );

          // getVoterInfo returns: [isRegistered, hasVoted, votedFor, name, profilePic]
          if (voter[0] || candidateMatch) {
            // Either registered as voter OR is a candidate
            if (voter[0]) votersCount++;
            
            setCurrentVoter({
              isRegistered: voter[0],
              hasVoted: voter[1],
              votedFor: voter[2],
              name: voter[0] ? voter[3] : candidateMatch?.name || '',
              profilePic: voter[0] ? voter[4] : candidateMatch?.profilePic || '',
              isCandidate: !!candidateMatch,
            });
          } else {
            setCurrentVoter(null);
          }
        } catch (err) {
          console.error('Error fetching voter:', err);
          setCurrentVoter(null);
        }
      }

      setTotalVoters(votersCount + candidatesList.length);
      console.log('Election data loaded successfully (Wagmi)');
    } catch (err) {
      console.error('Error fetching election data:', err);
      setError(err.message || 'Failed to fetch election data');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, account]);

  // Initial fetch only (no auto-refresh loop)
  useEffect(() => {
    fetchElectionData();
  }, [fetchElectionData]);

  // Listen for election update events from any component
  useEffect(() => {
    const handleElectionUpdate = () => {
      console.log('Election update event received, refreshing data...');
      fetchElectionData();
    };

    eventBus.on(EVENTS.ELECTION_UPDATED, handleElectionUpdate);
    eventBus.on(EVENTS.CANDIDATE_REGISTERED, handleElectionUpdate);
    eventBus.on(EVENTS.VOTER_REGISTERED, handleElectionUpdate);
    eventBus.on(EVENTS.VOTE_CAST, handleElectionUpdate);
    eventBus.on(EVENTS.STATUS_CHANGED, handleElectionUpdate);

    return () => {
      eventBus.off(EVENTS.ELECTION_UPDATED, handleElectionUpdate);
      eventBus.off(EVENTS.CANDIDATE_REGISTERED, handleElectionUpdate);
      eventBus.off(EVENTS.VOTER_REGISTERED, handleElectionUpdate);
      eventBus.off(EVENTS.VOTE_CAST, handleElectionUpdate);
      eventBus.off(EVENTS.STATUS_CHANGED, handleElectionUpdate);
    };
  }, [fetchElectionData]);

  // Get status text
  const getStatusText = useCallback(() => {
    switch (Number(status)) {
      case ElectionStatus.RegistrationOpen:
        return 'Registration Open';
      case ElectionStatus.RegistrationClosed:
        return 'Registration Closed';
      case ElectionStatus.Voting:
        return 'Voting in Progress';
      case ElectionStatus.Paused:
        return 'Election Paused';
      case ElectionStatus.Ended:
        return 'Election Ended';
      default:
        return 'Unknown';
    }
  }, [status]);

  // Calculate time remaining
  const getTimeRemaining = useCallback(() => {
    if (
      Number(status) !== ElectionStatus.Voting ||
      !votingStartTime ||
      Number(votingStartTime) === 0
    ) {
      return null;
    }

    const endTime = Number(votingStartTime) + votingDuration;
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    return { hours, minutes, seconds, expired: false };
  }, [status, votingStartTime, votingDuration]);

  return {
    status: Number(status),
    statusText: getStatusText(),
    votingDuration,
    votingStartTime: Number(votingStartTime),
    totalVoters,
    totalCandidates: candidates.length,
    totalVotesCast,
    candidates,
    currentVoter,
    winner,
    isOwner,
    isLoading,
    error,
    refresh: fetchElectionData,
    getTimeRemaining,
  };
};
