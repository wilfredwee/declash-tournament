// We need to have a better way to check() things.

Meteor.methods({
  registerTabUser: function(options) {
    check(options, Object);
    check(options.email, String);
    check(options.password, String);
    check(options.profile, Object);
    check(options.profile.name, String);
    check(options.profile.institution, String);
    check(options.profile.isAdmin, Boolean);

    user = Accounts.createUser(options);

    return user;
  },

  registerTournament: function(tournament) {
    check(tournament, {
        name: String,
        style: String, 
        maxUsers: Number
    });

    tournament.ownerId = this.userId;
    tournament.createdAt = new Date();
    tournament.paymentVerified = false;
    tournament.finished = false;

    Tournaments.insert(tournament);

    return tournament;
  }
});
