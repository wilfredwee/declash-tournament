"use strict";
/* global Tournaments */

// Initialize variables from DeclashApp namespace.
var ValidatorHelper;
var SchemaHelpers;
var AssignmentAlgorithm;
Meteor.startup(function() {
  ValidatorHelper = DeclashApp.helpers.ValidatorHelper;
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
  AssignmentAlgorithm = DeclashApp.AssignmentAlgorithm;
});

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

  updateRoom: function() {
    throw new Meteor.Error("invalidAction", "Single update for rooms is not supported currently.");
  },

  togglePublicRegistration: function() {
    var tournament = getOwnerTournament.call(this);

    if(tournament.rounds.length > 0 && !tournament.enablePublicRegistration) {
      return;
    }

    var newChecked = !tournament.enablePublicRegistration;
    Tournaments.update(tournament._id, {$set: {enablePublicRegistration: newChecked}});

    return newChecked;
  },

  togglePublicView: function() {
    var tournament = getOwnerTournament.call(this);

    var newChecked = !tournament.enablePublicView;
    Tournaments.update(tournament._id, {$set: {enablePublicView: newChecked}});
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
      var isActiveThisRound = team.isActiveForRound[(newRoundIndex-1).toString()] !== false;

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

    if(tournament.enablePublicRegistration) {
      Tournaments.update(tournament._id, {$set: {enablePublicRegistration: false}});
    }

    return newRoundIndex;
  },

  assignRound: function(roundIndex) {
    var tournament = getOwnerTournament.call(this);
    var roundToAssign = tournament.rounds[roundIndex];

    if(!ValidatorHelper.canAssignRound(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot assign this round. Make sure you have the proper conditions.");
    }

    // TODO: Perhaps something more elegant here?
    if(roundToAssign.index !== roundIndex) {
      throw new Meteor.Error("fatalError", "FATAL: The round assignments do not match.");
    }

    var algorithm = new AssignmentAlgorithm(tournament, roundToAssign);

    // Synchronous assignment call that does all the algorithmic heavy lifting.
    algorithm.assign();

    // assignedRound assigns teams and judges to rooms.
    var assignedRound = algorithm.getAssignedRound();

    // assignedTeams has their roles for a round assigned
    var assignedTeams = algorithm.getAssignedTeams();

    // assignedJudges has their roles for a round assigned (is chair or not)
    var assignedJudges = algorithm.getAssignedJudges();

    assignedRound.state = "assigned";

    Tournaments.update(
      {_id: tournament._id, "rounds.index": assignedRound.index},
      {$set: {"rounds.$": assignedRound}},
      {validate: false, filter: false}
    );

    Tournaments.update(tournament._id, {$set: {teams: assignedTeams, judges: assignedJudges}});
},

  deleteRound: function(roundIndex) {
    var tournament = getOwnerTournament.call(this);
    var roundToDelete = _.find(tournament.rounds, function(round) {
      return round.index === roundIndex;
    });

    if(!roundToDelete) {
      throw new Meteor.Error("unableToFind", "Unable to find the round you're looking for.");
    }

    if(!ValidatorHelper.canDeleteRound(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot delete this round. Make sure you have the proper conditions.");
    }

    Tournaments.update(tournament._id, {$pull: {"rounds": {index: roundIndex}, "publicRounds": {index: roundIndex}}});
  },

  activateRound: function(roundIndex) {
    var tournament = getOwnerTournament.call(this);
    var roundToActivate = _.find(tournament.rounds, function(round) {
      return round.index === roundIndex;
    });

    if(!roundToActivate) {
      throw new Meteor.Error("unableToFind", "Unable to find the round you're looking for.");
    }

    if(!ValidatorHelper.canActivateRound(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot activate this round. Make sure you have the proper conditions.");
    }

    roundToActivate.state = "active";

    // When activating a round, we create a public round that is similar to the private round,
    // only that it is viewable by the public.
    // We do this because of limitations of Mongo's capabilities in limiting fields.

    Tournaments.update(
      {_id: tournament._id, "rounds.index": roundToActivate.index},
      {$set: {"rounds.$.state": roundToActivate.state, "publicRounds": tournament.rounds}}
    );
  },

  finalizeRound: function(roundIndex) {
    var tournament = getOwnerTournament.call(this);
    var roundToFinalize = _.find(tournament.rounds, function(round) {
      return round.index === roundIndex;
    });

    if(!roundToFinalize) {
      throw new Meteor.Error("unableToFind", "Unable to find the round you're looking for.");
    }

    if(!ValidatorHelper.canFinalizeRound(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot finalize this round. Make sure you have the proper conditions.");
    }

    roundToFinalize.state = "finished";

    Tournaments.update(
      {_id: tournament._id, "rounds.index": roundToFinalize.index},
      {$set: {"rounds.$.state": roundToFinalize.state}}
    );

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

    if(!ValidatorHelper.canChangeJudgeRoom(tournament, roundIndex, originRoom, newRoom, transferringJudge)) {
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

        judge.averageRank = SchemaHelpers.getAverageRankForJudge(judge);

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
  },

  changeDebaterScore: function(team, debaterIndex, roundIndex, scoreValue) {
    if(Meteor.isClient) {
      return;
    }

    var tournament = getOwnerTournament.call(this);

    var teamToUpdate = _.find(tournament.teams, function(tournamentTeam) {
      return tournamentTeam.guid === team.guid;
    });

    if(!ValidatorHelper.canChangeDebaterScore(tournament, roundIndex, teamToUpdate, debaterIndex, scoreValue)) {
      throw new Meteor.Error("invalidAction", "Encountered problems changing the debater score.");
    }

    teamToUpdate.debaters[debaterIndex].scoreForRound[roundIndex] = scoreValue;

    Tournaments.update(
      {_id: tournament._id, "teams.guid": teamToUpdate.guid},
      {$set: {"teams.$": teamToUpdate}},
      {validate: false, filter: false}
    );
  },

  changeTeamResult: function(team, roundIndex, resultValue) {
    var tournament = getOwnerTournament.call(this);

    var teamToUpdate = _.find(tournament.teams, function(tournamentTeam) {
      return tournamentTeam.guid === team.guid;
    });

    if(!ValidatorHelper.canChangeTeamResult(tournament, roundIndex, teamToUpdate, resultValue)) {
      throw new Meteor.Error("invalidAction", "Encountered problems changing the team result.");
    }

    teamToUpdate.resultForRound[roundIndex] = resultValue;

    Tournaments.update(
      {_id: tournament._id, "teams.guid": teamToUpdate.guid},
      {$set: {"teams.$": teamToUpdate}},
      {validate: false, filter: false}
    );
  },

  changeJudgeRank: function(judge, roundIndex, rankValue) {
    if(Meteor.isClient) {
      return;
    }

    var tournament = getOwnerTournament.call(this);

    var judgeToUpdate = _.find(tournament.judges, function(tournamentJudge) {
      return tournamentJudge.guid === judge.guid;
    });

    if(!ValidatorHelper.canChangeJudgeRank(tournament, roundIndex, judgeToUpdate, rankValue)) {
      throw new Meteor.Error("invalidAction", "Encountered problems changing the judge rank.");
    }

    judgeToUpdate.rankForRound[roundIndex] = rankValue;

    Tournaments.update(
      {_id: tournament._id, "judges.guid": judgeToUpdate.guid},
      {$set: {"judges.$": judgeToUpdate}},
      {validate: false, filter: false}
    );
  },

  switchChair: function(judgeGuid, roundIndex) {
    var tournament = getOwnerTournament.call(this);

    var round = _.find(tournament.rounds, function(round) {
      return round.index === roundIndex;
    });

    var room = _.find(round.rooms, function(roomObj) {
      return _.contains(roomObj.judges, judgeGuid);
    });

    var prevChair = _.find(tournament.judges, function(judge) {
      return _.contains(room.judges, judge.guid) && judge.isChairForRound[roundIndex] === true;
    });

    var newChair = _.find(tournament.judges, function(judge) {
      return _.contains(room.judges, judge.guid) && judge.guid === judgeGuid;
    });

    prevChair.isChairForRound[roundIndex] = false;
    newChair.isChairForRound[roundIndex] = true;

    Tournaments.update(
      {_id: tournament._id, "judges.guid": prevChair.guid},
      {$set: {"judges.$": prevChair}},
      {validate: false, filter: false}
    );

    Tournaments.update(
      {_id: tournament._id, "judges.guid": newChair.guid},
      {$set: {"judges.$": newChair}},
      {validate: false, filter: false}
    );
  },

  changeMotion: function(motionText, roundIndex) {
    var tournament = getOwnerTournament.call(this);

    if(!ValidatorHelper.canEditMotion(tournament, roundIndex)) {
      throw new Meteor.Error("invalidAction", "Cannot edit the motion for this round.");
    }

    var round = _.find(tournament.rounds, function(round) {
      return round.index === roundIndex;
    });

    round.motion = motionText;

    Tournaments.update(
      {_id: tournament._id, "rounds.index": round.index},
      {$set: {"rounds.$.motion": round.motion}}
    );
  },

  swapTeamsForRound: function(teamToSwapOut, teamToSwapIn, roundIndex) {
    function changeRole(swapOutTeam, swapInTeam, rIndex) {
      swapOutTeam = JSON.parse(JSON.stringify(swapOutTeam));
      swapInTeam = JSON.parse(JSON.stringify(swapInTeam));

      var swapOutSetObj = {};
      swapOutSetObj["teams.$.roleForRound." + rIndex] = swapInTeam.roleForRound[rIndex];

      var swapInSetObj = {};
      swapInSetObj["teams.$.roleForRound." + rIndex] = swapOutTeam.roleForRound[rIndex];

      Tournaments.update(
        {_id: tournament._id, "teams.guid": swapOutTeam.guid},
        {$set: swapOutSetObj},
        {validate: false, filter: false}
      );

      Tournaments.update(
        {_id: tournament._id, "teams.guid": swapInTeam.guid},
        {$set: swapInSetObj},
        {validate: false, filter: false}
      );
    }

    function changeRoom(currRooms, swapOutTeam, swapInTeam, rIndex) {
      swapOutTeam = JSON.parse(JSON.stringify(swapOutTeam));
      swapInTeam = JSON.parse(JSON.stringify(swapInTeam));
      currRooms = JSON.parse(JSON.stringify(currRooms));

      var swapOutRoom = _.find(currRooms, function(room) {
        return _.contains(room.teams, swapOutTeam.guid);
      });

      var swapInRoom = _.find(currRooms, function(room) {
        return _.contains(room.teams, swapInTeam.guid);
      });

      swapOutRoom.teams = _.map(swapOutRoom.teams, function(teamGuid) {
        if(teamGuid === swapOutTeam.guid) {
          return swapInTeam.guid;
        }
        return teamGuid;
      });

      // swapInRoom will not be defined for non-active teams
      if(swapInRoom) {
        swapInRoom.teams = _.map(swapInRoom.teams, function(teamGuid) {
          if(teamGuid === swapInTeam.guid) {
            return swapOutTeam.guid;
          }
          return teamGuid;
        });
      }

      currRooms = _.map(currRooms, function(room) {
        if(room.locationId === swapOutRoom.locationId) {
          return swapOutRoom;
        }
        else if(swapInRoom && room.locationId === swapInRoom.locationId) {
          return swapInRoom;
        }
        return room;
      });

      Tournaments.update(
        {_id: tournament._id, "rounds.index": rIndex},
        {$set: {"rounds.$.rooms": currRooms}},
        {validate: false, filter: false}
      );
    }

    function changeActiveTeam(swapOutTeam, swapInTeam, rIndex) {
      swapOutTeam = JSON.parse(JSON.stringify(swapOutTeam));
      swapInTeam = JSON.parse(JSON.stringify(swapInTeam));

      swapInTeam.isActiveForRound[rIndex] = true;
      // these two changes shouldn't be necessary, actually.
      swapInTeam.resultForRound[rIndex] = undefined;
      swapInTeam.debaters = _.map(swapInTeam.debaters, function(debater) {
        debater.scoreForRound[rIndex] = undefined;

        return debater;
      });
      swapInTeam.roleForRound[rIndex] = swapOutTeam.roleForRound[rIndex];


      swapOutTeam.isActiveForRound[rIndex] = false;
      swapOutTeam.resultForRound[rIndex] = undefined;
      swapOutTeam.debaters = _.map(swapOutTeam.debaters, function(debater) {
        debater.scoreForRound[rIndex] = undefined;

        return debater;
      });
      swapOutTeam.roleForRound[rIndex] = undefined;


      Tournaments.update(
        {_id: tournament._id, "teams.guid": swapOutTeam.guid},
        {$set: {"teams.$": swapOutTeam}}
      );

      Tournaments.update(
        {_id: tournament._id, "teams.guid": swapInTeam.guid},
        {$set: {"teams.$": swapInTeam}}
      );
    }

    var tournament = getOwnerTournament.call(this);

    if(!ValidatorHelper.canSwapTeams(tournament, roundIndex, teamToSwapOut, teamToSwapIn)) {
      throw new Meteor.Error("invalidAction", "Cannot swap these teams.");
    }

    var round = _.find(tournament.rounds, function(round) {
      return round.index === roundIndex;
    });

    teamToSwapIn = _.find(tournament.teams, function(team) {
      return team.guid === teamToSwapIn.guid;
    });

    teamToSwapOut = _.find(tournament.teams, function(team) {
      return team.guid === teamToSwapOut.guid;
    });

    var roomOfSwapOut = _.find(round.rooms, function(room) {
      return _.contains(room.teams, teamToSwapOut.guid);
    });

    // Do not need to change activeForRound, resultForRound, scoreForRound, roleForRound
    // But should change room and position.
    if(teamToSwapIn.isActiveForRound[roundIndex]) {
      // Same Room, change positions only.
      if(_.contains(roomOfSwapOut.teams, teamToSwapIn.guid)) {
        changeRole(teamToSwapOut, teamToSwapIn, roundIndex);
      // Different Room, change room and position.
      }
      else {
        changeRole(teamToSwapOut, teamToSwapIn, roundIndex);
        changeRoom(round.rooms, teamToSwapOut, teamToSwapIn, roundIndex);
      }
    }
    // Change the necessary fields.
    else {
      // changeActiveTeam will change the roles of users for us.
      changeActiveTeam(teamToSwapOut, teamToSwapIn, roundIndex);
      changeRoom(round.rooms, teamToSwapOut, teamToSwapIn, roundIndex);
    }
  }
});
