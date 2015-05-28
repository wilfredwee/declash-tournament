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
    renderReactPage(<APPGLOBALS.LoginPageContainer />);
  }
  else {
    this.next();
  }
});

Router.route("/register", function() {
  renderReactPage(<APPGLOBALS.TabRegistrationPageContainer />);
});

Router.route("/login", function() {
  if(!Meteor.user()) {
    renderReactPage(<APPGLOBALS.LoginPageContainer />);
  }
  else {
    this.redirect("/");
  }
});

Router.route("/management", function() {
  renderReactPage(<APPGLOBALS.ManagementPageContainer />);
});

Router.route("/", function() {
  renderReactPage(<APPGLOBALS.HomePageContainer />);
});

Router.route("/tournaments", function() {
  renderReactPage(<APPGLOBALS.TournamentListPageContainer />);
});

Router.route("/registerParticipants/:tournamentId", function() {
  renderReactPage(<APPGLOBALS.ParticipantRegistrationPageContainer tournamentId={this.params.tournamentId} />);
});
