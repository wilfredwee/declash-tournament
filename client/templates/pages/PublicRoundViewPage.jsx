"use strict";
/* global Tournaments */

var RoomComponent;
var SchemaHelpers;
Meteor.startup(function() {
  RoomComponent = DeclashApp.client.templates.RoomComponent;
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
});

DeclashApp.client.templates.pages.PublicRoundViewPageContainer = (function() {
  var PublicRoundViewPageContainer = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui stackable container grid">
          <div className="column">
           <RoundViewBody urlId={this.props.tournamentUrlId} roundIndex={this.props.roundIndex} />;
          </div>
        </div>
      );
    }
  });

  var RoundViewBody = ReactMeteor.createClass({
    renderRooms: function(tournament, roundIndex) {
      var schemaInjectedRound = SchemaHelpers.getSchemaInjectedRound(tournament, roundIndex);

      return _.map(schemaInjectedRound.rooms, function(room, index) {
        return <RoomComponent key={index} room={room} roundIndex={roundIndex} />;
      }.bind(this));
    },

    render: function() {
      var tournament = SchemaHelpers.populateTournamentForPublic(Tournaments.findOne({urlId: this.props.urlId}));
      var roundIndex = parseInt(this.props.roundIndex);

      if(!tournament) {
        return <h1>No Tournament Found </h1>;
      }

      var motionSegment = (
        <div className="ui blue segment">
          <div className="ui grid">
            <div className="column">
              <h4 className="ui header">Motion:</h4>
            </div>
          </div>
          <p>{tournament.rounds[roundIndex].motion}</p>
        </div>
      );

      return (
          <div>
          <div className="row">
            <h1 className="ui header">{tournament.name + ": Round " + (roundIndex + 1).toString()}</h1>
          </div>
          <div className="row">
            {motionSegment}
            <br />
            <br />
          </div>
          <div className="row">
            <div className="ui stackable three column grid">
              {this.renderRooms(tournament, roundIndex)}
            </div>
          </div>
          </div>
      );
    }
  });

  return PublicRoundViewPageContainer;
})();
