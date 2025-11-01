// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingDAO {
    // --- Access Control Variables (Ownable2Step Pattern) ---
    address public owner;
    mapping(address => bool) private _pendingOwners;

    // --- Election Status Variables ---
    // REVISED: Added RegistrationClosed for stricter flow control
    enum Status { RegistrationOpen, RegistrationClosed, Voting, Paused, Ended }
    Status public currentStatus;
    uint256 public votingStartTime;
    uint256 public votingEndTime;
    address public winner; // Stores the final winner's address

    // --- Data Structures ---
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        address votedFor;
        string name;
        string profilePic;
    }

    struct Candidate {
        bool isRegistered;
        uint256 voteCount;
        string name;
        string profilePic;
    }

    mapping(address => Voter) public voters;
    mapping(address => Candidate) public candidates;
    address[] public candidateAddresses;

    // --- Events ---
    event VoterRegistered(address indexed voter, string name, string profilePic);
    event CandidateRegistered(address indexed candidate, string name, string profilePic);
    event Voted(address indexed voter, address indexed candidate);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event WinnerAnnounced(address indexed winner, uint256 maxVotes); // NEW: To announce the results

    // --- Constructor ---
    constructor() {
        _transferOwnership(msg.sender);
        currentStatus = Status.RegistrationOpen; // REVISED: Start in RegistrationOpen
    }

    // --- Modifiers ---

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    modifier onlyDuringRegistration() {
        // REVISED: Check for RegistrationOpen
        require(currentStatus == Status.RegistrationOpen, "Not in open registration period");
        _;
    }

    modifier onlyDuringVoting() {
        // REVISED: Check for Voting or Paused
        require(currentStatus == Status.Voting || currentStatus == Status.Paused, "Not in voting period");
        _;
    }

    modifier onlyWhenNotEnded() {
        require(currentStatus != Status.Ended, "Election has ended");
        _;
    }

    // --- Ownable2Step Implementation ---

    function _checkOwner() internal view {
        require(msg.sender == owner, "Ownable: caller is not the owner");
    }

    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _pendingOwners[newOwner] = true;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        require(_pendingOwners[msg.sender], "Ownable2Step: caller is not the new owner");
        _pendingOwners[msg.sender] = false;
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
    }
    
    // --- Election Timeline Management (onlyOwner) ---

    function startRegistration() public onlyOwner {
        // REVISED: Clear all previous election data on restart
        require(currentStatus == Status.Ended || currentStatus == Status.RegistrationOpen, "Election is active or paused");
        
        // Note: You might want to clear candidateAddresses and voter data here for a true 'restart'.
        // For simplicity and gas costs, this is often done in a separate 'reset' function in production.
        
        currentStatus = Status.RegistrationOpen;
        votingStartTime = 0;
        votingEndTime = 0;
        winner = address(0);
    }
    
    function closeRegistration() public onlyOwner {
        // NEW: Must be called to finalize the candidate list
        require(currentStatus == Status.RegistrationOpen, "Registration is not open to be closed");
        currentStatus = Status.RegistrationClosed;
    }

    function startVoting(uint256 _durationSeconds) public onlyOwner {
        // REVISED: Requires registration to be explicitly closed or paused
        require(currentStatus == Status.RegistrationClosed || currentStatus == Status.Paused, "Registration must be closed before voting starts");
        require(_durationSeconds > 0, "Duration must be > 0");
        
        currentStatus = Status.Voting;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + _durationSeconds;
    }

    function pauseElection() public onlyOwner {
        require(currentStatus == Status.Voting, "Not in voting status to pause");
        currentStatus = Status.Paused;
    }

    function restartVoting(uint256 _remainingDurationSeconds) public onlyOwner {
        require(currentStatus == Status.Paused, "Not in paused status to restart");
        require(_remainingDurationSeconds > 0, "Remaining duration must be > 0");

        currentStatus = Status.Voting;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + _remainingDurationSeconds;
    }

    function endElection() public onlyOwner {
        require(currentStatus == Status.Voting || currentStatus == Status.Paused || block.timestamp > votingEndTime, "Election is not ready to be finalized");
        
        // 1. Calculate the winner and store it
        winner = _calculateWinner();
        
        // 2. Change the status and emit event
        currentStatus = Status.Ended;
        // Find the winning candidate's vote count to emit
        uint256 winningVotes = winner != address(0) ? candidates[winner].voteCount : 0;
        emit WinnerAnnounced(winner, winningVotes);
    }

    // --- Core Functions ---

    function registerAsVoter(string memory _name, string memory _profilePic) public onlyDuringRegistration {
        require(!voters[msg.sender].isRegistered, "Already registered");
        require(bytes(_name).length > 0 && bytes(_name).length <= 32, "Invalid name");

        voters[msg.sender] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedFor: address(0),
            name: _name,
            profilePic: _profilePic
        });

        emit VoterRegistered(msg.sender, _name, _profilePic);
    }

    function registerAsCandidate(string memory _name, string memory _profilePic) public onlyDuringRegistration {
        require(!candidates[msg.sender].isRegistered, "Already registered");
        require(msg.sender != address(0), "Zero address");
        require(bytes(_name).length > 0 && bytes(_name).length <= 32, "Invalid name");

        candidates[msg.sender] = Candidate({
            isRegistered: true,
            voteCount: 0,
            name: _name,
            profilePic: _profilePic
        });

        candidateAddresses.push(msg.sender);
        emit CandidateRegistered(msg.sender, _name, _profilePic);
    }

    function vote(address _candidate) public onlyDuringVoting onlyWhenNotEnded {
        require(_candidate != address(0), "Zero address");
        
        // REVISED: Ensure voting is actually 'Voting' and not 'Paused' or RegistrationClosed
        require(currentStatus == Status.Voting, "Voting is paused or registration is not yet closed");
        require(block.timestamp <= votingEndTime, "Voting period has ended"); 

        Voter storage voter = voters[msg.sender];
        require(voter.isRegistered, "Not registered");
        require(!voter.hasVoted, "Already voted");
        require(candidates[_candidate].isRegistered, "Invalid candidate");

        voter.hasVoted = true;
        voter.votedFor = _candidate;
        candidates[_candidate].voteCount++;

        emit Voted(msg.sender, _candidate);
    }

    // --- Winner Determination ---

    /**
     * @dev Internal function to find the candidate with the highest vote count.
     * Tie-breaker: The candidate encountered first in the array (registered earlier) wins.
     */
    function _calculateWinner() internal view returns (address winningCandidate) {
        uint256 maxVotes = 0;
        
        if (candidateAddresses.length == 0) {
            return address(0);
        }
        
        for (uint256 i = 0; i < candidateAddresses.length; i++) {
            address currentCandidate = candidateAddresses[i];
            uint256 currentVotes = candidates[currentCandidate].voteCount;

            // Use strictly greater than (>) to keep the current winning candidate in case of a tie
            if (currentVotes > maxVotes) {
                maxVotes = currentVotes;
                winningCandidate = currentCandidate;
            } 
        }
        
        return winningCandidate;
    }
    
    /**
     * @dev Returns the address of the winner.
     */
    function getWinner() public view returns (address) {
        require(currentStatus == Status.Ended, "Election results are not final yet");
        return winner;
    }

    // --- Getters ---
    
    function getCandidates(uint256 start, uint256 count) public view returns (address[] memory) {
        require(start + count <= candidateAddresses.length, "Out of bounds");
        address[] memory batch = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            batch[i] = candidateAddresses[start + i];
        }
        return batch;
    }

    function getVoterInfo(address _voter) public view returns (
        bool isRegistered,
        bool hasVoted,
        address votedFor,
        string memory name,
        string memory profilePic
    ) {
        Voter memory voter = voters[_voter];
        return (
            voter.isRegistered,
            voter.hasVoted,
            voter.votedFor,
            voter.name,
            voter.profilePic
        );
    }

    function getCandidateInfo(address _candidate) public view returns (
        bool isRegistered,
        uint256 voteCount,
        string memory name,
        string memory profilePic
    ) {
        Candidate memory candidate = candidates[_candidate];
        return (
            candidate.isRegistered,
            candidate.voteCount,
            candidate.name,
            candidate.profilePic
        );
    }

    // --- Security ---
    
    receive() external payable {
        revert("ETH transfers not allowed");
    }
}