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

      // Since this is the first round, we're not concerned with the nested
      // data structure of teams and judges as we'll replace them anyway.
      var currentRoundRooms = _.map(currentRound.rooms, _.clone);

      var shuffledActiveTeams = _.shuffle(_.filter(tournament.teams, function(team) {
        return team.isActiveForRound[currentRound.index] === true;
      }));

      // TODO: Assign judges based on proper strategy.
      var shuffledActiveJudges = _.shuffle(_.filter(tournament.judges, function(judge) {
        return judge.isActiveForRound[currentRound.index] === true;
      }))

      var roomIndex = 0;
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


    }
  };

  return AssignmentAlgorithm;
})();
