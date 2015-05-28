APPGLOBALS.checkInvariants = function() {
  var trackedTournament = Tournaments.findOne({ownerId: this.userId, finished: false});

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

    var currViolationsTypes = _.map(currViolations, function(violation) {
      return violation.type;
    });

    if(currViolations.length === 0) {
      Tournaments.update(trackedTournament._id, {$set: {currentInvariantViolations: []}});
    }
    else {
      if(_.difference(currViolationsTypes, trackedTournament.currentInvariantViolations).length > 0) {
        Tournaments.update(trackedTournament._id, {$set: {currentInvariantViolations: currViolationsTypes}});
      }
    }
  }
}
