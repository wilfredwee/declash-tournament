Meteor.methods({
  enablePublicRegistration: function() {
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(tournament._id, {$set: {enablePublicRegistration: true}});

    return true;
  },

  removeTeam: function(teamGuid) {
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(tournament._id, {$pull: {teams: {guid: teamGuid}}});
  },

  updateTeam: function(team) {
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(
      {_id: tournament._id, "teams.guid": team.guid},
      {$set: {
        "teams.$.name": team.name,
        "teams.$.institution": team.institution,
        "teams.$.debaters.0.name": team.debaters[0].name,
        "teams.$.debaters.1.name": team.debaters[1].name
      }}
    );
  }
});