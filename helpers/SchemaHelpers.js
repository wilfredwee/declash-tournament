"use strict";

DeclashApp.helpers.SchemaHelpers = (function(){
  var SchemaHelpers = {
    getFiniteNumber: function(num) {
      return typeof num === "number" && isFinite(num)? num : 0;
    },

    getAverageRankForJudge: function(judge) {
      var totalRank = 0;

      _.each(judge.rankForRound, function(rank) {
        rank = typeof rank  === "number"? rank : 0;
        totalRank += rank;
      });

      var averageRank = _.keys(judge.rankForRound).length > 0 ?
        totalRank/(_.keys(judge.rankForRound).length)
        : 0;

      // Limit to 2 decimal places
      return Math.round(averageRank * 100) / 100;
    },

    getTotalResultForTeam: function(team) {
      return _.reduce(team.resultForRound, function(prev, curr) {
        prev = this.getFiniteNumber(prev);
        curr = this.getFiniteNumber(curr);

        return prev + curr;
      }.bind(this), 0);
    },

    getTotalScoreForTeam: function(team, roundIndex) {
      return _.reduce(team.debaters, function(accValue, currDebater) {

        if(typeof roundIndex === "number") {
          return accValue + currDebater.scoreForRound[roundIndex];
        }

        return accValue + _.reduce(currDebater.scoreForRound, function(prev, curr) {
          prev = this.getFiniteNumber(prev);
          curr = this.getFiniteNumber(curr);

          return prev + curr;
        }.bind(this), 0);
      }.bind(this), 0);
    },

    getSchemaInjectedRound: function(tournament, roundIndex) {
      tournament = JSON.parse(JSON.stringify(tournament));

      var round = _.find(tournament.rounds, function(round) {
        return round.index === roundIndex;
      });

      round.rooms = _.map(round.rooms, function(room) {
        room.teams = _.map(room.teams, function(teamGuid) {
          return _.find(tournament.teams, function(tournamentTeam) {
            return tournamentTeam.guid === teamGuid;
          });
        });

        room.judges = _.map(room.judges, function(judgeGuid) {
          return _.find(tournament.judges, function(tournamentJudge) {
            return tournamentJudge.guid === judgeGuid;
          });
        });

        return room;
      });

      return round;
    },

    populateTournamentForPublic: function(tournament) {
      if(!tournament) {
        return undefined;
      }

      tournament.rounds = tournament.publicRounds;
      tournament.teams = tournament.publicTeams;
      tournament.judges = tournament.publicJudges;

      return tournament;
    }
  };

  return SchemaHelpers;
})();
