APPGLOBALS.InvariantChecker = (function() {
  var InvariantChecker = function(tournament, currentRound) {
    this.tournament = tournament;
    this.currentRound = currentRound;
    this.noOfTeamsPerRoom = 4;

    this.violations = [];

    // Helper private variables.
    this._activeTeams = _.filter(this.tournament.teams, function(team) {
      return team.isActiveForRound[this.currentRound.index] === true;
    }.bind(this));

    this._activeJudges = _.filter(this.tournament.judges, function(judge) {
      return judge.isActiveForRound[this.currentRound.index] === true;
    }.bind(this));

    this._activeRooms = this.currentRound.rooms;
  };

  InvariantChecker.types = {
    HAS_LEFTOVER_TEAMS: "HAS_LEFTOVER_TEAMS",
    NOT_ENOUGH_ROOMS: "NOT_ENOUGH_ROOMS"
  };

  InvariantChecker.prototype.getViolatedInvariants = function() {
    this.checkHasNoLeftOverTeams();
    this.checkEnoughRooms();
    this.checkEnoughJudges();
    return this.violations;
  };

  InvariantChecker.prototype.checkHasNoLeftOverTeams = function() {
    if(this._activeTeams.length % this.noOfTeamsPerRoom !== 0) {
      this.violations.push({
        type: InvariantChecker.types.HAS_LEFTOVER_TEAMS,
        message: "You have rooms that are not complete. " +
        "You may add swing teams under 'Management' " +
        "or toggle them to be active/inactive."
      });
    }
  };

  InvariantChecker.prototype.checkEnoughRooms = function() {
    var roomsNeeded = Math.ceil(this._activeTeams.length / this.noOfTeamsPerRoom);

    if(this._activeRooms.length < roomsNeeded) {
      this.violations.push({
        type: InvariantChecker.types.NOT_ENOUGH_ROOMS,
        message: "Not enough active rooms. You need " +
        Math.ceil(roomsNeeded - this._activeRooms.length).toString() +
        " more rooms."
      });
    }
  }

  InvariantChecker.prototype.checkEnoughJudges = function() {
    var judgesNeeded = Math.ceil(this._activeTeams.length / this.noOfTeamsPerRoom);

    if(this._activeJudges.length < judgesNeeded) {
      this.violations.push({
        type: InvariantChecker.types.NOT_ENOUGH_JUDGES,
        message: "Not enough active judges. You need " +
        (judgesNeeded - this._activeJudges.length).toString() +
        " more judges."
      });
    }
  };

  return InvariantChecker;
})();
