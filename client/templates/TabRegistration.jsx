/** @jsx React.DOM */

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

    Meteor.call("registerTabUser", name, email, password, institution, true, function(error, result) {
      if(error) {
        // TODO
        console.log(error);
      }
      else {
        // TODO
        console.log(result);
      }
    })
  }
});