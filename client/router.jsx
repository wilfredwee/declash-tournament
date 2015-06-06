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
    renderReactPage(<DeclashApp.LoginPageContainer />);
  }
  else {
    this.next();
  }
});

Router.route("/register", function() {
  renderReactPage(<DeclashApp.TabRegistrationPageContainer />);
});

Router.route("/login", function() {
  if(!Meteor.user()) {
    renderReactPage(<DeclashApp.LoginPageContainer />);
  }
  else {
    this.redirect("/");
  }
});

Router.route("/management", function() {
  renderReactPage(<DeclashApp.ManagementPageContainer />);
});

Router.route("/", function() {
  renderReactPage(<DeclashApp.HomePageContainer />);
});

Router.route("/tournaments", function() {
  renderReactPage(<DeclashApp.TournamentListPageContainer />);
});

Router.route("/registerParticipants/:tournamentId", function() {
  renderReactPage(<DeclashApp.ParticipantRegistrationPageContainer tournamentId={this.params.tournamentId} />);
});
