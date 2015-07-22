"use strict";
/* global Tournaments */
var SchemaHelpers;
Meteor.startup(function() {
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
});


DeclashApp.client.templates.pages.PublicTournamentPageContainer = (function() {
  var PublicTournamentPageContainer = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui stackable center aligned container grid">
          <div className="column">
            <TournamentPageBody urlId={this.props.tournamentUrlId} />
          </div>
        </div>
      );
    }
  });

  var TournamentPageBody = ReactMeteor.createClass({
    render: function() {
      var tournament = SchemaHelpers.populateRoundsForPublic(Tournaments.findOne({urlId: this.props.urlId}));

      if(!tournament) {
        return false;
      }

      var participantRegistration;
      if(tournament.enablePublicRegistration === true) {
        participantRegistration = (
          <div className="row">
            <a
              className="ui primary button"
              href={window.location.origin + "/registerParticipants/" + tournament._id}
            >
              Register As A Participant
            </a>
          </div>
        );
      }

      return (
            <div>
              <div className="row">
                <h1>{tournament.name}</h1>
              </div>
              <br />
              <br />
              {participantRegistration}
              <br />
              {_.map(tournament.rounds, function(round, index) {
                return (
                  <div key={index}>
                  <div className="row">
                    <a
                      className="ui primary button"
                      href={window.location.origin + "/tournaments/" + this.props.urlId + "/" + round.index.toString()}
                    >
                      View Round {round.index + 1}
                    </a>
                  </div>
                  <br />
                  </div>
                );
              }.bind(this))}
          </div>
      );
    }
  });

  return PublicTournamentPageContainer;

})();
