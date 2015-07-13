"use strict";

DeclashApp.client.templates.pages.HomePageContainer = (function() {
  var HomePageContainer = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui stackable container grid">
          <div className="column">
            <Home />
          </div>
        </div>
      );
    }
  });

  var Home = ReactMeteor.createClass({
    loginDemoAccount: function(e) {
      e.preventDefault();

      if(Meteor.user()) {
        Router.go("/management");
      }
      else {
        Meteor.loginWithPassword("demouser@declash.com", "pass", function(err) {
          // TODO
          if(err) {
            alert(err.reason);
          }
          else {
            Router.go("/management");
          }
        });
      }
    },

    render: function() {
      /* jshint maxlen:false */

      var fontStyle = {fontSize: 12};
      return (
        <div>
          <div className="row">
            <h1>Welcome to DeClash! This is the homepage!</h1>
          </div>
          <div className="row">
            <a className="header" style={fontStyle} href="/tournaments">View Active Tournaments</a>
          </div>
          <div className="row">
            <span>Interested? <a href="" onClick={this.loginDemoAccount}>Click here</a> to test it out on a demo account!</span>
          </div>
        </div>
      );
    }
  });

  return HomePageContainer;
})();
