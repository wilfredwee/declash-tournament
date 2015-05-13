Meteor.methods({
  registerTabUser: function(options) {
    check(options, Object);
    check(options.email, String);
    check(options.password, String);
    check(options.profile, Object);
    check(options.profile.name, String);
    check(options.profile.institution, String);
    check(options.profile.isAdmin, Boolean);

    user = Accounts.createUser(options);

    return user;
  }
});
