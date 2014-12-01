// TODO: Store commonly grabbed data to avoid repeated ajax calls

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
        <li onClick={this.switchView} value={v} key={v}>
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
  getInitialState: function() {
    return {
      highlightData: {},
      fights: [],
      stats: {}
    };
  },
  componentDidMount: function() {
    $.getJSON('/api/highlights', function(data) {
      var stats = React.addons.update(this.state.stats, {
        topPlayers: {$set: data.topPlayers},
        topChars: {$set: data.topChars},
        bottomChars: {$set: data.bottomChars},
        topStages: {$set: data.topStages},
      });
      this.setState({
        highlightData: data,
        stats: stats
      });
    }.bind(this));
    // get fights and calculate the longest streaks
    $.getJSON('/api/fights', function(fights) {
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

      var stats = React.addons.update(this.state.stats, {
        maxStreakData: {$set: maxStreak},
        maxCharStreakData: {$set: maxCharStreak}
      });
      this.setState({
        fights: fights,
        stats: stats
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
        <div>{this.state.stats.maxStreakData ? <span>{this.state.stats.maxStreakData.name}: {this.state.stats.maxStreakData.maxStreak}</span> : null}</div>
        <div>{this.state.stats.maxCharStreakData ? <span>{this.state.stats.maxCharStreakData.name}: {this.state.stats.maxCharStreakData.maxStreak}</span> : null}</div>
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
        {this.state.players.map(function(p) { return <li key={p.id}>{p.name}</li>; })}
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
        {this.state.characters.map(function(c) { return <li key={c.id}>{c.name}</li>; })}
      </ul>
    );
  }
});

var Stats = React.createClass({
  render: function() {
    if (!this.props.data || !this.props.data.length) {
      return <div />
    }
    var data = this.props.data.map(function(d) {
      var extraStat = this.props.isPlayer ? <div>Rating: {d.rating}</div> :
                 this.props.isStage ? <div>Avg rating change: {d.ratingchange}</div> :
                 null;
      var winStat = !this.props.isStage ? <div>Win %: {Math.round(d.winpct * 100)}%</div> : null;
      return (
        <div key={d.id}>
          <div>Name: {d.name}</div>
          {extraStat}
          {winStat}
          <div>Total Matches: {d.total}</div>
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
