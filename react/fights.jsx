var App = React.createClass({
  componentDidMount: function() {
    // wrapper around getJSON for queue
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
    queue()
      .defer(getData('/api/players'))
      .defer(getData('/api/characterfights'))
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

    // app-wide scroll shortcuts
    function scrollTo(className) {
      $('html, body').animate({
        scrollTop: $('.'+className).offset().top
      }, 250);
    }
    var shortcuts = {
      97: 'fight-header',
      115: 'fight-summary',
      100: 'fight-stages',
      102: 'fight-notes',
    };
    $(window).keypress(function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag != 'input') {
        scrollTo(shortcuts[e.keyCode]);
      }
    });
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
      rating: [],
      notes: '',
      // other
      expectations: [],
      charExpectations: [],
      playerQueue: [],
      // basic: easiest to input, doubles: 2v2
      // enterType: 'basic',
      errorMsg: '',
      isFightAdded: false,
      characterFilter: '',
      stageFilter: '',
      oldFights: []
    };
  },
  selectPlayer: function(pid, pos) {
    pid = +pid;
    pos--;
    var newPlayers = this.state.players.slice();
    if ((pos === 0 && newPlayers[1] != pid)  || (pos === 1 && newPlayers[0] != pid)) {
      newPlayers[pos] = pid;
    }
    this.setState({
      players: newPlayers
    }, this.calculateRating);
  },
  addPlayer: function(pid) {
    if (this.state.players.length < 2 && this.state.players.indexOf(pid) == -1) {
      this.setState({
        players: this.state.players.concat([pid])
      }, this.calculateRating);
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
  queuePlayer: function(pid) {
    if (this.state.playerQueue.indexOf(pid) == -1) {
      this.addPlayer(pid);
      this.setState({
        playerQueue: this.state.playerQueue.concat([pid])
      });
    }
  },
  dequeuePlayer: function(pid) {
    pid = +pid;
    function notPlayer(x) {
      return x != pid;
    }

    var players = this.state.players.slice();
    var playerQueue = this.state.playerQueue.filter(notPlayer);
    if (players.indexOf(pid) > -1) {
      players = players.filter(notPlayer);
      if (playerQueue.length > 1) {
        players = players.concat(playerQueue[1]);
      }
    }
    this.setState({
      playerQueue: playerQueue,
      players: players
    });
  },
  addCharacter: function(cid) {
    if (this.state.characters.length < 2) {
      this.setState({
        characters: this.state.characters.concat([cid])
      }, this.calculateRating);
    }
  },
  removeCharacter: function() {
    if (this.state.characters.length) {
      this.setState({
        characters: this.state.characters.slice(0, this.state.characters.length - 1)
      });
    }
  },
  selectStage: function(sid) {
    this.setState({
      stage: sid
    });
  },
  searchStage: function(text) {
    this.setState({
      stageFilter: text
    });
  },
  selectWinner: function(wid) {
    this.setState({
      winner: wid
    });
  },
  addNotes: function(notes) {
    this.setState({
      notes: notes
    });
  },
  addNotesTag: function(tag, isChecked) {
    var notes = this.state.notes;
    if (isChecked) {
      notes = notes ? notes + ' ' : '';
      notes += tag;
    } else {
      notes = notes.replace(' ' + tag, '');
      notes = notes.replace(tag, '');
    }
    this.setState({
      notes: notes
    });
  },
  calculateRating: function() {
    if (this.state.players.length < 2 || this.state.characters.length < 2) {
      return;
    }
    var p1 = _.find(this.state.playerData, {id: this.state.players[0]});
    var p2 = _.find(this.state.playerData, {id: this.state.players[1]});
    var c1 = _.find(this.state.characterData, {id: this.state.characters[0]});
    var c2 = _.find(this.state.characterData, {id: this.state.characters[1]});

    var p1rating = p1.rating;
    var p2rating = p2.rating;
    // +rating = m * (100*(win/total) - 50)
      // m is a modifier on how much character performance affects the final expectation
    //   m = 2, 75% - 25%; m = 5, 95% - 5%

    var expectations = [];
    expectations[0] = 1.0 / (1.0 + Math.pow(10.0, ((p2rating - p1rating)/400.0)));
    expectations[1] = 1.0 / (1.0 + Math.pow(10.0, ((p1rating - p2rating)/400.0)));

    var m = 5;
    var c1pct = c1.total > 5 && c1.winpct ? c1.winpct : 0.50;
    var c2pct = c2.total > 5 && c2.winpct ? c2.winpct : 0.50;
    p1rating += m * ((100 * (c1pct || 0.50)) - 50);
    p2rating += m * ((100 * (c2pct || 0.50)) - 50);

    var charExpectations = [];
    charExpectations[0] = 1.0 / (1.0 + Math.pow(10.0, ((p2rating - p1rating)/400.0)));
    charExpectations[1] = 1.0 / (1.0 + Math.pow(10.0, ((p1rating - p2rating)/400.0)));

    var k = 24;
    var p1wins = [Math.round(k * (1.0 - expectations[0])), Math.round(k * (0.0 - expectations[1]))];
    var p2wins = [Math.round(k * (0.0 - expectations[0])), Math.round(k * (1.0 - expectations[1]))];

    this.setState({
      expectations: expectations,
      charExpectations: charExpectations,
      rating: [{win: p1wins[0], lose: p2wins[0]}, {win: p2wins[1], lose: p1wins[1]}]
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
      setTimeout(function() {
        this.setState({
          errorMsg: ''
        });
      }.bind(this), 4000);
      return;
    }
    // add the fight
    var winner = this.state.winner;
    var player1 = this.state.players[0];
    var player2 = this.state.players[1];
    var loser = player1 == winner ? player2 : player1;
    var rating1 = player1 == winner ? this.state.rating[0].win : this.state.rating[0].lose;
    var rating2 = player2 == winner ? this.state.rating[1].win : this.state.rating[1].lose;
    var fightData = {
      player1: player1,
      player2: player2,
      character1: this.state.characters[0],
      character2: this.state.characters[1],
      stage: this.state.stage,
      winner: this.state.winner,
      rating1: rating1,
      rating2: rating2,
      notes: this.state.notes
    };
    $.post('/api/fights', fightData);
    // update player ratings
    var playerData = _.cloneDeep(this.state.playerData);
    player1 = _.find(playerData, {id: player1});
    player2 = _.find(playerData, {id: player2});
    player1.rating = player1.rating + rating1;
    player2.rating = player2.rating + rating2;
    $.ajax({
      url: '/api/players/' + player1.id,
      data: {'rating': player1.rating},
      type: 'put'
    });
    $.ajax({
      url: '/api/players/' + player2.id,
      data: {'rating': player2.rating},
      type: 'put'
    });
    // convert fight data to use names
    fightData.player1 = player1.name;
    fightData.player2 = player2.name;
    fightData.character1 = _.find(this.state.characterData, {id: fightData.character1}).name;
    fightData.character2 = _.find(this.state.characterData, {id: fightData.character2}).name;
    fightData.stage = _.find(this.state.stageData, {id: fightData.stage}).name;
    fightData.winner = player1.id == fightData.winner ? player1.name : player2.name;
    // reset the state vars
    this.clearFight();
    var playerQueue = [winner].concat(this.state.playerQueue.slice(2)).concat(loser);
    this.setState({
      isFightAdded: true,
      players: [winner, playerQueue[1]],
      playerQueue: playerQueue,
      playerData: playerData,
      oldFights: [fightData].concat(this.state.oldFights)
    });
    setTimeout(function() {
      this.setState({
        isFightAdded: false
      });
    }.bind(this), 4000);
  },
  clearFight: function() {
    this.setState({
      players: [],
      characters: [],
      stage: 0,
      winner: 0,
      rating: [],
      notes: '',
      expectations: [],
      charExpectations: [],
      stageFilter: '',
      errorMsg: ''
    });
  },
  addNewPlayer: function(name) {
    var defaultRating = 1200;
    $.post('/api/players', {name: name, rating: defaultRating}, function(d) {
      d.name = name;
      d.rating = defaultRating;
      this.setState({
        playerData: this.state.playerData.concat([d])
      });
    }.bind(this));
  },
  // BASE RENDER
  render: function() {
    return (
      <div className="fight-app">
        <h1 className="fight-header">Add a Fight</h1>
        <hr />
        <div className="row">
          <div className="fight-chars nine columns">
            <Characters data={this.state.characterData} selected={this.state.characters} addCharacter={this.addCharacter} />
            <BackButton back={this.removeCharacter} />
          </div>
          <div className="fight-players three columns">
            <AddPlayer addPlayer={this.addNewPlayer} />
            <Players data={this.state.playerData} queue={this.state.playerQueue} queuePlayer={this.queuePlayer} />
            <PlayerQueue data={this.state.playerData} queue={this.state.playerQueue} selectedPlayers={this.state.players} dequeuePlayer={this.dequeuePlayer} />
          </div>
        </div>
        <hr />
        <div className="fight-summary row">
          <div className="eight columns">
            <Summaries playerData={this.state.playerData} selectedPlayers={this.state.players} selectPlayer={this.selectPlayer} characterData={this.state.characterData}
                       selectedChars={this.state.characters} winner={this.state.winner} selectWinner={this.selectWinner}
                       expectations={this.state.expectations} charExpectations={this.state.charExpectations} rating={this.state.rating} />
          </div>
          <div className="four columns">
            <AddFight addFight={this.addFight} clearFight={this.clearFight} errorMsg={this.state.errorMsg} isFightAdded={this.state.isFightAdded} />
          </div>
        </div>
        <hr />
        <div className="fight-stages">
          <StageSearch searchStage={this.searchStage} filter={this.state.stageFilter} />
          <Stages data={this.state.stageData} selected={this.state.stage} selectStage={this.selectStage} filter={this.state.stageFilter} />
        </div>
        <hr />
        <div className="fight-notes">
          <Notes data={this.state.notes} addNotes={this.addNotes} addNotesTag={this.addNotesTag} />
        </div>
        <hr />
        <div className="fights-recent">
          <RecentFights oldFights={this.state.oldFights} />
        </div>
      </div>
    );
  }
});

// END BASE, DEFINE COMPONENTS
// *******************************

var Player = React.createClass({
  handleClick: function() {
    this.props.queuePlayer(this.props.data.id);
  },
  render: function() {
    var disabled = this.props.selected ? ' disabled' : '';
    var classes = 'player' + disabled;
    return (
      <button className={classes} onClick={this.handleClick} disabled={this.props.selected}>{this.props.data.name}</button>
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
    this.props.dequeuePlayer(event.target.getAttribute('value'));
  },
  render: function() {
    var players = this.props.queue.map(function(p) {
      return _.find(this.props.data, {id: p});
    }.bind(this));

    function makePlayer(p) {
      var classes = 'player-item';
      classes += this.props.selectedPlayers.indexOf(p.id) > -1 ? ' selected' : '';
      return (
        <li key={p.id} className={classes} >
          {p.name} <div className="remove-player u-pull-right" onClick={this.handleClick} value={p.id}></div>
        </li>
      );
    }
    makePlayer = makePlayer.bind(this);

    return (
      <div>
        <div className='queue-header'>
          Player Queue
        </div>
        <ul className='player-queue'>
          {players.map(makePlayer)}
        </ul>
      </div>
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
      <img src={'/img/selects/select_'+select+'.png'} className={classes} onClick={this.handleClick}/>
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
      [46, 32, 48, 43, 8, 5, 21, 33, 25, 44]
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
  handleSelect: function() {
    this.props.selectPlayer(this.refs.playerSelect.getDOMNode().value, this.props.id);
  },
  render: function() {
    function convertPct(pct) {
      return (Math.round(pct * 100)) + '%';
    }
    var character = this.props.char ? <CharacterSummary data={this.props.char} /> : null
    var winnerButton = this.props.player && this.props.char ? <button className="winner-button" onClick={this.handleClick}>Victory!</button> : null
    var classes = "summary " + (this.props.selected ? 'selected' : '');
    var boldStyle = {fontWeight: 'bold'};
    var stats = !this.props.player || !this.props.char ? null :
      <div className='summary-stats'>
        <div>Current Rating: <span style={boldStyle}>{this.props.player ? this.props.player.rating: ''}</span></div>
        <div>Character Win %: {this.props.char && this.props.char.total ? convertPct(this.props.char.winpct) : 'n/a'}</div>
        <div>Player Chance to Win: {this.props.expectation ? convertPct(this.props.expectation) : ''}</div>
        <div style={boldStyle}>Total Chance to Win: {this.props.charExpectation ? convertPct(this.props.charExpectation) : ''}</div>
        <div style={boldStyle}>Rating at Stake: {this.props.rating ? this.props.rating.win : ''} | {this.props.rating ? this.props.rating.lose : ''}</div>
      </div>
    return (
      <div className={classes}>
        <div className="player-name">
          {/*<select ref='playerSelect' value={this.props.player ? this.props.player.id : ''} onChange={this.handleSelect}>
            <option value=''>Player</option>
            {this.props.playerData.map(function(p) {return (<option key={p.id} value={p.id}>{p.name}</option>);})}
          </select>*/}
          {this.props.player ? this.props.player.name : ''}
        </div>
        <div>{character}</div>
        <div>{stats}</div>
        <div>{winnerButton}</div>
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
    var summaries = _.zip([1, 2], selectedPlayers, selectedChars, this.props.expectations, this.props.charExpectations, this.props.rating);
    function makeSummary(s) {
      var selected = s[1] && s[1].id == this.props.winner;
      return (
        <div className="one-half column">
          <Summary key={s[0]} id={s[0]} playerData={this.props.playerData} player={s[1]} char={s[2]}
            selected={selected} selectPlayer={this.props.selectPlayer} selectWinner={this.props.selectWinner}
            expectation={s[3]} charExpectation={s[4]} rating={s[5]} />
        </div>
      );
    }
    makeSummary = makeSummary.bind(this);
    return (
      <div className="summaries row">
        { summaries.map(makeSummary.bind(this)) }
      </div>
    );
  }
});

var StageSearch = React.createClass({
  handleKeypress: _.throttle(function() {
    this.props.searchStage(this.refs.search.getDOMNode().value);
  }, 100),
  render: function() {
    return (
      <input type="text" className="stage-search u-full-width" placeholder="Search..." ref="search" value={this.props.filter} onChange={this.handleKeypress} />
    );
  }
});

var Stage = React.createClass({
  handleClick: function() {
    this.props.selectStage(this.props.data.id);
  },
  render: function() {
    var cx = React.addons.classSet;
    var filter = this.props.filter.toLowerCase();
    var matched = filter && this.props.data.name.toLowerCase().indexOf(filter) > -1;
    var classes = cx({
      'stage' : true,
      'selected': this.props.selected,
      'matched': matched && filter,
      'unmatched': !matched && filter
    });
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
      return (<Stage key={s.id} data={s} selected={this.props.selected == s.id} selectStage={this.props.selectStage} filter={this.props.filter} />);
    }
    makeStage = makeStage.bind(this);
    return (
      <div>
        { this.props.data.map(makeStage) }
      </div>
    );
  }
});

var Notes = React.createClass({
  handleKeypress: function() {
    this.props.addNotes(this.refs.notes.getDOMNode().value);
  },
  handleCheck: function(event) {
    this.props.addNotesTag(event.target.value, event.target.checked);
  },
  render: function() {
    var tags = [
      ['3 Stock', '#3stock'],
      ['Mew', '#mew'],
      ['Bullshit', '#bullshit']
    ];
    tags = tags.map(function(t) {
      var checked = this.props.data.indexOf(t[1]) > -1;
      return (
        <label className="check-boxes" key={t[1]}>
          <input type="checkbox" checked={checked} value={t[1]} onChange={this.handleCheck} />
          <span className="label-body">{t[0]}</span>
        </label>
      );
    }.bind(this))
    return (
      <div>
        {tags}
        <input type="text" className="u-full-width" placeholder="Notes..."
          ref="notes" value={this.props.data} onChange={this.handleKeypress} />
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
      <button className="remove-button" onClick={this.back}>Remove</button>
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
      <div className="add-player row">
        <div className="eight columns">
          <input type="text" className="player-input u-full-width" placeholder="New player..." ref="name" />
        </div>
        <div className="four columns">
          <button className="button-primary u-full-width" onClick={this.handleClick}>Add</button>
        </div>
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
      'add-button': true,
      'button-primary': !this.props.isFightAdded && !this.props.errorMsg,
      'button-success': this.props.isFightAdded,
      'button-danger': this.props.errorMsg
    });
    return (
      <div className="fight-submit">
        <button className={classes} onClick={this.addFight}>{(this.props.isFightAdded ? 'Added!!' : 'Add Fight')}</button>
        {/*<button className="btn btn-danger clear-button" onClick={this.clearFight}>Clear</button>*/}
        <div className="error-msg"><strong>{this.props.errorMsg}</strong></div>
      </div>
    );
  }
});

var RecentFights = React.createClass({
  render: function() {
    var headers = ['Player 1', 'Character 1', 'Player 2', 'Character 2', 'Winner', 'Stage', 'Notes'].map(function(h) {
      return (
        <th>{h}</th>
      );
    });
    var attrs = ['player1', 'character1', 'player2', 'character2', 'winner', 'stage', 'notes'];
    var data = this.props.oldFights.map(function(f) {
      var tds = attrs.map(function(a) {
        return ( <td>{f[a]}</td> );
      });
      return ( <tr>{tds}</tr> );
    });
    return (
      <div className='recent'>
        <h2>Recent Fights</h2>
        <table>
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>
            {data}
          </tbody>
        </table>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('app'));
