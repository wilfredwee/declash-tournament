DeclashApp.client.templates.BaseComponent = (function() {
  var BaseComponent = ReactMeteor.createClass({
    templateName: "baseTemplate",

    getMeteorState: function() {

    },
    render: function() {
      return (<NavBar></NavBar>);
    }
  });

  var NavBar = ReactMeteor.createClass({
    getMeteorState: function() {

    },

    render: function() {
      return (
        <div className="ui grid">
          <div className="row">
            <div className="ui inverted fixed menu navbar page grid">
              <a href="/" className="brand item">DeClash</a>
              <div className="right menu">
                <UserManagementButtons />
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  var UserManagementButtons = ReactMeteor.createClass({
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
      var message = this.state.user? "Logout" : "Login";

      var logins = <a className="active item" href="" onClick={this.handleLogins}>{message}</a>;
      if(this.state.user) {
        return (
          <div><a className="item" href="/management">Management</a>{logins}</div>
        );
      }
      return (
        <div>
          <a className="item" href="/register">Register</a>
          {logins}
        </div>
      );
    }
  });

  return BaseComponent;
})();
