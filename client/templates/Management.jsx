var REGISTER_TEAMS_HEADERS = ["Team Name", "Institution", "Debater 1", "Debater 2"];
var REGISTER_TEAMS_SCHEMA = {name: null, institution: null, debater1: null, debater2: null};
var REGISTER_TEAMS_COLUMNS = [{data: "name"}, {data: "institution"}, {data: "debater1"}, {data: "debater2"}];

var REGISTER_JUDGES_HEADERS = ["Judge Name", "Institution"];
var REGISTER_JUDGES_SCHEMA = {name: null, institution: null};
var REGISTER_JUDGES_COLUMNS = [{data: "name"}, {data: "institution"}];

var REGISTER_ROOMS_HEADERS = ["Room Location"];
var REGISTER_ROOMS_SCHEMA = {location: null};
var REGISTER_ROOMS_COLUMNS = [{data: "location"}];

var TEAM_CONTEXT_TYPE = "team";
var JUDGE_CONTEXT_TYPE = "judge";
var ROOM_CONTEXT_TYPE = "room";

var TEAM_REGISTER_METHOD_TYPE = "registerTeams";
var JUDGE_REGISTER_METHOD_TYPE = "registerJudges";
var ROOM_REGISTER_METHOD_TYPE = "registerRooms";

var TEAM_UPDATE_METHOD_TYPE = "updateTeam";
var JUDGE_UPDATE_METHOD_TYPE = "updateJudge";
var ROOM_UPDATE_METHOD_TYPE = "updateRoom";

var TEAM_REMOVE_METHOD_TYPE = "removeTeam";
var JUDGE_REMOVE_METHOD_TYPE = "removeJudge";
var ROOM_REMOVE_METHOD_TYPE = "removeRoom";


var TEAM_CONTEXT = {
  colHeaders: REGISTER_TEAMS_HEADERS,
  dataSchema: REGISTER_TEAMS_SCHEMA,
  columns: REGISTER_TEAMS_COLUMNS,
  type: TEAM_CONTEXT_TYPE,
  registerMethod: TEAM_REGISTER_METHOD_TYPE,
  updateMethod: TEAM_UPDATE_METHOD_TYPE,
  removeMethod: TEAM_REMOVE_METHOD_TYPE,
  transformCollectionToTableData: function(tournament) {
    return _.map(tournament.teams, function(team) {
      var newTeam = {};
      newTeam.name = team.name;
      newTeam.institution = team.institution;
      newTeam.debater1 = team.debaters[0].name;
      newTeam.debater2 = team.debaters[1].name;
      newTeam.guid = team.guid;

      return newTeam;
    });
  },
  transformTableDataToCollection: function(tableData) {
    var collectionTeam = {};

    if(tableData.guid) {
      collectionTeam.guid = tableData.guid;
    }
    collectionTeam.name = tableData.name;
    collectionTeam.institution = tableData.institution;
    collectionTeam.debaters = [{name: tableData.debater1}, {name: tableData.debater2}];

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
  transformCollectionToTableData: function(tournament) {
    return _.map(tournament.judges, function(judge) {
      var newJudge = {};
      newJudge.name = judge.name;
      newJudge.institution = judge.institution;
      newJudge.guid = judge.guid;

      return newJudge;
    });
  },
  transformTableDataToCollection: function(tableData) {
    var collectionJudge = {};

    if(tableData.guid) {
      collectionJudge.guid = tableData.guid;
    }
    collectionJudge.name = tableData.name;
    collectionJudge.institution = tableData.institution;

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
  transformCollectionToTableData: function(tournament) {
    return _.map(tournament.rooms, function(room) {
      return {location: room};
    });
  },
  transformTableDataToCollection: function(tableData) {
    return tableData.location;
  }
};

ManagementPageContainer = ReactMeteor.createClass({
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
      enablePublicRegistration: Session.get("enablePublicRegistration")
    };
  },

  render: function() {
    if(!this.state.tournament || this.state.tournament.rooms.length <= 0) {
      return <RegistrationContainer tournament={this.state.tournament} />;
    }
    else {
      return <TournamentManagementContainer tournament={this.state.tournament} />
    }
  }
});

var RegistrationContainer = ReactMeteor.createClass({
  getMeteorState: function() {
    return {
      enablePublicRegistration: Session.get("enablePublicRegistration")
    };
  },

  renderRegistrationTable: function(context) {
    return <RegistrationHotContainer context={context} />;
  },

  render: function() {
    if(!this.props.tournament) {
      // render tournament registration form.
      return (
        <div>
          <Header />
          <TournamentRegistrationForm />
        </div>
      );
    }
    else {
      // render registration tables accordingly.
      var enablePublicRegistrationState = Session.get("enablePublicRegistration");

      if(enablePublicRegistrationState === undefined) {
        // Render choosing.
        return <PublicRegistrationChooser />;
      }
      else if(enablePublicRegistrationState === true) {
        // render rooms table.
        return this.renderRegistrationTable(ROOM_CONTEXT);
      }
      else if(enablePublicRegistrationState === false) {
        if(this.props.tournament.teams.length <= 0) {
          return this.renderRegistrationTable(TEAM_CONTEXT);
        }
        if(this.props.tournament.judges.length <= 0) {
          return this.renderRegistrationTable(JUDGE_CONTEXT);
        }
        if(this.props.tournament.rooms.length <= 0) {
          return this.renderRegistrationTable(ROOM_CONTEXT);
        }
        // Render success with timeout here.
      }
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
    if(this.state.currentUser) {
      name = this.state.currentUser.profile.name;
    }
    return (
      <h1>Welcome, {name}</h1>
    );
  }
});

var PublicRegistrationChooser = ReactMeteor.createClass({
  handleYes: function() {
    Meteor.call("enablePublicRegistration", function(err, result) {
      if(err) {
        // TODO
        alert(err.reason);
      }
      else {
        Session.set("enablePublicRegistration", result);
      }
    })
  },

  handleNo: function() {
    Session.set("enablePublicRegistration", false);
  },

  render: function() {
    return (
      <div>
        <h2>Would you like to allow debaters and judges to register themselves?</h2>
        <br />
        <button onClick={this.handleYes}>Yes please. Skip to registering rooms.</button>
        <button onClick={this.handleNo}>No thanks. I want to register them myself now.</button>
      </div>
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
        // EDGE CASE: If session is already defined, we want to clear it.
        Session.set("enablePublicRegistration", undefined);
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

var RegistrationHotContainer = ReactMeteor.createClass({
  getMeteorState: function() {
    // TODO
  },

  componentDidMount: function() {
    if(!this.hot) {
      this.initializeHot(this.props.context);
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.hot) {
      // TODO: We may want to have a more performant way to render the new table.
      this.hot.destroy();
      this.hot = undefined;
    }
    this.initializeHot(nextProps.context);
  },

  initializeHot: function(context) {
    var tableData = context.data || [];

    this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
      data: tableData,
      minCols: context.colHeaders.length,
      startCols: context.colHeaders.length,
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: context.colHeaders,
      contextMenu: true,
      allowRemoveColumn: false,
      dataSchema: context.dataSchema,
      columns: context.columns
    });
  },

  handleSave: function(e) {
    // TODO: Check for sanitize condition.
    // TODO: Refactor logic out to something that specializes in
    //        schema transformation.

    var data = this.hot.getData();

    var dataWithoutEmptyRows = _.filter(data, function(rowData, index) {
        return !this.hot.isEmptyRow(index);
    }.bind(this));

    var contextType = this.props.context.type;
    switch(contextType) {
      case TEAM_CONTEXT_TYPE:
        registerTeams(dataWithoutEmptyRows);
        break;
      case JUDGE_CONTEXT_TYPE:
        registerJudges(dataWithoutEmptyRows);
        break;
      case ROOM_CONTEXT_TYPE:
        registerRooms(dataWithoutEmptyRows);
        break;
    }

    function registerTeams(unsanitizedFlattenedTeams) {
      var teams = _.map(unsanitizedFlattenedTeams, function(team) {
        var schemaTeam = {};
        schemaTeam.name = team.name;
        schemaTeam.institution = team.institution;
        schemaTeam.debaters = [{name: team.debater1}, {name: team.debater2}];

        return schemaTeam;
      });

      Meteor.call("registerTeams", teams, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    }

    function registerJudges(unsanitizedJudges) {
      Meteor.call("registerJudges", unsanitizedJudges, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    }

    function registerRooms(unsanitizedRooms) {
      var rooms = _.map(unsanitizedRooms, function(room) {
        return room.location;
      });


      Meteor.call("registerRooms", rooms, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    }
  },

  render: function() {
    return (
      <div>
        <div className="handsontable" ref="handsontable"></div>
        <br />
        <button className="ui positive button" onClick={this.handleSave}>Save</button>
      </div>
    );
  }
});

var TournamentManagementContainer = ReactMeteor.createClass({
  getMeteorState: function() {
    return {
      containerContext: Session.get("containerContext")
    };
  },

  switchContainerContext: function(context) {
    Session.set("containerContext", context);
  },

  renderAccordingToContext: function(context) {
    var contextType = TEAM_CONTEXT;
    switch(context) {
      case "team":
        contextType = TEAM_CONTEXT;
        break;
      case "judge":
        contextType = JUDGE_CONTEXT;
        break;
      case "room":
        contextType = ROOM_CONTEXT;
        break;
    }

    return <ManagementHotContainer context={contextType} />;
  },

  render: function() {
    var content = this.renderAccordingToContext(this.state.containerContext);
    return (
      <div>
        <div className="row">
          <div className="ui menu">
            <div tabIndex="-1" className="ui simple pointing dropdown link item">
              <i tabIndex="0" className="dropdown icon"></i>
              <span className="text">Management</span>
              <div tabIndex="-1" className="menu">
                <div className="item" onClick={this.switchContainerContext.bind(this, "team")}>Teams</div>
                <div className="item" onClick={this.switchContainerContext.bind(this, "judge")}>Judges</div>
                <div className="item" onClick={this.switchContainerContext.bind(this, "room")}>Rooms</div>
              </div>
            </div>
            <div className="item">Round 1 TODO</div>
            <div className="item">Round 2 TODO</div>
          </div>
        </div>
        <br /><br />
        <div className="row">
          {content}
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

  componentDidMount: function() {
    if(!this.hot) {
      this.initializeHot(this.props.context);
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    if(!this.hot || !_.isEqual(this.props, nextProps)) {
      return true;
    }

    // Only update if our table data AND current state is out of sync with nextState.
    // Updating serves only one purpose: To loadData to the table.

    // Why check for both conditions: Because this can be called even if
    // current state === nextState.
    var tableData = _.filter(this.hot.getData(), function(rowData, index) {
        return !this.hot.isEmptyRow(index);
    }.bind(this));

    return !_.isEqual(tableData, this.props.context.transformCollectionToTableData(nextState.tournament))
      && !_.isEqual(this.state, nextState);
  },

  componentDidUpdate: function (prevProps, prevState) {
    if(!this.hot) {
      this.initializeHot(this.props.context);
    }
    else{
      if(_.isEqual(this.props, prevProps)) {
        this.hot.loadData(this.props.context.transformCollectionToTableData(this.state.tournament));
      }
      else {
        this.hot.destroy();
        this.hot = undefined;
        this.initializeHot(this.props.context);
      }
    }
  },

  initializeHot: function(context) {
    var componentThis = this;
    var tableData = this.props.context.transformCollectionToTableData(this.state.tournament);
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
      dataSchema: context.dataSchema,
      columns: context.columns,
      afterChange: function(changes, source) {
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
              var collectionToSend = context.transformTableDataToCollection(data);

              Meteor.call(context.updateMethod, collectionToSend, function(err, result) {
                // TODO
                if(err) {
                  alert(err);
                }
              });
            }
            else {
              var collectionToSend = [context.transformTableDataToCollection(data)];
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
          return !this.isEmptyRow(rowIndex);
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
              var collectionToSend = context.transformTableDataToCollection(data);
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
        <div className="handsontable" ref="handsontable"></div>

        {/*UI for the Modal we will render*/}
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Warning
          </div>
          <div className="content">
            <div className="description">
              Are you sure you want to delete a registered team?
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