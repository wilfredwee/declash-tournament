Meteor.publish("unfinishedTournaments", function() {
  if(this.userId) {
    return Tournaments.find({finished: false});
  }
  return Tournaments.find({finished: false, enablePublicRegister: true});
});
