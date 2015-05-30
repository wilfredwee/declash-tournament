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

// All contexts' functions must be pure functions.
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

    newColumns.unshift({data: "isActive", readOnly: false, type: "checkbox", width:20});

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

    newColumns.unshift({data: "isActive", readOnly: false, type: "checkbox", width:20});

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

    newColumns.unshift({data: "isActive", readOnly: false, type: "checkbox", width:20});

    return newColumns;
  })(),
  registerMethod: null,
  removeMethod: null,
  updateMethod: "updateRoomForRound",
  type: "room_round"
});

APPGLOBALS.ManagementPageContainer = ReactMeteor.createClass({
  render: function() {
    return <ManagementBody />;
  }
});


var ManagementBody = ReactMeteor.createClass({
  startMeteorSubscriptions: function() {
    Meteor.subscribe("unfinishedTournaments");
  },

  getMeteorState: function() {
    return {
      tournament: Tournaments.findOne({ownerId: Meteor.userId()}),
    };
  },

  render: function() {
    if(!this.state.tournament) {
      return (
        <div>
          <Header tournament={this.state.tournament} />
          <TournamentRegistrationForm tournament={this.state.tournament} />
        </div>
      );
    }
    else {
      return (
        <div>
          <Header tournament={this.state.tournament} />
          <TournamentManagementContainer tournament={this.state.tournament} />
        </div>
      );
    }
  }
});

var Header = ReactMeteor.createClass({
  startMeteorSubscriptions: function() {
    // TODO
  },

  getMeteorState: function() {
    return {
      currentUser: Meteor.user()
    };
  },

  render: function() {
    var name = "Please login, I'll create template for you later.";
    var tournamentString = "";

    if(this.props.tournament) {
      tournamentString = "You are now managing " + this.props.tournament.name + ".";
    }
    if(this.state.currentUser) {
      name = this.state.currentUser.profile.name;
    }
    return (
      <h1>Welcome, {name + "! " + " " + tournamentString}</h1>
    );
  }
});

var TournamentRegistrationForm = ReactMeteor.createClass({
  getMeteorState: function() {
    return {};
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var name = React.findDOMNode(this.refs.name).value.trim();
    var maxUsers = Math.floor(React.findDOMNode(this.refs.maxUsers).value);

    var tournament = {
      name: name,
      maxUsers: maxUsers,
      style: "BP"
    };

    Meteor.call("registerTournament", tournament, function(err, result) {
      if(err) {
        alert(err.reson);
        // TODO
      }
      else {
        // TODO - Figure out how to handle waiting for payments here. Maybe?
        // Just wait for re-render once tournament changes to true.
      }
    })
  },

  render: function() {
    return (
      <form className="ui form TournamentRegistrationForm" onSubmit={this.handleSubmit}>
        <label>Tournament Name</label>
        <input type="text" placeholder="Enter a name for the tournament" ref="name" />
        <label>Max Debaters</label>
        <input type="number" placeholder="Maximum amount of debaters." ref="maxUsers" />
        <input type="submit" className="ui submit button" value="Create Tournament" />
      </form>
    );
  }
});

var TournamentManagementContainer = ReactMeteor.createClass({
  getMeteorState: function() {
    return {
      containerContextType: Session.get("containerContextType"),
      currentRoundIndex: Session.get("currentRoundIndex")
    };
  },

  switchContainerContextType: function(contextType, roundIndex) {
    Session.set("containerContextType", contextType);
    if(typeof roundIndex === "number") {
      Session.set("currentRoundIndex", roundIndex);
    }
  },

  renderAccordingToContextType: function(contextType, roundIndex) {
    var contextToRender = TEAM_CONTEXT;
    switch(contextType) {
      case TEAM_CONTEXT.type:
        contextToRender = TEAM_CONTEXT;
        break;
      case JUDGE_CONTEXT.type:
        contextToRender = JUDGE_CONTEXT;
        break;
      case ROOM_CONTEXT.type:
        contextToRender = ROOM_CONTEXT;
        break;
      case TEAM_ROUND_CONTEXT.type:
        contextToRender = TEAM_ROUND_CONTEXT;
        break;
      case JUDGE_ROUND_CONTEXT.type:
        contextToRender = JUDGE_ROUND_CONTEXT;
        break;
      case ROOM_ROUND_CONTEXT.type:
        contextToRender = ROOM_ROUND_CONTEXT;
        break;
    }

    if(_.contains([TEAM_CONTEXT.type, JUDGE_CONTEXT.type, ROOM_CONTEXT.type], contextToRender.type)) {
      return <ManagementHotContainer context={contextToRender} />;
    }
    else {
      return <RoundHotContainer roundIndex={roundIndex} context={contextToRender} />;
    }
  },

  createRound: function(e) {
    Meteor.call("createRound", function(err, result) {
      // TODO
      if(err) {
        alert(err.reason);
      }
    });
  },

  render: function() {
    var contentContainer = this.renderAccordingToContextType(this.state.containerContextType, this.state.currentRoundIndex);

    var warningMessage = (function() {
      if(this.props.tournament.currentInvariantViolations.length > 0) {
        return (
          <div className="ui warning message">
            <div className="header">
              Warning! These errors must be resolved before your can further proceed.
            </div>
            <ul className="list">
              {this.props.tournament.currentInvariantViolations.map(function(violation, index) {
                return <li key={index}>{violation.message}</li>;
              })}
            </ul>
          </div>
        );
      }
      return undefined;
    }.bind(this))();

    var createRoundClassName = (function() {
      if(this.props.tournament.rounds.length === 0) {
        return "ui link item";
      }
      var lastRoundIndex = this.props.tournament.rounds.length - 1;
      var lastRoundState = this.props.tournament.rounds[lastRoundIndex].state;

      if(lastRoundState !== "finished") {
        return "ui disabled item";
      }
      return "ui link item";
    }.bind(this))();

    return (
      <div>
        <div className="row">
          <div className="ui menu">
            <div tabIndex="-1" className="ui simple pointing dropdown link item">
              <i tabIndex="0" className="dropdown icon"></i>
              <span className="text">Management</span>
              <div tabIndex="-1" className="menu">
                <div className="item" onClick={this.switchContainerContextType.bind(this, TEAM_CONTEXT.type)}>Teams</div>
                <div className="item" onClick={this.switchContainerContextType.bind(this, JUDGE_CONTEXT.type)}>Judges</div>
                <div className="item" onClick={this.switchContainerContextType.bind(this, ROOM_CONTEXT.type)}>Rooms</div>
              </div>
            </div>
            {this.props.tournament.rounds.map(function(round) {
              return (
                <div key={round.index} tabIndex="-1" className="ui simple pointing dropdown link item">
                  <i tabIndex="0" className="dropdown icon"></i>
                  <span className="text">Round {round.index + 1}</span>
                  <div tabIndex="-1" className="menu">
                    <div className="item" onClick={this.switchContainerContextType.bind(this, TEAM_ROUND_CONTEXT.type, round.index)}>Teams</div>
                    <div className="item" onClick={this.switchContainerContextType.bind(this, JUDGE_ROUND_CONTEXT.type, round.index)}>Judges</div>
                    <div className="item" onClick={this.switchContainerContextType.bind(this, ROOM_ROUND_CONTEXT.type, round.index)}>Rooms</div>
                  </div>
                </div>
              );
            }.bind(this))}
            <div onClick={createRoundClassName.indexOf("disabled") >= 0? undefined : this.createRound} className={createRoundClassName}>Create a Round</div>
          </div>
        </div>
        <br />
        <div className="row">
          {warningMessage}
        </div>
        <br />
        <div className="row">
          {contentContainer}
        </div>
      </div>
    );
  }
});

var ManagementHotContainer = ReactMeteor.createClass({
  startMeteorSubscriptions: function() {
    Meteor.subscribe("unfinishedTournaments");
  },

  getMeteorState: function() {
    return {
      tournament: Tournaments.findOne({ownerId: Meteor.userId()})
    };
  },

  handleSelectPublicRegistration: function(e) {
    Meteor.call("togglePublicRegistration", function(err, result) {
      if(err) {
        // TODO
        alert(err.reason);
      }
      else {
        // We probably don't need to lag-compensate here because Meteor methods should
        // theoretically already do it for us.
      }
    }.bind(this))
  },

  render: function() {
    return (
      <div>
        <div className="row">
          <div className="ui toggle checkbox">
            <input ref="enablePublicRegistrationCheckBox" checked={this.state.tournament.enablePublicRegistration} readOnly onClick={this.handleSelectPublicRegistration} type="checkbox">
            <label>Public Registration of Teams/Judges is {this.state.tournament.enablePublicRegistration ? "Open" : "Closed"}.</label>
            </input>
          </div>
        </div>
        {/* We need to implement registration url here. */}
        <br />
        <div className="row">
          <ManagementHot context={this.props.context} tournament={this.state.tournament} />
        </div>


      </div>
    );
  }
});


var ManagementHot = ReactMeteor.createClass({
  componentDidMount: function() {
    if(!this.hot) {
      this.initializeHot(this.props.context);
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    if(!this.hot || !_.isEqual(this.props.context, nextProps.context)) {
      return true;
    }

    // Only update if our table data AND current state is out of sync with nextState.
    // Updating serves only one purpose: To loadData to the table.

    // Why check for both conditions: Because this can be called even if
    // current state === nextState.
    var tableData = _.filter(this.hot.getData(), function(rowData, index) {
        return !this.hot.isEmptyRow(index);
    }.bind(this));

    return !_.isEqual(tableData, this.props.context.transformCollectionToTableData(nextProps.tournament))
      && !_.isEqual(this.props.tournament, nextProps.tournament);
  },

  componentDidUpdate: function (prevProps, prevState) {
    if(!this.hot) {
      this.initializeHot(this.props.context);
    }
    else {
      if(_.isEqual(this.props.context, prevProps.context)) {
        this.hot.loadData(this.props.context.transformCollectionToTableData(this.props.tournament));
      }
      else {
        this.hot.destroy();
        this.hot = undefined;
        this.initializeHot(this.props.context);
      }
    }
  },

  componentWillUnmount: function () {
    if(this.hot) {
      this.hot.destroy();
      this.hot = undefined;
    }
  },

  initializeHot: function(context) {
    var componentThis = this;
    var tableData = this.props.context.transformCollectionToTableData(this.props.tournament);
    var allowRemoveRow = false;

    this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
      data: tableData,
      minCols: context.colHeaders.length,
      startCols: context.colHeaders.length,
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: context.colHeaders,
      contextMenu: true,
      autoWrapRow: true,
      undo: true,
      stretchH: "all",
      height: 500,
      allowRemoveColumn: false,
      allowInsertColumn: false,
      allowInvalid: false,
      dataSchema: context.dataSchema,
      columns: context.columns,
      afterCreateRow: function() {
        this.validateCells(function() {
          // do nothing.
        });
      },
      beforeValidate: function(value, row, prop, source) {
        if(!this.isEmptyRow(row) && value === null) {
          return false;
        }
        if(typeof value === "string" && value.length <= 0) {
          return false
        }
      },
      validator: function(value, callback) {
        if(value === false) {
          callback(false);
        }
        else {
          callback(true);
        }
      },
      afterChange: function(changes, source) {
        //  We might want to perform caching if source === "paste"
        if(source === "loadData") {
          return;
        }

        var context = componentThis.props.context;

        var dataArray = componentThis.getDataToBeChanged(changes, this);
        if(!dataArray) {
          return;
        }

        // Rooms are special, we just re-register all of them for now
        // as they are just string arrays.
        if(context.type === ROOM_CONTEXT_TYPE) {

          var data = this.getData();

          var dataWithoutEmptyRows = _.filter(data, function(rowData, index) {
              return !this.isEmptyRow(index);
          }.bind(this));

          var roomStrings = _.map(dataWithoutEmptyRows, function(rowData) {
            return rowData.location;
          });

          Meteor.call(context.registerMethod, roomStrings, function(err, result) {
            // TODO
            if(err) {
              alert(err);
            }
          });
        }
        else {
          _.each(dataArray, function(data) {
            if(data.guid) {
              var collectionToSend = context.transformTableDataRowToCollection(data);

              Meteor.call(context.updateMethod, collectionToSend, function(err, result) {
                // TODO
                if(err) {
                  alert(err);
                }
              });
            }
            else {
              var collectionToSend = [context.transformTableDataRowToCollection(data)];
              Meteor.call(context.registerMethod, collectionToSend, function(err, result) {
                // TODO
                if(err) {
                  alert(err);
                }
              });
            }
          });
        }
      },
      beforeRemoveRow: function(index, amount) {
        // Check if all rows to remove are empty.
        var rowIndexes = _.range(index, index+amount);

        var notEmptyRows = _.filter(rowIndexes, function(rowIndex) {
          return !this.isEmptyRow(rowIndex) || this.getSourceDataAtRow(rowIndex).guid;
        }.bind(this));

        if(notEmptyRows.length <= 0) {
          return true;
        }

        var thisTable = this;
        var context = componentThis.props.context;

        if(allowRemoveRow === true) {
          if(context.type === ROOM_CONTEXT_TYPE) {
            var data = this.getData();

            var dataWithoutEmptyRows = _.filter(data, function(rowData, rowIndex) {
                return !this.isEmptyRow(rowIndex) && !_.contains(rowIndexes, rowIndex);
            }.bind(this));

            var roomStrings = _.map(dataWithoutEmptyRows, function(rowData) {
              return rowData.location;
            });

            Meteor.call(context.registerMethod, roomStrings, function(err, result) {
              // TODO
              if(err) {
                alert(err);
              }
            });

            return true;
          }

          for(var i=index; i<(index+amount); i++) {
            var data = this.getSourceDataAtRow(i);

            if(!_.contains(data, null)) {
              var collectionToSend = context.transformTableDataRowToCollection(data);
              Meteor.call(context.removeMethod, collectionToSend, function(err, result) {
                // TODO
                if(err) {
                  alert(err);
                }
              });
            }
            // Should we consider an 'else' case here where an incomplete thing is around?
          }
          return true;
        }
        else {
          $(".ui.modal").modal({
            closable: false,
            onDeny: function() {
              allowRemoveRow = false;
            },
            onApprove: function() {
              allowRemoveRow = true;
              thisTable.alter("remove_row", index, amount);
            }
          }).modal("show");
          return false;
        }
      },
      afterRemoveRow: function(index, amount) {
        allowRemoveRow = false;
      }
    });
  },

  getDataToBeChanged: function(changes, hot) {
    var uniqueChanges = _.filter(changes, function(change) {
      return change[2] !== change[3];
    });

    if(uniqueChanges.length <= 0) {
      return null;
    }

    var uniqueRowIndexes = [];
    _.each(uniqueChanges, function(change) {
      if(!_.contains(uniqueRowIndexes, change[0])){
        uniqueRowIndexes.push(change[0]);
      }
    });

    var dataToBeChanged = _.chain(uniqueRowIndexes)
      .map(function(index) {
        var data = hot.getSourceDataAtRow(index);

        var hasIncompleteData = _.some(data, function(element) {
          return !element || element.length <= 0
        });

        return hasIncompleteData? null : data;
      })
      .filter(function(data) {
        return data !== null;
      })
      .value();

    return dataToBeChanged.length <= 0? null : dataToBeChanged;
  },

  render: function() {
    return (
      <div>
        <div className="row">
            <div className="handsontable" ref="handsontable"></div>
        </div>

        {/*UI for the Modal we will render*/}
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Warning
          </div>
          <div className="content">
            <div className="description">
              Are you sure you want to delete the item?
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">No</div>
            <div className="ui ok button">Yes</div>
          </div>
        </div>
      </div>
    );
  }
});

var RoundHotContainer = ReactMeteor.createClass({
  startMeteorSubscriptions: function() {
    Meteor.subscribe("unfinishedTournaments");
  },

  getMeteorState: function() {
    return {
      tournament: Tournaments.findOne({ownerId: Meteor.userId()})
    };
  },

  render: function() {
    return (
      <div>
        <div className="row">
          <h3>Managing Round {(this.props.roundIndex + 1).toString()}.</h3>
        </div>
        <div className="row">
          <RoundHot roundIndex={this.props.roundIndex} context={this.props.context} tournament={this.state.tournament} />
        </div>
      </div>
    );
  }
});

var RoundHot = ReactMeteor.createClass({
  componentDidMount: function () {
    if(!this.hot) {
      this.initializeHot();
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    if(!this.hot || !_.isEqual(this.props.context, nextProps.context) || !_.isEqual(this.props.roundIndex, nextProps.roundIndex)) {
      return true;
    }

    // Only update if our table data AND current state is out of sync with nextState.
    // Updating serves only one purpose: To loadData to the table.

    // Why check for both conditions: Because this can be called even if
    // current state === nextState.
    var tableData = _.filter(this.hot.getData(), function(rowData, index) {
        return !this.hot.isEmptyRow(index);
    }.bind(this));

    return !_.isEqual(tableData, this.props.context.transformCollectionToTableData(nextProps.tournament, nextProps.roundIndex))
      && !_.isEqual(this.props.tournament, nextProps.tournament);
  },

  componentDidUpdate: function (prevProps, prevState) {
    if(!this.hot) {
      this.initializeHot();
    }
    else {
      if(_.isEqual(this.props.context, prevProps.context)) {
        this.hot.loadData(this.props.context.transformCollectionToTableData(this.props.tournament, this.props.roundIndex));
      }
      else {
        this.hot.destroy();
        this.hot = undefined;
        this.initializeHot();
      }
    }
  },

  componentWillUnmount: function () {
    if(this.hot) {
      this.hot.destroy();
      this.hot = undefined;
    }
  },

  initializeHot: function() {
    var context = this.props.context;
    var roundIndex = this.props.roundIndex;
    var componentThis = this;
    var tableData = this.props.context.transformCollectionToTableData(this.props.tournament, roundIndex);

    this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
      data: tableData,
      minCols: context.colHeaders.length,
      startCols: context.colHeaders.length,
      minSpareRows: 0,
      maxRows: tableData.length,
      rowHeaders: true,
      colHeaders: context.colHeaders,
      autoWrapRow: true,
      stretchH: "all",
      height: 500,
      allowRemoveColumn: false,
      allowInsertColumn: false,
      allowInsertRow: false,
      allowRemoveRow: false,
      dataSchema: context.dataSchema,
      columns: context.columns,
      afterChange: function(changes, source) {
        if(source === "loadData") {
          return;
        }

        _.each(changes, function(change) {
          if(change[1] !== "isActive") {
            throw new Meteor.Error("invalidAction",
              "You may only change active status here. Please go to the Management tab to change information about teams.");
          }

          var data = this.getSourceDataAtRow(change[0]);

          var collectionToSend = context.transformTableDataRowToCollection(data);

          Meteor.call(context.updateMethod, collectionToSend, roundIndex, change[3], function(err, result) {
            if(err) {
              // TODO
              alert(err.reason);
            }
          });
        }.bind(this))
      }
    });
  },

  render: function() {
    return (
      <div className="row">
        <div className="SOMETABLE" ref="handsontable"></div>
      </div>
    );

  }

});
