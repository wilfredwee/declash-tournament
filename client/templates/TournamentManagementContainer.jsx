"use strict";
/* jshint maxlen:false */
/* global Tournaments */
/* global Session */
/* global Handsontable */


// Imports
var ValidatorHelper;
var SchemaHelpers;
var ManagementContextConstants;
var RoomComponent;
var ConnectDroppable;

// Special variable from imports
var DroppableRoomComponent;
Meteor.startup(function() {
  ValidatorHelper = DeclashApp.helpers.ValidatorHelper;
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
  ManagementContextConstants = DeclashApp.client.constants.ManagementContextConstants;
  RoomComponent = DeclashApp.client.templates.RoomComponent;
  ConnectDroppable = DeclashApp.client.templates.ConnectDroppable;

  DroppableRoomComponent = ConnectDroppable(RoomComponent);
});

DeclashApp.client.templates.TournamentManagementContainer = (function() {
  var TournamentManagementContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        tournament: Tournaments.findOne({ownerId: Meteor.userId()}),
        containerContextType: Session.get("containerContextType"),
        currentRoundIndex: Session.get("currentRoundIndex")
      };
    },

    switchContainerContextType: function(contextType, roundIndex) {
      Session.set("containerContextType", contextType);
      Session.set("currentRoundIndex", roundIndex);
    },

    renderAccordingToContextType: function(contextType, roundIndex) {
      // Shortening our variable to avoid insanity.
      var MANAGE_CONTEXT_TYPE = ManagementContextConstants.MANAGE_CONTEXT_TYPE;
      var TEAM_CONTEXT = ManagementContextConstants.TEAM_CONTEXT;
      var JUDGE_CONTEXT = ManagementContextConstants.JUDGE_CONTEXT;
      var ROOM_CONTEXT = ManagementContextConstants.ROOM_CONTEXT;
      var TEAM_ROUND_CONTEXT = ManagementContextConstants.TEAM_ROUND_CONTEXT;
      var JUDGE_ROUND_CONTEXT = ManagementContextConstants.JUDGE_ROUND_CONTEXT;
      var ROOM_ROUND_CONTEXT = ManagementContextConstants.ROOM_ROUND_CONTEXT;
      var TEAM_TAB_CONTEXT = ManagementContextConstants.TEAM_TAB_CONTEXT;
      var SPEAKER_TAB_CONTEXT = ManagementContextConstants.SPEAKER_TAB_CONTEXT;

      var contextToRender = TEAM_CONTEXT;
      switch(contextType) {
        case TEAM_CONTEXT.type:
          contextToRender = TEAM_CONTEXT;
          break;
        case JUDGE_CONTEXT.type:
          contextToRender = JUDGE_CONTEXT;
          break;
        case ROOM_CONTEXT.type:
          contextToRender = ROOM_CONTEXT;
          break;
        case TEAM_ROUND_CONTEXT.type:
          contextToRender = TEAM_ROUND_CONTEXT;
          break;
        case JUDGE_ROUND_CONTEXT.type:
          contextToRender = JUDGE_ROUND_CONTEXT;
          break;
        case ROOM_ROUND_CONTEXT.type:
          contextToRender = ROOM_ROUND_CONTEXT;
          break;
        case MANAGE_CONTEXT_TYPE:
          contextToRender = {type: null};
          break;
        case TEAM_TAB_CONTEXT.type:
          contextToRender = TEAM_TAB_CONTEXT;
          break;
        case SPEAKER_TAB_CONTEXT.type:
          contextToRender = SPEAKER_TAB_CONTEXT;
          break;
      }

      if(_.contains([
        TEAM_CONTEXT.type,
        JUDGE_CONTEXT.type,
        ROOM_CONTEXT.type
        ], contextToRender.type)
      ) {
        return <ManagementHotContainer context={contextToRender} />;
      }
      else if(_.contains([
        TEAM_ROUND_CONTEXT.type,
        JUDGE_ROUND_CONTEXT.type,
        ROOM_ROUND_CONTEXT.type
        ], contextToRender.type)
      ){
        return <RoundHotContainer roundIndex={roundIndex} context={contextToRender} />;
      }
      else if(_.contains([
        TEAM_TAB_CONTEXT.type,
        SPEAKER_TAB_CONTEXT.type
        ], contextToRender.type)
      ) {
        return <TabHotContainer context={contextToRender} />;
      }
      else {
        if(this.state.tournament.rounds[roundIndex].state === "assigned" ||
          this.state.tournament.rounds[roundIndex].state === "finished") {
          return <RoundRoomsContainer roundIndex={roundIndex} />;
        }
        else {
          return <ActiveRoundRoomsContainer roundIndex={roundIndex} />;
        }
      }
    },

    createRound: function(e) {
      Meteor.call("createRound", function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    },

    render: function() {
      var contentContainer = this.renderAccordingToContextType(this.state.containerContextType, this.state.currentRoundIndex);


      var createRoundClassName = (function() {
        if(this.props.tournament.rounds.length === 0) {
          return "ui link item";
        }

        if(!ValidatorHelper.canCreateNextRound(this.props.tournament)) {
          return "ui disabled item";
        }
        return "ui link item";
      }.bind(this))();

      return (
        <div>
          <div className="row">
            <div className="ui menu">
              <div tabIndex="-1" className="ui simple pointing dropdown link item">
                <i tabIndex="0" className="dropdown icon"></i>
                <span className="text">Management</span>
                <div tabIndex="-1" className="menu">
                  <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.TEAM_CONTEXT.type)}>Teams</div>
                  <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.JUDGE_CONTEXT.type)}>Judges</div>
                  <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.ROOM_CONTEXT.type)}>Rooms</div>
                </div>
              </div>
              {this.props.tournament.rounds.map(function(round) {
                return (
                  <div key={round.index} tabIndex="-1" className="ui simple pointing dropdown link item">
                    <i tabIndex="0" className="dropdown icon"></i>
                    <span className="text">Round {round.index + 1}</span>
                    <div tabIndex="-1" className="menu">
                      <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.TEAM_ROUND_CONTEXT.type, round.index)}>Teams</div>
                      <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.JUDGE_ROUND_CONTEXT.type, round.index)}>Judges</div>
                      <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.ROOM_ROUND_CONTEXT.type, round.index)}>Rooms</div>
                      {round.state !== "initial" ?
                        <div className="item"
                          onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.MANAGE_CONTEXT_TYPE, round.index)}
                        >
                          <div><strong>Manage Assignment</strong></div>
                        </div>
                        : null}
                    </div>
                  </div>
                );
              }.bind(this))}
              <div onClick={createRoundClassName.indexOf("disabled") >= 0? undefined : this.createRound} className={createRoundClassName}>Create a Round</div>
              <div tabIndex="-1" className="ui simple pointing dropdown link item">
                <i tabIndex="0" className="dropdown icon"></i>
                <span className="text">Tab Results</span>
                <div tabIndex="-1" className="menu">
                  <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.TEAM_TAB_CONTEXT.type)}>Teams</div>
                  <div className="item" onClick={this.switchContainerContextType.bind(this, ManagementContextConstants.SPEAKER_TAB_CONTEXT.type)}>Speakers</div>
                </div>
              </div>
            </div>
          </div>
          <br />
          {typeof this.state.currentRoundIndex === "number"?
            <RoundManagementComponent
              currentRoundIndex={this.state.currentRoundIndex}
              tournament={this.state.tournament}
              switchContainerContextType={this.switchContainerContextType} />
            : undefined
          }
          {typeof this.state.currentRoundIndex === "number"?
            <br />
            : undefined
          }
          <div className="row">
            {contentContainer}
          </div>
        </div>
      );
    }
  });

  var RoundManagementComponent = ReactMeteor.createClass({
    getMeteorState: function() {
      Session.setDefault("isEditMode", false);

      return {
        isEditMode: Session.get("isEditMode")
      };
    },

    assignCurrentRound: function() {
      Meteor.call("assignRound", this.props.currentRoundIndex, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });

      this.props.switchContainerContextType(ManagementContextConstants.MANAGE_CONTEXT_TYPE, this.props.currentRoundIndex);
    },

    deleteCurrentRound: function() {
      var deleteRoundModalDOM = $("<div>").modal();

      React.render(<DeleteRoundModal
        roundIndex={this.props.currentRoundIndex}
        modalDOM={deleteRoundModalDOM}
        switchContainerContextType={this.props.switchContainerContextType} />,
        deleteRoundModalDOM[0]
      );
    },

    activateCurrentRound: function() {
      var activateRoundModalDOM = $("<div>").modal();

      React.render(<ActivateRoundModal
        roundIndex={this.props.currentRoundIndex}
        modalDOM={activateRoundModalDOM}
        switchContainerContextType={this.props.switchContainerContextType} />,
        activateRoundModalDOM[0]
      );
    },

    deactivateCurrentRound: function() {
      var deactivateRoundModalDOM = $("<div>").modal();

      React.render(<DeactivateRoundModal
        roundIndex={this.props.currentRoundIndex}
        modalDOM={deactivateRoundModalDOM}
        switchContainerContextType={this.props.switchContainerContextType} />,
        deactivateRoundModalDOM[0]
      );
    },

    finalizeCurrentRound: function() {
      var finalizeRoundModalDOM = $("<div>").modal();

      React.render(<FinalizeRoundModal
        roundIndex={this.props.currentRoundIndex}
        modalDOM={finalizeRoundModalDOM} />,
        finalizeRoundModalDOM[0]
      );
    },

    setToEditMode: function(e) {
      e.preventDefault();

      Session.set("isEditMode", true);
    },

    handleMotionSubmit: function(e) {
      e.preventDefault();

      var motionText = React.findDOMNode(this.refs.motionText).value;

      Meteor.call("changeMotion", motionText, this.props.currentRoundIndex, function(err, result) {
        // TODO:
        if(err) {
          alert(err.reason);
        }
        else {
          Session.set("isEditMode", false);
        }
      });
    },

    render: function() {
      function addRowToItem(uiItem) {
        return uiItem? <div className="row">{uiItem}<br /></div> : undefined;
      }

      var currentRoundIndex = this.props.currentRoundIndex;
      var tournament = this.props.tournament;
      var currentRound = tournament.rounds[currentRoundIndex];

      var manageRoundLabel = <h3>Managing Round {(currentRoundIndex + 1).toString()}.</h3>;

      var motionInputForm = (
        <form className="ui form" onSubmit={this.handleMotionSubmit}>
          <input type="text" ref="motionText" placeholder="Enter the Motion" />
          <input type="submit" className="ui submit button" value="Save" />
        </form>
      );

      var motionLabel = <div>{currentRound.motion}</div>;

      var motionSegment = (
        <div className="ui blue segment">
          <div className="ui grid">
            <div className="column">
              <h4 className="ui header">Motion:</h4>
            </div>
            {ValidatorHelper.canEditMotion(tournament, currentRoundIndex)?
              <div className="right floated right aligned column">
                <i onClick={this.setToEditMode} className="large edit link icon"></i>
              </div>
              : undefined
            }
          </div>
          {this.state.isEditMode? motionInputForm : motionLabel}
        </div>
      );

      var assignRoundButton = ValidatorHelper.canAssignRound(tournament, currentRoundIndex)?
        <button className="ui primary button" onClick={this.assignCurrentRound}>Assign Round</button>
        : undefined;

      var deleteRoundButton = ValidatorHelper.canDeleteRound(tournament, currentRoundIndex)?
        <button className="ui negative button" onClick={this.deleteCurrentRound}>Delete Round</button>
        : undefined;

      var activateRoundButton = ValidatorHelper.canActivateRound(tournament, currentRoundIndex)?
        <button className="ui positive button" onClick={this.activateCurrentRound}>Activate Round and Publish Assignment</button>
        : undefined;

      var deactivateRoundButton = ValidatorHelper.canDeactivateRound(tournament, currentRoundIndex)?
        <button className="ui negative button" onClick={this.deactivateCurrentRound}>Deactivate Round</button>
        : undefined;

      var finalizeRoundButton = ValidatorHelper.canFinalizeRound(tournament, currentRoundIndex)?
        <button className="ui positive button" onClick={this.finalizeCurrentRound}>Finalize Round {currentRoundIndex + 1}</button>
        : undefined;

      return (
        <div>
          {addRowToItem(manageRoundLabel)}
          {addRowToItem(motionSegment)}
          {addRowToItem(assignRoundButton)}
          {addRowToItem(deleteRoundButton)}
          {addRowToItem(activateRoundButton)}
          {addRowToItem(deactivateRoundButton)}
          {addRowToItem(finalizeRoundButton)}
        </div>
      );
    }
  });

  var DeleteRoundModal = ReactMeteor.createClass({
    componentDidMount: function() {
      var self = this;

      $(".ui.modal").modal({
        closable: true,
        detachable: false,
        onApprove: function() {
          Meteor.call("deleteRound", self.props.roundIndex, function(err, result) {
            // TODO
            if(err) {
              alert(err.reason);
            }
          });

          self.props.switchContainerContextType(ManagementContextConstants.TEAM_CONTEXT);
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      })
      .modal("show");

    },

    render: function() {
      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Warning
          </div>
          <div className="content">
            <div className="description">
              Are you sure you want to delete Round {this.props.roundIndex + 1}? All information for the round will be lost. This cannot be undone.
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">No</div>
            <div className="negative ui ok button">Yes, delete the round.</div>
          </div>
        </div>
      );
    }
  });

  var FinalizeRoundModal = ReactMeteor.createClass({
    componentDidMount: function() {
      var self = this;

      $(".ui.modal").modal({
        closable: true,
        detachable: false,
        onApprove: function() {
          Meteor.call("finalizeRound", self.props.roundIndex, function(err, result) {
            // TODO
            if(err) {
              alert(err.reason);
            }
          });
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      })
      .modal("show");

    },

    render: function() {
      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Finalize Round
          </div>
          <div className="content">
            <div className="description">
              Are you sure you want to finalize Round {this.props.roundIndex + 1}? No more changes can be made for this round.
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">No</div>
            <div className="negative ui ok button">Yes, finalize the round.</div>
          </div>
        </div>
      );
    }
  });

  var ActivateRoundModal = ReactMeteor.createClass({
    componentDidMount: function() {
      var self = this;

      $(".ui.modal").modal({
        closable: true,
        detachable: false,
        onApprove: function() {
          Meteor.call("activateRound", self.props.roundIndex, function(err, result) {
            // TODO
            if(err) {
              alert(err.reason);
            }
          });

          self.props.switchContainerContextType(ManagementContextConstants.MANAGE_CONTEXT_TYPE, self.props.roundIndex);
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      })
      .modal("show");
    },

    render: function() {
      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Activate Round
          </div>
          <div className="content">
            <div className="description">
              Activating a Round will release the motion and assignments to the public if you set the tournament as viewable by the public. Activate Round {this.props.roundIndex + 1}?
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">No</div>
            <div className="positive ui ok button">Yes, activate the round.</div>
          </div>
        </div>
      );
    }
  });

  var DeactivateRoundModal = ReactMeteor.createClass({
    componentDidMount: function() {
      var self = this;

      $(".ui.modal").modal({
        closable: true,
        detachable: false,
        onApprove: function() {
          Meteor.call("deactivateRound", self.props.roundIndex, function(err, result) {
            // TODO
            if(err) {
              alert(err.reason);
            }
          });

          self.props.switchContainerContextType(ManagementContextConstants.MANAGE_CONTEXT_TYPE, self.props.roundIndex);
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      })
      .modal("show");
    },

    render: function() {
      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Deactivate Round
          </div>
          <div className="content">
            <div className="description">
              Deactivating a round allows you to re-assign teams. You must inform participants that changes have been made! Existing results and scores will be kept.
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">No</div>
            <div className="negative primary ui ok button">Yes, deactivate the round.</div>
          </div>
        </div>
      );
    }
  });

  var ManagementHotContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        tournament: Tournaments.findOne({ownerId: Meteor.userId()})
      };
    },

    handleSelectPublicRegistration: function(e) {
      Meteor.call("togglePublicRegistration", function(err, result) {
        if(err) {
          // TODO
          alert(err.reason);
        }
        // else {
        //   // We probably don't need to lag-compensate here because Meteor methods should
        //   // theoretically already do it for us.
        // }
      }.bind(this));
    },

    handleSelectPublicView: function() {
      Meteor.call("togglePublicView", function(err, result) {
        // TODO:
        if(err) {
          alert(err.reason);
        }
      });
    },

    render: function() {
      var hasCreatedRound = this.state.tournament.rounds.length > 0;

      var publicRegistrationText = "Public Registration of Teams/Judges is ";
      if(hasCreatedRound) {
        publicRegistrationText += "Closed because at least one Round is created.";
      }
      else {
        if(this.state.tournament.enablePublicRegistration) {
          publicRegistrationText += "Open.";
        }
        else {
          publicRegistrationText += "Closed.";
        }
      }

      return (
        <div>
          <div className="row">
            <div className="ui toggle checkbox">
              <input
                ref="enablePublicRegistrationCheckBox"
                checked={this.state.tournament.enablePublicRegistration}
                onClick={this.handleSelectPublicRegistration}
                readOnly
                type="checkbox"
              >
                <label>{publicRegistrationText}</label>
              </input>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="ui toggle checkbox">
              <input
                ref="enablePublicViewCheckBox"
                checked={this.state.tournament.enablePublicView}
                onClick={this.handleSelectPublicView}
                readOnly
                type="checkbox"
              >
                <label>The public {this.state.tournament.enablePublicView ? "can" : "cannot"} see your tournament.</label>
              </input>
            </div>
          </div>
          {/* We need to implement registration url here. */}
          <br />
          <div className="row">
            <ManagementHot context={this.props.context} tournament={this.state.tournament} />
          </div>


        </div>
      );
    }
  });

  var ManagementHot = ReactMeteor.createClass({
    componentDidMount: function() {
      if(!this.hot) {
        this.initializeHot(this.props.context);
      }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
      if(!this.hot || !_.isEqual(this.props.context, nextProps.context)) {
        return true;
      }

      // Only update if our table data AND current state is out of sync with nextState.
      // Updating serves only one purpose: To loadData to the table.

      // Why check for both conditions: Because this can be called even if
      // current state === nextState.
      var tableData = _.filter(this.hot.getData(), function(rowData, index) {
          return !this.hot.isEmptyRow(index);
      }.bind(this));

      return !_.isEqual(tableData, this.props.context.transformCollectionToTableData(nextProps.tournament)) &&
        !_.isEqual(this.props.tournament, nextProps.tournament);
    },

    componentDidUpdate: function (prevProps, prevState) {
      if(!this.hot) {
        this.initializeHot(this.props.context);
      }
      else {
        if(_.isEqual(this.props.context, prevProps.context)) {
          this.hot.loadData(this.props.context.transformCollectionToTableData(this.props.tournament));
        }
        else {
          this.hot.destroy();
          this.hot = undefined;
          this.initializeHot(this.props.context);
        }
      }
    },

    componentWillUnmount: function () {
      if(this.hot) {
        this.hot.destroy();
        this.hot = undefined;
      }
    },

    initializeHot: function(context) {
      var componentThis = this;
      var tableData = this.props.context.transformCollectionToTableData(this.props.tournament);
      var allowRemoveRow = false;

      this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
        data: tableData,
        minCols: context.colHeaders.length,
        startCols: context.colHeaders.length,
        minSpareRows: 1,
        rowHeaders: true,
        colHeaders: context.colHeaders,
        contextMenu: true,
        autoWrapRow: true,
        undo: true,
        stretchH: "all",
        height: 500,
        allowRemoveColumn: false,
        allowInsertColumn: false,
        allowInvalid: false,
        dataSchema: context.dataSchema,
        columns: context.columns,
        columnSorting: true,
        afterCreateRow: function() {
          this.validateCells(function() {
            // do nothing.
          });
        },
        beforeValidate: function(value, row, prop, source) {
          if(!this.isEmptyRow(row) && value === null) {
            return false;
          }
          if(typeof value === "string" && value.length <= 0) {
            var selection = this.getSelected();

            if(selection[1] === 0 && selection[3] === context.colHeaders.length - 1) {
              return true;
            }

            return false;
          }
        },
        validator: function(value, callback) {
          if(value === false) {
            callback(false);
          }
          else {
            callback(true);
          }
        },

        beforeChange: function(changes) {
          var affectedRows = _.map(changes, function(change) {
            var row = change[0];

            return row;
          });

          var uniqueAffectedRows = _.uniq(affectedRows);

          var everyCellInRowChanged = _.every(uniqueAffectedRows, function(uniqueRowIndex) {
            var changesInSameRow = _.filter(changes, function(change) {
              return change[0] === uniqueRowIndex;
            });

            return changesInSameRow.length === context.colHeaders.length;
          });

          var everyChangeIsEmptyString = _.every(changes, function(change) {
            var newValue = change[3];

            return newValue === "";
          });

          if(everyCellInRowChanged && everyChangeIsEmptyString) {
            uniqueAffectedRows.sort();

            this.alter("remove_row", uniqueAffectedRows[0], uniqueAffectedRows.length);

            return false;
          }
        },

        afterChange: function(changes, source) {
          //  We might want to perform caching if source === "paste"
          if(source === "loadData") {
            return;
          }

          var context = componentThis.props.context;

          var dataArray = componentThis.getDataToBeChanged(changes, this);
          if(!dataArray) {
            return;
          }

          // Rooms are special, we just re-register all of them for now
          // as they are just string arrays.
          if(context.type === ManagementContextConstants.ROOM_CONTEXT.type) {

            var data = this.getData();

            var dataWithoutEmptyRows = _.filter(data, function(rowData, index) {
                return !this.isEmptyRow(index);
            }.bind(this));

            var roomStrings = _.map(dataWithoutEmptyRows, function(rowData) {
              return rowData.location;
            });

            Meteor.call(context.registerMethod, roomStrings, function(err, result) {
              // TODO
              if(err) {
                alert(err.reason);
              }
            });
          }
          else {
            _.each(dataArray, function(data) {
              var collectionToSend;
              if(data.guid) {
                collectionToSend = context.transformTableDataRowToCollection(data);

                Meteor.call(context.updateMethod, collectionToSend, function(err, result) {
                  // TODO
                  if(err) {
                    alert(err.reason);
                  }
                });
              }
              else {
                collectionToSend = [context.transformTableDataRowToCollection(data)];
                Meteor.call(context.registerMethod, collectionToSend, function(err, result) {
                  // TODO
                  if(err) {
                    alert(err.reason);
                  }
                });
              }
            });
          }
        },
        beforeRemoveRow: function(index, amount) {
          // Check if all rows to remove are empty.
          var rowIndexes = _.range(index, index+amount);

          var notEmptyRows = _.filter(rowIndexes, function(rowIndex) {
            return !this.isEmptyRow(rowIndex) || this.getSourceDataAtRow(rowIndex).guid;
          }.bind(this));

          var hasNonInitialRound = _.some(componentThis.props.tournament.rounds, function(round) {
            return round.state !== "initial";
          });

          if(notEmptyRows.length <= 0) {
            return true;
          }

          if(hasNonInitialRound) {
            return false;
          }

          var thisTable = this;
          var context = componentThis.props.context;

          if(allowRemoveRow === true) {
            if(context.type === ManagementContextConstants.ROOM_CONTEXT.type) {
              var data = this.getData();

              var dataWithoutEmptyRows = _.filter(data, function(rowData, rowIndex) {
                  return !this.isEmptyRow(rowIndex) && !_.contains(rowIndexes, rowIndex);
              }.bind(this));

              var roomStrings = _.map(dataWithoutEmptyRows, function(rowData) {
                return rowData.location;
              });

              Meteor.call(context.registerMethod, roomStrings, function(err, result) {
                // TODO
                if(err) {
                  alert(err.reason);
                }
              });

              return true;
            }

            for(var i=index; i<(index+amount); i++) {
              var rowData = this.getSourceDataAtRow(i);

              if(!_.contains(rowData, null)) {
                var collectionToSend = context.transformTableDataRowToCollection(rowData);

                /* jshint ignore:start */
                // TODO: A more performant way for this method call.
                Meteor.call(context.removeMethod, collectionToSend, function(err, result) {
                  // TODO
                  if(err) {
                    alert(err.reason);
                  }
                });
                /* jshint ignore:end */
              }
              // Should we consider an 'else' case here where an incomplete thing is around?
            }
            return true;
          }
          else {
            var modalDOM = $("<div>").modal();

            var onDeny = function() {
              allowRemoveRow = false;
            };

            var onApprove = function() {
              allowRemoveRow = true;
              thisTable.alter("remove_row", index, amount);
            };

            React.render(<DeleteRowModal
              modalDOM={modalDOM}
              onModalDeny={onDeny}
              onModalApprove={onApprove} />,
              modalDOM[0]
            );

            return false;
          }
        },
        afterRemoveRow: function(index, amount) {
          allowRemoveRow = false;
        }
      });
    },

    getDataToBeChanged: function(changes, hot) {
      var uniqueChanges = _.filter(changes, function(change) {
        return change[2] !== change[3];
      });

      if(uniqueChanges.length <= 0) {
        return null;
      }

      var uniqueRowIndexes = [];
      _.each(uniqueChanges, function(change) {
        if(!_.contains(uniqueRowIndexes, change[0])){
          uniqueRowIndexes.push(change[0]);
        }
      });

      var dataToBeChanged = _.chain(uniqueRowIndexes)
        .map(function(index) {
          var data = hot.getSourceDataAtRow(index);

          var hasIncompleteData = _.some(data, function(element) {
            return !element || element.length <= 0;
          });

          return hasIncompleteData? null : data;
        })
        .filter(function(data) {
          return data !== null;
        })
        .value();

      return dataToBeChanged.length <= 0? null : dataToBeChanged;
    },

    render: function() {
      return (
        <div>
          <div className="row">
              <div className="handsontable" ref="handsontable"></div>
          </div>

          {/*UI for the Modal we will render*/}

        </div>
      );
    }
  });

  var DeleteRowModal = ReactMeteor.createClass({
    componentDidMount: function() {
      var self = this;

      $(".ui.modal").modal({
        closable: false,
        detachable: false,
        onDeny: function() {
          self.props.onModalDeny();
        },
        onApprove: function() {
          self.props.onModalApprove();
        },
        onHidden: function() {
          React.unmountComponentAtNode(self.props.modalDOM[0]);
          $(this).remove();
        }
      })
      .modal("show");
    },

    render: function() {
      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            Warning
          </div>
          <div className="content">
            <div className="description">
              Are you sure you want to delete the item?
            </div>
          </div>
          <div className="actions">
            <div className="ui cancel button">No</div>
            <div className="ui ok button">Yes</div>
          </div>
        </div>
      );
    }
  });

  var RoundHotContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        tournament: Tournaments.findOne({ownerId: Meteor.userId()})
      };
    },

    render: function() {
      if(!this.state.tournament.rounds[this.props.roundIndex]) {
        // Do we want to set the session? Somehow it complains but works fine.
        // Session.set("containerContextType", TEAM_CONTEXT.type);
        return false;
      }

      var warningMessage = (function() {
        if(this.state.tournament.currentInvariantViolations.length > 0) {
          return (
            <div className="ui warning message">
              <div className="header">
                Warning! These errors must be resolved before your can further proceed.
              </div>
              <ul className="list">
                {this.state.tournament.currentInvariantViolations.map(function(violation, index) {
                  return <li key={index}>{violation.message}</li>;
                })}
              </ul>
            </div>
          );
        }
        return undefined;
      }.bind(this))();



      return (
        <div>
          <div className="row">
            {warningMessage}
          </div>
          <br />
          <div className="row">
            <RoundHot roundIndex={this.props.roundIndex} context={this.props.context} tournament={this.state.tournament} />
          </div>
        </div>
      );
    }
  });

  var RoundHot = ReactMeteor.createClass({
    componentDidMount: function () {
      if(!this.hot) {
        this.initializeHot();
      }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
      if(!this.hot ||
        !_.isEqual(this.props.context, nextProps.context) ||
        !_.isEqual(this.props.roundIndex, nextProps.roundIndex) ||
        !_.isEqual(this.props.tournament.rounds[this.props.roundIndex].state, nextProps.tournament.rounds[this.props.roundIndex].state)
      ) {
        return true;
      }

      // Only update if our table data AND current state is out of sync with nextState.
      // Updating serves only one purpose: To loadData to the table.

      // Why check for both conditions: Because this can be called even if
      // current state === nextState.
      var tableData = _.filter(this.hot.getData(), function(rowData, index) {
          return !this.hot.isEmptyRow(index);
      }.bind(this));

      return !_.isEqual(this.props.tournament, nextProps.tournament) &&
        !_.isEqual(tableData, this.props.context.transformCollectionToTableData(nextProps.tournament, nextProps.roundIndex));

    },

    componentDidUpdate: function (prevProps, prevState) {
      if(!this.hot) {
        this.initializeHot();
      }
      else {
        if(_.isEqual(this.props.context, prevProps.context)) {
          var currRoundState = this.props.tournament.rounds[this.props.roundIndex].state;

          var isActiveReadOnly = currRoundState === "initial"? false : true;

          this.hot.updateSettings({
            readOnly: isActiveReadOnly
          });

          this.hot.loadData(this.props.context.transformCollectionToTableData(this.props.tournament, this.props.roundIndex));
        }
        else {
          this.hot.destroy();
          this.hot = undefined;
          this.initializeHot();
        }
      }
    },

    componentWillUnmount: function () {
      if(this.hot) {
        this.hot.destroy();
        this.hot = undefined;
      }
    },

    initializeHot: function() {
      var context = this.props.context;
      var roundIndex = this.props.roundIndex;
      var componentThis = this;
      var tableData = this.props.context.transformCollectionToTableData(this.props.tournament, roundIndex);

      var isActiveReadOnly = (function() {
        var round = this.props.tournament.rounds[roundIndex];

        return round.state !== "initial";

      }.bind(this))();

      this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
        data: tableData,
        minCols: context.colHeaders.length,
        startCols: context.colHeaders.length,
        minSpareRows: 0,
        maxRows: tableData.length,
        rowHeaders: true,
        colHeaders: context.colHeaders,
        autoWrapRow: true,
        stretchH: "all",
        height: 500,
        allowRemoveColumn: false,
        allowInsertColumn: false,
        allowInsertRow: false,
        allowRemoveRow: false,
        readOnly: isActiveReadOnly,
        dataSchema: context.dataSchema,
        columns: context.columns,
        columnSorting: true,
        afterChange: function(changes, source) {
          if(source === "loadData") {
            return;
          }

          _.each(changes, function(change) {
            if(change[1] !== "isActive") {
              throw new Meteor.Error("invalidAction",
                "You may only change active status here. Please go to the Management tab to change information about teams.");
            }

            var data = this.getSourceDataAtRow(change[0]);

            var collectionToSend = context.transformTableDataRowToCollection(data);

            Meteor.call(context.updateMethod, collectionToSend, roundIndex, change[3], function(err, result) {
              if(err) {
                // TODO
                alert(err.reason);
              }
            });
          }.bind(this));
        }
      });
    },

    render: function() {
      return (
        <div className="row">
          <div ref="handsontable"></div>
        </div>
      );

    }

  });

  var TabHotContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      Session.setDefault("canEdit", false);
      return {
        tournament: Tournaments.findOne({ownerId: Meteor.userId()}),
        canEdit: Session.get("canEdit")
      };
    },

    render: function() {
      // TODO: change canEdit based on button.
      return (
        <div className="row">
          <TabHot canEdit={this.state.canEdit} context={this.props.context} tournament={this.state.tournament} />
        </div>
      );
    }
  });

  var TabHot = ReactMeteor.createClass({
    componentDidMount: function () {
      if(!this.hot) {
        this.initializeHot();
      }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
      if(!this.hot ||
        !_.isEqual(this.props.context, nextProps.context) ||
        !_.isEqual(this.props.canEdit, nextProps.canEdit)) {
        return true;
      }

      // TODO: Better checks.

      return !_.isEqual(this.props.tournament, nextProps.tournament);
    },

    componentDidUpdate: function (prevProps, prevState) {
      if(!this.hot) {
        this.initializeHot();
      }
      else {
        if(_.isEqual(this.props.context, prevProps.context)) {
          // TODO: update data depending on whether editing is allowed.
          this.hot.updateSettings({
            readOnly: this.props.canEdit
          });

          //this.hot.loadData(this.props.context.transformCollectionToTableData(this.props.tournament));
        }
        else {
          this.hot.destroy();
          this.hot = undefined;
          this.initializeHot();
        }
      }
    },

    componentWillUnmount: function () {
      if(this.hot) {
        this.hot.destroy();
        this.hot = undefined;
      }
    },

    initializeHot: function() {
      var componentThis = this;
      var context = this.props.context;
      var colHeaders = context.getColHeaders(this.props.tournament);
      var dataSchema = context.getDataSchema(this.props.tournament);
      var columns = context.getColumns(this.props.tournament);
      var tableData = context.transformCollectionToTableData(this.props.tournament);

      var readOnly = !this.props.canEdit;

      this.hot = new Handsontable(this.refs.handsontable.getDOMNode(), {
        data: tableData,
        minCols: colHeaders.length,
        startCols: colHeaders.length,
        minSpareRows: 0,
        maxRows: tableData.length,
        rowHeaders: true,
        colHeaders: colHeaders,
        autoWrapRow: true,
        stretchH: "all",
        height: 500,
        allowRemoveColumn: false,
        allowInsertColumn: false,
        allowInsertRow: false,
        allowRemoveRow: false,
        readOnly: readOnly,
        dataSchema: dataSchema,
        columns: columns,
        columnSorting: true,
        afterChange: function(changes, source) {
          // TODO?
        }
      });
    },

    render: function() {
      return (
        <div className="row">
          <div ref="handsontable"></div>
        </div>
      );

    }
  });

  var ActiveRoundRoomsContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      var tournament = Tournaments.findOne({ownerId: Meteor.userId()});
      return {
        tournament: tournament,
        schemaInjectedRound: SchemaHelpers.getSchemaInjectedRound(tournament, this.props.roundIndex),
      };
    },

    renderRooms: function(room) {
      return _.map(this.state.schemaInjectedRound.rooms, function(room, roomIndex) {
        return (
            <ActiveRoomComponent
              key={roomIndex}
              room={room}
              roundIndex={this.props.roundIndex}/>
        );
      }.bind(this));
    },

    render: function() {
      return (
        <div>
          <div className="row">
            <div className="ui stackable two column grid">
              {this.renderRooms()}
            </div>
          </div>
        </div>
      );
    }

  });

  var RoundRoomsContainer = ReactMeteor.createClass({
    getMeteorState: function() {
      var tournament = Tournaments.findOne({ownerId: Meteor.userId()});
      Session.setDefault("filteredRoomIds", ["", ""]);
      Session.setDefault("currentDraggedJudgeData", null);
      return {
        tournament: tournament,
        schemaInjectedRound: this.filterRooms(SchemaHelpers.getSchemaInjectedRound(tournament, this.props.roundIndex), Session.get("filteredRoomIds")),
        currentDraggedJudgeData: Session.get("currentDraggedJudgeData")
      };
    },

    filterRooms: function(schemaInjectedRound, filteredRoomIds) {
      schemaInjectedRound.rooms = _.filter(schemaInjectedRound.rooms, function(room) {
        return _.contains(filteredRoomIds, room.locationId) || _.contains(filteredRoomIds, "");
      });

      return schemaInjectedRound;
    },

    componentDidMount: function () {
      var that = this;
      $("#" + this.refs.selectOne.getDOMNode().id).dropdown({
        onChange: function() {
          that.handleFilter();
        }
      });
      $("#" + this.refs.selectTwo.getDOMNode().id).dropdown({
        onChange: function() {
          that.handleFilter();
        }
      });
    },

    setCurrentDraggedJudge: function(judge, roundIndex) {
      Session.set("currentDraggedJudgeData", {
        judge: judge,
        roundIndex: roundIndex
      });
    },

    clearCurrentDraggedJudge: function(){
      Session.set("currentDraggedJudgeData", null);
    },

    getDragData: function() {
      return Session.get("currentDraggedJudgeData");
    },

    onDrop: function(room) {
      var judge = this.getDragData().judge;
      var roundIndex = this.props.roundIndex;

      Meteor.call("changeJudgeRoom", judge, room.locationId, roundIndex, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    },

    renderRooms: function(room) {
      var roundState = this.state.schemaInjectedRound.state;
      return _.map(this.state.schemaInjectedRound.rooms, function(room, roomIndex) {
        if(roundState === "finished") {
          return <RoomComponent key={roomIndex} room={room} roundIndex={this.props.roundIndex} />;
        }

        return (
            <DroppableRoomComponent
              key={roomIndex}
              onDragStart={this.setCurrentDraggedJudge}
              onDragStop={this.clearCurrentDraggedJudge}
              getDragData={this.getDragData}
              onDrop={this.onDrop.bind(null, room)}
              room={room}
              teams={this.state.tournament.teams}
              rooms={this.state.tournament.rounds[this.props.roundIndex].rooms}
              roundIndex={this.props.roundIndex}/>
        );
      }.bind(this));
    },

    handleFilter: function(e, index) {
      var firstFilteredRoom = React.findDOMNode(this.refs.selectOne).value;
      var secondFilteredRoom = React.findDOMNode(this.refs.selectTwo).value;

      Session.set("filteredRoomIds", [firstFilteredRoom, secondFilteredRoom]);
    },

    clearFilter: function() {
      Session.set("filteredRoomIds", ["", ""]);

      $("#" + this.refs.selectOne.getDOMNode().id).dropdown("clear");
      $("#" + this.refs.selectTwo.getDOMNode().id).dropdown("clear");
    },

    render: function() {
      return (
        <div>
          <div className="row">
            <div className="ui three column grid">
              <div className="column">
                <select ref="selectOne" onChange={this.handleFilter.bind(this, 0)} className="ui search selection dropdown" id="filterOne">
                  <option value="">Filter 1</option>
                  {_.map(this.state.tournament.rounds[this.props.roundIndex].rooms, function(room, roomIndex) {
                    return (
                      <option key={roomIndex} value={room.locationId}>{room.locationId}</option>
                    );
                  })}
                </select>
              </div>
              <div className="column">
                <select ref="selectTwo" onChange={this.handleFilter.bind(this, 1)} className="ui search selection dropdown" id="filterTwo">
                  <option value="">Filter 2</option>
                  {_.map(this.state.tournament.rounds[this.props.roundIndex].rooms, function(room, roomIndex) {
                    return (
                      <option key={roomIndex} value={room.locationId}>{room.locationId}</option>
                    );
                  })}
                </select>
              </div>
              <div className="column">
                <button onClick={this.clearFilter} className="ui button">Clear Filter</button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="ui stackable three column grid">
              {this.renderRooms()}
            </div>
          </div>
        </div>
      );
    }
  });

  var ActiveRoomComponent = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        room: this.props.room,
        doesRoomScoresAddUp: ValidatorHelper.doesRoomScoresAddUp(this.props.room.teams, this.props.roundIndex)
      };
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      if(this.state.doesRoomScoresAddUp !== nextState.doesRoomScoresAddUp) {
        return true;
      }

      var roundIndex = this.props.roundIndex;

      var currentTeams = this.props.room.teams;
      var nextTeams = nextState.room.teams;

      // length of teams should be the same.
      var allResultSame = _.every(currentTeams, function(currTeam, index) {
        var nextTeam = nextTeams[index];

        var resultSame = currTeam.resultForRound[roundIndex] === nextTeam.resultForRound[roundIndex]

        var everyDebaterScoreSame = _.every(currTeam.debaters, function(currDebater, dIndex) {
          if(!ValidatorHelper.isDebaterScoreWithinRange(currDebater.scoreForRound[roundIndex])) {
            return true;
          }

          var nextDebater = nextTeam.debaters[dIndex];

          return currDebater.scoreForRound[roundIndex] === nextDebater.scoreForRound[roundIndex];
        });

        return resultSame && everyDebaterScoreSame;
      });

      if(allResultSame) {
        return false;
      }

      return true;
    },

    changeTeamResult: function(team, event) {
      var roundIndex = this.props.roundIndex;

      var inputClassName = "ui mini fluid input";
      var value = event.target.valueAsNumber;

      function doesRoomScoresAddUp(roomTeams) {
        roomTeams = JSON.parse(JSON.stringify(roomTeams));

        var teamToUpdate = _.find(roomTeams, function(teamInList) {
          return teamInList.guid === team.guid;
        });

        teamToUpdate.resultForRound[roundIndex] = value;

        return ValidatorHelper.doesRoomScoresAddUp(roomTeams, roundIndex);
      }

      this.setState({
        doesRoomScoresAddUp: doesRoomScoresAddUp(this.state.room.teams)
      });

      if(!ValidatorHelper.isTeamResultWithinRange(value)) {
        event.target.parentElement.className =  inputClassName + " error";
      }
      else {
        event.target.parentElement.className =  inputClassName;

        var teamToMutate = _.find(this.state.room.teams, function(propTeam) {
          return propTeam.guid === team.guid;
        });

        teamToMutate.resultForRound[this.props.roundIndex] = value;

        this.setState({
          room: this.state.room
        });


        Meteor.call("changeTeamResult", team, this.props.roundIndex, value, function(err, result) {
          // TODO:
          if(err) {
            alert(err.reason);
          }
        });
      }
    },

    changeDebaterScore: function(team, debaterIndex, event) {
      var roundIndex = this.props.roundIndex;

      var inputClassName = "ui mini fluid input";
      var value = event.target.valueAsNumber;

      function doesRoomScoresAddUp(roomTeams) {
        roomTeams = JSON.parse(JSON.stringify(roomTeams));

        var teamToUpdate = _.find(roomTeams, function(teamInList) {
          return teamInList.guid === team.guid;
        });

        teamToUpdate.debaters[debaterIndex].scoreForRound[roundIndex] = value;

        return ValidatorHelper.doesRoomScoresAddUp(roomTeams, roundIndex);
      }

      this.setState({
        doesRoomScoresAddUp: doesRoomScoresAddUp(this.state.room.teams)
      });

      if(!ValidatorHelper.isDebaterScoreWithinRange(value)) {
        event.target.parentElement.className = inputClassName + " error";
      }
      else {
        event.target.parentElement.className = inputClassName;

        var teamToMutate = _.find(this.state.room.teams, function(propTeam) {
          return propTeam.guid === team.guid;
        });

        teamToMutate.debaters[debaterIndex].scoreForRound[this.props.roundIndex] = value;

        this.setState({
          room: this.state.room
        });

        Meteor.call("changeDebaterScore", team, debaterIndex, this.props.roundIndex, value, function(err, result) {
          // TODO
          if(err) {
            alert(err.reason);
          }
        });
      }
    },

    changeJudgeRank: function(judge, event) {
      var value = event.target.valueAsNumber;

      Meteor.call("changeJudgeRank", judge, this.props.roundIndex, value, function(err, result) {
        // TODO:
        if(err) {
          alert(err.reason);
        }
      });
    },

    renderTeamsForRoom: function() {
      var room = this.props.room;
      var roundIndex = this.props.roundIndex;

      function getTeamForRole(role) {
        return _.find(room.teams, function(team) {
          return team.roleForRound[roundIndex] === role;
        });
      }

      var OGTeam = getTeamForRole("OG");
      var OOTeam = getTeamForRole("OO");
      var CGTeam = getTeamForRole("CG");
      var COTeam = getTeamForRole("CO");

      var teams = [OGTeam, OOTeam, CGTeam, COTeam];
      var teamPositions = ["OG", "OO", "CG", "CO"];

      return (
        <div className="ui stackable two column celled grid">
          {_.map(_.range(2), function(firstRangeIndex) {
            return (
              <div key={firstRangeIndex} className="two column row">
                {_.map(_.range(2), function(secondRangeIndex) {
                  var teamPosition = teamPositions.shift();
                  var team = teams.shift();

                  return (
                    <div key={secondRangeIndex} className="column">
                      <div className="ui two column row">
                        <div className="ui two column grid">
                          <div className="two column row">
                            <div className="ten wide column">
                              <span><strong>{teamPosition + ": "} </strong><u>{team.name + " (" + team.resultForRound[this.props.roundIndex] + ")"}</u></span>
                            </div>
                            <div className="six wide column">
                              <div className="ui mini fluid input">
                                <input type="number" defaultValue={team.resultForRound[this.props.roundIndex]} onChange={this.changeTeamResult.bind(null, team)} />
                              </div>
                            </div>
                          </div>
                          <div className="two column row">
                            <div className="ten wide column">
                              <span>{team.debaters[0].name + " (" + team.debaters[0].scoreForRound[this.props.roundIndex] + ")"}:</span>
                            </div>
                            <div className="six wide column">
                              <div className="ui mini fluid input">
                                <input type="number" defaultValue={team.debaters[0].scoreForRound[this.props.roundIndex]} onChange={this.changeDebaterScore.bind(null, team, 0)} />
                              </div>
                            </div>
                          </div>
                          <div className="two column row">
                            <div className="ten wide column">
                              <span>{team.debaters[1].name + " (" + team.debaters[1].scoreForRound[this.props.roundIndex] + ")"}:</span>
                            </div>
                            <div className="six wide column">
                              <div className="ui mini fluid input">
                                <input type="number" defaultValue={team.debaters[1].scoreForRound[this.props.roundIndex]} onChange={this.changeDebaterScore.bind(null, team, 1)} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }.bind(this))}
              </div>
            );
          }.bind(this))
          }
        </div>
      );
    },

    renderJudgesForRoom: function() {
      var room = this.props.room;
      var roundIndex = this.props.roundIndex;

      return _.map(room.judges, function(judge, judgeIndex) {
        var judgeName = judge.name;

        if(judge.isChairForRound[roundIndex]) {
          judgeName = "(Chair) ".concat(judgeName);
        }

        return (
          <div key={judgeIndex} className="column">
            <div className="ui two column grid">
              <div className="two column row">
                <div className="ten wide column">
                  <div>{judgeName}</div>
                </div>
                <div className="six wide column">
                  <div className="ui mini fluid input">
                    {judge.rankForRound ?
                      <input type="number" defaultValue={judge.rankForRound[this.props.roundIndex]} onChange={this.changeJudgeRank.bind(null, judge)} />
                      : undefined
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }.bind(this));
    },

    render: function() {
      var styleObj = this.state.doesRoomScoresAddUp? {} : {background: "rgba(226, 82, 76, 0.1)"};

      return (
        <div className="column">
          <div style={styleObj} className="ui segment">
            <h3 className="ui horizontal header divider">{this.props.room.locationId}</h3>
            {this.renderTeamsForRoom()}
            <h5 className="ui horizontal header divider">Judges</h5>
            <div className="ui stackable two column grid">
              {this.renderJudgesForRoom()}
            </div>
          </div>
        </div>
      );
    }
  });

  return TournamentManagementContainer;
})();
