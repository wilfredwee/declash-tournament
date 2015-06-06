Meteor.startup(function() {
  var query = Tournaments.find();

  var handle = query.observeChanges({
    changed: function(id, fieldChanges) {
      if(Array.isArray(fieldChanges.currentInvariantViolations)) {
        return;
      }

      APPGLOBALS.checkInvariantsBeforeAssign(Tournaments.findOne(id));
    }
  });
});
