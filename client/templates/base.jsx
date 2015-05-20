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

  handleClick: function() {
    Router.go("/");
  },

  render: function() {
    return (
      <div className="ui grid">
        <div className="computer tablet only row">
          <div className="ui inverted fixed menu navbar page grid">
            <a href="/" className="brand item">DeClash</a>
            <div className="right menu">
              <UserLoginButtons />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var UserLoginButtons = ReactMeteor.createClass({
  getMeteorState: function() {
    return {
      user: Meteor.user()
    };
  },

  handleClick: function() {
    if(this.state.user) {
      Meteor.logout();
    }
    else {
      Router.go("login");
    }
  },

  render: function() {
    var message = this.state.user? "Logout" : "Login";

    return(<a className="active item" href="" onClick={this.handleClick}>{message}</a>);
  }
});