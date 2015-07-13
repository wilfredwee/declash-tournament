"use strict";
/* jshint maxlen:false */

function renderReactPage(component) {
  /*jshint validthis:true */
  React.render(component, document.getElementById("ReactComponentDiv"));
  this.render(null);
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
    renderReactPage.call(this, <DeclashApp.client.templates.pages.LoginPageContainer />);
  }
  else {
    this.next();
  }
});

Router.route("/login", function() {
  this.render("LoginPage");
});

Router.route("/management", function() {
  renderReactPage.call(this, <DeclashApp.client.templates.pages.ManagementPageContainer />);
});

Router.route("/", function() {
  renderReactPage.call(this, <DeclashApp.client.templates.pages.HomePageContainer />);
});

Router.route("/tournaments", function() {
  renderReactPage.call(this, <DeclashApp.client.templates.pages.TournamentListPageContainer />);
});

Router.route("/registerParticipants/:tournamentId", function() {
  renderReactPage.call(this, <DeclashApp.client.templates.pages.ParticipantRegistrationPageContainer tournamentId={this.params.tournamentId} />);
});

Router.route("/tournaments/:tournamentUrlId", function() {
  renderReactPage.call(this, <DeclashApp.client.templates.pages.PublicTournamentPageContainer tournamentUrlId={this.params.tournamentUrlId} />);
});

Router.route("/tournaments/:tournamentUrlId/:roundIndex", function() {
  renderReactPage.call(this, <DeclashApp.client.templates.pages.PublicRoundViewPageContainer
    tournamentUrlId={this.params.tournamentUrlId}
    roundIndex={this.params.roundIndex} />
  );
});
