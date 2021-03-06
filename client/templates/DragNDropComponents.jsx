"use strict";

DeclashApp.client.templates.ConnectDroppable = (function() {
  // Contract for Droppable Connector:
  // 1. A Component must be passed in.
  // 2. This Component expects these props:
  //      i :  getDragData (function)
  //      ii:  onDrop (function)
  // 3. This connector provides four props:
  //      i  :  onMouseEnter
  //      ii :  onMouseLeave
  //      iii:  onMouseUp
  //      iv :  style
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

  return connectDroppable;
})();

DeclashApp.client.templates.ConnectDraggable = (function() {
  // Contract for Draggable Connector:
  // 1. A Component must be passed it.
  // 2. This Component expects these props:
  //      i   :  getDragData (function)
  //      ii  :  onDragStart (function)
  //      iii :  onDragStop (function)
  // 3. This connector provides two props:
  //      i :  onMouseDown
  //      ii:  style
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
          });
        }
      },

      onMouseMove: function(event) {
        if(!this.state.dragging) {
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
      },

      onMouseUp: function(event) {
        this.removeDragEvents();

        if(this.state.dragging) {
          this.props.onDragStop();

          if(this.isMounted()) {
            return this.setState({
              dragging: false,
            });
          }

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

  return connectDraggable;
})();
