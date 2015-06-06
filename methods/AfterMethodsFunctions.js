APPGLOBALS.checkInvariantsBeforeAssign = function(tournament) {
  var trackedTournament = tournament;

  if(trackedTournament.rounds.length <= 0) {
    return;
  }

  var currRound = _.reduce(trackedTournament.rounds, function(prevRound, currRound) {
    if(!currRound.index) {
      return prevRound;
    }
    return prevRound.index > currRound.index? prevRound : currRound;
  });

  if(currRound.state === "finished") {
    return;
  }
  else {
    var invariantChecker = new APPGLOBALS.InvariantChecker(trackedTournament, currRound);

    var currViolations = invariantChecker.getViolatedInvariants();

    if(currViolations.length === 0) {
      Tournaments.update(trackedTournament._id, {$set: {currentInvariantViolations: []}});
    }
    else {
      if(_.difference(currViolations, trackedTournament.currentInvariantViolations).length > 0) {
        Tournaments.update(trackedTournament._id, {$set: {currentInvariantViolations: currViolations}});
      }
    }
  }
}
