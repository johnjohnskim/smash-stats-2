// stores any fetched data
var STORED_DATA = {};
function getData(url, callback) {
  var field = url.split('api/')[1].replace('/', '_');
  if (!STORED_DATA[field]) {
    $.getJSON(url, function(data) {
      STORED_DATA[field] = data;
      if (callback) {
        callback(null, data);
      }
    });
  } else {
    if (callback) {
      callback(null, STORED_DATA[field]);
    }
  }
}
function setLocalData(key, val) {
  STORED_DATA[key] = val;
}
function getLocalData(key) {
  return STORED_DATA[key];
}

function cleanName(name) {
  return name.toLowerCase().replace('.', '').replace(' ', '-');
}

var App = React.createClass({
  componentDidMount: function() {
    function switchFromUrl(url) {
      if (this.state.prevUrl && (url == this.state.prevUrl || /\/highlights\/?$/.test(url))) {
        return;
      }
      url = url.split('/');
      var view = null;
      var data = null;
      if (url[2] == 'player') {
        data = _.find(this.state.playerData, function(p) {
          return cleanName(p.name) == url[3].toLowerCase();
        });
        view = data ? 'player' : 'players';
      }
      else if (url[2] == 'character') {
        data = _.find(this.state.characterData, function(c) {
          return cleanName(c.name) == url[3].toLowerCase();
        });
        view = data ? 'character' : 'characters';
      } else {
        view = url[2] || 'general';
      }
      this.switchView(view, data);
    }
    switchFromUrl = switchFromUrl.bind(this);

    function getQueuedData(url) {
      return function(callback) {
        getData(url, callback);
      }
    }
    queue()
      .defer(getQueuedData('/api/players'))
      .defer(getQueuedData('/api/characters'))
      .await(function(err, players, characters) {
        this.setState({
          playerData: players,
          characterData: characters
        });
        switchFromUrl(location.pathname);
      }.bind(this));

    window.addEventListener("popstate", function(e) {
      switchFromUrl(location.pathname);
    });

    window.addEventListener("keypress", function(e) {
      var newView;
      if (e.keyCode == 98) {
        switch(this.state.view) {
          case 'player':
            newView = 'players';
            break;
          case 'character':
            newView = 'characters';
            break;
          default:
            newView = 'general';
        }
        this.switchView(newView);
      }
    }.bind(this));
  },
  getInitialState: function() {
    return {
      view: null,
      data: null,
      playerData: [],
      characterData: [],
      prevUrl: null
    };
  },
  switchMainView: function(event) {
    var view = event.target.getAttribute('value');
    if (this.state.view == view) {
      return;
    }
    var url = '/highlights/' + view;
    history.pushState(null, null, url);
    this.setState({
      view: view,
      prevUrl: url
    })
  },
  switchView: function(view, data) {
    var url = '/highlights/' + view
    if (data) {
      url += '/' + cleanName(data.name.toLowerCase());
    }
    if (location.pathname != url) {
      history.pushState(null, null, url);
    }
    this.setState({
      view: view,
      data: data,
      prevUrl: url
    });
  },
  render: function() {
    if (!this.state.view) {
      return (<div />);
    }
    var view;
    switch(this.state.view) {
      case 'general':
        view = <General />
        break;
      case 'players':
        view = <Players switchView={this.switchView} players={this.state.playerData} />
        break;
      case 'characters':
        view = <Characters switchView={this.switchView} characters={this.state.characterData} />
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
      var isActive = v.indexOf(this.state.view) > -1;
      var classes = isActive ? 'active' : ''
      return (
        <li onClick={this.switchMainView} value={v} key={v} className={classes}>
          {v.substring(0, 1).toUpperCase() + v.substring(1)}
        </li>
      );
    }.bind(this));
    return (
      <div className='highlights'>
        <ul className='main-menu'>
          {views}
        </ul>
        <div className='main-view'>
          {view}
        </div>
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
    getData('/api/highlights', function(err, data) {
      this.setState({
        stats: data
      });
    }.bind(this));
    // get fights and calculate the longest streaks
    getData('/api/fights', function(err, fights) {
      var players = {};
      var characters = {};
      var maxStreak;
      var maxCharStreak;

      function initializeStreak(id, name, type) {
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

      if (!getLocalData('maxStreak')) {
        fights.forEach(function(f) {
          ['player', 'character'].forEach(function(type) {
            initializeStreak(f[type+1], f[type+'1name'], type);
            initializeStreak(f[type+2], f[type+'2name'], type);
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
        maxStreak = _.max(players, 'maxStreak');
        maxCharStreak = _.max(characters, 'maxStreak');
        setLocalData('maxStreak', maxStreak);
        setLocalData('maxCharStreak', maxCharStreak);
      } else {
        maxStreak = getLocalData('maxStreak');
        maxCharStreak = getLocalData('maxCharStreak');
      }

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
        <hr />
        <h3>top characters:</h3>
        <Stats data={this.state.stats.topChars} />
        <hr />
        <h3>bottom characters:</h3>
        <Stats data={this.state.stats.bottomChars} />
        <hr />
        <h3>max streaks:</h3>
        <div style={{marginBottom: '0.5rem'}}>{this.state.streaks.maxStreakData ? <span>{this.state.streaks.maxStreakData.name}: {this.state.streaks.maxStreakData.maxStreak}</span> : null}</div>
        <div>{this.state.streaks.maxCharStreakData ? <span>{this.state.streaks.maxCharStreakData.name}: {this.state.streaks.maxCharStreakData.maxStreak}</span> : null}</div>
        <hr />
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
  handleClick: function() {
    var player = _.find(this.props.players, {id: +event.target.getAttribute('value')});
    this.props.switchView('player', player);
  },
  render: function() {
    if (!this.props.players.length) {
      return <div />
    }
    return (
      <div>
        <h2>Players</h2>
        <ul className='highlights-list'>
          {this.props.players.map(function(p) { return <li key={p.id} value={p.id} onClick={this.handleClick}>{p.name}</li>; }.bind(this))}
        </ul>
      </div>
    );
  }
});

function getMaxStreak(id, fights, type) {
  var streak = 0;
  var maxStreak = 0;
  var winnerField = type == 'player' ? 'winner' : 'winnerchar';
  var storeField = type+id+'Streak';
  if (getLocalData(storeField)) {
    return getLocalData(storeField);
  }
  fights.forEach(function(f) {
    if (id == f[type+1] || id == f[type+2]) {
      if (id == f[winnerField]) {
        streak += 1;
        if (streak > maxStreak) {
          maxStreak = streak;
        }
      } else {
        streak = 0;
      }
    }
  });
  setLocalData(storeField, maxStreak);
  return maxStreak;
}

var Player = React.createClass({
  getInitialState: function() {
    return {
      stats: {}
    };
  },
  componentDidMount: function() {
    getData('/api/highlights/players/'+this.props.data.id, function(err, data) {
      this.setState({
        stats: data
      });
    }.bind(this));
    getData('/api/fights', function(err, fights) {
      var maxStreak = getMaxStreak(this.props.data.id, fights, 'player');
      this.setState({
        maxStreak: maxStreak
      });
    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <h2>Player: {this.props.data.name}</h2>
        <h3>best against:</h3>
        <Stats data={this.state.stats.topPlayers} nameField='player2name' />
        <hr />
        <h3>worst against:</h3>
        <Stats data={this.state.stats.bottomPlayers} nameField='player2name' />
        <hr />
        <h3>max streak:</h3>
        <div>{this.state.maxStreak} matches</div>
        <hr />
        <h3>best characters:</h3>
        <Stats data={this.state.stats.topChars} nameField='charactername' />
        <hr />
        <h3>worst characters:</h3>
        <Stats data={this.state.stats.bottomChars} nameField='charactername' />
        <hr />
        <h3>best stages:</h3>
        <Stats data={this.state.stats.topStages} nameField='stagename' />
        <hr />
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
  handleClick: function() {
    var character = _.find(this.props.characters, {id: +event.target.getAttribute('value')});
    this.props.switchView('character', character);
  },
  render: function() {
    if (!this.props.characters.length) {
      return <div />
    }
    return (
      <div>
        <h2>Characters</h2>
        <ul className="highlights-list">
          {this.props.characters.map(function(c) { return <li key={c.id} value={c.id} onClick={this.handleClick}>{c.name}</li>; }.bind(this))}
        </ul>
      </div>
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
    getData('/api/highlights/characters/'+this.props.data.id, function(err, data) {
      this.setState({
        stats: data
      });
    }.bind(this));
    getData('/api/fights', function(err, fights) {
      var maxStreak = getMaxStreak(this.props.data.id, fights, 'character');
      this.setState({
        maxStreak: maxStreak
      });
    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <h2>Character: {this.props.data.name}</h2>
        <h3>best against:</h3>
        <Stats data={this.state.stats.topChars} nameField='character2name' />
        <hr />
        <h3>worst against:</h3>
        <Stats data={this.state.stats.bottomChars} nameField='character2name' />
        <hr />
        <h3>max streak:</h3>
        <div>{this.state.maxStreak} matches</div>
        <hr />
        <h3>best player with:</h3>
        <Stats data={this.state.stats.topPlayers} nameField='playername' />
        <hr />
        <h3>best stages:</h3>
        <Stats data={this.state.stats.topStages} nameField='stagename' />
        <hr />
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
    var data = this.props.data.map(function(d, i) {
      var nameField = this.props.nameField || 'name';
      var fields = [
        ['Name', nameField],
        ['Total Matches', 'total']
      ];
      if (this.props.isPlayer) {
        fields.splice(1, 0, ['Rating', 'rating']);
      } else if (this.props.isStage) {
        fields.splice(1, 0, ['Avg rating change', 'ratingchange']);
      }
      if (!this.props.isStage) {
        fields.splice(2, 0, ['Win %', 'winpct']);
      }
      fields = fields.map(function(f) {
        return f[1] != 'winpct' ?
          (<div><span className='stat-key'>{f[0]}</span>: <span className='stat-val'>{d[f[1]]}</span></div>) :
          (<div><span className='stat-key'>Win %</span>: <span className='stat-val'>{Math.round(d.winpct * 100)}%</span></div>);
      });
      return (
        <div key={i} className='stats'>
          {fields}
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

React.render(<App />, document.getElementById('app'));
