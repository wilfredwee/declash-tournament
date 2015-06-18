"use strict";
/* jshint maxlen:false */
/* global Tournaments */
/* global Session */
/* global Handsontable */


var ValidatorHelper;
var ManagementContextConstants;
var SchemaHelpers;
Meteor.startup(function() {
  ValidatorHelper = DeclashApp.helpers.ValidatorHelper;
  ManagementContextConstants = DeclashApp.client.constants.ManagementContextConstants;
  SchemaHelpers = DeclashApp.helpers.SchemaHelpers;
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

    assignCurrentRound: function() {
      Meteor.call("assignRound", this.state.currentRoundIndex, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    },

    deleteCurrentRound: function() {
      Meteor.call("deleteRound", this.state.currentRoundIndex, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    },

    activateCurrentRound: function() {
      Meteor.call("activateRound", this.state.currentRoundIndex, function(err, result) {
        // TODO
        if(err) {
          alert(err.reason);
        }
      });
    },

    finalizeCurrentRound: function() {
      Meteor.call("finalizeRound", this.state.currentRoundIndex, function(err, result) {
        // TODO:
        if(err) {
          alert(err.reson);
        }
      });
    },

    switchContainerContextType: function(contextType, roundIndex) {
      Session.set("containerContextType", contextType);
      if(typeof roundIndex === "number") {
        Session.set("currentRoundIndex", roundIndex);
      }
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
        if(this.state.tournament.rounds[roundIndex].state === "assigned") {
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

      var assignRoundButton = ValidatorHelper.canAssignRound(this.state.tournament, this.state.currentRoundIndex)?
        <button className="ui primary button" onClick={this.assignCurrentRound}>Assign Round</button>
        : undefined;

      var deleteRoundButton = ValidatorHelper.canDeleteRound(this.state.tournament, this.state.currentRoundIndex)?
        <button className="ui negative button" onClick={this.deleteCurrentRound}>Delete Round</button>
        : undefined;

      var activateRoundButton = ValidatorHelper.canActivateRound(this.state.tournament, this.state.currentRoundIndex)?
        <button className="ui positive button" onClick={this.activateCurrentRound}>Activate Round and Publish Assignment</button>
        : undefined;

      var finalizeRoundButton = ValidatorHelper.canFinalizeRound(this.state.tournament, this.state.currentRoundIndex)?
        <button className="ui positive button" onClick={this.finalizeCurrentRound}>Finalize Round {this.state.currentRoundIndex + 1}</button>
        : undefined;

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
          <div className="row">
            <h3>Managing Round {(this.state.currentRoundIndex + 1).toString()}.</h3>
          </div>
          <br />
          <div className="row">
            {assignRoundButton}
          </div>
          <div className="row">
            {deleteRoundButton}
          </div>
          <div className="row">
            {activateRoundButton}
          </div>
          <div className="row">
            {finalizeRoundButton}
          </div>
          <br />
          <div className="row">
            {contentContainer}
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

    render: function() {
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
                <label>Public Registration of Teams/Judges is {this.state.tournament.enablePublicRegistration ? "Open" : "Closed"}.</label>
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
                alert(err);
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
                    alert(err);
                  }
                });
              }
              else {
                collectionToSend = [context.transformTableDataRowToCollection(data)];
                Meteor.call(context.registerMethod, collectionToSend, function(err, result) {
                  // TODO
                  if(err) {
                    alert(err);
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

          if(notEmptyRows.length <= 0) {
            return true;
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
                  alert(err);
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
                    alert(err);
                  }
                });
                /* jshint ignore:end */
              }
              // Should we consider an 'else' case here where an incomplete thing is around?
            }
            return true;
          }
          else {
            $(".ui.modal").modal({
              closable: false,
              onDeny: function() {
                allowRemoveRow = false;
              },
              onApprove: function() {
                allowRemoveRow = true;
                thisTable.alter("remove_row", index, amount);
              }
            }).modal("show");
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
        schemaInjectedRounds: this.getSchemaInjectedRounds(tournament),
      };
    },

    getSchemaInjectedRounds: function(tournament) {
      return _.map(_.map(tournament.rounds, _.clone), function(round) {
        round.rooms = _.map(round.rooms, function(room) {
          room.teams = _.map(room.teams, function(teamGuid) {
            return _.find(tournament.teams, function(tournamentTeam) {
              return tournamentTeam.guid === teamGuid;
            });
          });

          room.judges = _.map(room.judges, function(judgeGuid) {
            return _.find(tournament.judges, function(tournamentJudge) {
              return tournamentJudge.guid === judgeGuid;
            });
          });

          return room;
        });

        return round;
      });
    },

    renderRooms: function(room) {
      return _.map(this.state.schemaInjectedRounds[this.props.roundIndex].rooms, function(room, roomIndex) {
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
        schemaInjectedRounds: this.getSchemaInjectedRounds(tournament, Session.get("filteredRoomIds")),
        currentDraggedJudgeData: Session.get("currentDraggedJudgeData")
      };
    },

    getSchemaInjectedRounds: function(tournament, filteredRoomIds) {
      return _.map(_.map(tournament.rounds, _.clone), function(round) {
        round.rooms = _.filter(round.rooms, function(room) {
          return _.contains(filteredRoomIds, room.locationId) || _.contains(filteredRoomIds, "");
        });

        round.rooms = _.map(round.rooms, function(room) {
          room.teams = _.map(room.teams, function(teamGuid) {
            return _.find(tournament.teams, function(tournamentTeam) {
              return tournamentTeam.guid === teamGuid;
            });
          });

          room.judges = _.map(room.judges, function(judgeGuid) {
            return _.find(tournament.judges, function(tournamentJudge) {
              return tournamentJudge.guid === judgeGuid;
            });
          });

          return room;
        });

        return round;
      });
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
      return _.map(this.state.schemaInjectedRounds[this.props.roundIndex].rooms, function(room, roomIndex) {
        return (
            <RoomComponent
              key={roomIndex}
              onDragStart={this.setCurrentDraggedJudge}
              onDragStop={this.clearCurrentDraggedJudge}
              getDragData={this.getDragData}
              onDrop={this.onDrop.bind(null, room)}
              room={room}
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


  // Contract for Draggable Connector:
  // 1. A Component must be passed it.
  // 2. This connector provides two props:
  //      i:   onMouseDown
  //      ii: style
  var connectDraggable = function(Component) {
    var DraggableComponent = ReactMeteor.createClass({
      getInitialState: function () {
        return {
            mouseDown: false,
            dragging: false
        };
      },
      render: function() {
        var combinedProps = {
            onMouseDown: this.onMouseDown,
            style: this.getStyle()
        };
        _.extend(combinedProps, this.props);
        return <Component {...combinedProps} />;
      },

      getStyle: function() {
        // To set a style, we build an object accordingly.

        var styleObj = {
          cursor: "move"
        };

        // We're currently dragging something.
        if(this.props.getDragData()) {

          // We're dealing with an object that's being dragged.
          if(this.state.dragging) {
            _.extend(styleObj, {
              position: "absolute",
              left: this.state.left,
              top: this.state.top,
              zIndex: 10,
              pointerEvents: "none"
            });
          }
        }
        return styleObj;
      },

      onMouseDown: function(event) {
        // 0 is left-button
        if(event.button === 0) {
          event.stopPropagation();
          event.preventDefault();
          this.addDragEvents();
          var pageOffset = this.getDOMNode().getBoundingClientRect();
          return this.setState({
            mouseDown: true,
            originX: event.pageX,
            originY: event.pageY,
            elementX: pageOffset.left,
            elementY: pageOffset.top
          });
        }
      },

      onMouseMove: function(event) {

        var deltaX = event.pageX - this.state.originX;
        var deltaY = event.pageY - this.state.originY;
        var distance = Math.abs(deltaX) + Math.abs(deltaY);

        var DRAG_TRESHOLD = 3;

        if(!this.state.dragging && distance > DRAG_TRESHOLD) {
          this.setState({
            dragging: true
          });

          if(typeof this.props.onDragStart === "function") {
            var dragData = typeof this.props.getDragData === "function"?
              this.props.getDragData()
              : undefined;

            this.props.onDragStart(dragData);
          }
        }

        if(this.state.dragging) {
          return this.setState({
            left: this.state.elementX + deltaX + document.body.scrollLeft,
            top: this.state.elementY + deltaY + document.body.scrollTop
          });
        }

      },

      onMouseUp: function(event) {
        this.removeDragEvents();

        if(this.state.dragging) {
          this.props.onDragStop();

          return this.setState({
            dragging: false,
          });
        }
      },

      addDragEvents: function() {
        document.addEventListener("mousemove", this.onMouseMove);
        return document.addEventListener("mouseup", this.onMouseUp);
      },

      removeDragEvents: function() {
        document.removeEventListener("mousemove", this.onMouseMove);
        return document.removeEventListener("mouseup", this.onMouseUp);
      }
    });

    return DraggableComponent;
  };

  // Contract for Droppable Connector:
  // 1. A Component must be passed it.
  // 2. This connector provides four props:
  //      i:   onMouseEnter
  //      ii:  onMouseLeave
  //      iii: onMouseUp
  //      iv:  style
  var connectDroppable = function(Component) {
    var DroppableComponent = ReactMeteor.createClass({
      getInitialState: function() {
        return {
            hover: false
        };
      },

      getStyle: function() {
        var styleObj = {};

        if(this.state.hover && this.props.getDragData()) {
          _.extend(styleObj, {background: "green"});
        }

        return styleObj;
      },

      onMouseEnter: function(event) {
        return this.setState({
          hover: true
        });
      },

      onMouseLeave: function(event) {
        return this.setState({
          hover: false
        });
      },

      onMouseUp: function(event) {
        if(this.props.getDragData()) {
          this.props.onDrop();
        }
      },

      render: function() {
        var props = {
          onMouseEnter: this.onMouseEnter,
          onMouseLeave: this.onMouseLeave,
          onMouseUp: this.onMouseUp,
          style: this.getStyle()
        };

        _.extend(props, this.props);

        return <Component {...props} />;
      }
    });

    return DroppableComponent;
  };

  var ActiveRoomComponent = ReactMeteor.createClass({
    getMeteorState: function() {
      return {
        lastUpdate: new Date()
      };
    },

    componentDidMount: function() {
      var current = new Date();
      this.setState({lastUpdate: current});
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      var lastUpdate = this.state.lastUpdate || new Date();
      var current = new Date();

      if((lastUpdate.getTime() - current.getTime() > 10000) && !_.isEqual(this.props, nextProps)) {
        this.setState({
          lastUpdate: current
        });

        return true;
      }

      return false;
    },

    changeTeamResult: function(team, event) {
      var inputClassName = "ui mini fluid input";
      var value = event.target.valueAsNumber;


      if(!ValidatorHelper.isTeamResultWithinRange(value)) {
        event.target.parentElement.className =  inputClassName + " error";
      }
      else if(ValidatorHelper.isTeamResultDuplicate(this.props.room.teams, team, this.props.roundIndex, value)) {
        event.target.parentElement.className =  inputClassName + " error";
      }
      else {
        event.target.parentElement.className =  inputClassName;

        Meteor.call("changeTeamResult", team, this.props.roundIndex, value, function(err, result) {
          // TODO:
          if(err) {
            alert(err.reason);
          }
        });
      }
    },

    changeDebaterScore: function(team, debaterIndex, event) {
      var inputClassName = "ui mini fluid input";
      var value = event.target.valueAsNumber;

      if(!ValidatorHelper.isDebaterScoreWithinRange(value)) {
        event.target.parentElement.className = inputClassName + " error";
      }
      else {
        event.target.parentElement.className = inputClassName;

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
                              <span><strong>{teamPosition + ": "} </strong><u>{team.name}</u></span>
                            </div>
                            <div className="six wide column">
                              <div className="ui mini fluid input">
                                <input type="number" defaultValue={team.resultForRound[this.props.roundIndex]} onChange={this.changeTeamResult.bind(null, team)} />
                              </div>
                            </div>
                          </div>
                          <div className="two column row">
                            <div className="ten wide column">
                              <span>{team.debaters[0].name}:</span>
                            </div>
                            <div className="six wide column">
                              <div className="ui mini fluid input">
                                <input type="number" defaultValue={team.debaters[0].scoreForRound[this.props.roundIndex]} onChange={this.changeDebaterScore.bind(null, team, 0)} />
                              </div>
                            </div>
                          </div>
                          <div className="two column row">
                            <div className="ten wide column">
                              <span>{team.debaters[1].name}:</span>
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
      return (
        <div className="column">
          <div className="ui segment">
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

  var RoomComponent = connectDroppable(
    ReactMeteor.createClass({
      shouldComponentUpdate: function(nextProps, nextState) {
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
      },

      onDrop: function() {
        this.props.onDrop(this.props.room, this.props.roundIndex);
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
        return _.map(room.judges, function(judge, judgeIndex) {
          return (
            <JudgeComponent
              key={judgeIndex}
              onDragStart={this.props.onDragStart.bind(null, judge, roundIndex)}
              onDragStop={this.props.onDragStop}
              getDragData={this.props.getDragData}
              judge={judge}
              roundIndex={roundIndex}
            />
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
    })
  );

  var JudgeComponent = connectDraggable(
    ReactMeteor.createClass({
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

        return (
          <div className="row"
            onMouseDown={this.props.onMouseDown}
            style={this.props.style}
          >
            <div className="column">
              {judgeName}
            </div>
          </div>
        );
      }
    })
  );

  return TournamentManagementContainer;
})();
