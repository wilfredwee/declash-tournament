"use strict";

// DeclashApp.client.manualTestScripts.AddResultToAllTeamsForRound(Tournaments.findOne({ownerId: Meteor.userId()}), 0)
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


      var teams = _.shuffle(_.filter(tournament.teams, function(team) {
        return _.contains(room.teams, team.guid);
      }));

      _.each(teams, function(team) {
        // our result is like an index, so use it as so.
        var result = availableResults.shift();

        var totalScore = availableTotalScores[result];

        team.resultForRound[roundIndex] = result;

        _.each(team.debaters, function(debater) {
          var score = getRandomScore();

          if(totalScore <= 92 && totalScore >= 68) {
            score = totalScore;
          }
          else {
            var nextScore = totalScore - score;

            while(nextScore > 92 || nextScore < 68) {
              score = getRandomScore();
              nextScore = totalScore - score;
            }

            totalScore -= score;
          }

          debater.scoreForRound[roundIndex] = score;
        });
      });

      var filteredTeamGuids = _.map(teams, function(filterTeam) {
        return filterTeam.guid;
      });

      tournament.teams = _.map(tournament.teams, function(tournTeam) {
        if(_.contains(filteredTeamGuids, tournTeam.guid)) {
          return _.find(teams, function(updatedTeam) {
            return updatedTeam.guid === tournTeam.guid;
          });
        }

        return tournTeam;
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
