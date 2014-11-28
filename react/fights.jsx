// var queue = require('queue-async');

function getData(url) {
  return function(callback) {
    $.getJSON(url, {}, function(data) {
      callback(null, data);
    });
  };
}

// name -> img filename
function getImg(name) {
  return name.toLowerCase().replace(/[\.\']/g, '').replace(/\s/g, '_').replace('é', 'e');
}

var App = React.createClass({
  componentDidMount: function() {
    queue()
      .defer(getData('/api/players'))
      .defer(getData('/api/characters'))
      .defer(getData('/api/stages'))
      .await(function(err, players, characters, stages) {
        // attach img filenames
        characters.forEach(function(c) {
          c.img = getImg(c.name) + '.png';
        });
        stages.forEach(function(s) {
          s.img = getImg(s.name) + '.jpg';
        });

        this.setState({
          playerData: players,
          characterData: characters,
          stageData: stages
        });
      }.bind(this));
  },
  getInitialState: function() {
    return {
      // meta data from api
      playerData: [],
      characterData: [],
      stageData: [],
      // fields for adding a fight
      players: [],
      characters: [],
      stage: 0,
      winner: 0,
      rating: 0,
      notes: '',
      // other
      // basic: easiest to input, pro: fastest to input, doubles: 2v2
      enterType: 'basic',
      errorMsg: '',
      isFightAdded: false,
      playerQueue: [],
      characterFilter: '',
      stageFilter: ''
    };
  },
  selectPlayer: function(p, pos) {
    p = +p;
    pos--;
    var newPlayers = this.state.players.slice();
    if ((pos === 0 && newPlayers[1] != p)  || (pos === 1 && newPlayers[0] != p)) {
      newPlayers[pos] = p;
    }
    this.setState({
      players: newPlayers
    });
  },
  addPlayer: function(p) {
    if (this.state.players.length < 2 && this.state.players.indexOf(p) == -1) {
      this.setState({
        players: this.state.players.concat([p])
      });
    }
  },
  removePlayer: function() {
    if (this.state.players.length) {
      if (this.state.winner == this.state.players[this.state.players.length - 1]) {
        this.setState({
          winner: 0
        });
      }
      this.setState({
        players: this.state.players.slice(0, this.state.players.length - 1)
      });
    }
  },
  queuePlayer: function(p) {
    if (this.state.playerQueue.indexOf(p) == -1) {
      this.addPlayer(p);
      this.setState({
        playerQueue: this.state.playerQueue.concat([p])
      });
    }
  },
  dequeuePlayer: function(p) {
    this.setState({
      playerQueue: this.state.playerQueue.filter(function(x) {
        return x != p;
      })
    });
  },
  addCharacter: function(c) {
    if (this.state.characters.length < 2) {
      this.setState({
        characters: this.state.characters.concat([c])
      });
    }
  },
  removeCharacter: function() {
    if (this.state.characters.length) {
      this.setState({
        characters: this.state.characters.slice(0, this.state.characters.length - 1)
      });
    }
  },
  selectStage: function(s) {
    this.setState({
      stage: s
    });
  },
  selectWinner: function(w) {
    this.setState({
      winner: w
    });
  },
  addFight: function() {
    // check for errors
    var msg = this.state.characters.length != 2 ? 'both characters are required':
              this.state.players.length != 2 ? 'both players are required' :
              !this.state.winner ? 'a winner is required' :
              !this.state.stage ? 'a stage is required' :
              this.state.players[0] == this.state.players[1] ? 'cannot have duplicate players' :
              '';
    if (msg) {
      this.setState({
        errorMsg: msg
      });
      return;
    }
    // TODO: calculate ELO change. probably should display the elo to gain/lose on the fights page
    // add the fight
    var winner = this.state.winner;
    $.post('/api/fights', {
      player1: this.state.players[0],
      player2: this.state.players[1],
      character1: this.state.characters[0],
      character2: this.state.characters[1],
      stage: this.state.stage,
      winner: this.state.winner,
    });
    // reset the state vars
    this.clearFight();
    this.setState({
      isFightAdded: true,
      players: [winner]
    });
    setTimeout(function() {
      this.setState({
        isFightAdded: false
      });
    }.bind(this), 3000);
  },
  clearFight: function() {
    this.setState({
      players: [],
      characters: [],
      stage: 0,
      winner: 0,
      rating: 0,
      notes: '',
      errorMsg: '',
    });
  },
  addNewPlayer: function(name) {
    $.post('/api/players', {name: name}, function(d) {
      d.name = name;
      this.setState({
        playerData: this.state.playerData.concat([d])
      });
    }.bind(this));
  },
  render: function() {
    return (
      <div className="app text-center">
        <AddPlayer addPlayer={this.addNewPlayer} />
        <Players data={this.state.playerData} queue={this.state.playerQueue} queuePlayer={this.queuePlayer} />
        <PlayerQueue data={this.state.playerData} queue={this.state.playerQueue} selectedPlayers={this.state.players} dequeuePlayer={this.dequeuePlayer} />
        <Characters data={this.state.characterData} selected={this.state.characters} addCharacter={this.addCharacter} />
        <BackButton back={this.removeCharacter} />
        <Summaries playerData={this.state.playerData} selectedPlayers={this.state.players} selectPlayer={this.selectPlayer}
                   characterData={this.state.characterData} selectedChars={this.state.characters}
                   winner={this.state.winner} selectWinner={this.selectWinner} />
        <Stages data={this.state.stageData} selected={this.state.stage} selectStage={this.selectStage} />
        <AddFight addFight={this.addFight} clearFight={this.clearFight} errorMsg={this.state.errorMsg} isFightAdded={this.state.isFightAdded} />
      </div>
    );
  }
});

var Player = React.createClass({
  handleClick: function() {
    this.props.queuePlayer(this.props.data.id);
  },
  render: function() {
    return (
      <button className="player btn btn-default" onClick={this.handleClick} disabled={this.props.selected}>{this.props.data.name}</button>
    );
  }
});
var Players = React.createClass({
  render: function() {
    return (
      <div>{ this.props.data.map(function(p) {return (<Player key={p.id} selected={this.props.queue.indexOf(p.id) > -1} data={p} queuePlayer={this.props.queuePlayer} />);}.bind(this)) }</div>
    );
  }
});

var PlayerQueue = React.createClass({
  handleClick: function(event) {
    this.props.dequeuePlayer(event.target.parentElement.getAttribute('data-id'));
  },
  render: function() {
    var players = this.props.queue.map(function(p) {
      return _.find(this.props.data, {id: p});
    }.bind(this));

    function makePlayer(p) {
      var classes = 'player-item';
      classes += this.props.selectedPlayers.indexOf(p.id) > -1 ? ' selected' : '';
      return (
        <li key={p.id} data-id={p.id} className={classes} >
          {p.name} <span onClick={this.handleClick} className="remove-player" >x</span>
        </li>
      );
    }
    makePlayer = makePlayer.bind(this);

    return (
      <ul className='player-queue'>
        {players.map(makePlayer)}
      </ul>
    );
  }
});

var Character = React.createClass({
  handleClick: function() {
    if (!this.props.summary) {
      this.props.addCharacter(this.props.data.id);
    }
  },
  render: function() {
    var players = this.props.players;
    var cx = React.addons.classSet;
    var classes = cx({
      'character': true,
      'selected': players.length,
      'selected-p1': players.length == 1 && players[0] == 1,
      'selected-p2': players.length == 1 && players[0] == 2,
      'selected-both': players.length == 2
    });
    var select = (this.props.data.select < 10 ? '0' : 0) + this.props.data.select;
    return (
      <div className="box" onClick={this.handleClick}>
        <img src={'/img/chars/select/select_'+select+'.png'} className={classes} />
      </div>
    );
  }
});

var Characters = React.createClass({
  render: function() {
    if (!this.props.data.length) {
      return (<div />);
    }
    var charRows = [
      [23, 22, 35, 1, 49, 40, 2, 47, 7, 6, 30, 19],
      [18, 50, 42, 12, 45, 41, 51, 37, 34, 24, 14, 39, 9],
      [17, 16, 26, 11, 10, 36, 4, 20, 15, 13, 38, 31, 3],
      [46, 32, 48, 43, 8, 5, 21, 33, 25, 44],
    ];
    var pos = 1;
    // replace ids with character object and attach select position
    charRows.forEach(function(row, i) {
      row.forEach(function(c, j) {
        var character = _.find(this.props.data, {id: c});
        character.select = pos++;
        row[j] = character;
      }.bind(this))
    }.bind(this));

    function makeChar(c) {
      var players = [];
      this.props.selected.forEach(function(s, i) {
        if (c.id == s) {
          players.push(i+1);
        }
      });
      return (<Character key={c.id} data={c} players={players} addCharacter={this.props.addCharacter}/>);
    }
    makeChar = makeChar.bind(this)

    function makeCharRow(row, i) {
      return (
        <div key={i} className="character-row">
          {row.map(makeChar)}
        </div>
      );
    }

    return (
      <div className="characters">
        {charRows.map(makeCharRow)}
      </div>
    );
  }
});

var CharacterSummary = React.createClass({
  render: function() {
    return (
      <img src={'/img/chars/'+this.props.data.img} className="character-summary" />
    );
  }
});

var Summary = React.createClass({
  handleClick: function() {
    if (this.props.player) {
      this.props.selectWinner(this.props.player.id);
    }
  },
  handleSelect: function(event) {
    this.props.selectPlayer(event.target.value, this.props.id);
  },
  render: function() {
    var character = this.props.char ? <CharacterSummary data={this.props.char} /> : null
    var winnerButton = this.props.player && this.props.char ? <button onClick={this.handleClick}>Winner?</button> : null
    var classes = "summary " + (this.props.selected ? 'selected' : '');
    return (
      <div className={classes}>
        {character}
        {/*<span className="summary-text">{this.props.player ? this.props.player.name : ''}</span>*/}
        <select value={this.props.player ? this.props.player.id : ''} onChange={this.handleSelect}>
           {this.props.playerData.map(function(p) {return (<option value={p.id}>{p.name}</option>);})}
         </select>
        {winnerButton}
      </div>
    );
  }
})
var Summaries = React.createClass({
  render: function() {
    if (!this.props.playerData.length || !this.props.characterData.length) {
      return (<div />);
    }
    var selectedPlayers = this.props.selectedPlayers.map(function(s) {
      return _.find(this.props.playerData, {id: s});
    }.bind(this));
    var selectedChars = this.props.selectedChars.map(function(s) {
      return _.find(this.props.characterData, {id: s});
    }.bind(this));
    var summaries = _.zip([1, 2], selectedPlayers, selectedChars);

    function makeSummary(p) {
      var selected = p[1] && p[1].id == this.props.winner;
      return (
        <Summary key={p[0]} id={p[0]} playerData={this.props.playerData} player={p[1]} char={p[2]}
          selected={selected} selectPlayer={this.props.selectPlayer} selectWinner={this.props.selectWinner} />
      );
    }
    makeSummary = makeSummary.bind(this);
    return (
      <div className="summaries">
        { summaries.map(makeSummary.bind(this)) }
      </div>
    );
  }
});

var Stage = React.createClass({
  handleClick: function() {
    this.props.selectStage(this.props.data.id);
  },
  render: function() {
    var classes = "stage " + (this.props.selected ? 'selected' : '');
    return (
      <img src={'img/stages/'+this.props.data.img} className={classes} onClick={this.handleClick} />
    );
  }
});
var Stages = React.createClass({
  render: function() {
    if (!this.props.data.length) {
      return (<div />);
    }
    function makeStage(s) {
      return (<Stage key={s.id} data={s} selected={this.props.selected == s.id} selectStage={this.props.selectStage} />);
    }
    makeStage = makeStage.bind(this);
    return (
      <div>
        { this.props.data.map(makeStage) }
      </div>
    );
  }
});

var BackButton = React.createClass({
  back: function() {
    this.props.back();
  },
  render: function() {
    return (
      <button className="btn btn-default back" onClick={this.back}>Back</button>
    );
  }
});

var AddPlayer = React.createClass({
  handleClick: function() {
    var name = this.refs.name.getDOMNode().value.trim();
    if (!name) return;
    this.props.addPlayer(name);
    this.refs.name.getDOMNode().value = '';
  },
  render: function() {
    return (
      <div className="add-player">
        <input type="text" className="form-control player-input" placeholder="New player..." ref="name" />
        <button className="btn btn-primary" onClick={this.handleClick}>Add</button>
      </div>
    );
  }
});

var AddFight = React.createClass({
  addFight: function() {
    this.props.addFight();
  },
  clearFight: function() {
    this.props.clearFight();
  },
  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'btn' : true,
      'add-button': true,
      'btn-primary': !this.props.isFightAdded,
      'btn-success': this.props.isFightAdded
    });
    return (
      <div className="add-fight">
        <button className={classes} onClick={this.addFight}>{(this.props.isFightAdded ? 'Added!!' : 'Add')}</button>
        {/*<button className="btn btn-danger clear-button" onClick={this.clearFight}>Clear</button>*/}
        <div className="error-msg"><strong>{this.props.errorMsg}</strong></div>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('app'));
