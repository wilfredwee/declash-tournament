"use strict";
/* jshint maxlen:false */

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

      return !_.isEqual(this.props, nextProps);
    },

    openRoomSwapDialog: function() {
      if(!this.props.getDragData) {
        return;
      }

      var self = this;

      var modalDOM = $("<div>").modal();

      React.render(<RoomSwapDialogComponent
        roundIndex={this.props.roundIndex}
        swappingRoom={this.props.room}
        rooms={this.props.rooms}
        modalDOM={modalDOM} />,
        modalDOM[0]
      );
    },

    openSwapDialog: function(team) {
      if(!this.props.getDragData) {
        return;
      }

      var self = this;

      var modalDOM = $("<div>").modal();

      React.render(<SwapDialogComponent
        roundIndex={this.props.roundIndex}
        teamToSwapOut={team}
        modalDOM={modalDOM}
        room={this.props.room}
        teams={this.props.teams} />,
        modalDOM[0]
      );
    },

    renderRoomLocation: function(room, roundIndex) {
      return (
        <h3 className="ui horizontal header divider">
          <a onClick={this.openRoomSwapDialog} href="" className="roomLink ui link">{room.locationId}</a>
        </h3>
      );
    },

    renderTeamsForRoom: function(room, roundIndex) {
      function getTeamForRole(role) {
        return _.find(room.teams, function(team) {
          return team.roleForRound[roundIndex] === role;
        });
      }

      var OGTeam = getTeamForRole("OG");
      var OOTeam = getTeamForRole("OO");
      var CGTeam = getTeamForRole("CG");
      var COTeam = getTeamForRole("CO");

      return (
        <div>
          <div className="ui stackable two column celled grid">
            <div className="two column row">
              <div className="column"><a onClick={this.openSwapDialog.bind(this, OGTeam)} href="" className="roomLink ui link"><strong>OG: </strong>{OGTeam.name}</a></div>
              <div className="column"><a onClick={this.openSwapDialog.bind(this, OOTeam)} href="" className="roomLink ui link"><strong>OO: </strong>{OOTeam.name}</a></div>
            </div>
            <div className="two column row">
              <div className="column"><a onClick={this.openSwapDialog.bind(this, CGTeam)} href="" className="roomLink ui link"><strong>CG: </strong>{CGTeam.name}</a></div>
              <div className="column"><a onClick={this.openSwapDialog.bind(this, COTeam)} href="" className="roomLink ui link"><strong>CO: </strong>{COTeam.name}</a></div>
            </div>
          </div>
        </div>
      );
    },

    renderJudgesForRoom: function(room, roundIndex) {
      var DraggableJudgeComponent = ConnectDraggable(JudgeComponent);

      return _.map(room.judges, function(judge, judgeIndex) {
        if(this.props.getDragData) {
          return (
            <div className="row" key={judgeIndex}>
              <div className="column">
                <DraggableJudgeComponent
                  onDragStart={this.props.onDragStart.bind(null, judge, roundIndex)}
                  onDragStop={this.props.onDragStop}
                  getDragData={this.props.getDragData}
                  judge={judge}
                  roundIndex={roundIndex}
                />
              </div>
            </div>
          );
        }

        return (
          <div className="row" key={judgeIndex}>
            <div className="column">
              <JudgeComponent key={judgeIndex} judge={judge} roundIndex={roundIndex} />
            </div>
          </div>
        );
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
            {this.renderRoomLocation(this.props.room, this.props.roundIndex)}
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

  var RoomSwapDialogComponent = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        roomToSwapIn: undefined
      };
    },

    componentDidMount: function() {
      var self = this;

      var modal = $(".ui.modal").modal({
        closable: false,
        detachable: false,
        onApprove: function() {
          if(!self.state.roomToSwapIn) {
            return;
          }

          Meteor.call("swapRoomsForRound", self.props.swappingRoom, self.state.roomToSwapIn, self.props.roundIndex, function(err, result) {
            // TODO:
            if(err) {
              alert(err.reason);
            }
          });
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      });

      modal.modal("show");

      var searchRooms = _.chain(this.props.rooms)
        .map(function(room) {
          return {title: room.locationId};
        })
        .filter(function(searchRoom) {
          return searchRoom.title !== self.props.swappingRoom.locationId;
        })
        .value();

      $(".ui.local.search.swaprooms").search({
        source: searchRooms,
        searchFields: [
          "title"
        ],
        onSelect: function(result) {
          var roomToSwapIn = _.find(self.props.rooms, function(room) {
            return room.locationId === result.title;
          });

          self.setState({
            roomToSwapIn: roomToSwapIn
          });
        }
      });
    },

    render: function() {
      var content =  (
        <div className="ui local search swaprooms">
          <div className="ui icon input">
            <input className="prompt" placeholder={"Search for rooms"} type="text" />
            <i className="search icon"></i>
          </div>
          <div className="results"></div>
        </div>
      );

      var informMessage = "Please select a room to swap.";
      if(this.state.roomToSwapIn) {
        informMessage = "Swapping the rooms " + this.props.swappingRoom.locationId +
          " and " + this.state.roomToSwapIn.locationId + ". " +
          "Proceed?";
      }

      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Swapping {this.props.swappingRoom.locationId}
          </div>
          <div className="content">
            <div className="ui grid">
              <div className="column">
                <div className="row">
                  {content}
                  <br />
                </div>
                <div className="row">
                  <span>{informMessage}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">Cancel</div>
            <div className="primary ui ok button">Save</div>
          </div>
        </div>
      );
    }
  });

  var SwapDialogComponent = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        teamToSwapIn: undefined
      };
    },

    componentDidMount: function() {
      var self = this;

      var modal = $(".ui.modal").modal({
        closable: false,
        detachable: false,
        onApprove: function() {
          if(!self.state.teamToSwapIn) {
            return;
          }

          Meteor.call("swapTeamsForRound", self.props.teamToSwapOut, self.state.teamToSwapIn, self.props.roundIndex, function(err, result) {
            // TODO:
            if(err) {
              alert(err.reason);
            }
          });
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      });

      modal.modal("show");


      var searchTeams = _.chain(this.props.teams)
        .map(function(team) {
          return {title: team.name, guid: team.guid};
        })
        .filter(function(searchTeam) {
          return searchTeam.guid !== self.props.teamToSwapOut.guid;
        })
        .value();

      $(".ui.local.search.swapteams").search({
        source: searchTeams,
        searchFields: [
          "title"
        ],
        onSelect: function(result) {
          var teamToSwapIn = _.find(self.props.teams, function(team) {
            return team.guid === result.guid;
          });

          self.setState({
            teamToSwapIn: teamToSwapIn
          });
        }
      });
    },

    render: function() {
      var content = (
        <div className="ui local search swapteams">
          <div className="ui icon input">
            <input className="prompt" placeholder={"Search for teams"} type="text" />
            <i className="search icon"></i>
          </div>
          <div className="results"></div>
        </div>
      );

      var informMessage = "Please select a team to swap.";
      if(this.state.teamToSwapIn) {
        var teamToSwapIn = this.state.teamToSwapIn;
        var teamToSwapOut = this.props.teamToSwapOut;

        if(teamToSwapIn.isActiveForRound[this.props.roundIndex]) {
          var isSameRoom = _.some(this.props.room.teams, function(team) {
            return team.guid === teamToSwapIn.guid;
          });

          if(isSameRoom) {
            informMessage = "You will swap positions between " +
              teamToSwapIn.name + " and " +
              teamToSwapOut.name;
          }
          else {
            informMessage = "You will swap rooms and positions between " +
              teamToSwapIn.name + " and " +
              teamToSwapOut.name;
          }
        }
        else {
          informMessage = "You will swing in " + teamToSwapIn.name +
            " to replace " + teamToSwapOut.name +
            " for this round.";
        }

      }

      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Swapping {this.props.teamToSwapOut.name}
          </div>
          <div className="content">
            <div className="ui grid">
              <div className="column">
                <div className="row">
                  {content}
                  <br />
                </div>
                <div className="row">
                  <span>{informMessage}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">Cancel</div>
            <div className="primary ui ok button">Save</div>
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

      if(this.props.getDragData) {
        judgeName += " (" + SchemaHelpers.getAverageRankForJudge(this.props.judge) + ")";
      }

      if(this.props.judge.isChairForRound[this.props.roundIndex]) {
        judgeName = <div><i className="legal icon"></i>{judgeName}</div>;
      }
      else {
        judgeName = <div>{judgeName}</div>;
      }

      if(this.props.getDragData) {
        return (
          <div
            onMouseDown={this.props.onMouseDown}
            style={this.props.style}
            onDoubleClick={this.switchChair}
          >
              {judgeName}
          </div>
        );
      }

      return judgeName;
    }
  });

  return RoomComponent;
})();


