"use strict";
/* global Tournaments */

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
      var acceptableStates = ["initial", "assigned", "active"];
      var round = tournament.rounds[currentRoundIndex];
      if(!round) {
        return false;
      }
      return _.contains(acceptableStates, tournament.rounds[currentRoundIndex].state);
    },

    canChangeJudgeRoom: function(tournament, roundIndex, originRoom, newRoom, transferringJudge) {
      // tournament must be in an assigned state
      if(tournament.rounds[roundIndex].state !== "assigned") {
        return false;
      }

      // rooms must be different.
      if(originRoom.locationId === newRoom.locationId) {
        return false;
      }

      // originRoom must have at least 2 judges.
      if(originRoom.judges.length <= 1) {
        return false;
      }

      return true;
    },

    canActivateRound: function(tournament, currentRoundIndex) {
      var round = tournament.rounds[currentRoundIndex];
      if(!round) {
        return false;
      }

      return round.state === "assigned";
    },

    canChangeDebaterScore: function(tournament, roundIndex, teamToUpdate, debaterIndex, scoreValue) {
      var round = tournament.rounds[roundIndex];
      if(!round || round.state !== "active") {
        return false;
      }

      return true;

      // TODO: More conditions
    },

    canChangeJudgeRank: function(tournament, roundIndex, judgeToUpdate, rankValue) {
      var round = tournament.rounds[roundIndex];
      if(!round || round.state !== "active") {
        return false;
      }

      return true;

      // TODO: More conditions.
    }
  };

  return ValidatorHelper;
})();
