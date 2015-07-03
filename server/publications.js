"use strict";
/* global Tournaments */

Meteor.publish("unfinishedTournaments", function() {
  if(this.userId) {
    // TODO: Disallow admins from viewing other tournaments that disabled
    // enablePublicView
    return Tournaments.find({finished: false});
  }
  else {
    return Tournaments.find(
      {finished: false, enablePublicView: true},
      {fields: {"rounds": 0}}
    );
  }

});
