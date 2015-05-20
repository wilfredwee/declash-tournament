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
    tournament.enablePublicRegistration = false;
    tournament.teams = [];
    tournament.judges = [];
    tournament.rooms = [];
    tournament.rounds = [];


    Tournaments.insert(tournament);

    return tournament;
  },

  registerTeams: function(teams, tournamentId) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.

    var tournament = tournamentId?
      Tournaments.findOne({_id: tournamentId, finished: false})
      :Tournaments.findOne({ownerId: this.userId, finished: false})._id;

    if(!tournament) {
      throw new Meteor.Error("invalidAction", "Unable to find the tournament you're looking for.");
    }
    else if(!tournament.enablePublicRegister) {
      throw new Meteor.Error("invalidAction", "You cannot register for this tournament.");
    }
    else if(!this.userId && teams.length > 1) {
      throw new Meteor.Error("throttleAction", "Please register only one at a time.");
    }

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

    Tournaments.update(tournament._id, {$push: {teams: {$each: validTeams}}});
  },

  registerJudges: function(judges, tournamentId) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.
    var tournament = tournamentId?
      Tournaments.findOne({_id: tournamentId, finished: false})
      :Tournaments.findOne({ownerId: this.userId, finished: false})._id;

    if(!tournament) {
      throw new Meteor.Error("invalidAction", "Unable to find the tournament you're looking for.");
    }
    else if(!tournament.enablePublicRegister) {
      throw new Meteor.Error("invalidAction", "You cannot register for this tournament.");
    }
    else if(!this.userId && judges.length > 1) {
      throw new Meteor.Error("throttleAction", "Please register only one at a time.");
    }

    _.each(judges, function(judge) {
      judge.guid = createGuid();
      judge.isChairForRound = {};
    });

    Tournaments.update(tournament._id, {$push: {judges: {$each: judges}}});

  },

  registerRooms: function(rooms) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    Tournaments.update(tournament._id, {$push: {rooms: {$each: rooms}}});
  }
});
