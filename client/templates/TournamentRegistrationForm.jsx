"use strict";

DeclashApp.client.templates.TournamentRegistrationForm = (function() {
  var TournamentRegistrationForm = ReactMeteor.createClass({
    handleSubmit: function(e) {
      e.preventDefault();

      var name = React.findDOMNode(this.refs.name).value.trim();
      var maxUsers = Math.floor(React.findDOMNode(this.refs.maxUsers).value);

      var tournament = {
        name: name,
        maxUsers: maxUsers,
        style: "BP"
      };

      Meteor.call("registerTournament", tournament, function(err, result) {
        if(err) {
          alert(err.reson);
          // TODO
        }
        // else {
        //   // TODO - Figure out how to handle waiting for payments here. Maybe?
        //   // Just wait for re-render once tournament changes to true.
        // }
      });
    },

    render: function() {
      return (
        <form className="ui form TournamentRegistrationForm" onSubmit={this.handleSubmit}>
          <label>Tournament Name</label>
          <input type="text" placeholder="Enter a name for the tournament" ref="name" />
          <label>Max Debaters</label>
          <input type="number" placeholder="Maximum amount of debaters." ref="maxUsers" />
          <input type="submit" className="ui submit button" value="Create Tournament" />
        </form>
      );
    }
  });

  return TournamentRegistrationForm;
})();
