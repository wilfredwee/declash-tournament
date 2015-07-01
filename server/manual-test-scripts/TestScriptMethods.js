Meteor.methods({
  testScriptAddResultToAllTeamsForRound: function(tournamentId, teams) {
    if(process.env.NODE_ENV === "development") {
      Tournaments.update({_id: tournamentId}, {$set: {"teams": teams}});
    }
  }
});
