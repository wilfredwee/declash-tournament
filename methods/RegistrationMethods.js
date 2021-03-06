"use strict";
/* global Tournaments */
/* global Roles */

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

    var user = Accounts.createUser(options);

    if(Meteor.isServer) {
      Roles.addUsersToRoles(user, "tab");
    }

    return user;
  },

  registerTournament: function(tournament) {
    tournament.ownerId = this.userId;
    tournament.createdAt = new Date();
    tournament.paymentVerified = false;
    tournament.finished = false;
    tournament.enablePublicRegistration = false;
    tournament.enablePublicView = false;
    tournament.teams = [];
    tournament.judges = [];
    tournament.rooms = [];
    tournament.rounds = [];
    tournament.publicRounds = [];
    tournament.currentInvariantViolations = [];

    var urlId = tournament.name.toLowerCase().replace(" ", "-");

    var tournamentsWithSameUrl = Tournaments.find({urlId: urlId}).fetch();

    if(tournamentsWithSameUrl.length > 0) {
      var count = tournamentsWithSameUrl.length + 1;

      urlId = urlId + "-" + count.toString();
    }

    tournament.urlId = urlId;

    Tournaments.insert(tournament);

    return tournament;
  },

  registerTeams: function(teams, tournamentId) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.

    var tournament = tournamentId?
      Tournaments.findOne({_id: tournamentId, finished: false})
      :Tournaments.findOne({ownerId: this.userId, finished: false});

    if(!tournament) {
      throw new Meteor.Error("invalidAction", "Unable to find the tournament you're looking for.");
    }
    else if(!this.userId && !tournament.enablePublicRegistration) {
      throw new Meteor.Error("invalidAction", "You cannot register for this tournament.");
    }
    else if(!this.userId && teams.length > 1) {
      throw new Meteor.Error("throttleAction", "Please register only one at a time.");
    }

    var validTeams = _.map(teams, function(team) {
        team.guid = createGuid();
        team.resultForRound = {};
        team.roleForRound = {};
        team.isActiveForRound = (function() {
          var objBuilder = {};
          _.each(tournament.rounds, function(round) {
            if(round.state === "initial") {
              objBuilder[round.index.toString()] = true;
            }
            else {
              objBuilder[round.index.toString()] = false;
            }
          });

          return objBuilder;
        })();

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
      :Tournaments.findOne({ownerId: this.userId, finished: false});

    if(!tournament) {
      throw new Meteor.Error("invalidAction", "Unable to find the tournament you're looking for.");
    }
    else if(!this.userId && !tournament.enablePublicRegistration) {
      throw new Meteor.Error("invalidAction", "You cannot register for this tournament.");
    }
    else if(!this.userId && judges.length > 1) {
      throw new Meteor.Error("throttleAction", "Please register only one at a time.");
    }

    _.each(judges, function(judge) {
      judge.guid = createGuid();
      judge.isChairForRound = {};
      judge.isActiveForRound = (function() {
        var objBuilder = {};
        _.each(tournament.rounds, function(round) {
          if(round.state === "initial") {
            objBuilder[round.index.toString()] = true;
          }
          else {
            objBuilder[round.index.toString()] = false;
          }
        });

        return objBuilder;
      })();
      judge.rankForRound = {};
    });

    Tournaments.update(tournament._id, {$push: {judges: {$each: judges}}});
  },

  registerRooms: function(rooms) {
    // INVARIANT: A single user can only have one unfinished tournament at a time.
    var tournament = Tournaments.findOne({ownerId: this.userId, finished: false});

    if(_.uniq(rooms).length !== rooms.length) {
      throw new Meteor.Error("invalidAction", "You may not have duplicate rooms.");
    }

    Tournaments.update(tournament._id, {$set: {rooms: rooms}});

    var initialRound = _.find(tournament.rounds, function(round) {
      return round.state === "initial";
    });

    if(initialRound) {
      initialRound.rooms = _.map(rooms, function(roomString) {
        return {
          locationId: roomString,
          teams: [],
          judges: []
        };
      });

      Tournaments.update(
        {_id: tournament._id, "rounds.index": initialRound.index},
        {$set: {"rounds.$.rooms": initialRound.rooms}}
      );
    }
  }
});
