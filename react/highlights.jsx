var App = React.createClass({
  getInitialState: function() {
    return {
      view: this.props.view
    };
  },
  switchView: function(event) {
    this.setState({
      view: event.target.getAttribute('value')
    })
  },
  render: function() {
    var view;
    switch(this.state.view) {
      case 'general':
        view = <General />
        break;
      case 'players':
        view = <Players />
        break;
      case 'characters':
        view = <Characters />
        break;
    }
    var views = ['general', 'players', 'characters'];
    views = views.map(function(v) {
      return (
        <li onClick={this.switchView} value={v}>
          {v.substring(0, 1).toUpperCase() + v.substring(1)}
        </li>
      );
    }.bind(this));
    return (
      <div className='highlights'>
        <ul>
          {views}
        </ul>
        {view}
      </div>
    );
  }
});

var General = React.createClass({
  componentDidMount: function() {
    //
  },
  render: function() {
    return (
      <div>General</div>
    );
  }
});

var Players = React.createClass({
  getInitialState: function() {
    return {
      players: []
    };
  },
  componentDidMount: function() {
    $.getJSON('/api/players', function(data) {
      this.setState({
        players: data
      });
    }.bind(this));
  },
  render: function() {
    if (!this.state.players.length) {
      return <div />
    }
    return (
      <ul>
        {this.state.players.map(function(p) { return <li>{p.name}</li>; })}
      </ul>
    );
  }
});

var Characters = React.createClass({
  getInitialState: function() {
    return {
      characters: []
    };
  },
  componentDidMount: function() {
    $.getJSON('/api/characters', function(data) {
      this.setState({
        characters: data
      });
    }.bind(this));
  },
  render: function() {
    if (!this.state.characters.length) {
      return <div />
    }
    return (
      <ul>
        {this.state.characters.map(function(c) { return <li>{c.name}</li>; })}
      </ul>
    );
  }
});

// http://www.abeautifulsite.net/parsing-urls-in-javascript/
function parseUrl(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    hash: parser.hash
  };
}

var url = parseUrl(document.URL);

React.render(<App view='general' />, document.getElementById('app'));
