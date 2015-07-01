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
      return <RoundViewBody urlId={this.props.tournamentUrlId} roundIndex={this.props.roundIndex} />;
    }
  });

  var RoundViewBody = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        tournament: Tournaments.findOne({urlId: this.props.urlId}),
        roundIndex: parseInt(this.props.roundIndex)
      };
    },

    renderRooms: function() {
      var schemaInjectedRound = SchemaHelpers.getSchemaInjectedRound(this.state.tournament, this.state.roundIndex);

      return _.map(schemaInjectedRound.rooms, function(room, index) {
        return <RoomComponent key={index} room={room} roundIndex={this.state.roundIndex} />;
      }.bind(this));
    },

    render: function() {
      if(!this.state.tournament) {
        return <h1>No Tournament Found </h1>;
      }
      return (
        <div className="ui stackable three column grid">
          {this.renderRooms()}
        </div>
      );
    }
  });

  return PublicRoundViewPageContainer;
})();
