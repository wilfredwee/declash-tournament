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
    renderReactPage(<DeclashApp.client.templates.pages.LoginPageContainer />);
  }
  else {
    this.next();
  }
});

Router.route("/register", function() {
  renderReactPage(<DeclashApp.client.templates.pages.TabRegistrationPageContainer />);
});

Router.route("/login", function() {
  if(!Meteor.user()) {
    renderReactPage(<DeclashApp.client.templates.pages.LoginPageContainer />);
  }
  else {
    this.redirect("/");
  }
});

Router.route("/management", function() {
  renderReactPage(<DeclashApp.client.templates.pages.ManagementPageContainer />);
});

Router.route("/", function() {
  renderReactPage(<DeclashApp.client.templates.pages.HomePageContainer />);
});

Router.route("/tournaments", function() {
  renderReactPage(<DeclashApp.client.templates.pages.TournamentListPageContainer />);
});

Router.route("/registerParticipants/:tournamentId", function() {
  renderReactPage(<DeclashApp.client.templates.pages.ParticipantRegistrationPageContainer tournamentId={this.params.tournamentId} />);
});
