"use strict";
/* global Tournaments */

Meteor.startup(function() {
  var query = Tournaments.find();

  var handle = query.observe({
    changed: function(newDocument, oldDocument) {
      if(!_.some(newDocument.rounds, function(round) {
        return round.state === "initial";
      })) {
        return;
      }

      DeclashApp.helpers.checkInvariantsBeforeAssign(newDocument);
    }
  });
});
