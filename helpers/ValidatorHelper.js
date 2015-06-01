// For now, a static class with self-contained helper functions.
APPGLOBALS.ValidatorHelper = (function() {
  var ValidatorHelper = {
    canCreateNextRound: function(tournament) {
      if(tournament.rounds.length === 0) {
        return true;
      }
      var lastRound = tournament.rounds[tournament.rounds.length - 1];
      return lastRound.state === "finished";
    }
  };

  return ValidatorHelper;
})();
