"use strict";

DeclashApp.client.templates.pages.ParticipantRegistrationPageContainer = (function() {
  var REGISTRATION_STATES = {
    choosing: "choosing",
    registerTeam: "registerTeam",
    registerJudge: "registerJudge",
    success: "success"
  };

  var ParticipantRegistrationPageContainer = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui stackable container grid">
          <div className="column">
            <ParticipantRegistrationPageBody tournamentId={this.props.tournamentId} />
          </div>
        </div>
      );
    }
  });

  var ParticipantRegistrationPageBody = ReactMeteor.createClass({
    getMeteorState: function() {
      var registrationState = Session.get("registrationState") || REGISTRATION_STATES.choosing;
      return {
        registrationState: registrationState
      };
    },

    changeState: function(registrationState) {
      Session.set("registrationState", registrationState);
    },

    render: function() {
      switch(this.state.registrationState) {
        case REGISTRATION_STATES.choosing:
          return <ParticipantTypeChooser updateParentState={this.changeState} />;
        case REGISTRATION_STATES.registerTeam:
          return <TeamRegistrationForm updateParentState={this.changeState} tournamentId={this.props.tournamentId} />;
        case REGISTRATION_STATES.registerJudge:
          return <JudgeRegistrationForm updateParentState={this.changeState} tournamentId={this.props.tournamentId} />;
        case REGISTRATION_STATES.success:
          return <Success />;
      }
    }
  });

  var ParticipantTypeChooser = ReactMeteor.createClass({
    handleRegisterTeam: function() {
      Session.set("registrationState", REGISTRATION_STATES.registerTeam);
    },

    handleRegisterJudge: function() {
      Session.set("registrationState", REGISTRATION_STATES.registerJudge);
    },

    render: function() {
      return (
        <div className="row">
          <button onClick={this.handleRegisterTeam}>Register As A Team</button>
          <button onClick={this.handleRegisterJudge}>Register As A Judge</button>
        </div>
      );
    }
  });

  var TeamRegistrationForm = ReactMeteor.createClass({
    handleSubmit: function(e) {
      e.preventDefault();

      var teamName = React.findDOMNode(this.refs.teamName).value.trim();
      var institutionName = React.findDOMNode(this.refs.institutionName).value.trim();
      var debaterName1 = React.findDOMNode(this.refs.debaterName1).value.trim();
      var debaterName2 = React.findDOMNode(this.refs.debaterName2).value.trim();

      // registerTeams expect an array.
      var team = [{
        name: teamName,
        institution: institutionName,
        debaters: [{name: debaterName1}, {name: debaterName2}]
      }];

      Meteor.call("registerTeams", team, this.props.tournamentId, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
        else {
          Session.set("registrationState", REGISTRATION_STATES.success);
        }
      });

    },

    render: function() {
      return (
        <form className="ui form TeamRegistrationForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Your Team Name" ref="teamName" />
          <input type="text" placeholder="Your Team's Institution Name" ref="institutionName" />
          <input type="text" placeholder="Debater Name 1" ref="debaterName1" />
          <input type="text" placeholder="Debater Name 2" ref="debaterName2" />
          <input type="submit" className="ui submit button" value="Register" />
        </form>
      );
    }
  });

  var JudgeRegistrationForm = ReactMeteor.createClass({
    handleSubmit: function(e) {
      e.preventDefault();

      var name = React.findDOMNode(this.refs.name).value.trim();
      var institutionName = React.findDOMNode(this.refs.institutionName).value.trim();

      // registerJudges expect an array.
      var judge = [{
        name: name,
        institution: institutionName
      }];

      Meteor.call("registerJudges", judge, this.props.tournamentId, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
        else {
          Session.set("registrationState", REGISTRATION_STATES.success);
        }
      });
    },

    render: function() {
      return (
        <form className="ui form JudgeRegistrationForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Your Name" ref="name" />
          <input type="text" placeholder="Your Institution's Name" ref="institutionName" />
          <input type="submit" className="ui submit button" value="Register" />
        </form>
      );
    }
  });

  var Success = ReactMeteor.createClass({
    render: function() {
      return <h1>Yay! Success!</h1>;
    }
  });

  return ParticipantRegistrationPageContainer;
})();
