HomePageContainer = ReactMeteor.createClass({
  render: function() {
    return <Home />;
  }
});

var Home = ReactMeteor.createClass({
  templateName: "Home",

  handleClick: function() {
    window.location.href = "/register";
  },

  render: function() {
    var fontStyle = {fontSize: 12};
    return (
      <div className="ui page grid main">
        <div className="row">
          <h1>Welcome to DeClash! This is the homepage!</h1>
        </div>
        <div className="row">
          <a className="header" style={fontStyle} href="/register">Register as Tab Director</a>
        </div>
      </div>
    );
  }
});
