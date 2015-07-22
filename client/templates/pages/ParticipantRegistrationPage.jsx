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
        <div className="ui middle aligned centered grid registerparticipant">
          <div className="column">
            <ParticipantRegistrationPageBody tournamentId={this.props.tournamentId} />
          </div>
        </div>
      );
    }
  });

  var ParticipantRegistrationPageBody = ReactMeteor.createClass({
    getInitialState: function() {
      return {
        "registrationState": REGISTRATION_STATES.choosing
      };
    },

    changeState: function(registrationState) {
      this.setState({
        "registrationState": registrationState
      });
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
          return <Success updateParentState={this.changeState} />;
      }
    }
  });

  var ParticipantTypeChooser = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui fluid buttons">
          <button className="ui primary button"
            onClick={this.props.updateParentState.bind(null, REGISTRATION_STATES.registerTeam)}
          >
          Register As A Team
          </button>
          <div className="or" />
          <button className="ui positive button"
            onClick={this.props.updateParentState.bind(null, REGISTRATION_STATES.registerJudge)}
          >
          Register As A Judge
          </button>
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

      var self = this;
      Meteor.call("registerTeams", team, this.props.tournamentId, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
        else {
          self.props.updateParentState(REGISTRATION_STATES.success);
        }
      });

    },

    render: function() {
      return (
        <form className="ui form TeamRegistrationForm" onSubmit={this.handleSubmit}>
          <h3 className="ui header">Registering a Team</h3>
          <div className="field">
            <label>Team Name</label>
            <input type="text" placeholder="Your Team Name" ref="teamName" />
          </div>
          <div className="field">
            <label>Institution Name</label>
            <input type="text" placeholder="Your Team's Institution Name" ref="institutionName" />
          </div>
          <div className="field">
            <label>{"Debaters'"} Name</label>
            <input type="text" placeholder="Debater Name 1" ref="debaterName1" />
            <input type="text" placeholder="Debater Name 2" ref="debaterName2" />
          </div>
          <input type="submit" className="ui primary button" value="Register" />
          <br />
          <a href="" onClick={this.props.updateParentState.bind(null, REGISTRATION_STATES.choosing)}>Back</a>
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

      var self = this;
      Meteor.call("registerJudges", judge, this.props.tournamentId, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
        else {
          self.props.updateParentState(REGISTRATION_STATES.success);
        }
      });
    },

    render: function() {
      return (
        <form className="ui form JudgeRegistrationForm" onSubmit={this.handleSubmit}>
          <h3 className="ui header">Registering a Judge</h3>
          <div className="field">
            <label>Name</label>
            <input type="text" placeholder="Your Name" ref="name" />
          </div>
          <div className="field">
            <label>Institution Name</label>
            <input type="text" placeholder="Your Institution's Name" ref="institutionName" />
          </div>
          <input type="submit" className="ui positive button" value="Register" />
          <br />
          <a href="" onClick={this.props.updateParentState.bind(null, REGISTRATION_STATES.choosing)}>Back</a>
        </form>
      );
    }
  });

  var Success = ReactMeteor.createClass({
    render: function() {
      return (
        <div>
          <h1>Registration Done!</h1>
          <br />
          <a href="" onClick={this.props.updateParentState.bind(null, REGISTRATION_STATES.choosing)}>Back</a>
        </div>
      );
    }
  });

  return ParticipantRegistrationPageContainer;
})();
