/** @jsx React.DOM */

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