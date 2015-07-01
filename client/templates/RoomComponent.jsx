var ConnectDraggable;
var SchemaHelpers;
Meteor.startup(function() {
  ConnectDraggable = DeclashApp.client.templates.ConnectDraggable;
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
});

DeclashApp.client.templates.RoomComponent = (function() {
  var RoomComponent = ReactMeteor.createClass({
    shouldComponentUpdate: function(nextProps, nextState) {
      if(this.props.getDragData) {
        // Should update room if judge is being dragged FROM the room.
        var draggedData = this.props.getDragData();

        if(draggedData && draggedData.judge) {
          var draggedJudge = draggedData.judge;

          var hasRoomJudge = _.some(this.props.room.judges, function(judge) {
            return judge.guid === draggedJudge.guid;
          });

          if(hasRoomJudge) {
            return true;
          }
        }

        // Should update if room information has changed.
        // Should update if judge is being dragged TO the room.
        // For now, we check this by checking the style prop from connectDroppable.
        // This is not ideal. Ideally, we want to only transmit data, not information
        // about appearance.
        return !_.isEqual(this.props.room, nextProps.room) || !_.isEqual(this.props.style, nextProps.style);
      }

      return true;
    },

    renderTeamsForRoom: function(room, roundIndex) {
      function getTeamForRole(role) {
        return _.find(room.teams, function(team) {
          return team.roleForRound[roundIndex] === role;
        });
      }

      function getTotalResultForTeam(team) {
        return _.reduce(team.resultForRound, function(prev, curr) {
          prev = typeof prev === "number"? prev : 0;
          curr = typeof curr === "number"? curr : 0;

          return prev + curr;
        }, 0);
      }

      var OGTeam = getTeamForRole("OG");
      var OOTeam = getTeamForRole("OO");
      var CGTeam = getTeamForRole("CG");
      var COTeam = getTeamForRole("CO");

      return (
        <div className="ui stackable two column celled grid">
          <div className="two column row">
            <div className="column"><span><strong>OG: </strong>{OGTeam.name} ({getTotalResultForTeam(OGTeam)})</span></div>
            <div className="column"><span><strong>OO: </strong>{OOTeam.name} ({getTotalResultForTeam(OOTeam)})</span></div>
          </div>
          <div className="two column row">
            <div className="column"><span><strong>CG: </strong>{CGTeam.name} ({getTotalResultForTeam(CGTeam)})</span></div>
            <div className="column"><span><strong>CO: </strong>{COTeam.name} ({getTotalResultForTeam(COTeam)})</span></div>
          </div>
        </div>
      );
    },

    renderJudgesForRoom: function(room, roundIndex) {
      var DraggableJudgeComponent = ConnectDraggable(JudgeComponent);

      return _.map(room.judges, function(judge, judgeIndex) {
        if(this.props.getDragData) {
          return (
            <DraggableJudgeComponent
              key={judgeIndex}
              onDragStart={this.props.onDragStart.bind(null, judge, roundIndex)}
              onDragStop={this.props.onDragStop}
              getDragData={this.props.getDragData}
              judge={judge}
              roundIndex={roundIndex}
            />
          );
        }

        return <JudgeComponent key={judgeIndex} judge={judge} roundIndex={roundIndex} />;
      }.bind(this));
    },

    render: function() {
      return (
        <div className="column">
          <div className="ui segment"
            onMouseEnter={this.props.onMouseEnter}
            onMouseLeave={this.props.onMouseLeave}
            onMouseUp={this.props.onMouseUp}
            style={this.props.style}
          >
            <h3 className="ui horizontal header divider">{this.props.room.locationId}</h3>
            {this.renderTeamsForRoom(this.props.room, this.props.roundIndex)}
            <h5 className="ui horizontal header divider">Judges</h5>
            <div className="ui celled vertically divided grid">
              {this.renderJudgesForRoom(this.props.room, this.props.roundIndex)}
            </div>
          </div>
        </div>
      );
    }
  });

  var JudgeComponent = ReactMeteor.createClass({
    switchChair: function() {
      var judgeGuid = this.props.judge.guid;
      var roundIndex = this.props.roundIndex;

      Meteor.call("switchChair", judgeGuid, roundIndex, function(err, result) {
        // TODO:
        if(err) {
          alert(err.reason);
        }
      });
    },

    render: function() {
      var judgeName = this.props.judge.name;

      judgeName += " (" + this.props.judge.institution + ")";
      judgeName += " (" + SchemaHelpers.getAverageRankForJudge(this.props.judge) + ")";

      if(this.props.judge.isChairForRound[this.props.roundIndex]) {
        judgeName = <div><i className="legal icon"></i>{judgeName}</div>;
      }
      else {
        judgeName = <div>{judgeName}</div>;
      }

      if(this.props.getDragData) {
        return (
          <div className="row"
            onMouseDown={this.props.onMouseDown}
            style={this.props.style}
            onDoubleClick={this.switchChair}
          >
            <div className="column">
              {judgeName}
            </div>
          </div>
        );
      }

      return (
        <div className="row">
          <div className="column">
            {judgeName}
          </div>
        </div>
      );
    }
  });

  return RoomComponent;
})();


