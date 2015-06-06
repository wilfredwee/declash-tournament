var getOwnerTournament = function() {
  return Tournaments.findOne({ownerId: this.userId, finished: false});
};

Meteor.methods({
  removeTeam: function(team) {
    var tournament = getOwnerTournament.call(this);

    Tournaments.update(tournament._id, {$pull: {teams: {guid: team.guid}}});
  },

  updateTeam: function(team) {
    var tournament = getOwnerTournament.call(this);

    Tournaments.update(
      {_id: tournament._id, "teams.guid": team.guid},
      {$set: {
        "teams.$.name": team.name,
        "teams.$.institution": team.institution,
        "teams.$.debaters.0.name": team.debaters[0].name,
        "teams.$.debaters.1.name": team.debaters[1].name
      }}
    );
  },

  updateTeamForRound: function(team, roundIndex, isActive) {
    var tournament = getOwnerTournament.call(this);

    // We just toggle the active state for now. Can be modified later
    // if more complex functionality is needed.

    var setObj = {};
    var selector = "teams.$.isActiveForRound." + roundIndex;

    setObj[selector] = isActive;

    Tournaments.update(
      {_id: tournament._id, "teams.guid": team.guid},
      {$set: setObj},
      {validate: false, filter: false}
    );
  },

  updateJudgeForRound: function(judge, roundIndex, isActive) {
    var tournament = getOwnerTournament.call(this);

    // We just toggle the active state for now. Can be modified later
    // if more complex functionality is needed.

    var setObj = {};
    var selector = "judges.$.isActiveForRound." + roundIndex;

    setObj[selector] = isActive;

    Tournaments.update(
      {_id: tournament._id, "judges.guid": judge.guid},
      {$set: setObj},
      {validate: false, filter: false}
    );
  },

  updateRoomForRound: function(roomString, roundIndex, isActive) {
    var tournament = getOwnerTournament.call(this);

    if(isActive === true) {
      var newRoom = {
        locationId: roomString,
        teams: [],
        judges: []
      };

      Tournaments.update(
        {_id: tournament._id, "rounds.index": roundIndex},
        {$push: {"rounds.$.rooms": newRoom}}
      );
    }
    else {
      Tournaments.update(
        {_id: tournament._id, "rounds.index": roundIndex},
        {$pull: {"rounds.$.rooms": {locationId: roomString}}}
      );
    }
  },

  removeJudge: function(judge) {
    var tournament = getOwnerTournament.call(this);

    Tournaments.update(tournament._id, {$pull: {judges: {guid: judge.guid}}});
  },

  updateJudge: function(judge) {
    var tournament = getOwnerTournament.call(this);

    Tournaments.update(
      {_id: tournament._id, "judges.guid": judge.guid},
      {$set: {
        "judges.$.name": judge.name,
        "judges.$.institution": judge.institution
      }}
    );
  },

  removeRoom: function(room) {
    var tournament = getOwnerTournament.call(this);

    Tournaments.update(tournament._id, {$pull: {rooms: room}});
  },

  updateRoom: function(room) {
    throw new Meteor.Error("invalidAction", "Single update for rooms is not supported currently.")
  },

  togglePublicRegistration: function() {
    var tournament = getOwnerTournament.call(this);

    var newChecked = !tournament.enablePublicRegistration;
    Tournaments.update(tournament._id, {$set: {enablePublicRegistration: newChecked}});

    return newChecked;
  },

  createRound: function() {
    var tournament = getOwnerTournament.call(this);

    var oldRound = _.reduce(tournament.rounds, function(prevRound, currRound) {
      return currRound.index >= prevRound.index? currRound : prevRound;
    }, {index: -1});

    var newRoundIndex = oldRound.index + 1;

    var roundRooms = [];

    if(tournament.rounds[(newRoundIndex-1)]) {
      roundRooms = _.map(tournament.rounds[(newRoundIndex-1)].rooms, function(room) {
        return {
          locationId: room.locationId,
          teams: [],
          judges: []
        };
      });
    }
    else {
      roundRooms = _.map(tournament.rooms, function(roomString) {
        return {
          locationId: roomString,
          teams: [],
          judges: []
        };
      });
    }

    var newRound = {
      index: newRoundIndex,
      motion: "",
      rooms: roundRooms,
      state: "initial"
    };

    Tournaments.update(tournament._id, {$push: {rounds: newRound}});


    var newTeams = _.map(tournament.teams, function(team) {
      var isActiveThisRound = !(team.isActiveForRound[(newRoundIndex-1).toString()] === false)

      team.isActiveForRound[newRoundIndex.toString()] = isActiveThisRound;

      return team;
    });

    var newJudges = _.map(tournament.judges, function(judge) {
      var isActiveThisRound = true;
      if(judge.isActiveForRound[(newRoundIndex-1).toString()] === false) {
        isActiveThisRound = false;
      }

      judge.isActiveForRound[newRoundIndex.toString()] = isActiveThisRound;

      return judge;
    });

    //TODO: Need to validate this.
    Tournaments.update(tournament._id, {$set: {teams: newTeams, judges: newJudges}});

    return newRoundIndex;
  },

  assignRound: function(roundIndex) {
    var tournament = getOwnerTournament.call(this);
    var roundToAssign = tournament.rounds[roundIndex];

    if(!DeclashApp.ValidatorHelper.canAssignRound(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot assign this round. Make sure you have the proper conditions.");
    }

    // TODO: Perhaps something more elegant here?
    if(roundToAssign.index !== roundIndex) {
      throw new Meteor.Error("fatalError", "FATAL: The round assignments do not match.");
    }

    if(roundToAssign.index === 0) {
      // assignedRound assigns teams and judges to rooms.
      var assignedRound = DeclashApp.AssignmentAlgorithm.getAssignedFirstRound(tournament, roundToAssign);

      // assignedTeams has their roles for a round assigned
      var assignedTeams = DeclashApp.AssignmentAlgorithm.getAssignedTeams(tournament.teams, assignedRound);

      // assignedJudges has their roles for a round assigned (is chair or not)
      var assignedJudges = DeclashApp.AssignmentAlgorithm.getAssignedJudges(tournament.judges, assignedRound);

      assignedRound.state = "assigned";

      Tournaments.update({_id: tournament._id, "rounds.index": assignedRound.index}, {$set: {"rounds.$": assignedRound}}, {validate: false, filter: false});
      Tournaments.update(tournament._id, {$set: {teams: assignedTeams, judges: assignedJudges}});
    }
  },

  deleteRound: function(roundIndex) {
    var tournament = getOwnerTournament.call(this);
    var roundToDelete = tournament.rounds[roundIndex];

    if(!DeclashApp.ValidatorHelper.canDeleteRound(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot delete this round. Make sure you have the prper conditions.");
    }

    // TODO: Perhaps something more elegant here?
    if(roundToDelete.index !== roundIndex) {
      throw new Meteor.Error("fatalError", "FATAL: The round assignments do not match.");
    }

    Tournaments.update(tournament._id, {$pull: {"rounds": {index: roundIndex}}});
  },

  changeJudgeRoom: function(transferringJudge, destinationRoomString, roundIndex) {
    // Assumption: every room will always have a chair.
    var tournament = getOwnerTournament.call(this);

    function getNewRoom(passedTournament) {
      return _.find(passedTournament.rounds[roundIndex].rooms, function(room) {
        return room.locationId === destinationRoomString;
      });
    }

    function getOriginRoom(passedTournament) {
      return _.find(passedTournament.rounds[roundIndex].rooms, function(room) {
        return _.find(room.judges, function(judgeGuid) {
          return judgeGuid === transferringJudge.guid;
        });
      });
    }

    var originRoom = getOriginRoom(tournament);

    var newRoom = getNewRoom(tournament);

    if(!DeclashApp.ValidatorHelper.canChangeJudgeRoom(originRoom, newRoom, transferringJudge)) {
      // We silently fail for this for now.
      return;
    }

    var newOriginRoomJudges = _.filter(originRoom.judges, function(judgeGuid) {
      return judgeGuid !== transferringJudge.guid;
    });

    // Set a new chair for the origin room.
    // and, set the transferring judge to NOT be chair.
    if(transferringJudge.isChairForRound[roundIndex]) {
      var judgesWithAverageRank = _.map(newOriginRoomJudges, function(judgeGuid) {
        var judge = _.find(tournament.judges, function(judge) {
          return judge.guid === judgeGuid;
        });

        judge.averageRank = DeclashApp.SchemaHelpers.getAverageRankForJudge(judge);

        return judge;
      });

      var highestRankJudge = _.max(judgesWithAverageRank, function(judge) {
        return judge.averageRank;
      });

      var setObj = {};
      setObj["judges.$.isChairForRound." + roundIndex.toString()] = true;

      Tournaments.update(
        {_id: tournament._id, "judges.guid": highestRankJudge.guid},
        {$set: setObj},
        {validate: false, filter: false}
      );

      setObj["judges.$.isChairForRound." + roundIndex.toString()] = false;
      Tournaments.update(
        {_id: tournament._id, "judges.guid": transferringJudge.guid},
        {$set: setObj},
        {validate: false, filter: false}
      );

      // re-get our tournament, since it is changed.
      tournament = getOwnerTournament.call(this);
    }

    newRoom = getNewRoom(tournament);
    originRoom = getOriginRoom(tournament);

    newRoom.judges.push(transferringJudge.guid);
    originRoom.judges = newOriginRoomJudges;

    Tournaments.update(
      {_id: tournament._id, "rounds.index": roundIndex},
      {$set: {"rounds.$.rooms": tournament.rounds[roundIndex].rooms}});
  }
});
