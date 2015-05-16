Router.onBeforeAction(function() {
  if(Meteor.loggingIn()) {
    // TODO: Render a loading template.
    return;
  }
  else if(!Meteor.userId()) {
    this.render("Login");
  }
  else {
    this.next();
  }
});

Router.route("/register", function() {
  this.render("TabRegistration");
});

Router.route("/login", function() {
  if(!Meteor.user()) {
    this.render("Login");
  }
  else {
    this.redirect("/");
  }
});

Router.route("/management", function() {
  this.render("ManagementBody");
});

Router.route("/", function() {
  this.render("home");
});