function renderReactPage(component) {
  React.render(component, document.getElementById("ReactComponentDiv"));
  // call this.stop() to prevent the router from warning that we did not call this.next()
  this.stop();
}

Router.onBeforeAction(function() {
  if(document.getElementById("ReactComponentDiv")) {
    React.unmountComponentAtNode(document.getElementById("ReactComponentDiv"));
  }
  if(Meteor.loggingIn() || (this.route.getName() === undefined || "/register")) {
    // TODO: Render a loading template.
    this.next();
  }
  else if(!Meteor.userId()) {
    renderReactPage.call(this, <LoginPageContainer />);
  }
  else {
    this.next();
  }
});

Router.route("/register", function() {
  renderReactPage.call(this, <TabRegistrationPageContainer />);
});

Router.route("/login", function() {
  if(!Meteor.user()) {
    renderReactPage.call(this, <LoginPageContainer />);
  }
  else {
    this.redirect("/");
  }
});

Router.route("/management", function() {
  this.render("ManagementBody");
  renderReactPage.call(this, <ManagementPageContainer />);
});

Router.route("/", function() {
  renderReactPage.call(this, <HomePageContainer />);
});