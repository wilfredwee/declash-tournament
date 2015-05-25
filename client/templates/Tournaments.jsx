TournamentListPageContainer = ReactMeteor.createClass({
  startMeteorSubscriptions: function() {
    Meteor.subscribe("unfinishedTournaments");
  },

  getMeteorState: function() {
    return {
      tournaments: Tournaments.find({enablePublicRegistration: true})
    };
  },

  render: function() {
    return (
      <div className="ui selection list">
        {this.state.tournaments.map(function(tournament, index) {
          return (
            <a className="item" key={index} href={"registerParticipants/" + tournament._id}>
              {tournament.name}
            </a>
          );
        })}
      </div>
    );
  }
});