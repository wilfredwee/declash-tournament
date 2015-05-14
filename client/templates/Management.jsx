var REGISTER_TEAMS_HEADERS = ["Team Name", "Institution", "Debater 1", "Debater 2"];
var REGISTER_TEAMS_SCHEMA = {teamName: null, institution: null, debater1: null, debater2: null};
var REGISTER_TEAM_COLUMNS = [{data: "teamName"}, {data: "institution"}, {data: "debater1"}, {data: "debater2"}];


var ManagementBody = ReactMeteor.createClass({
  templateName: "ManagementBody",

  startMeteorSubscriptions: function() {
    Meteor.subscribe("unfinishedTournaments");
  },

  getMeteorState: function() {
    return {
      tournament: Tournaments.findOne({ownerId: Meteor.userId()})
    };
  },

  renderRegistrationTable: function(colHeaders, dataSchema, columns) {
    return (<HandsOnTableContainer 
              colHeaders={colHeaders}
              dataSchema={dataSchema}
              columns={columns}
              tournament={this.state.tournament}
            />);
  },

  render: function() {
    var headerNode = <div className="ManagementHeader"><Header /></div>;
    if(this.state.tournament) {
      var tournamentNameHeader = <h1>You are now managing {this.state.tournament.name}</h1>;
      var contentToRender;

      if(this.state.tournament.teams.length <= 0) {
        contentToRender = this.renderRegistrationTable(
          REGISTER_TEAMS_HEADERS,
          REGISTER_TEAMS_SCHEMA,
          REGISTER_TEAM_COLUMNS);
      }
      else {
        // TODO
        contentToRender = <div></div>;
      }

      return (
        <div>
          {headerNode}
          {tournamentNameHeader}
          {contentToRender}
        </div>
      );
    }
    else {
      return (
        <div>
          {headerNode}
          <TournamentRegistrationForm></TournamentRegistrationForm>
        </div>
      );
    }
  }
});

var Header = ReactMeteor.createClass({
  templateName: "ManagementHeader",

  startMeteorSubscriptions: function() {
    Meteor.subscribe("tabUsers");
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

var TournamentRegistrationForm = ReactMeteor.createClass({
  templateName: "TournamentRegistrationForm",

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

var HandsOnTableContainer = ReactMeteor.createClass({
  getMeteorState: function() {
    // TODO
  },

  componentDidMount: function() {
    if(!this.hot) {
      this.initializeHot();
    }
  },

  initializeHot: function() {
    var tableData = this.props.data || [];

    this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
      data: tableData,
      minCols: this.props.colHeaders.length,
      startRows: 5,
      startCols: this.props.colHeaders.length,
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: this.props.colHeaders,
      contextMenu: true,
      allowRemoveColumn: false,
      dataSchema: this.props.dataSchema,
      columns: this.props.columns
    });
  },

  handleSave: function(e) {
    // TODO: Check for sanitize condition.
    // TODO: Refactor logic out to something that specializes in
    //        schema transformation.

    var unsanitizedFlattenedTeams = this.hot.getData();
    unsanitizedFlattenedTeams.pop();

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