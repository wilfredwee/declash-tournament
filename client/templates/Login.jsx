var LoginComponent = ReactMeteor.createClass({
  templateName: "Login",

  startMeteorSubscriptions: function() {
    // TODO
  },

  getMeteorState: function() {
    return {
      isLoggedIn: !!Meteor.userId()
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var email = React.findDOMNode(this.refs.email).value.trim();
    var password = React.findDOMNode(this.refs.password).value.trim()

    Meteor.loginWithPassword(email, password, function(err) {
      // TODO
      if(err) {
        alert(err.reason);
      }
    });
  },

  render: function() {
    if(this.state.isLoggedIn) {
      return false;
    }
    return (
      <form className="ui form LoginForm" onSubmit={this.handleSubmit}>
        <input type="email" placeholder="Email" ref="email" />
        <input type="password" placeholder="Password" ref="password" />
        <input type="submit" className="ui submit button" value="Login" />
      </form>
    );
  }
});