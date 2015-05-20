function renderReactPage(component) {
  React.render(component, document.getElementById("ReactComponentDiv"));
  // router will keep warning that we did not call this.next() here.
  // we can't call this.stop() because it'll kill our reactive state.
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
    renderReactPage(<LoginPageContainer />);
  }
  else {
    this.next();
  }
});

Router.route("/register", function() {
  renderReactPage(<TabRegistrationPageContainer />);
});

Router.route("/login", function() {
  if(!Meteor.user()) {
    renderReactPage(<LoginPageContainer />);
  }
  else {
    this.redirect("/");
  }
});

Router.route("/management", function() {
  renderReactPage(<ManagementPageContainer />);
});

Router.route("/", function() {
  renderReactPage(<HomePageContainer />);
});