"use strict";
/* global Tournaments */

DeclashApp.client.templates.pages.PublicTournamentPageContainer = (function() {
  var PublicTournamentPageContainer = ReactMeteor.createClass({
    render: function() {
      return <TournamentPageBody urlId={this.props.tournamentUrlId} />;
    }
  });

  var TournamentPageBody = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        tournament: Tournaments.findOne({urlId: this.props.urlId})
      };
    },

    render: function() {
      if(!this.state.tournament) {
        return false;
      }

      var participantRegistration;
      if(this.state.tournament.enablePublicRegistration === true) {
        participantRegistration = (
          <div className="row">
            <a className="ui primary button" href={window.location.origin + "/registerParticipants/" + this.state.tournament._id}>Register As A Participant</a>
          </div>
        );
      }

      return (
        <div className="ui stackable column grid">
          <div className="column">
            <div className="row">
              <h1>{this.state.tournament.name}</h1>
            </div>
            <br />
            <br />
            {participantRegistration}
          </div>
        </div>
      );
    }
  });

  return PublicTournamentPageContainer;

})();
