var TabRegistrationForm = ReactMeteor.createClass({
  templateName: "TabRegistration",

  startMeteorSubscriptions: function() {
    Meteor.subscribe("tabUsers");
  },
  getMeteorState: function() {
    // TODO
    // Stub:
    var users = Meteor.users.find();
    return {
      users :users
    };
  },
  render: function() {
    return (
      <form className="ui form TabRegistrationForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your Name" ref="name" />
        <input type="email" placeholder="Email" ref="email" />
        <input type="password" placeholder="Password" ref="password" />
        <input type="text" placeholder="Your Institution" ref="institution" />
        <input type="submit" className="ui submit button" value="Register" />
      </form>
    );
  },
  handleSubmit: function(e) {
    e.preventDefault();

    var name = React.findDOMNode(this.refs.name).value.trim();
    var email = React.findDOMNode(this.refs.email).value.trim();
    var password = React.findDOMNode(this.refs.password).value.trim();
    var institution = React.findDOMNode(this.refs.institution).value.trim();

    var user = {
      email: email,
      password: password,
      profile: {
        name: name,
        institution: institution,
      }
    };

    Meteor.call("registerTabUser", user, function(err, result) {
      if(err) {
        alert(err.reason);
      }
      else {
        Meteor.loginWithPassword(user.email, user.password, function(err) {
          if(err) {
            alert(err.reason);
          }
          else {
            window.location.href = "/management";
          }
        });
      }
    });

  }
});