"use strict";

DeclashApp.client.templates.pages.HomePageContainer = (function() {
  var HomePageContainer = ReactMeteor.createClass({
    render: function() {
      return <Home />;
    }
  });

  var Home = ReactMeteor.createClass({
    render: function() {
      var fontStyle = {fontSize: 12};
      return (
        <div>
          <div className="row">
            <h1>Welcome to DeClash! This is the homepage!</h1>
          </div>
          <div className="row">
            <a className="header" style={fontStyle} href="/tournaments">View Active Tournaments</a>
          </div>
        </div>
      );
    }
  });

  return HomePageContainer;
})();
