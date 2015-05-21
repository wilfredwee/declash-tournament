var REGISTER_TEAMS_HEADERS = ["Team Name", "Institution", "Debater 1", "Debater 2"];
var REGISTER_TEAMS_SCHEMA = {teamName: null, institution: null, debater1: null, debater2: null};
var REGISTER_TEAMS_COLUMNS = [{data: "teamName"}, {data: "institution"}, {data: "debater1"}, {data: "debater2"}];

var REGISTER_JUDGES_HEADERS = ["Judge Name", "Institution"];
var REGISTER_JUDGES_SCHEMA = {name: null, institution: null};
var REGISTER_JUDGES_COLUMNS = [{data: "name"}, {data: "institution"}];

var REGISTER_ROOMS_HEADERS = ["Room Location"];
var REGISTER_ROOMS_SCHEMA = {location: null};
var REGISTER_ROOMS_COLUMNS = [{data: "location"}];

var TEAM_CONTEXT_TYPE = "team";
var JUDGE_CONTEXT_TYPE = "judge";
var ROOM_CONTEXT_TYPE = "room";

var TEAM_CONTEXT = {
  colHeaders: REGISTER_TEAMS_HEADERS,
  dataSchema: REGISTER_TEAMS_SCHEMA,
  columns: REGISTER_TEAMS_COLUMNS,
  type: TEAM_CONTEXT_TYPE
};

var JUDGE_CONTEXT = {
  colHeaders: REGISTER_JUDGES_HEADERS,
  dataSchema: REGISTER_JUDGES_SCHEMA,
  columns: REGISTER_JUDGES_COLUMNS,
  type: JUDGE_CONTEXT_TYPE
};

var ROOM_CONTEXT = {
  colHeaders: REGISTER_ROOMS_HEADERS,
  dataSchema: REGISTER_ROOMS_SCHEMA,
  columns: REGISTER_ROOMS_COLUMNS,
  type: ROOM_CONTEXT_TYPE
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
        schemaTeam.name = team.teamName;
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
    switch(context) {
      case "team":
        return <ManagementHotContainer context={TEAM_CONTEXT} />;
        break;
    }
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

  componentDidUpdate: function (prevProps, prevState) {
      console.log("I did update huh.");
  },

  initializeHot: function(context) {
    function transformCollectionToTableData(tournament) {
      return _.map(tournament.teams, function(team) {
        var newTeam = {};
        newTeam.teamName = team.name;
        newTeam.institution = team.institution;
        newTeam.debater1 = team.debaters[0].name;
        newTeam.debater2 = team.debaters[1].name;
        newTeam.guid = team.guid;

        return newTeam;
      });
    }

    var tableData = transformCollectionToTableData(this.state.tournament);
    var allowRemoveRow = false;

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
      columns: context.columns,
      afterChange: function(changes, source) {
        if(source !== "loadData") {
          _.each(changes, function(change) {

          });
          console.log(changes);
          // Meteor.call("registerTeams", [{
          //   name: "auto test",
          //   institution: "auto inst test",
          //   debaters: [
          //     {name: "auto deb 1 test"},
          //     {name: "auto deb 2 test"}
          //   ]
          // }]);
        }
      },
      beforeRemoveRow: function(index, amount) {
        var thisTable = this;

        if(allowRemoveRow === true) {
          for(var i=index; i<(index+amount); i++) {
            var guid = this.getSourceDataAtRow(i).guid;
            if(guid) {
              Meteor.call("removeTeam", guid, function(err, result) {
                // TODO
                if(err) {
                  alert(err);
                }
              });
            }
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