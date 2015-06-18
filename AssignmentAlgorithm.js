"use strict";

var SchemaHelpers;
Meteor.startup(function() {
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
});

DeclashApp.AssignmentAlgorithm = (function() {
  function AssignmentAlgorithm(tournament, roundToAssign) {
    this.tournament = JSON.parse(JSON.stringify(tournament));
    this.roundToAssign = roundToAssign;

    this.assignedRound = null;
    this.assignedTeams = null;
    this.assignedJudges = null;
  }

  AssignmentAlgorithm.prototype.assign = function() {
    if(this.roundToAssign.index === 0) {
      assignFirstRoundRoomsForTeams.call(this);
      assignRoomsForJudges.call(this);
      assignTeams.call(this);
    }
    else {
      assignRound.call(this);
      assignRoomsForJudges.call(this);
    }

    assignJudges.call(this);
  };

  AssignmentAlgorithm.prototype.getAssignedRound = function() {
    return this.assignedRound;
  };

  AssignmentAlgorithm.prototype.getAssignedTeams = function() {
    return this.assignedTeams;
  };

  AssignmentAlgorithm.prototype.getAssignedJudges = function() {
    return this.assignedJudges;
  };

  function assignRoomsForJudges() {
    var shuffledActiveJudges = _.shuffle(_.filter(this.tournament.judges, function(judge) {
      return judge.isActiveForRound[this.assignedRound.index] === true;
    }.bind(this)));

    _.each(shuffledActiveJudges, function(judge) {
      var sortedRooms = _.chain(this.assignedRound.rooms)
        .map(function(room, roomIndex) {
          var institutions = _.map(room.teams, function(teamGuid) {
            var team = _.find(this.tournament.teams, function(assignedTeam) {
              return assignedTeam.guid === teamGuid;
            });

            return team.institution;
          }.bind(this));

          var clonedRoom = JSON.parse(JSON.stringify(room));

          clonedRoom.institutions = institutions;
          clonedRoom.index = roomIndex;

          return clonedRoom;
        }.bind(this))
        .sortBy(function(room) {
          return _.reduce(room.judges, function(acc, currJudgeGuid) {
            var judge = _.find(shuffledActiveJudges, function(judgeObj) {
              return judgeObj.guid === currJudgeGuid;
            });

            return acc += SchemaHelpers.getAverageRankForJudge(judge);
          }, 0);
        })
        .sortBy(function(room) {
          return room.judges.length;
        })
        .sortBy(function(room) {
          return room.judges.length % 2 !== 0? Infinity : -Infinity;
        })
        .sortBy(function(room) {
          return _.contains(room.institutions, judge.institution)? Infinity : -Infinity;
        })
        .sortBy(function(room) {
          return room.judges.length === 0? -Infinity : Infinity;
        })
        .value();


      var roomToAssign = _.first(sortedRooms);

      this.assignedRound.rooms[roomToAssign.index].judges.push(judge.guid);
    }.bind(this));
  }

  function assignFirstRoundRoomsForTeams() {
    // Strategy:
    // 1. Assign teams randomly.
    // 2. Assign judges to chair based on rank.
    // 3. Assign judges to rooms based on non-conflict.

    // Clone the round to avoid mutating data.
    // We separately clone the rooms to deal with nested data structure.
    var currentRound = _.clone(_.find(this.tournament.rounds, function(round) {
      return round.index === this.roundToAssign.index;
    }.bind(this)));

    var shuffledActiveTeams = _.shuffle(_.filter(this.tournament.teams, function(team) {
      return team.isActiveForRound[currentRound.index] === true;
    }));


    // According to the RoomSchema, this should properly clone the rooms,
    // because all fields of a Room are primitive types, except teams and judges,
    // which is not applicable because it is now empty anyway and we're populating it here.
    var currentRoundRooms = _.first(currentRound.rooms, (shuffledActiveTeams.length/4));

    var roomIndex = 0;
    var POSITIONS = ["OG", "OO", "CG", "CO"];
    _.each(shuffledActiveTeams, function(team, index) {
      if(currentRoundRooms[roomIndex].teams.length === 4) {
        roomIndex++;
      }
      var currentRoom = currentRoundRooms[roomIndex];

      currentRoom.teams.push(team.guid);
    });

    currentRound.rooms = currentRoundRooms;

    this.assignedRound = currentRound;
  }

  function assignTeams() {
    // Clone to avoid mutating input.
    var clonedTeams = _.map(this.tournament.teams, _.clone);

    var assignedTeams = _.flatten(_.map(this.assignedRound.rooms, function(room) {
      // This is an array of teams from clonedTeams
      var roomTeams = _.map(room.teams, function(teamGuid) {
        return _.find(clonedTeams, function(team) {
          return team.guid === teamGuid;
        });
      });

      if(roomTeams.length !== 4) {
        throw new Meteor.Error("fatalError", "FATAL: Assigned room does not have the required amount of teams.");
      }

      roomTeams[0].roleForRound[this.assignedRound.index] = "OG";
      roomTeams[1].roleForRound[this.assignedRound.index] = "OO";
      roomTeams[2].roleForRound[this.assignedRound.index] = "CG";
      roomTeams[3].roleForRound[this.assignedRound.index] = "CO";

      return roomTeams;
    }.bind(this)), true);

    var assignedTeamsGuid = _.pluck(assignedTeams, "guid");

    _.each(clonedTeams, function(team) {
      if(!_.contains(assignedTeamsGuid, team.guid)) {
        assignedTeams.push(team);
      }
    });

    this.assignedTeams = assignedTeams;
  }

  function assignJudges() {
    // Properly assign judges.
    var clonedJudges = _.map(this.tournament.judges, _.clone);

    var assignedJudges = _.flatten(_.map(this.assignedRound.rooms, function(room) {
      var roomJudges = _.chain(room.judges)
        .map(function(judgeGuid) {
          return _.find(clonedJudges, function(judge) {
            return judge.guid === judgeGuid;
          });
        })
        .shuffle()
        .sortBy(function(judge) {
          return SchemaHelpers.getAverageRankForJudge(judge);
        })
        .reverse()
        .value();

      _.first(roomJudges).isChairForRound[this.assignedRound.index] = true;

      _.each(_.rest(roomJudges), function(judge) {
        judge.isChairForRound[this.assignedRound.index] = false;
      }.bind(this));

      return roomJudges;
    }.bind(this)), true);

    var assignedJudgesGuid = _.pluck(assignedJudges, "guid");
    _.each(clonedJudges, function(judge) {
      if(!_.contains(assignedJudgesGuid, judge.guid)) {
        assignedJudges.push(judge);
      }
    });

    this.assignedJudges = assignedJudges;
  }

  function assignRound() {
    function getTotalResult(team) {
      return _.reduce(team.resultForRound, function(prev, curr) {
        prev = typeof prev === "number"? prev : 0;
        curr = typeof curr === "number"? curr : 0;

        return prev + curr;
      }, 0);
    }

    function getTotalTimesForRole(team, roleToEval) {
      return _.reduce(team.roleForRound, function(acc, currRole) {
        if(currRole === roleToEval) {
          acc++;
        }
        return acc;
      }, 0);
    }

    function assignRolesForTeams(teams, role, currentRoundIndex, noOfRooms) {
      return _.chain(teams)
        .filter(function(team) {
          return !team.roleForRound[currentRoundIndex];
        })
        .groupBy(function(team) {
          return getTotalTimesForRole(team, role);
        }.bind(this))
        .map(function(groupedTeams, timesForRole) {
          groupedTeams = _.shuffle(groupedTeams);

          return groupedTeams;
        })
        .sortBy(function(groupedTeams, timesForRole) {
          return parseInt(timesForRole, 10);
        })
        .flatten()
        .first(noOfRooms)
        .map(function(team) {
          team.roleForRound[currentRoundIndex] = role;

          return team;
        })
        .value();
    }

    // Clone the round to avoid mutating data.
    // We separately clone the rooms to deal with nested data structure.
    var roundToUpdate = _.clone(_.find(this.tournament.rounds, function(round) {
      return round.index === this.roundToAssign.index;
    }.bind(this)));

    var teamsToUpdate = _.map(this.tournament.teams, _.clone);

    var activeTeamsToUpdate = _.filter(teamsToUpdate, function(team) {
      return team.isActiveForRound[roundToUpdate.index];
    });

    var currentRoundRooms = _.map(_.first(roundToUpdate.rooms, (activeTeamsToUpdate.length/4)), _.clone);

    var groupedTeams = _.groupBy(activeTeamsToUpdate, function(team) {
      return getTotalResult(team);
    });

    var sortedKeys = _.sortBy(_.keys(groupedTeams), function(num) {
      return parseInt(num, 10);
    }).reverse();


    // Start assigning teams their roles, and place them into
    // pools to assign them their rooms.
    var pool = [];
    var pools = [];
    for(var i=0; i<sortedKeys.length; i++) {
      var teamsWithSameResult = _.shuffle(groupedTeams[sortedKeys[i]]);

      // We're in the case where it's not a pull up.
      // Thus we now assign teams their pools according to
      // their past speaking positions.
      if(pool.length === 0) {
        var roomNum = Math.floor(teamsWithSameResult.length / 4);

        // Go through each room and assign speaking position
        // to lowest amount team.
        var lowestOGs = assignRolesForTeams.call(this, teamsWithSameResult, "OG", roundToUpdate.index, roomNum);
        var lowestOOs = assignRolesForTeams.call(this, teamsWithSameResult, "OO", roundToUpdate.index, roomNum);
        var lowestCGs = assignRolesForTeams.call(this, teamsWithSameResult, "CG", roundToUpdate.index, roomNum);
        var lowestCOs = assignRolesForTeams.call(this, teamsWithSameResult, "CO", roundToUpdate.index, roomNum);

        var changedTeams = lowestOGs.concat(lowestOOs, lowestCGs, lowestCOs);

        _.each(changedTeams, function(changedTeam) {
          var teamToChange = _.find(activeTeamsToUpdate, function(teamToUpdate) {
            return teamToUpdate.guid === changedTeam.guid;
          });

          teamToChange = changedTeam;
        });

        var teamGuids = _.pluck(changedTeams, "guid");
        teamsWithSameResult = _.filter(teamsWithSameResult, function(team) {
          return !_.contains(teamGuids, team.guid);
        });

        _.each(_.range(roomNum), function() {
          pools.push([lowestOGs.pop(), lowestOOs.pop(), lowestCGs.pop(), lowestCOs.pop()]);
        });
      }

      /* jshint ignore:start */
      _.each(teamsWithSameResult, function(team) {
          pool.push(team);

          if(pool.length === 4) {
            pools.push(_.clone(pool));
            pool = [];
          }
      });
      /* jshint ignore:end */
    }

    // Place teams in their rooms from the pools.
    var roomIndex = 0;
    _.each(pools, function(teams) {
      if(currentRoundRooms[roomIndex].teams.length === 4) {
        roomIndex++;
      }

      currentRoundRooms[roomIndex].teams = _.map(teams, function(team) {
        return team.guid;
      });
    });

    // Assign roles to remaining teams that have not been assigned.
    _.each(pools, function(teams) {
      var roomTeamGuids = _.pluck(teams, "guid");
      var availablePositions = ["OG", "OO", "CG", "CO"];

      var roomTeamsToUpdate = _.filter(activeTeamsToUpdate, function(team) {
        return _.contains(roomTeamGuids, team.guid);
      });

      var roomTeamsToAssign = _.filter(roomTeamsToUpdate, function(team) {
        var teamRole = team.roleForRound[roundToUpdate.index];

        if(teamRole) {
          availablePositions.splice(availablePositions.indexOf(teamRole), 1);
          return false;
        }
        else {
          return true;
        }
      });

      _.each(availablePositions, function(position) {
        var sortedRoomTeams = _.sortBy(roomTeamsToAssign, function(team) {
          return getTotalTimesForRole(team, position);
        });

        var teamToAssign = sortedRoomTeams[0];

        var teamToUpdate = _.find(activeTeamsToUpdate, function(team) {
          return team.guid === teamToAssign.guid;
        });

        teamToUpdate.roleForRound[roundToUpdate.index] = position;

        roomTeamsToAssign = _.filter(roomTeamsToAssign, function(team) {
          return team.guid !== teamToAssign.guid;
        });
      });
    });

    // Done assigning teams.
    this.assignedTeams = activeTeamsToUpdate.concat(_.filter(teamsToUpdate, function(team) {
      return !team.isActiveForRound[roundToUpdate.index];
    }.bind(this)));


    roundToUpdate.rooms = currentRoundRooms;
    this.assignedRound = roundToUpdate;

  }

  return AssignmentAlgorithm;
})();
