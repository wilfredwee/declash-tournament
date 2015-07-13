"use strict";
/* global Tournaments */

DeclashApp.client.templates.pages.TournamentListPageContainer = (function() {
  var TournamentListPageContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        // We further specify the constraint here to prevent confusion from the admins.
        tournaments: Tournaments.find({enablePublicView: true}).fetch()
      };
    },

    render: function() {
      return (
        <div className="ui stackable container grid">
          <div className="column">
            <div className="row">
              <h1 className="ui header">Active Tournaments</h1>
            </div>
            <div className="row">
              <div className="ui selection list">
                {_.map(this.state.tournaments, function(tournament, index) {
                  return (
                    <a className="item" key={index} href={"tournaments/" + tournament.urlId}>
                      {tournament.name}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      );
    }
  });

  return TournamentListPageContainer;
})();
