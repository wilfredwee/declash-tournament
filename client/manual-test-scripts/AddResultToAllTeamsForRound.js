"use strict";

DeclashApp.client.manualTestScripts.AddResultToAllTeamsForRound = (function() {
  var getRandomScore = function() {
      return Math.floor(Math.random() * (92 - 68 + 1) + 68);
  };

  var addResultToAllTeamsForRound = function(tournament, roundIndex) {

    var rooms = tournament.rounds[roundIndex].rooms;

    _.each(rooms, function(room) {
      var availableResults = [0, 1, 2, 3];

      var totalScores = [];

      var availableTotalScores = _.map(_.range(4), function() {
        var totalScore = getRandomScore() + getRandomScore();

        while(_.contains(totalScores, totalScore)) {
          totalScore = getRandomScore() + getRandomScore();
        }

        totalScores.push(totalScore);

        return totalScore;
      })
      .sort();


      var teams = _.filter(tournament.teams, function(team) {
        return _.contains(room.teams, team.guid);
      });

      _.each(teams, function(team) {
        // our result is like an index, so use it as so.
        var result = availableResults.shift();

        var totalScore = availableTotalScores[result];

        team.resultForRound[roundIndex] = result;

        _.each(team.debaters, function(debater) {
          var score = getRandomScore();

          if(totalScore - score < 0) {
            score = totalScore;
          }
          else {
            totalScore -= score;
          }

          debater.scoreForRound[roundIndex] = score;
        });
      });

      var filteredTeamGuids = _.map(teams, function(team) {
        return team.guid;
      });

      tournament.teams = _.map(tournament.teams, function(team) {
        if(_.contains(filteredTeamGuids, team.guid)) {
          return _.find(teams, function(updatedTeam) {
            return updatedTeam.guid === team.guid;
          });
        }

        return team;
      });
    });

    Meteor.call("testScriptAddResultToAllTeamsForRound", tournament._id, tournament.teams, function(err, result) {
      if(err) {
        alert(err.reason);
      }
    });
  };

  return addResultToAllTeamsForRound;
})();
