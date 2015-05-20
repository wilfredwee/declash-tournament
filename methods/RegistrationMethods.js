// A good-enough guid generator.
var createGuid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
    s4() + "-" + s4() + s4() + s4();
};

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


    Tournaments.insert(tournament);

    return tournament;
  },

  registerTeams: function(teams, tournamentId) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.

    var tournamentId = tournamentId || Tournaments.findOne({ownerId: this.userId, finished: false})._id;

    var validTeams = _.map(teams, function(team) {
        team.guid = createGuid();
        team.resultForRound = {};
        team.roleForRound = {};
        team.isActiveForRound = {};

        team.debaters = _.map(team.debaters, function(debater) {
            debater.scoreForRound = {};

            return debater;
        });

        return team;
    }.bind(this));

    Tournaments.update(tournamentId, {$push: {teams: {$each: validTeams}}});
  },

  registerJudges: function(judges, tournamentId) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.
    var tournamentId = tournamentId || Tournaments.findOne({ownerId: this.userId, finished: false})._id;

    _.each(judges, function(judge) {
      judge.guid = createGuid();
      judge.isChairForRound = {};
    });

    Tournaments.update(tournamentId, {$push: {judges: {$each: judges}}});

  },

  registerRooms: function(rooms) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(tournament._id, {$push: {rooms: {$each: rooms}}});
  }
});
