APPGLOBALS.InvariantChecker = (function() {
  var InvariantChecker = function(tournament, currentRound) {
    this.tournament = tournament;
    this.currentRound = currentRound;
    this.noOfTeamsPerRoom = 4;

    this.violations = [];

    // Helper private variables.
    this._activeTeams = _.filter(this.tournament.teams, function(team) {
      return team.isActiveForRound[this.currentRound.index] === true;
    });

    this._activeRooms = this.currentRound.rooms;
  };

  InvariantChecker.prototype.getVioldatedInvariants = function() {
    this.checkHasNoLeftOverTeams();
    this.checkEnoughRooms()
    return this.violations;
  };

  InvariantChecker.prototype.getInitialViolatedInvariants = function() {
    var violations = [];

    return violations;
  };

  InvariantChecker.prototype.checkHasNoLeftOverTeams = function() {
    if(this._activeTeams % this.noOfTeamsPerRoom !== 0) {
      this.violations.push(
        "You have rooms that are not complete. " +
        "You may add swing teams under 'Management' " +
        "or toggle them to be active/inactive.");
    }
  };

  InvariantChecker.prototype.checkEnoughRooms = function() {
    var capacity = this.noOfTeamsPerRoom * this._activeRooms.length;

    if(this._activeTeams.length > capacity) {
      this.violations.push("Not enough active rooms. You need " +
        Math.ceil(this._activeTeams/this.noOfTeamsPerRoom).toString() +
        " more rooms.");
    }
  }

  return InvariantChecker;
})();
