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
      currentPlayers: [],
      characterFilter: '',
      stageFilter: ''
    };
  },
  // selectPlayer: function(p, pos) {
  //   var newPlayers = _.extend({}, this.state.players);
  //   newPlayers[pos] = p;
  //   this.setState({
  //     players: newPlayers
  //   });
  // },
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
    // add the fight
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
      isFightAdded: true
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
    // return (
    //   <div className="app text-center">
    //     <Characters data={this.state.characterData} selected={this.state.characters} addCharacter={this.addCharacter} />
    //     <Buttons reset={this.resetCharacters} back={this.removeCharacter} />
    //     <hr />
    //     <AddPlayer addPlayer={this.addNewPlayer} />
    //     <Players data={this.state.playerData} addPlayer={this.addPlayer} />
    //     <Buttons reset={this.resetPlayers} back={this.removePlayer} />
    //     <Summaries playerData={this.state.playerData} selectedPlayers={this.state.players}
    //                characterData={this.state.characterData} selectedChars={this.state.characters}
    //                winner={this.state.winner} selectWinner={this.selectWinner} />
    //     <hr />
    //     <Stages data={this.state.stageData} selected={this.state.stage} selectStage={this.selectStage} />
    //     <AddFight addFight={this.addFight} clearFight={this.clearFight} errorMsg={this.state.errorMsg} isFightAdded={this.state.isFightAdded} />
    //   </div>
    // );
    return (
      <div className="app text-center">
        <Characters data={this.state.characterData} selected={this.state.characters} addCharacter={this.addCharacter} />
      </div>
    );
  }
})

var Character = React.createClass({
  handleClick: function() {
    if (!this.props.summary) {
      this.props.addCharacter(this.props.data.id);
    }
  },
  render: function() {
    var cx = React.addons.classSet;
    // var selects = this.props.players.map(function(p, i) {
    //   return (<Select key={i} player={p} />);
    // });
    var classes = cx({
      'character': true,
      'summary-char': this.props.summary,
      // 'selected': selects.length
    });
    // return (
    //   <div className="character-box box" onClick={this.handleClick}>
    //     <img src={'img/characters/'+this.props.data.img} className={classes} />
    //     {selects}
    //   </div>
    // );
    return (
      <div className="character-box box" onClick={this.handleClick}>
        <img src={'/img/chars/'+this.props.data.img} className={classes} />
      </div>
    );
  }
});

var Characters = React.createClass({
  render: function() {
    if (!this.props.data.length) {
      return (<div />);
    }

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

    return (
      <div className="characters">
        {this.props.data.map(makeChar)}
      </div>
    );
  }
});

// var Player = React.createClass({
//   handleClick: function() {
//     this.props.addPlayer(this.props.data.id);
//   },
//   render: function() {
//     return (
//       <button className="player btn" onClick={this.handleClick}>{this.props.data.name}</button>
//     );
//   }
// });

// var Players = React.createClass({
//   render: function() {
//     return (
//       <div>{ this.props.data.map(function(p) {return (<Player key={p.id} data={p} addPlayer={this.props.addPlayer} />);}.bind(this)) }</div>
//     );
//   }
// })

// var Summary = React.createClass({
//   handleClick: function() {
//     if (this.props.player) {
//       this.props.selectWinner(this.props.player.id);
//     }
//   },
//   render: function() {
//     var character = this.props.char ? <Character data={this.props.char} players={[]} summary={true} /> : null
//     var classes = "summary " + (this.props.selected ? 'selected' : '');
//     return (
//       <div className="summary-box box" onClick={this.handleClick} >
//         <img src={'img/players/p'+this.props.id+'-display.png'} className={classes} />
//         {character}
//         <span className="summary-text">{this.props.player ? this.props.player.name : ''}</span>
//         {this.props.selected ? <span className="summary-winner">Winner!!!</span> : ''}
//       </div>
//     );
//   }
// })
// var Summaries = React.createClass({
//   render: function() {
//     if (!this.props.playerData.length || !this.props.characterData.length) {
//       return (<div />);
//     }
//     var ids = [1, 2, 3, 4];
//     var selectedPlayers = this.props.selectedPlayers.map(function(s) {
//       return _.find(this.props.playerData, {id: s});
//     }.bind(this));
//     var selectedChars = this.props.selectedChars.map(function(s) {
//       return _.find(this.props.characterData, {id: s});
//     }.bind(this));
//     var summaries = _.zip(ids, selectedPlayers, selectedChars);

//     function makeSummary(p) {
//       var selected = p[1] && p[1].id == this.props.winner;
//       return (<Summary key={p[0]} id={p[0]} player={p[1]} char={p[2]} selected={selected} selectWinner={this.props.selectWinner} />);
//     }
//     makeSummary = makeSummary.bind(this);
//     return (
//       <div className="summaries">
//         { summaries.map(makeSummary.bind(this)) }
//       </div>
//     );
//   }
// });

// var Select = React.createClass({
//   render: function() {
//     var classes = 'select + p' + this.props.player;
//     return (
//       <img src={'img/players/p'+this.props.player+'-select.png'} className={classes} />
//     );
//   }
// })

// var Stage = React.createClass({
//   handleClick: function() {
//     this.props.selectStage(this.props.data.id);
//   },
//   render: function() {
//     var classes = "stage " + (this.props.selected ? 'selected' : '');
//     return (
//       <img src={'img/stages/'+this.props.data.img+'.jpg'} className={classes} onClick={this.handleClick} />
//     );
//   }
// });
// var Stages = React.createClass({
//   render: function() {
//     if (!this.props.data.length) {
//       return (<div />);
//     }
//     var stages = [
//       ['princess-peachs-castle', 'kongo-jungle', 'great-bay', 'yoshis-story', 'fountain-of-dreams', 'corneria'],
//       ['rainbow-cruise', 'jungle-japes', 'temple', 'yoshis-island', 'green-greens', 'venom'],
//       ['icicle-mountain', 'flat-zone'],
//       ['brinstar', 'onett', 'mute-city', 'pokemon-stadium', 'kingdom'],
//       ['brinstar-depths', 'fourside', 'big-blue', 'poke-floats', 'kingdom-ii'],
//       ['battlefield', 'final-destination', 'past-dream-land', 'past-yoshis-island', 'past-kongo-jungle']
//     ]
//     stages = stages.map(function(row) {
//       return row.map(function(s) { return _.find(this.props.data, {img: s}); }.bind(this));
//     }.bind(this));
//     function makeStage(s) {
//       return (<Stage key={s.id} data={s} selected={this.props.selected == s.id} selectStage={this.props.selectStage} />);
//     }
//     makeStage = makeStage.bind(this);
//     function makeStageRow(row, i) {
//       return (
//         <div key={i} className="character-row">
//           {row.map(makeStage)}
//         </div>
//       );
//     }
//     return (
//       <div>
//         { stages.map(makeStageRow) }
//       </div>
//     );
//   }
// });

// var Buttons = React.createClass({
//   reset: function() {
//     this.props.reset();
//   },
//   back: function() {
//     this.props.back();
//   },
//   render: function() {
//     return (
//       <div className="clearfix">
//         <div className="pull-right">
//           <button className="btn btn-default back" onClick={this.back}>Back</button>
//           <button className="btn btn-default reset" onClick={this.reset}>Reset</button>
//         </div>
//       </div>
//     );
//   }
// });

// var AddPlayer = React.createClass({
//   handleClick: function() {
//     var name = this.refs.name.getDOMNode().value.trim();
//     if (!name) return;
//     this.props.addPlayer(name);
//     this.refs.name.getDOMNode().value = '';
//   },
//   render: function() {
//     return (
//       <div className="add-player">
//         <input type="text" className="form-control player-input" placeholder="New player..." ref="name" />
//         <button className="btn btn-primary" onClick={this.handleClick}>Add</button>
//       </div>
//     );
//   }
// });

// var AddFight = React.createClass({
//   addFight: function() {
//     this.props.addFight();
//   },
//   clearFight: function() {
//     this.props.clearFight();
//   },
//   render: function() {
//     var cx = React.addons.classSet;
//     var classes = cx({
//       'btn' : true,
//       'add-button': true,
//       'btn-primary': !this.props.isFightAdded,
//       'btn-success': this.props.isFightAdded
//     });
//     return (
//       <div className="add-fight">
//         <button className={classes} onClick={this.addFight}>{(this.props.isFightAdded ? 'Added!!' : 'Add')}</button>
//         <button className="btn btn-danger clear-button" onClick={this.clearFight}>Clear</button>
//         <div className="error-msg"><strong>{this.props.errorMsg}</strong></div>
//       </div>
//     );
//   }
// });

React.render(<App />, document.getElementById('app'));
