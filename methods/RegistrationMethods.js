// We need to have a better way to check() things.

Meteor.methods({
  registerTabUser: function(options) {
    check(options, Object);
    check(options.email, String);
    check(options.password, String);
    check(options.profile, Object);
    check(options.profile.name, String);
    check(options.profile.institution, String);

    user = Accounts.createUser(options);

    Roles.addUsersToRoles(user, "tab");

    return user;
  },

  registerTournament: function(tournament) {
    tournament.ownerId = this.userId;
    tournament.createdAt = new Date();
    tournament.paymentVerified = false;
    tournament.finished = false;
    tournament.teams = [];
    tournament.judges = [];
    tournament.rooms = [];
    tournament.rounds = [];

    check(tournament, Tournaments.simpleSchema());

    Tournaments.insert(tournament);

    return tournament;
  },

  registerTeams: function(teams) {
    // Generate a good-enough guid.
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
        s4() + "-" + s4() + s4() + s4();
    }

    // INVARIANT: A single user can only have one unfinished tournament at a time.
    // check(tournamentId, String);
    // check(teams, Array);
    // _.each(teams, function(team) {
    //     check(team, {
    //         name: String,
    //         debaters: Array,
    //         institution: String
    //     });

    //     _.each(team.debaters, function(debater) {
    //         check(debater, {
    //             name: String
    //         });
    //     });
    // });
    
    check(arguments, [Match.Any]);

    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    var validTeams = _.map(teams, function(team) {
        team.guid = guid();
        team.resultForRound = {};

        team.debaters = _.map(team.debaters, function(debaterName) {
            var debater = {};

            debater.name = debaterName;
            debater.scoreForRound = {};

            return debater;
        });

        return team;
    }.bind(this));

    Tournaments.update(tournament._id, {$set: {teams: validTeams}});
  }
});
