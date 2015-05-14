// Meteor.publish("tabUsers", function() {
//   return Meteor.users.find({
//     role: "super"
//   });
// });

Meteor.publish("unfinishedTournaments", function() {
  return Tournaments.find({finished: false});
});
