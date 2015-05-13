Meteor.publish("tabUsers", function() {
  Meteor.users.find({
    role: "tab"
  });
});