Router.route("/register", function() {
  this.render("TabRegistration");
});

Router.route("/management", function() {
  this.render("ManagementBody");
});

Router.route("/", function() {
  this.render("home");
});