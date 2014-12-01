// stores any fetched data
var STORED_DATA = {};
function getData(url, callback) {
  var field = url.split('api/')[1].replace('/', '_');
  if (!STORED_DATA[field]) {
    $.getJSON(url, function(data) {
      STORED_DATA[field] = data;
      callback(data)
    });
  } else {
    callback(STORED_DATA[field]);
  }
}

var App = React.createClass({
  getInitialState: function() {
    return {
      view: this.props.view,
      // can be relevant to anything, so the name should be general
      data: null
    };
  },
  switchMainView: function(event) {
    this.setState({
      view: event.target.getAttribute('value')
    })
  },
  switchView: function(view, data) {
    this.setState({
      view: view,
      data: data
    });
  },
  render: function() {
    var view;
    switch(this.state.view) {
      case 'general':
        view = <General />
        break;
      case 'players':
        view = <Players switchView={this.switchView} />
        break;
      case 'characters':
        view = <Characters switchView={this.switchView} />
        break;
      case 'player':
        view = <Player data={this.state.data} />
        break;
      case 'character':
        view = <Character data={this.state.data}/>
        break;
      default:
        view = <General />
    }
    var views = ['general', 'players', 'characters'];
    views = views.map(function(v) {
      return (
        <li onClick={this.switchMainView} value={v} key={v}>
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

// GENERAL
var General = React.createClass({
  getInitialState: function() {
    return {
      fights: [],
      stats: {},
      streaks: {}
    };
  },
  componentDidMount: function() {
    getData('/api/highlights', function(data) {
      this.setState({
        stats: data
      });
    }.bind(this));
    // get fights and calculate the longest streaks
    getData('/api/fights', function(fights) {
      var players = {};
      var characters = {};
      function initalizeStreak(id, name, type) {
        var o = type == 'player' ? players : characters;
        if (!o[id]) {
          o[id] = {
            id: id,
            name: name,
            streak: 0,
            maxStreak: 0,
            total: 0
          }
        }
      }
      fights.forEach(function(f) {
        ['player', 'character'].forEach(function(type) {
          initalizeStreak(f[type+1], f[type+'1name'], type);
          initalizeStreak(f[type+2], f[type+'2name'], type);
          var winner = type == 'player' ? f.winner : f.winnerchar;
          var loser = f.player1 == f.winner ? f[type+2] : f[type+1];
          var obj = type == 'player' ? players : characters;
          obj[winner].streak += 1;
          if (obj[winner].streak > obj[winner].maxStreak) {
            obj[winner].maxStreak = obj[winner].streak;
          }
          obj[loser].streak = 0;
          obj[winner].total += 1;
          obj[loser].total += 1;
        });
      });
      var maxStreak = _.max(players, function(p) {return p.maxStreak/p.total;});
      var maxCharStreak = _.max(characters, function(p) {return p.maxStreak/p.total;});

      var streaks = React.addons.update(this.state.streaks, {
        maxStreakData: {$set: maxStreak},
        maxCharStreakData: {$set: maxCharStreak}
      });
      this.setState({
        fights: fights,
        streaks: streaks
      });
    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <h2>General</h2>
        <h3>top players:</h3>
        <Stats data={this.state.stats.topPlayers} isPlayer={true} />
        <h3>max streak:</h3>
        <div>{this.state.streaks.maxStreakData ? <span>{this.state.streaks.maxStreakData.name}: {this.state.streaks.maxStreakData.maxStreak}</span> : null}</div>
        <div>{this.state.streaks.maxCharStreakData ? <span>{this.state.streaks.maxCharStreakData.name}: {this.state.streaks.maxCharStreakData.maxStreak}</span> : null}</div>
        <h3>top characters:</h3>
        <Stats data={this.state.stats.topChars} />
        <h3>bottom characters:</h3>
        <Stats data={this.state.stats.bottomChars} />
        <h3>stages with biggest upset:</h3>
        <Stats data={this.state.stats.topStages} isStage={true} />
      </div>
    );
  }
});

// PLAYERS
var Players = React.createClass({
  getInitialState: function() {
    return {
      players: []
    };
  },
  componentDidMount: function() {
    getData('/api/players', function(data) {
      this.setState({
        players: data
      });
    }.bind(this));
  },
  handleClick: function() {
    var player = _.find(this.state.players, {id: +event.target.getAttribute('value')});
    this.props.switchView('player', player);
  },
  render: function() {
    if (!this.state.players.length) {
      return <div />
    }
    return (
      <ul>
        {this.state.players.map(function(p) { return <li key={p.id} value={p.id} onClick={this.handleClick}>{p.name}</li>; }.bind(this))}
      </ul>
    );
  }
});

var Player = React.createClass({
  getInitialState: function() {
    return {
      stats: {}
    };
  },
  componentDidMount: function() {
    getData('/api/highlights/players/'+this.props.data.id, function(data) {
      this.setState({
        stats: data
      });
    }.bind(this));
    getData('/api/fights', function(fights) {

    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <h2>{this.props.data.name}</h2>
        <h3>best against:</h3>
        <Stats data={this.state.stats.topPlayers} nameField='player2name' />
        <h3>worst against:</h3>
        <Stats data={this.state.stats.bottomPlayers} nameField='player2name' />
        {/*<h3>max streak:</h3>
        <div>{this.state.streaks.maxStreakData ? <span>{this.state.streaks.maxStreakData.name}: {this.state.streaks.maxStreakData.maxStreak}</span> : null}</div>
        <div>{this.state.streaks.maxCharStreakData ? <span>{this.state.streaks.maxCharStreakData.name}: {this.state.streaks.maxCharStreakData.maxStreak}</span> : null}</div>
        */}
        <h3>best characters:</h3>
        <Stats data={this.state.stats.topChars} nameField='charactername' />
        <h3>worst characters:</h3>
        <Stats data={this.state.stats.bottomChars} nameField='charactername' />
        <h3>best stages:</h3>
        <Stats data={this.state.stats.topStages} nameField='stagename' />
        <h3>worst stages:</h3>
        <Stats data={this.state.stats.bottomStages} nameField='stagename' />
      </div>
    );
  }
});

// CHARACTERS
var Characters = React.createClass({
  getInitialState: function() {
    return {
      characters: []
    };
  },
  componentDidMount: function() {
    getData('/api/characters', function(data) {
      this.setState({
        characters: data
      });
    }.bind(this));
  },
  handleClick: function() {
    var character = _.find(this.state.characters, {id: +event.target.getAttribute('value')});
    this.props.switchView('character', character);
  },
  render: function() {
    if (!this.state.characters.length) {
      return <div />
    }
    return (
      <ul>
        {this.state.characters.map(function(c) { return <li key={c.id} value={c.id} onClick={this.handleClick}>{c.name}</li>; }.bind(this))}
      </ul>
    );
  }
});

var Character = React.createClass({
  getInitialState: function() {
    return {
      stats: {}
    };
  },
  componentDidMount: function() {
    getData('/api/highlights/characters/'+this.props.data.id, function(data) {
      this.setState({
        stats: data
      });
    }.bind(this));
    getData('/api/fights', function(fights) {

    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <h2>{this.props.data.name}</h2>
        <h3>best against:</h3>
        <Stats data={this.state.stats.topChars} nameField='character2name' />
        <h3>worst against:</h3>
        <Stats data={this.state.stats.bottomChars} nameField='character2name' />
        {/*<h3>max streak:</h3>
        <div>{this.state.streaks.maxStreakData ? <span>{this.state.streaks.maxStreakData.name}: {this.state.streaks.maxStreakData.maxStreak}</span> : null}</div>
        <div>{this.state.streaks.maxCharStreakData ? <span>{this.state.streaks.maxCharStreakData.name}: {this.state.streaks.maxCharStreakData.maxStreak}</span> : null}</div>
        */}
        <h3>best player with:</h3>
        <Stats data={this.state.stats.topPlayers} nameField='playername' />
        <h3>best stages:</h3>
        <Stats data={this.state.stats.topStages} nameField='stagename' />
        <h3>worst stages:</h3>
        <Stats data={this.state.stats.bottomStages} nameField='stagename' />
      </div>
    );
  }
});

var Stats = React.createClass({
  render: function() {
    if (!this.props.data || !this.props.data.length) {
      return <div />
    }
    var data = this.props.data.map(function(d) {
      var nameField = this.props.nameField || 'name';
      var extraStat = this.props.isPlayer ? <div>Rating: {d.rating}</div> :
                 this.props.isStage ? <div>Avg rating change: {d.ratingchange}</div> :
                 null;
      var winStat = !this.props.isStage ? <div>Win %: {Math.round(d.winpct * 100)}%</div> : null;
      return (
        <div key={d.id}>
          <div>Name: {d[nameField]}</div>
          {extraStat}
          {winStat}
          <div>Total Matches: {d.total}</div>
          <hr />
        </div>
      );
    }.bind(this));
    return (
      <div>
        {data}
      </div>
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
