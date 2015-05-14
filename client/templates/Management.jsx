/** @jsx React.DOM */

var REGISTER_TEAMS_HEADERS = ["Team Name", "Institution", "Debater 1", "Debater 2"];
var REGISTER_TEAMS_SCHEMA = {teamName: null, institution: null, debater1: null, debater2: null};

var ManagementBody = ReactMeteor.createClass({
  templateName: "ManagementBody",

  startMeteorSubscriptions: function() {
    Meteor.subscribe("unfinishedTournaments");
  },

  getMeteorState: function() {
    var tournament = Tournaments.findOne({ownerId: Meteor.userId()});
    return {
      tournament: tournament
    };
  },

  render: function() {
    var headerNode = <div className="ManagementHeader"><Header /></div>;
    if(this.state.tournament) {
      return (
        <div>
          {headerNode}
          <h1>You are now managing {this.state.tournament.name}</h1>
          <HandsOnTableContainer colHeaders={REGISTER_TEAMS_HEADERS} dataSchema={REGISTER_TEAMS_SCHEMA}  tournament={this.state.tournament}/>
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

  handleSave: function(e) {
    var flattenedTeams = this.refs.hotComponent.getData();



    var teams = _.map(flattenedTeams, function(team) {
      var schemaTeam = {};
      schemaTeam.name = team.teamName;
      schemaTeam.institution = team.institution;
      schemaTeam.debaters = [team.debater1, team.debater2];

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
        <HandsOnTableComponent
          ref="hotComponent"
          data={this.props.data} 
          colHeaders={this.props.colHeaders} 
          dataSchema={this.props.dataSchema} 
        />
        <br />
        <button className="ui positive button" onClick={this.handleSave}>Save</button>
      </div>
    );
  }
});

var HandsOnTableComponent = ReactMeteor.createClass({
  getMeteorState: function() {
    // TODO
  },

  initializeHot: function(data, colHeaders, dataSchema) {
    var tableData = data || [];

    this.hot = new Handsontable(this.getDOMNode(), {
      data: tableData,
      minCols: colHeaders.length,
      startRows: 5,
      startCols: colHeaders.length,
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: colHeaders,
      contextMenu: true,
      allowRemoveColumn: false,
      dataSchema: dataSchema
    });
  },

  getData: function() {
    var unsanitizedData = this.hot.getData();

    unsanitizedData.pop();

    return unsanitizedData;
  },

  componentDidMount: function() {
    if(!this.hot) {
      this.initializeHot(this.props.data, this.props.colHeaders, this.props.dataSchema);
    }
  },

  render: function() {
    return (
      <div className="handsontablecomponent"></div>
    );
  }
});