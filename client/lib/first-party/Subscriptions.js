"use strict";

if(Meteor.isClient) {
  Meteor.startup(function() {
      Meteor.subscribe("unfinishedTournaments");
  });
}
