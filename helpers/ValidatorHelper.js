"use strict";
/* global Tournaments */

var SchemaHelpers;
Meteor.startup(function() {
 SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
});

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

    canAssignRound: function(tournament, roundIndex) {
      // TODO: In the future, if necessary, check for specific violations.
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }
      return tournament.currentInvariantViolations.length === 0 &&
        tournament.rounds[roundIndex].state === "initial";
    },

    canDeleteRound: function(tournament, roundIndex) {
      var acceptableStates = ["initial", "assigned", "active"];
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }
      return _.contains(acceptableStates, tournament.rounds[roundIndex].state);
    },

    canChangeJudgeRoom: function(tournament, roundIndex, originRoom, newRoom, transferringJudge) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      // tournament must be in an assigned state
      if(round.state !== "assigned") {
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

    canActivateRound: function(tournament, roundIndex) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      return round.state === "assigned" && round.motion && round.motion.length > 0;
    },

    canDeactivateRound: function(tournament, roundIndex) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      return round.state === "active";
    },

    canFinalizeRound: function(tournament, roundIndex) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      var everyActiveTeamHasResult = _.every(tournament.teams, function(team) {
        if(!team.isActiveForRound[roundIndex]) {
          return true;
        }

        var everyDebaterHasScore = _.every(team.debaters, function(debater) {
          var score = debater.scoreForRound[roundIndex];
          return typeof score === "number";
        });

        var result = team.resultForRound[roundIndex];

        return typeof result === "number" && everyDebaterHasScore;
      });

      var schemaInjectedRound = SchemaHelpers.getSchemaInjectedRound(tournament, roundIndex);

      var roomScoresAddUp = _.every(schemaInjectedRound.rooms, function(room) {
        return this.doesRoomScoresAddUp(room.teams, roundIndex);
      }.bind(this));

      return everyActiveTeamHasResult && roomScoresAddUp && round.state === "active";
    },

    canEditMotion: function(tournament, roundIndex) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      var acceptableStates = ["initial", "assigned"];

      return _.contains(acceptableStates, round.state);
    },

    isDebaterScoreWithinRange: function(scoreValue) {
      return scoreValue >= 65 && scoreValue <= 100;
    },

    doesRoomScoresAddUp: function(teamsInRoom, roundIndex) {
      var hasEmpties = _.some(teamsInRoom, function(team) {
        var result = team.resultForRound[roundIndex];
        var hasEmptyResult = typeof result !== "number" || isNaN(result);

        var hasEmptyScore = _.some(team.debaters, function(debater) {
          return typeof debater.scoreForRound[roundIndex] !== "number";
        });

        return hasEmptyResult || hasEmptyScore;
      });

      if(hasEmpties) {
        return false;
      }

      var uniqueResults = [];
      var hasDuplicateResult = _.some(teamsInRoom, function(team) {
        var teamResult = team.resultForRound[roundIndex];

        if(_.contains(uniqueResults, teamResult)) {
          return true;
        }

        uniqueResults.push(teamResult);
        return false;
      });

      if(hasDuplicateResult) {
        return false;
      }

      var sortedByResult = _.sortBy(teamsInRoom, function(team) {
        return team.resultForRound[roundIndex];
      });

      var sortedByScores = _.sortBy(teamsInRoom, function(team) {
        return SchemaHelpers.getTotalScoreForTeam(team, roundIndex);
      });

      // We know that their lengths are the same.
      return _.every(sortedByResult, function(team, index) {
        return team.guid === sortedByScores[index].guid;
      });
    },

    canChangeDebaterScore: function(tournament, roundIndex, teamToUpdate, debaterIndex, scoreValue) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      return this.isDebaterScoreWithinRange(scoreValue);
    },

    canChangeJudgeRank: function(tournament, roundIndex, judgeToUpdate, rankValue) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round || round.state !== "active") {
        return false;
      }

      return true;

      // TODO: More conditions.
    },

    canChangeTeamResult: function(tournament, roundIndex, teamToUpdate, resultValue) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      // This is BP Specific. Update when necessary.
      return this.isTeamResultWithinRange(resultValue);
    },

    isTeamResultWithinRange: function(resultValue) {
      return resultValue >= 0 && resultValue <= 3;
    },

    canSwapTeams: function(tournament, roundIndex, teamToSwapOut, teamToSwapIn) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      if(round.state !== "assigned") {
        return false;
      }

      if(teamToSwapOut.guid === teamToSwapIn.guid) {
        return false;
      }
      return true;
    },

    canSwapRooms: function(tournament, roundIndex, room1, room2) {
      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      if(!round) {
        return false;
      }

      if(round.state !== "assigned") {
        return false;
      }

      if(room1.locationId === room2.locationId) {
        return false;
      }

      return true;
    }
  };

  return ValidatorHelper;
})();
