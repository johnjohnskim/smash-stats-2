function isNum(x) {
  return !isNaN(x);
}
function isPct(x) {
  return x.substring(x.length - 1) == '%';
}
function isDate(x) {
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(x);
}

var Table = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      sortBy: 0,
      order: '+',
      filter: ''
    };
  },
  componentDidMount: function() {
    $.getJSON(this.props.url, {}, function(data) {
      if (!data || !data.length) return;
      data = _.sortBy(data, 'winpct').reverse();
      data.forEach(function(d) {
        d.winpct = Math.round(d.winpct * 100) + '%';
      });
      data = data.map(function(d) {
        return this.props.headers.map(function(h) {
          return d[h[0]];
        });
      }.bind(this));
      this.setState({
        data: data
      });
    }.bind(this));
  },
  handleKeypress: _.throttle(function() {
    this.setState({
      filter: this.refs.search.getDOMNode().value
    });
  }, 100),
  sort: function(index) {
    if (this.state.sortBy == index) {
      this.setState({
        order: this.state.order == '+' ? '-' : '+'
      });
    } else {
      this.setState({
        sortBy: index,
        order: '+'
      });
    }
  },
  render: function() {
    if (!this.state.data.length) return (<div />);
    var data = this.state.data;
    var filter = this.state.filter.toLowerCase();
    var first;

    // filter data
    if (this.state.filter) {
      data = data.filter(function(d) {
        return d.some(function(x) {
          return isNum(x) ? false : x.toLowerCase().indexOf(filter) > -1;
        });
      });
    }

    // sort data
    if (this.state.sortBy > -1 && data.length) {
      first = data[0][this.state.sortBy];
      if (isNum(first)) {
        data = _.sortBy(data, function(d) {
          return (this.state.order == '-' ? 1 : -1) * d[this.state.sortBy];
        }.bind(this));
      } else if (isPct(first)) {
        data = _.sortBy(data, function(d) {
          return (this.state.order == '-' ? 1 : -1) * parseInt(d[this.state.sortBy], 10);
        }.bind(this));
      } else {
        data = _.sortBy(data, function(d) { return d[this.state.sortBy]; }.bind(this));
        data = this.state.order == '-' ? data.reverse() : data;
      }
    }

    var trs = data.map(function(d, i) {
      return (
        <tr key={i}>
          { d.map(function(x, i) {return (<td key={i}>{x}</td>);}) }
        </tr>
      );
    }.bind(this));

    function makeHeader(h, i) {
      return (<Header key={i} name={h[1]} sort={this.sort} sortBy={this.state.sortBy} order={this.state.order} />);
    }

    return (
      <div>
        <div className="clearfix">
          <div className="pull-right">
            <input type="text" className="form-control" placeholder="Search..." ref="search" onChange={this.handleKeypress} />
          </div>
        </div>
        <table className="table table-hover main-table">
          <thead>
            <tr>
              { this.props.headers.map(makeHeader.bind(this)) }
            </tr>
          </thead>
          <tbody>
            {trs}
          </tbody>
        </table>
      </div>
    );
  }
});

var Header = React.createClass({
  handleClick: function() {
    this.props.sort(this.props.key);
  },
  render: function() {
    var classes = this.props.sortBy == this.props.key ? (this.props.order == '+' ? 'glyphicon-chevron-up' :
                                                                                   'glyphicon-chevron-down') :
                  '';
    return (
      <th onClick={this.handleClick}>
        {this.props.name}
        &nbsp;&nbsp;<span className={'glyphicon ' + classes} />
      </th>
    );
  }
});

var tableMeta = {
  'fights': {
    'headers': [
      ['id', 'Id'],
      ['date', 'Date'],
      ['stagename', 'Stage'],
      ['winnername', 'Winner'],
      ['player1name', 'Player 1'],
      ['character1name', 'Character 1'],
      ['player2name', 'Player 2'],
      ['character2name', 'Character 2']
    ]
  },
  'playermeta': {
    'headers': [
      ['name', 'Name'],
      ['total', 'Total Fights'],
      ['wins', 'Wins'],
      ['winpct', 'Win %']
    ]
  },
  'charactermeta': {
    'headers': [
      ['name', 'Name'],
      ['total', 'Total Fights'],
      ['wins', 'Wins'],
      ['winpct', 'Win %']
    ]
  },
  'stagemeta': {
    'headers': [
      ['name', 'Name'],
      ['total', 'Appearances']
    ]
  },
  'characterwins': {
    'headers': [
      ['playername', 'Player'],
      ['charactername', 'Character'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
  'stagewins': {
    'headers': [
      ['playername', 'Player'],
      ['stagename', 'Stage'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
  'playervs': {
    'headers': [
      ['player1name', 'Player 1'],
      ['player2name', 'Player 2'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
  'charactervs': {
    'headers': [
      ['character1name', 'Character 1'],
      ['character2name', 'Character 2'],
      ['total', 'Total'],
      ['wins', 'Wins'],
      ['winpct', 'Win %'],
    ]
  },
}

// table-type is given from the table router
var tableType = $('#app')[0].getAttribute('type');
if (tableType && tableMeta[tableType]) {
  if (tableType == 'fights') {
    $.getJSON('/api/fights', function(d) {
      var h1 = $('h1');
      h1.text('All ' + d.length + ' fights');
    });
  }
  React.render(<Table url={'/api/'+tableType} headers={tableMeta[tableType].headers} />, document.getElementById('app'));
}
