Meteor.methods({
  registerTabUser: function(name, email, password, institution, isAdmin) {
    check(name, String);
    check(email, String);
    check(password, String);
    check(institution, String);
    check(isAdmin, Boolean);

    Accounts.createUser({
      username: email,
      email: email,
      password: password,
      profile: {
        name: name,
        institution: institution,
        role: "tab",
        isAdmin: isAdmin
      }
    });
  }
});