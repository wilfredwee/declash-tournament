Meteor.methods({
  enablePublicRegistration: function() {
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(tournament._id, {$set: {enablePublicRegistration: true}});

    return true;
  },

  removeTeam: function(teamGuid) {
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(tournament._id, {$pull: {teams: {guid: teamGuid}}});
  }
});