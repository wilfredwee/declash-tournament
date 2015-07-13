"use strict";

DeclashApp.client.templates.BaseComponent = (function() {
  var BaseComponent = ReactMeteor.createClass({
    templateName: "baseTemplate",

    render: function() {
      return (<NavBar></NavBar>);
    }
  });

  var NavBar = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        user: Meteor.user()
      };
    },

    handleLogins: function() {
      if(this.state.user) {
        Meteor.logout();
        Router.go("/");
      }
      else {
        Router.go("login");
      }
    },

    render: function() {
      var message = this.state.user? "Logout" : "Login/Register";

      var logins = <a className="active item" href="" onClick={this.handleLogins}>{message}</a>;

      var managementButton = this.state.user?
        <a className="item" href="/management">Management</a>
        :undefined

      return (
            <div className="ui fixed inverted menu">
              <div className="ui container">
                <a href="/" className="item">DeClash</a>
                <div className="right menu">
                  {managementButton}
                  {logins}
                </div>
              </div>
            </div>
      );
    }
  });

  return BaseComponent;
})();
