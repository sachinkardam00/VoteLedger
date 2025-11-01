import { useState, useEffect, useCallback } from 'react';
import { ElectionStatus } from '@config';

export const useElectionState = (contract, account) => {
  const [status, setStatus] = useState(null);
  const [votingDuration, setVotingDuration] = useState(0);
  const [votingStartTime, setVotingStartTime] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalVotesCast, setTotalVotesCast] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [currentVoter, setCurrentVoter] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all election data
  const fetchElectionData = useCallback(async () => {
    if (!contract) {
      console.log('Contract not initialized yet');
      return;
    }
    
    if (!account) {
      console.log('Account not connected yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching election data from contract...');
      console.log('Contract address:', contract.target || contract.address);
      console.log('Connected account:', account);
      
      // Fetch basic election info
      const statusValue = await contract.currentStatus();
      const startTime = await contract.votingStartTime();
      const endTime = await contract.votingEndTime();
      
      console.log('Status:', Number(statusValue), 'Start:', Number(startTime), 'End:', Number(endTime));

      setStatus(Number(statusValue));
      setVotingStartTime(Number(startTime));
      setVotingDuration(Number(endTime) - Number(startTime));
      
      // Get candidates - candidateAddresses is a public array, so we need to fetch by index
      const candidatesList = [];
      let candidateIndex = 0;
      let fetchingCandidates = true;
      
      while (fetchingCandidates) {
        try {
          const candidateAddr = await contract.candidateAddresses(candidateIndex);
          if (candidateAddr && candidateAddr !== '0x0000000000000000000000000000000000000000') {
            candidatesList.push(candidateAddr);
            candidateIndex++;
          } else {
            fetchingCandidates = false;
          }
        } catch (err) {
          // No more candidates
          fetchingCandidates = false;
        }
      }
      
      console.log('Found candidates:', candidatesList);
      
      // Count registered voters and votes cast
      let votersCount = 0;
      let votesCastCount = 0;

      // Fetch candidate details
      const candidatesData = await Promise.all(
        candidatesList.map(async (candidateAddr) => {
          const candidate = await contract.candidates(candidateAddr);
          votesCastCount += Number(candidate.voteCount);
          return {
            address: candidateAddr,
            name: candidate.name,
            profilePic: candidate.profilePic,
            voteCount: Number(candidate.voteCount),
            isRegistered: candidate.isRegistered,
          };
        })
      );

      setTotalCandidates(candidatesList.length);
      setTotalVotesCast(votesCastCount);
      setCandidates(candidatesData);

      // Fetch winner if election ended
      if (Number(statusValue) === ElectionStatus.Ended) {
        try {
          const winnerAddress = await contract.getWinner();
          if (winnerAddress !== '0x0000000000000000000000000000000000000000') {
            const winnerData = await contract.candidates(winnerAddress);
            setWinner({
              address: winnerAddress,
              name: winnerData.name,
              profilePic: winnerData.profilePic,
              voteCount: Number(winnerData.voteCount),
            });
          }
        } catch (err) {
          console.error('Error fetching winner:', err);
        }
      }

      // Fetch current voter info if account is connected
      if (account) {
        try {
          const voter = await contract.voters(account);
          if (voter.isRegistered) {
            votersCount++;
            setCurrentVoter({
              name: voter.name,
              profilePic: voter.profilePic,
              hasVoted: voter.hasVoted,
              isCandidate: await contract.candidates(account).then(c => c.isRegistered),
            });
          } else {
            setCurrentVoter(null);
          }
        } catch (err) {
          console.error('Error fetching voter:', err);
          setCurrentVoter(null);
        }

        // Check if current account is owner
        try {
          console.log('About to call contract.owner()...');
          const ownerAddress = await contract.owner();
          console.log('Raw owner address from contract:', ownerAddress);
          
          const ownerLower = ownerAddress.toLowerCase();
          const accountLower = account.toLowerCase();
          const isOwnerResult = ownerLower === accountLower;
          
          console.log('Owner check:', { 
            ownerAddress, 
            ownerLower,
            account, 
            accountLower,
            isOwnerResult,
            match: ownerLower === accountLower ? '✓ MATCH' : '✗ NO MATCH'
          });
          setIsOwner(isOwnerResult);
        } catch (err) {
          console.error('Error checking owner:', err);
          console.error('Error details:', err.message, err.code);
          setIsOwner(false);
        }
      }
      
      setTotalVoters(votersCount);
      console.log('Election data loaded successfully');
    } catch (err) {
      console.error('Error fetching election data:', err);
      setError(err.message || 'Failed to fetch election data');
    } finally {
      setIsLoading(false);
    }
  }, [contract, account]);

  // Initial fetch
  useEffect(() => {
    fetchElectionData();
  }, [fetchElectionData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!contract) return;

    const interval = setInterval(() => {
      fetchElectionData();
    }, 10000);

    return () => clearInterval(interval);
  }, [contract, fetchElectionData]);

  // Listen to contract events
  useEffect(() => {
    if (!contract) return;

    const eventNames = [
      'RegistrationOpened',
      'RegistrationClosed',
      'VotingStarted',
      'ElectionPaused',
      'ElectionResumed',
      'ElectionEnded',
      'VoterRegistered',
      'CandidateRegistered',
      'VoteCast',
    ];

    const handleEvent = () => {
      console.log('Contract event detected, refreshing data...');
      fetchElectionData();
    };

    // Subscribe to all events
    eventNames.forEach((eventName) => {
      contract.on(eventName, handleEvent);
    });

    return () => {
      // Unsubscribe from all events
      eventNames.forEach((eventName) => {
        contract.off(eventName, handleEvent);
      });
    };
  }, [contract, fetchElectionData]);

  // Get status text
  const getStatusText = useCallback(() => {
    switch (status) {
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
    if (status !== ElectionStatus.Voting || votingStartTime === 0) {
      return null;
    }

    const endTime = votingStartTime + votingDuration;
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
    status,
    statusText: getStatusText(),
    votingDuration,
    votingStartTime,
    totalVoters,
    totalCandidates,
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
