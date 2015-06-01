// This serves as a useful documentation of how entities in the application
// are expected to be constructed.

// Notes:
// 1. Rooms use their location string as their unique ID's.
// 2. Rounds use their index field as their unique ID's.
// 3. Teams must have a unique guid assigned on creation.

// This is important because other fields use this assumption to reference these fields.
// Any changes or updates must be done in ALL areas.
// (This is only likely to happen for Rooms for now.)

// 4. Currently, institution is just a String with no referential integrity.

var DebaterSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Debater name",
    max: 100
  },

  scoreForRound: {
    type: Object,
    label: "All scores for a debater. They are a key-value pair. Key:Round index. Value: score",
    blackbox: true
  }
});

var JudgeSchema = new SimpleSchema({
  guid: {
    type: String,
    label: "guid of a judge of a particular tournament."
  },

  name: {
    type: String,
    label: "Judge name.",
    max: 100
  },

  institution: {
    type: String,
    label: "Judge institution name.",
    max: 100
  },

  rankForRound: {
    type: Object,
    label: "All scores for a judge. They are a key-value pair. Key: Round index, Value: score",
    optional: true,
    blackbox: true
  },

  isActiveForRound: {
    type: Object,
    label: "All active status for a judge. They are a key-value pair. Key:Round index. Value: isActive(Boolean)",
    blackbox: true
  },

  isChairForRound: {
    type: Object,
    label: "All isChar for a judge. They are a key-value pair. Key:Round index, Value: score",
    blackbox: true
  }
});

var RoomSchema = new SimpleSchema({
  locationId: {
    type: String,
    label: "Location for a room.",
    max: 30
  },

  teams: {
    type: [String],
    label: "Teams guid in a particular room of a round.",
    minCount: 0
  },

  judges: {
    type: [String],
    label: "Judges guid in a particular room of a round.",
    minCount: 0
  },

  motion: {
    type:String,
    label: "Room-specific motions for a round.",
    max: 1000,
    optional: true
  }
});

var TeamSchema = new SimpleSchema({
  guid: {
    type: String,
    label: "guid of a team of a particular tournament."
  },

  name: {
    type: String,
    label: "Team name",
    max: 100
  },

  institution: {
    type: String,
    label: "Team institution name.",
    max: 100
  },

  debaters: {
    type: [DebaterSchema],
    label: "All debaters in a team.",
    minCount: 1
  },

  resultForRound: {
    type: Object,
    label: "All results for a team. They are a key-value pair. Key:Round index. Value: result",
    blackbox: true
  },

  roleForRound: {
    type: Object,
    label: "All roles for a team. They are a key-value pair. Key:Round index. Value: role(String)",
    blackbox: true
  },

  isActiveForRound: {
    type: Object,
    label: "All active status for a team. They are a key-value pair. Key:Round index. Value: isActive(Boolean)",
    blackbox: true
  }
});

var RoundSchema = new SimpleSchema({
  index: {
    type: Number,
    label: "Index of a round for a tournament, starting with 0",
    min: 0
  },

  motion: {
    type: String,
    label: "Motion for a round.",
    max: 1000,
    optional: true
  },

  rooms: {
    type:[RoomSchema],
    label: "All rooms for a round.",
    minCount: 0
  },

  state: {
    type: String,
    label: "Whether a round is active.",
    allowedValues: ["initial", "active", "finished"]
  }
});

var TournamentSchema = new SimpleSchema({
  createdAt: {
    type: Date
  },

  name: {
    type: String,
    label: "Name of the tournament.",
    max: 200
  },

  style: {
    type: String,
    label: "Style of the tournament.",
    allowedValues: ["BP"]
  },

  maxUsers: {
    type: Number,
    label: "Maximum number of users that can be registered for the tournament.",
    max: 10000
  },

  ownerId: {
    type: String,
    label: "Owner Id of the tournament."
  },

  paymentVerified: {
    type: Boolean,
    label: "Is payment verified or not."
  },

  finished: {
    type: Boolean,
    label: "Has the tournament been explicitly closed by the owner."
  },

  enablePublicRegistration: {
    type: Boolean,
    label: "Field for whether tournament enables the public to register"
  },

  teams: {
    type: [TeamSchema],
    label: "All teams in a tournament.",
    minCount: 0
  },

  judges: {
    type: [JudgeSchema],
    label: "All judges in a tournament.",
    minCount: 0
  },

  rooms: {
    type: [String],
    label: "All rooms in a tournament.",
    minCount: 0,
    max: 30
  },

  rounds: {
    type:[RoundSchema],
    label: "All rounds created in a tournament.",
    minCount: 0,
  },

  currentInvariantViolations: {
    type: [Object],
    label: "List of invariant violation types",
    minCount: 0,
    blackbox: true
  }
});

// Initial implementation of the validator, which disallows user from
// creating a round if the last round is not finished.
// More needs to be added here, and the validator component should be exportable
// so that we can do the same validation in the client.
SimpleSchema.addValidator(function() {
  if(this.isUpdate) {
    if(this.genericKey === "rounds.$" && this.value.index !== 0) {
      var tournament = Tournaments.findOne({ownerId: this.userId, finished:false});

      if(!APPGLOBALS.ValidatorHelper.canCreateNextRound(tournament)) {
        return "notAllowed";
      }
    }
  }

});

Tournaments.attachSchema(TournamentSchema);
