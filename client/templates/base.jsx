var baseComponent = ReactMeteor.createClass({
  templateName: "baseTemplate",

  getMeteorState: function() {
    return {
      user: Meteor.user()
    };
  },

  handleLogout: function() {
    Meteor.logout();
  },

  render: function() {
    if(this.state.user) {
      return (<button onClick={this.handleLogout}>Logout</button>);
    }
    else {
      return (<h1>Can I have login pls?</h1>);
    }
  }
});