"use strict";
/* global Tournaments */

// Initialize variables from DeclashApp namespace.
var TournamentRegistrationForm;
var TournamentManagementContainer;
Meteor.startup(function() {
  TournamentRegistrationForm = DeclashApp.client.templates.TournamentRegistrationForm;
  TournamentManagementContainer = DeclashApp.client.templates.TournamentManagementContainer;
});

DeclashApp.client.templates.pages.ManagementPageContainer = (function() {
  var ManagementPageContainer = ReactMeteor.createClass({
    render: function() {
      return <ManagementBody />;
    }
  });

  var ManagementBody = ReactMeteor.createClass({
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

  return ManagementPageContainer;
})();




