APPGLOBALS.AssignmentAlgorithm = (function() {
  var AssignmentAlgorithm = {
    getAssignedFirstRound: function(tournament, roundToAssign) {
      // Strategy:
      // 1. Assign teams randomly.
      // 2. Assign judges to chair based on rank.
      // 3. Assign judges to rooms based on non-conflict.

      // Clone the round to avoid mutating data.
      // We separately clone the rooms to deal with nested data structure.
      var currentRound = _.clone(_.find(tournament.rounds, function(round) {
        return round.index === roundToAssign.index;
      }));

      var shuffledActiveTeams = _.shuffle(_.filter(tournament.teams, function(team) {
        return team.isActiveForRound[currentRound.index] === true;
      }));

      // TODO: Assign judges based on proper strategy.
      var shuffledActiveJudges = _.shuffle(_.filter(tournament.judges, function(judge) {
        return judge.isActiveForRound[currentRound.index] === true;
      }));


      // Since this is the first round, we're not concerned with the nested
      // data structure of teams and judges as we'll replace them anyway.
      var currentRoundRooms = _.map(_.first(currentRound.rooms, (shuffledActiveTeams.length/4)), _.clone);

      var roomIndex = 0;
      var POSITIONS = ["OG", "OO", "CG", "CO"];
      _.each(shuffledActiveTeams, function(team, index) {
        if(currentRoundRooms[roomIndex].teams.length === 4) {
          roomIndex++;
        }
        var currentRoom = currentRoundRooms[roomIndex];

        currentRoom.teams.push(team.guid);
      });

      // roomIndex now also serves as the last room index, we can determine
      // the number of rooms used by computing roomIndex + 1

      // TODO: Assign judges based on proper strategy.
      _.each(shuffledActiveJudges, function(judge, index) {
        currentRoundRooms[index % (roomIndex + 1)].judges.push(judge.guid);
      });

      currentRound.rooms = currentRoundRooms;
      return currentRound;
    },

    getAssignedTeams: function(teams, round) {
      // Clone to avoid mutating input.
      var clonedTeams = _.map(teams, _.clone);

      if(round.index !== 0) {
        throw new Meteor.Error("unimplemented", "Round 2 and above is not implemented yet.");
      }

      var assignedTeams = _.flatten(_.map(round.rooms, function(room) {
        // This is an array of teams from clonedTeams
        var roomTeams = _.map(room.teams, function(teamGuid) {
          return _.find(clonedTeams, function(team) {
            return team.guid === teamGuid;
          });
        });

        if(roomTeams.length !== 4) {
          throw new Meteor.Error("fatalError", "FATAL: Assigned room does not have the required amount of teams.")
        }

        if(round.index !== 0) {
          throw new Meteor.Error("unimplemented", "Round 2 and above is not implemented yet.");
        }

        roomTeams[0].roleForRound[round.index] = "OG";
        roomTeams[1].roleForRound[round.index] = "OO";
        roomTeams[2].roleForRound[round.index] = "CG";
        roomTeams[3].roleForRound[round.index] = "CO";

        return roomTeams;
      }), true);

      var assignedTeamsGuid = _.pluck(assignedTeams, "guid");

      _.each(clonedTeams, function(team) {
        if(!_.contains(assignedTeamsGuid, team.guid)) {
          assignedTeams.push(team);
        }
      });

      return assignedTeams;
    },

    getAssignedJudges: function(judges, round) {
      // Properly assign judges.
      var clonedJudges = _.map(judges, _.clone);

      var assignedJudges = _.flatten(_.map(round.rooms, function(room) {
        var roomJudges = _.map(room.judges, function(judgeGuid) {
          return _.find(clonedJudges, function(judge) {
            return judge.guid === judgeGuid;
          });
        });

        _.first(roomJudges).isChairForRound[round.index] = true;

        _.each(_.rest(roomJudges), function(judge) {
          judge.isChairForRound[round.index] = false;
        });

        return roomJudges;
      }), true);

      var assignedJudgesGuid = _.pluck(assignedJudges, "guid");
      _.each(clonedJudges, function(judge) {
        if(!_.contains(assignedJudgesGuid, judge.guid)) {
          assignedJudges.push(judge);
        }
      });

      return assignedJudges;
    }
  };

  return AssignmentAlgorithm;
})();
