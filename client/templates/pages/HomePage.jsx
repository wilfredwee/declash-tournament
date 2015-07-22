"use strict";

DeclashApp.client.templates.pages.HomePageContainer = (function() {
  var HomePageContainer = ReactMeteor.createClass({
    render: function() {
      return (
        <div className="ui stackable grid">
          <div className="column homepage">
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
          <div className="ui vertical first homepage segment">
            <div className="ui middle aligned stackable grid container">
              <div className="row">
                <div className="four wide column">
                  <i className="massive blue table icon" />
                </div>
                <div className="twelve wide column">
                  <h3>Familiar To Use</h3>
                  <p>Use Excel and Google Docs-like tables to register, edit and delete teams, judges and rooms.</p>
                </div>
              </div>
              <div className="row">
                <div className="four wide column">
                  <i className="massive teal browser icon" />
                </div>
                <div className="twelve wide column">
                  <h3>Simple Interface</h3>
                  <p>No visual clutter, but filled with functionality.</p>
                </div>
              </div>
              <div className="row">
                <div className="four wide column">
                  <i className="massive pink heart icon" />
                </div>
                <div className="twelve wide column">
                  <h3>Intuitive Design</h3>
                  <p>Drag and drop judges. See rooms represented with their actual seating arrangements when populating the scores.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="ui vertical first homepage segment">
            <div className="ui middle aligned equal width stackable internally celled grid container">
              <div className="row">
                <div className="column">
                  <div className="ui stackable grid">
                    <div className="twelve wide column">
                      <h3>We are open source!</h3>
                      <p>Feature suggestions? Interested to contribute? Click <a href="http://github.com/WilfredWee/declash-tournament" target="_blank">here</a> to get started.</p>
                    </div>
                    <div className="four wide column">
                      <i className="circular grey github alternate huge icon" />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="ui stackable grid">
                    <div className="twelve wide column">
                      <h3>Host your own DeClash!</h3>
                      <p>{"It's"} super easy and completely free! Read the How-To <a href="http://github.com/WilfredWee/declash-tournament/wiki/Setup-Instructions" taget="_blank">here</a>.</p>
                    </div>
                    <div className="four wide column">
                      <i className="circular red database huge icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ui inverted vertical footer homepage segment">
            <div className="ui container">
              <div className="ui stackable inverted divided equal height stackable grid">
                <div className="four wide column">
                  <h4 className="ui inverted header">Overview</h4>
                  <div className="ui inverted link list">
                    <a className="item" href="http://github.com/WilfredWee/declash-tournament">About</a>
                    <a className="item" href="http://github.com/WilfredWee/declash-tournament/wiki">How-To</a>
                    <a className="item" href="http://github.com/WilfredWee/declash-tournament/issues">Feature Suggestions</a>
                  </div>
                </div>
                <div className="four wide column">
                  <h4 className="ui inverted header">Developers</h4>
                  <div className="ui inverted link list">
                    <a className="item" href="http://github.com/WilfredWee/declash-tournament">Contribute</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  return HomePageContainer;
})();
