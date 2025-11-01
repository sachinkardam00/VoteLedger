// Simple event bus for cross-component communication
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

// Event types
export const EVENTS = {
  ELECTION_UPDATED: 'election_updated',
  CANDIDATE_REGISTERED: 'candidate_registered',
  VOTER_REGISTERED: 'voter_registered',
  VOTE_CAST: 'vote_cast',
  STATUS_CHANGED: 'status_changed',
};
