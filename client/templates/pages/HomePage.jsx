"use strict";

DeclashApp.client.templates.pages.HomePageContainer = (function() {
  var HomePageContainer = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui stackable grid">
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
          <div className="ui inverted vertical masthead center aligned segment">
            <div className="ui text container">
              <h1 className="ui inverted header">
                Debate Tournament Tabbing Has Never Been Easier
              </h1>
              <h4 className="ui inverted header">Intuitive, Simple, Familiar</h4>
              <a href="/tournaments" className="ui large primary button">View Active Tournaments<i className="right arrow icon"></i></a>
              <div onClick={this.loginDemoAccount} className="ui large positive button">Interested? Click to log in to a demo account!</div>
            </div>
          </div>
        </div>
      );
    }
  });

  return HomePageContainer;
})();
