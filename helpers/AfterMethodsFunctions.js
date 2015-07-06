"use strict";
/* global Tournaments */

DeclashApp.helpers.checkInvariantsBeforeAssign = function(tournament) {
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
    var invariantChecker = new DeclashApp.helpers.InvariantChecker(trackedTournament, currRound);

    var currViolations = invariantChecker.getViolatedInvariants();

    if(currViolations.length === 0) {
      Tournaments.update(trackedTournament._id, {$set: {currentInvariantViolations: []}});
    }
    else {
      // IMPORTANT: Must see if it's different before updating the Collection or we'll end up in
      // an infinite loop because this checkinvariants call is called in a reactive observe.
      var currViolationsMessages = _.map(currViolations, function(violation) {
        return violation.message;
      });

      var prevViolationsMessages = _.map(trackedTournament.currentInvariantViolations, function(violation) {
        return violation.message;
      });

      if(currViolations.length !== trackedTournament.currentInvariantViolations.length ||
        !_.isEqual(currViolationsMessages, prevViolationsMessages))
      {
        Tournaments.update(trackedTournament._id, {$set: {currentInvariantViolations: currViolations}});
      }

    }
  }
};
