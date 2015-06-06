DeclashApp.client.constants.ManagementContextConstants = (function() {
  var REGISTER_TEAMS_HEADERS = ["Team Name", "Institution", "Debater 1", "Debater 2"];
  var REGISTER_TEAMS_SCHEMA = {name: null, institution: null, debater1: null, debater2: null};
  var REGISTER_TEAMS_COLUMNS = [{data: "name"}, {data: "institution"}, {data: "debater1"}, {data: "debater2"}];

  var REGISTER_JUDGES_HEADERS = ["Judge Name", "Institution"];
  var REGISTER_JUDGES_SCHEMA = {name: null, institution: null};
  var REGISTER_JUDGES_COLUMNS = [{data: "name"}, {data: "institution"}];

  var REGISTER_ROOMS_HEADERS = ["Room Location"];
  var REGISTER_ROOMS_SCHEMA = {location: null};
  var REGISTER_ROOMS_COLUMNS = [{data: "location"}];

  var TEAM_CONTEXT_TYPE = "team_management";
  var JUDGE_CONTEXT_TYPE = "judge_management";
  var ROOM_CONTEXT_TYPE = "room_management";

  var TEAM_REGISTER_METHOD_TYPE = "registerTeams";
  var JUDGE_REGISTER_METHOD_TYPE = "registerJudges";
  var ROOM_REGISTER_METHOD_TYPE = "registerRooms";

  var TEAM_UPDATE_METHOD_TYPE = "updateTeam";
  var JUDGE_UPDATE_METHOD_TYPE = "updateJudge";
  var ROOM_UPDATE_METHOD_TYPE = "updateRoom";

  var TEAM_REMOVE_METHOD_TYPE = "removeTeam";
  var JUDGE_REMOVE_METHOD_TYPE = "removeJudge";
  var ROOM_REMOVE_METHOD_TYPE = "removeRoom";

  var MANAGE_CONTEXT_TYPE = "manage"

  // IMPORTANT: All contexts' functions must be pure functions.
  var TEAM_CONTEXT = {
    colHeaders: REGISTER_TEAMS_HEADERS,
    dataSchema: REGISTER_TEAMS_SCHEMA,
    columns: REGISTER_TEAMS_COLUMNS,
    type: TEAM_CONTEXT_TYPE,
    registerMethod: TEAM_REGISTER_METHOD_TYPE,
    updateMethod: TEAM_UPDATE_METHOD_TYPE,
    removeMethod: TEAM_REMOVE_METHOD_TYPE,
    transformCollectionToTableData: function(tournament, currentRoundIndex) {
      return _.map(tournament.teams, function(team) {
        var newTeam = {};

        _.each(team, function(value, key) {
          if(key === "debaters") {
            newTeam.debater1 = value[0].name;
            newTeam.debater2 = value[1].name;
          }
          else if(key === "isActiveForRound") {
            if(typeof currentRoundIndex === "number") {
              var isActiveForCurrentRound = value[currentRoundIndex.toString()];

              if(typeof isActiveForCurrentRound !== "boolean") {
                throw new Meteor.Error("unableToFind", "Unable To Find the Round you're looking for.")
              }
              newTeam.isActive = isActiveForCurrentRound;

            }
          }
          else if(key === "resultForRound") {
            // TODO
          }
          else if(key === "roleForRound") {
            // TODO
          }
          else {
            newTeam[key] = value;
          }
        });

        return newTeam;
      });
    },
    transformTableDataRowToCollection: function(tableData) {
      var collectionTeam = {};
      collectionTeam.debaters = [];

      _.each(tableData, function(value, key) {
        if(key === "debater1") {
          collectionTeam.debaters[0] = {};
          collectionTeam.debaters[0].name = value;
        }
        else if(key === "debater2") {
          collectionTeam.debaters[1] = {};
          collectionTeam.debaters[1].name = value;
        }
        else if(key === "isActive") {
          // do nothing?
        }
        else {
          collectionTeam[key] = value;
        }
      });

      return collectionTeam;
    }
  };

  var JUDGE_CONTEXT = {
    colHeaders: REGISTER_JUDGES_HEADERS,
    dataSchema: REGISTER_JUDGES_SCHEMA,
    columns: REGISTER_JUDGES_COLUMNS,
    type: JUDGE_CONTEXT_TYPE,
    registerMethod: JUDGE_REGISTER_METHOD_TYPE,
    updateMethod: JUDGE_UPDATE_METHOD_TYPE,
    removeMethod: JUDGE_REMOVE_METHOD_TYPE,
    transformCollectionToTableData: function(tournament, currentRoundIndex) {
      return _.map(tournament.judges, function(judge) {
        var newJudge = {};

        _.each(judge, function(value, key) {
          if(key === "isActiveForRound") {
            if(typeof currentRoundIndex === "number") {
              var isActiveForCurrentRound = value[currentRoundIndex.toString()];

              if(typeof isActiveForCurrentRound !== "boolean") {
                throw new Meteor.Error("unableToFind", "Unable To Find the Round you're looking for.")
              }
              newJudge.isActive = isActiveForCurrentRound;
            }
          }
          else if(key === "isChairForRound") {
            // TODO
          }
          else {
            newJudge[key] = value;
          }
        });

        return newJudge;
      });
    },
    transformTableDataRowToCollection: function(tableData) {
      var collectionJudge = {};

      _.each(tableData, function(value, key) {
        collectionJudge[key] = value;
      });

      return collectionJudge;
    }
  };

  var ROOM_CONTEXT = {
    colHeaders: REGISTER_ROOMS_HEADERS,
    dataSchema: REGISTER_ROOMS_SCHEMA,
    columns: REGISTER_ROOMS_COLUMNS,
    type: ROOM_CONTEXT_TYPE,
    registerMethod: ROOM_REGISTER_METHOD_TYPE,
    updateMethod: ROOM_UPDATE_METHOD_TYPE,
    removeMethod: ROOM_REMOVE_METHOD_TYPE,
    transformCollectionToTableData: function(tournament, currentRoundIndex) {
      if(typeof currentRoundIndex === "number") {
        var currentRound = _.find(tournament.rounds, function(round) {
          return round.index === currentRoundIndex;
        });

        if(!currentRound) {
          throw new Meteor.Error("unableToFind", "Unable To Find the Round you're looking for.")
        }

        var currentRoundRoomLocations = _.map(currentRound.rooms, function(room) {
          return room.locationId;
        });

        return _.map(tournament.rooms, function(room) {
          var isActive = _.contains(currentRoundRoomLocations, room);

          return {location: room, isActive: isActive};
        });
      }
      else {
        return _.map(tournament.rooms, function(room) {
          return {location: room};
        });
      }

    },
    transformTableDataRowToCollection: function(tableData) {
      // This is currently unused
      return tableData.location;
    }
  };

  var TEAM_ROUND_CONTEXT = _.extend({}, TEAM_CONTEXT, {
    colHeaders: ["Active"].concat(_.clone(TEAM_CONTEXT.colHeaders)),
    dataSchema: _.extend({isActive: null}, TEAM_CONTEXT.dataSchema),
    columns: (function () {
      var newColumns = _.map(TEAM_CONTEXT.columns, _.clone);

      newColumns = _.map(newColumns, function(obj) {
        obj.readOnly = true;
        return obj;
      });

      newColumns.unshift({data: "isActive", type: "checkbox", width:20});

      return newColumns;
    })(),
    registerMethod: null,
    removeMethod: null,
    updateMethod: "updateTeamForRound",
    type: "team_round"
  });

  var JUDGE_ROUND_CONTEXT = _.extend({}, JUDGE_CONTEXT, {
    colHeaders: ["Active"].concat(_.clone(JUDGE_CONTEXT.colHeaders)),
    dataSchema: _.extend({isActive: true}, JUDGE_CONTEXT.dataSchema),
    columns: (function () {
      var newColumns = _.map(JUDGE_CONTEXT.columns, _.clone);

      newColumns = _.map(newColumns, function(obj) {
        obj.readOnly = true;
        return obj;
      });

      newColumns.unshift({data: "isActive", type: "checkbox", width:20});

      return newColumns;
    })(),
    registerMethod: null,
    removeMethod: null,
    updateMethod: "updateJudgeForRound",
    type: "judge_round"
  });

  var ROOM_ROUND_CONTEXT = _.extend({}, ROOM_CONTEXT, {
    colHeaders: ["Active"].concat(_.clone(ROOM_CONTEXT.colHeaders)),
    dataSchema: _.extend({isActive: true}, ROOM_CONTEXT.dataSchema),
    columns: (function () {
      var newColumns = _.map(ROOM_CONTEXT.columns, _.clone);

      newColumns = _.map(newColumns, function(obj) {
        obj.readOnly = true;
        return obj;
      });

      newColumns.unshift({data: "isActive", type: "checkbox", width:20});

      return newColumns;
    })(),
    registerMethod: null,
    removeMethod: null,
    updateMethod: "updateRoomForRound",
    type: "room_round"
  });

  var ManagementContextConstants = {
    MANAGE_CONTEXT_TYPE: MANAGE_CONTEXT_TYPE,
    TEAM_CONTEXT: TEAM_CONTEXT,
    JUDGE_CONTEXT: JUDGE_CONTEXT,
    ROOM_CONTEXT: ROOM_CONTEXT,
    TEAM_ROUND_CONTEXT: TEAM_ROUND_CONTEXT,
    JUDGE_ROUND_CONTEXT: JUDGE_ROUND_CONTEXT,
    ROOM_ROUND_CONTEXT: ROOM_ROUND_CONTEXT,
  };

  return ManagementContextConstants;
})();
