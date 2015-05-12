if (Meteor.isClient) {
  Session.setDefault('name', 'stranger');

  Template.hello.helpers({
    name: function () {
      if(Meteor.user()) {
        return Meteor.user().profile.name;
      }
      else {
        return 'stranger';
      }
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the name when button is clicked
      Session.set('name', Session.get('name') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
