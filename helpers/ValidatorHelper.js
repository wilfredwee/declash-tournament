// For now, a static class with self-contained helper functions.
DeclashApp.helpers.ValidatorHelper = (function() {
  var ValidatorHelper = {
    canCreateNextRound: function(tournament) {
      if(tournament.rounds.length === 0) {
        return true;
      }
      var lastRound = tournament.rounds[tournament.rounds.length - 1];
      return lastRound.state === "finished";
    },

    canAssignRound: function(tournament, currentRoundIndex) {
      // TODO: In the future, if necessary, check for specific violations.
      var round = tournament.rounds[currentRoundIndex];

      if(!round) {
        return false;
      }
      return tournament.currentInvariantViolations.length === 0 &&
        tournament.rounds[currentRoundIndex].state === "initial";
    },

    canDeleteRound: function(tournament, currentRoundIndex) {
      var acceptableStates = ["initial", "assigned"];
      var round = tournament.rounds[currentRoundIndex];
      if(!round) {
        return false;
      }
      return _.contains(acceptableStates, tournament.rounds[currentRoundIndex].state);
    },

    canChangeJudgeRoom: function(originRoom, newRoom, transferringJudge) {
      // rooms must be different.
      if(originRoom.locationId === newRoom.locationId) {
        return false;
      }

      // originRoom must have at least 2 judges.
      if(originRoom.judges.length <= 1) {
        return false;
      }

      return true;
    }
  };

  return ValidatorHelper;
})();
