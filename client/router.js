Router.route("/register", function() {
  this.render("TabRegistration");
});

Router.route("/management", function() {
  this.render("Management");
});

Router.route("/", function() {
  this.render("home");
});